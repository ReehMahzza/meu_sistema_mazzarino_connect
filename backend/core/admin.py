# backend/core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# ADICIONADO: Importe ProcessMovement
from .models import CustomUser, Case, Document, ProcessMovement

# Registrar o CustomUser
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
    list_display = ('title', 'created_by', 'current_status', 'created_at') # ADICIONADO: current_status
    list_filter = ('created_by', 'current_status', 'created_at') # ADICIONADO: current_status
    search_fields = ('title', 'description')
    raw_id_fields = ('created_by',)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'case', 'uploaded_by', 'upload_date', 'file_type')
    list_filter = ('case', 'uploaded_by', 'upload_date', 'file_type')
    search_fields = ('file_name', 'description', 'file_url')
    raw_id_fields = ('case', 'uploaded_by',)

# ADICIONAR NOVO REGISTRO AQUI para ProcessMovement
@admin.register(ProcessMovement)
class ProcessMovementAdmin(admin.ModelAdmin):
    list_display = ('case', 'actor', 'movement_type', 'timestamp', 'from_sector', 'to_sector', 'is_internal', 'associated_document_link')
    list_filter = ('movement_type', 'timestamp', 'is_internal', 'case', 'actor')
    search_fields = ('case__title', 'actor__email', 'content', 'from_sector', 'to_sector')
    raw_id_fields = ('case', 'actor', 'associated_document',)

    # Cria um link clicável para o documento associado no admin
    def associated_document_link(self, obj):
        if obj.associated_document:
            from django.utils.html import format_html
            return format_html('<a href="{}" target="_blank">{}</a>', obj.associated_document.file_url, obj.associated_document.file_name)
        return "-"
    associated_document_link.short_description = 'Documento'