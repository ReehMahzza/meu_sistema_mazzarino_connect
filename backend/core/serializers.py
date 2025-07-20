# Em backend/core/serializers.py (VERSÃO FINAL E CORRIGIDA DE TODAS AS SERIALIZERS ATÉ FASE 7)

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Case, Document, ProcessMovement, CustomUser # Importar CustomUser diretamente

# ActorSerializer (para exibir detalhes do usuário)
class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'password2', 'cpf', 'telefone', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'username': {'required': False},
        }
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})

        if not attrs.get('username') and attrs.get('email'):
            email = attrs['email']
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            attrs['username'] = username

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = ActorSerializer(read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    # ADICIONADO: Campo 'case' como write_only para ser aceito no payload
    case = serializers.PrimaryKeyRelatedField(queryset=Case.objects.all(), write_only=True) # <-- ADICIONADO AQUI!

    class Meta:
        model = Document
        fields = [
            'id', 'case', 'case_title', 'file_name', 'file_type', 'file_url',
            'upload_date', 'description', 'uploaded_by'
        ]
        read_only_fields = ['uploaded_by', 'file_url', 'upload_date', 'case_title']


class DocumentMovementSerializer(serializers.ModelSerializer):
    """Serializer simplificado para documentos aninhados em andamentos."""
    class Meta:
        model = Document
        fields = ['id', 'file_name', 'file_url']


class ProcessMovementSerializer(serializers.ModelSerializer):
    actor = ActorSerializer(read_only=True) # Este é para LEITURA
    associated_document = DocumentMovementSerializer(read_only=True)
    associated_document_id = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(), source='associated_document', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = ProcessMovement
        fields = [
            'id', 'case', 'actor', 'movement_type', 'timestamp', 'from_sector',
            'to_sector', 'content', 'associated_document', 'associated_document_id', 'is_internal', 'notes',
            'request_details'
        ]
        read_only_fields = ['actor', 'timestamp', 'associated_document']


# REESCRITA COMPLETA E CORRIGIDA DO CASE SERIALIZER (COM TODOS OS CAMPOS ATÉ FASE 7)
class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    created_by = ActorSerializer(read_only=True)

    # Campo para escrita do cliente (ID)
    client = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), write_only=True) 
    # Campo para leitura detalhada do cliente (objeto serializado)
    client_detail = ActorSerializer(source='client', read_only=True) 

    class Meta:
        model = Case
        fields = [
            'id', 'title', 'description', 'created_by', 'created_at',
            'current_status', 'movements', 
            'client', # Campo de escrita (recebe o ID)
            'client_detail', # Campo de leitura (retorna o objeto Actor)
            'ia_analysis_result', 'human_analysis_result', 'technical_report_content', # Fase 3
            'proposal_sent_date', 'client_decision', 'docusign_status', # Fase 4
            'dossier_sent_date', 'bank_response_status', 'counterproposal_details', # Fase 5
            'final_agreement_sent_date', # Fase 6
            'bank_payment_status', 'client_liquidation_date', 'commission_value', # Fase 7
            'completion_date', 'final_communication_sent', 'survey_sent' # Fase 8
        ]
        read_only_fields = ['created_at', 'current_status', 'movements', 'client_detail'] # client_detail é apenas para leitura

    def create(self, validated_data):
        # O PrimaryKeyRelatedField já converte o ID para o objeto CustomUser,
        # então 'client' já estará no validated_data como o objeto CustomUser.
        return super().create(validated_data)
        