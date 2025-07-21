# backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Case, Document, ProcessMovement, CustomUser, Comunicacao

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'password2', 'cpf', 'telefone', 'first_name', 'last_name')
        extra_kwargs = { 'first_name': {'required': False}, 'last_name': {'required': False} }
        read_only_fields = ['id']

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
        user = CustomUser.objects.create_user(username=username, **validated_data)
        return user

class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'first_name', 'last_name', 'email']

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = Document
        fields = ['id', 'case', 'file_name', 'file_type', 'file_url', 'upload_date', 'description', 'uploaded_by', 'uploaded_by_name']
        read_only_fields = ['uploaded_by', 'file_url', 'upload_date', 'uploaded_by_name']

class ProcessMovementSerializer(serializers.ModelSerializer):
    actor = ActorSerializer(read_only=True)
    # Ajustado para usar DocumentSerializer em vez de um serializer anônimo
    associated_document = DocumentSerializer(read_only=True)

    class Meta:
        model = ProcessMovement
        fields = ['id', 'case', 'actor', 'movement_type', 'timestamp', 'from_sector', 'to_sector', 'content', 'associated_document', 'is_internal', 'notes', 'request_details']
        read_only_fields = ['actor', 'timestamp']
        extra_kwargs = { 'request_details': {'required': False} }

class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    client = ActorSerializer(read_only=True)
    created_by = ActorSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True, required=False)
    documents = DocumentSerializer(many=True, read_only=True) 

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
            'documents',
            'client_id' # <-- ADICIONADO AQUI
        ]
        read_only_fields = ['created_by', 'client', 'movements', 'documents']

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