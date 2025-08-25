# backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Case, Document, ProcessMovement, CustomUser, Comunicacao
from .models import (
    Case, Document, ProcessMovement, CustomUser, Comunicacao,
    ChecklistTemplate, RequiredDocument, DocumentValidationCheck, ContractAnalysisData
)

# ADICIONADO: Serializer de Token customizado para incluir o 'role' no payload do JWT
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona campos customizados ao token
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['email'] = user.email
        token['role'] = user.role  # Adiciona o 'role' do usuário

        return token

# ADICIONADO: Pega o modelo de usuário ativo
User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'password2', 'cpf', 'telefone', 'first_name', 'last_name', 'client_id', 'role')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'role': {'required': True} # Garante que o role seja enviado
        }
        read_only_fields = ['id', 'client_id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # O 'role' agora é passado diretamente nos dados validados
        # A lógica de criar o username foi movida para o model
        user = CustomUser.objects.create_user(**validated_data)
        return user

class ActorSerializer(serializers.ModelSerializer):
    # Adiciona um campo que retorna o 'display' legível da choice 'role'
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        # ADICIONADO: O campo 'setor_ou_equipe' foi incluído na lista
        fields = [
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'role', 
            'role_display', 
            'setor_ou_equipe'
        ]

# REMOVIDO: DocumentMovementSerializer não é mais necessário, pois o andamento agora
# pode ter um anexo direto, e não um 'documento associado' complexo.

class ProcessMovementSerializer(serializers.ModelSerializer):
    # Mantendo a lógica original com nomes de campo corrigidos
    actor_name = serializers.CharField(source='actor.__str__', read_only=True)
    actor_role = serializers.CharField(source='actor.get_role_display', read_only=True)

    class Meta:
        model = ProcessMovement
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    client = ActorSerializer(read_only=True)
    created_by = ActorSerializer(read_only=True)
    
    # ADICIONADO: Campo que expõe as ações disponíveis para o frontend
    available_actions = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id', 'title', 'description', 'created_by', 'created_at',
            'current_status', 'movements', 'client',
            'bank_name', 'bank_code', 'contract_type',
            'ia_analysis_result', 'human_analysis_result', 'technical_report_content',
            'proposal_sent_date', 'client_decision', 'docusign_status',
            'dossier_sent_date', 'bank_response_status', 'counterproposal_details',
            'final_agreement_sent_date',
            'bank_payment_status', 'client_liquidation_date', 'commission_value',
            'completion_date', 'final_communication_sent', 'survey_sent',
            'case_type', 'parent_case',
            'protocol_id',
            'available_actions' # ADICIONADO: Incluído na lista de campos
        ]
        read_only_fields = ['created_by', 'client', 'movements', 'protocol_id', 'available_actions', 'current_status']

    # ADICIONADO: Método que contém a lógica da máquina de estados (BPM)
    def get_available_actions(self, case):
        # O 'request' é necessário para saber quem está a pedir as ações
        request = self.context.get('request')
        if not request:
            return []
            
        user = request.user
        actions = []

        # Ações de workflow só estão disponíveis para funcionários e administradores
        if user.role in ['ADMIN', 'FUNCIONARIO']:
            
            if case.current_status == 'ONBOARDING':
                actions.append({'id': 'send_to_validation', 'label': 'Enviar para Validação Doc.', 'style': 'primary', 'requires_justification': False})

            elif case.current_status == 'VALIDACAO_DOCUMENTAL':
                actions.append({'id': 'approve_documents', 'label': 'Aprovar Documentos', 'style': 'success', 'requires_justification': False})
                actions.append({'id': 'reprove_documents', 'label': 'Reprovar / Pedir Ofício', 'style': 'danger', 'requires_justification': True})
            
            elif case.current_status == 'EXTRACAO_DADOS':
                actions.append({'id': 'send_to_financial_analysis', 'label': 'Enviar para Análise Financeira', 'style': 'primary', 'requires_justification': False})
            
            # ... (lógica para outros estados será adicionada aqui no futuro) ...

            if case.current_status not in ['FINALIZADO', 'ARQUIVADO']:
                actions.append({'id': 'force_manual_transition', 'label': 'Forçar Andamento', 'style': 'warning', 'requires_justification': True})
                actions.append({'id': 'add_internal_note', 'label': 'Adicionar Nota Interna', 'style': 'secondary', 'requires_justification': True})
                actions.append({'id': 'create_internal_request', 'label': 'Requisição Interna', 'style': 'secondary', 'requires_justification': True})
                actions.append({'id': 'reclassify_case', 'label': 'Reclassificar Protocolo', 'style': 'secondary', 'requires_justification': True})
                actions.append({'id': 'external_communication', 'label': 'Comunicação Externa', 'style': 'info', 'requires_justification': False})
                actions.append({'id': 'upload_document', 'label': 'Anexar Documento', 'style': 'info', 'requires_justification': False})
                actions.append({'id': 'archive_case', 'label': 'Arquivar Caso', 'style': 'danger', 'requires_justification': True})


        return actions

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'case', 'file_name', 'file_type', 'file_url',
            'upload_date', 'description', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['uploaded_by', 'file_url', 'upload_date', 'uploaded_by_name']

class ComunicacaoSerializer(serializers.ModelSerializer):
    autor = ActorSerializer(read_only=True)

    class Meta:
        model = Comunicacao
        fields = [
            'id', 'case', 'autor', 'tipo_comunicacao', 'destinatario',
            'assunto', 'corpo', 'timestamp'
        ]
        # CORRIGIDO: Adicionado 'case' aos campos somente leitura
        read_only_fields = ['autor', 'timestamp', 'case']

# ADICIONADO: Novo serializer para o evento de timeline unificado
class TimelineEventSerializer(serializers.Serializer):
    type = serializers.CharField()
    actor = ActorSerializer()
    timestamp = serializers.DateTimeField()
    content = serializers.CharField()
    event_specific_details = serializers.DictField(required=False)

# Adicionar estas novas classes ao final do seu serializers.py
class DocumentValidationCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentValidationCheck
        fields = '__all__'
        read_only_fields = ['validated_by', 'validated_at']

class RequiredDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredDocument
        fields = ['id', 'document_name', 'is_mandatory']

class ChecklistTemplateSerializer(serializers.ModelSerializer):
    required_documents = RequiredDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = ChecklistTemplate
        fields = ['id', 'name', 'description', 'required_documents']

class ContractAnalysisDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractAnalysisData
        fields = '__all__'
        read_only_fields = ['dados_extraidos_por', 'data_extracao']