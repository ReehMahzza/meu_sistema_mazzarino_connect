# Em backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Case, Document, ProcessMovement

CustomUser = get_user_model()

# Serializer simplificado para informações do ator (usuário)
class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        # MODIFICAR AQUI: Remover a obrigatoriedade dos nomes
        fields = ('id', 'email', 'password', 'password2', 'cpf', 'telefone', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'username': {'required': False}, # Username pode ser gerado
        }
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})

        # ADICIONADO: Gerar um username único a partir do email se não for fornecido
        if not attrs.get('username') and attrs.get('email'):
            email = attrs['email']
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while CustomUser.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            attrs['username'] = username
        elif not attrs.get('username'): 
            # Este caso é mais para quando username é REQUIRED_FIELDS no modelo, mas não no serializer.
            # Como USERNAME_FIELD é email, o Django cuida se username não for explicitamente setado.
            pass # Nenhuma ação necessária aqui.

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # A criação do usuário deve usar create_user para hashear a senha
        user = CustomUser.objects.create_user(**validated_data)
        return user

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = ActorSerializer(read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)

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
    actor = ActorSerializer(read_only=True)
    associated_document = DocumentMovementSerializer(read_only=True)
    associated_document_id = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(), source='associated_document', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = ProcessMovement
        fields = [
            'id', 'case', 'actor', 'movement_type', 'timestamp', 'from_sector',
            'to_sector', 'content', 'associated_document', 'associated_document_id', 'is_internal', 'notes',
            'request_details' # <-- ADICIONAR CAMPO AQUI!
        ]
        read_only_fields = ['actor', 'timestamp', 'associated_document']
        # Torna o campo opcional na entrada da API
        extra_kwargs = {
            'request_details': {'required': False} # <-- ADICIONAR ESTE extra_kwargs AQUI!
        }

# MODIFICAR O CASE SERIALIZER EXISTENTE
class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    created_by = ActorSerializer(read_only=True) # created_by agora é o objeto Actor
    client = ActorSerializer(read_only=True) # client agora é o objeto Actor
    client_id = serializers.IntegerField(write_only=True, required=False)


    class Meta:
        model = Case
        # ADICIONAR NOVOS CAMPOS AQUI
        fields = [
            'id', 'title', 'description', 'created_by', 'created_at',
            'current_status', 'movements', 'client', 'client_id',
            'ia_analysis_result', 'human_analysis_result', 'technical_report_content',
            'proposal_sent_date', 'client_decision', 'docusign_status',
            'dossier_sent_date', 'bank_response_status', 'counterproposal_details',
            'final_agreement_sent_date' # <-- ADICIONE ESTA LINHA AQUI!
        ]
        read_only_fields = ['created_at', 'current_status', 'movements']