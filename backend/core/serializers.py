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
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password2', 'cpf', 'telefone', 'setor_ou_equipe')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
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

    # Campo para receber APENAS o ID do documento no POST
    associated_document_id = serializers.PrimaryKeyRelatedField(
        queryset=Document.objects.all(), source='associated_document', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = ProcessMovement
        fields = [
            'id', 'case', 'actor', 'movement_type', 'timestamp', 'from_sector',
            'to_sector', 'content', 'associated_document', 'associated_document_id', 'is_internal', 'notes'
        ]
        read_only_fields = ['actor', 'timestamp', 'associated_document']


# CORREÇÃO CRÍTICA FINAL DO CASE SERIALIZER (Com ActorSerializer para created_by)
class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    # created_by agora serializa o objeto Actor (para GET), e é PrimaryKeyRelatedField para POST
    created_by = ActorSerializer(read_only=True) 

    class Meta:
        model = Case
        # Removido 'created_by_full_name' dos fields, pois 'created_by' é o campo serializado
        fields = ['id', 'title', 'description', 'created_by', 'created_at', 'current_status', 'movements']
        read_only_fields = ['created_at', 'current_status', 'movements'] # 'created_by' não precisa estar aqui, pois é read_only como ActorSerializer