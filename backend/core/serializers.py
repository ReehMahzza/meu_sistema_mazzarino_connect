# Em backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Case, Document # ADICIONADO: Importe Case e Document

CustomUser = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password2', 'cpf', 'telefone', 'setor_ou_equipe')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': True}, # Mantenha username obrigatório por enquanto para AbstractUser
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user

# ADICIONAR AQUI: Novos serializers
class CaseSerializer(serializers.ModelSerializer):
    # Adicionado para incluir o nome completo do criador
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Case
        fields = ['id', 'title', 'description', 'created_by', 'created_at', 'created_by_name']
        read_only_fields = ['created_by', 'created_by_name'] # O 'created_by' será definido na view

class DocumentSerializer(serializers.ModelSerializer):
    # Para exibir o nome do usuário que fez o upload, em vez de apenas o ID.
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True) # ADICIONADO: Título do caso

    class Meta:
        model = Document
        fields = [
            'id', 'case', 'case_title', 'file_name', 'file_type', 'file_url', # Adicionado 'case_title'
            'upload_date', 'description', 'uploaded_by', 'uploaded_by_name'
        ]
        # Campos que não serão enviados pelo frontend, mas definidos pelo backend.
        read_only_fields = ['uploaded_by', 'file_url', 'upload_date', 'uploaded_by_name', 'case_title']