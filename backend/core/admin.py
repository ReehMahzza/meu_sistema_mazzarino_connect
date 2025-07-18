# Em backend/core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# MODIFICADO: Importa apenas os modelos reais, não serializers como 'Actor'
from .models import CustomUser, Case, Document, ProcessMovement # <-- ESTA DEVE SER A LINHA!

# Registro do CustomUser
@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Informações Adicionais', {'fields': ('cpf', 'telefone', 'setor_ou_equipe')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {'fields': ('username', 'email', 'password', 'password2')}),
        (('Informações Adicionais', {'fields': ('first_name', 'last_name', 'cpf', 'telefone', 'setor_ou_equipe')}),),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    list_display = (
        'email', 'username', 'first_name', 'last_name', 'is_staff',
        'cpf', 'telefone', 'setor_ou_equipe'
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'setor_ou_equipe')
    search_fields = ('email', 'username', 'cpf', 'first_name', 'last_name')

# Registro dos modelos Case e Document
@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    # ADICIONADO: client e novos campos da Fase 3/4/5/6/7 para exibição no admin
    list_display = (
        'title', 'created_by', 'client', 'current_status', 'created_at',
        'ia_analysis_result', 'human_analysis_result', 'proposal_sent_date',
        'client_decision', 'docusign_status', 'dossier_sent_date',
        'bank_response_status', 'client_liquidation_date', 'commission_value',
        'final_agreement_sent_date', 'completion_date', 'final_communication_sent', 'survey_sent' # ADICIONADO: Fase 8
    )
    list_filter = (
        'created_by', 'client', 'current_status', 'ia_analysis_result',
        'human_analysis_result', 'client_decision', 'docusign_status',
        'bank_response_status', 'created_at'
    )
    search_fields = ('title', 'description', 'client__email', 'created_by__email')
    raw_id_fields = ('created_by', 'client',) # Permite buscar por ID de usuário

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'case', 'uploaded_by', 'upload_date', 'file_type')
    list_filter = ('case', 'uploaded_by', 'upload_date', 'file_type')
    search_fields = ('file_name', 'description', 'file_url')
    raw_id_fields = ('case', 'uploaded_by',)

@admin.register(ProcessMovement)
class ProcessMovementAdmin(admin.ModelAdmin):
    list_display = ('case', 'actor', 'movement_type', 'timestamp', 'content', 'associated_document_link')
    list_filter = ('movement_type', 'timestamp', 'is_internal', 'case', 'actor')
    search_fields = ('case__title', 'actor__email', 'content')
    raw_id_fields = ('case', 'actor', 'associated_document',)

    def associated_document_link(self, obj):
        if obj.associated_document:
            from django.utils.html import format_html
            return format_html('<a href="{}" target="_blank">{}</a>', obj.associated_document.file_url, obj.associated_document.file_name)
        return "-"
    associated_document_link.short_description = 'Documento'