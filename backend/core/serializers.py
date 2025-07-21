# backend/core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Case, Document, ProcessMovement, CustomUser, Comunicacao

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirme a senha")

    class Meta:
        model = CustomUser
        # ADICIONADO: Campo 'role'
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

        user = CustomUser.objects.create_user(
            username=username,
            **validated_data
        )
        return user

class ActorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_system_user = serializers.SerializerMethodField()
    
    class Meta:
        model = get_user_model()
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 
            'cpf', 'telefone', 'role', 'is_active', 'is_system_user',
            'date_joined', 'last_login', 'setor_ou_equipe'
        ]
        
    def get_full_name(self, obj):
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip() or obj.email
        
    def get_is_system_user(self, obj):
        return obj.is_active and obj.has_usable_password()

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
        read_only_fields = ['actor', 'timestamp']
        extra_kwargs = {
            'request_details': {'required': False}
        }

class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'case', 'file_name', 'file_type', 'file_url',
            'upload_date', 'description', 'uploaded_by', 'uploaded_by_name'
        ]
        read_only_fields = ['uploaded_by', 'file_url', 'upload_date', 'uploaded_by_name']

class CaseSerializer(serializers.ModelSerializer):
    movements = ProcessMovementSerializer(many=True, read_only=True)
    client = ActorSerializer(read_only=True)
    created_by = ActorSerializer(read_only=True)
    client_id = serializers.IntegerField(write_only=True, required=False)
    documents = DocumentSerializer(many=True, read_only=True) 

    class Meta:
        model = Case
        fields = [
            'id',
            'protocol_id', # ADICIONADO
            'title', 'description', 'created_by', 'created_at',
            'current_status', 'movements', 'client', 'client_id',
            'bank_name', 'bank_code', 'contract_type',
            'ia_analysis_result', 'human_analysis_result', 'technical_report_content',
            'proposal_sent_date', 'client_decision', 'docusign_status',
            'dossier_sent_date', 'bank_response_status', 'counterproposal_details',
            'final_agreement_sent_date',
            'bank_payment_status', 'client_liquidation_date', 'commission_value',
            'completion_date', 'final_communication_sent', 'survey_sent',
            'case_type', 'parent_case',
            'documents'
        ]
        read_only_fields = ['created_by', 'client', 'movements', 'documents', 'protocol_id']

class ComunicacaoSerializer(serializers.ModelSerializer):
    autor = ActorSerializer(read_only=True)

    class Meta:
        model = Comunicacao
        fields = [
            'id', 'case', 'autor', 'tipo_comunicacao', 'destinatario',
            'assunto', 'corpo', 'timestamp'
        ]
        read_only_fields = ['autor', 'timestamp', 'case']

# ADICIONAR NOVO SERIALIZER MAIS COMPLETO
class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_system_user = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 
            'cpf', 'telefone', 'role', 'is_active', 'is_system_user',
            'date_joined', 'last_login'
        ]
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
        
    def get_is_system_user(self, obj):
        return obj.is_active and obj.has_usable_password()

# ATUALIZAR O UserRegistrationSerializer PARA SUPORTAR NOVOS CAMPOS
class ContactCreateSerializer(serializers.ModelSerializer):
    is_full_user = serializers.BooleanField(write_only=True, default=False)
    contact_type = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default='CLIENTE')
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'email', 'cpf', 'telefone', 
            'setor_ou_equipe', 'role', 'is_full_user', 'contact_type', 'password'
        ]
        
    def create(self, validated_data):
        is_full_user = validated_data.pop('is_full_user', False)
        contact_type = validated_data.pop('contact_type', 'CLIENTE')
        password = validated_data.pop('password', None)
        
        # Criar username baseado no email
        validated_data['username'] = validated_data['email']
        validated_data['role'] = contact_type
        
        user = CustomUser.objects.create(**validated_data)
        
        if is_full_user and password:
            user.set_password(password)
            user.is_active = True
        elif is_full_user:
            # Senha temporária
            user.set_password(f"temp{user.id}2024")
            user.is_active = True
        else:
            user.set_unusable_password()
            user.is_active = False
            
        user.save()
        return user