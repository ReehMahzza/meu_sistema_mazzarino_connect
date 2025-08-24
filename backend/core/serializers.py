# backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Case, Document, ProcessMovement, CustomUser, Comunicacao

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'password2', 'cpf', 'telefone', 'first_name', 'last_name', 'client_id', 'role')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
        read_only_fields = ['id', 'client_id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        email = validated_data.get('email')
        username = email.split('@')[0]
        counter = 1
        while CustomUser.objects.filter(username=username).exists():
            username = f"{email.split('@')[0]}{counter}"
            counter += 1

        validated_data['role'] = 'CLIENTE'

        user = CustomUser.objects.create_user(
            username=username,
            **validated_data
        )
        return user

class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'first_name', 'last_name', 'email', 'client_id', 'role', 'telefone', 'cpf', 'setor_ou_equipe']

class DocumentMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'file_name', 'file_url']

class ProcessMovementSerializer(serializers.ModelSerializer):
    actor = ActorSerializer(read_only=True)
    associated_document = DocumentMovementSerializer(read_only=True)

    class Meta:
        model = ProcessMovement
        fields = [
            'id', 'case', 'actor', 'movement_type', 'timestamp', 'from_sector',
            'to_sector', 'content', 'associated_document', 'is_internal', 'notes',
            'request_details'
        ]
        read_only_fields = ['actor', 'timestamp', 'case']
        extra_kwargs = {
            'request_details': {'required': False}
        }

class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    client = ActorSerializer(read_only=True)
    created_by = ActorSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True, required=False)
    current_status = serializers.CharField(read_only=True)  # GARANTE QUE O STATUS VAI PARA O FRONT

    class Meta:
        model = Case
        fields = '__all__'  # Inclui todos os campos, inclusive current_status
        read_only_fields = ['created_by', 'client', 'movements', 'protocol_id']

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