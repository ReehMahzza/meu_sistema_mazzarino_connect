# backend/core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, Case, Document

# Registrar o CustomUser
@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    # Definindo todos os fieldsets para evitar problemas de concatenação
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        # ATENÇÃO AQUI: Removido o par de parênteses extras que envolvia esta tupla
        ('Informações Adicionais', {'fields': ('cpf', 'telefone', 'setor_ou_equipe')}), # <-- CORRIGIDO AQUI
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    # Definindo explicitamente os add_fieldsets para a tela de criação de usuário
    add_fieldsets = (
        (None, {'fields': ('username', 'email', 'password', 'password2')}),
        (('Informações Adicionais', {'fields': ('first_name', 'last_name', 'cpf', 'telefone', 'setor_ou_equipe')}),),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    # Adicione seus campos personalizados à lista de exibição
    list_display = (
        'email', 'username', 'first_name', 'last_name', 'is_staff',
        'cpf', 'telefone', 'setor_ou_equipe'
    )
    # Filtros adicionais na barra lateral
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'setor_ou_equipe')
    # Campos de busca
    search_fields = ('email', 'username', 'cpf', 'first_name', 'last_name')
    # list_editable = ('cpf', 'telefone', 'setor_ou_equipe') # Cuidado ao usar.

# ADICIONAR AQUI: Registro dos novos modelos Case e Document
@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    list_filter = ('created_by', 'created_at')
    search_fields = ('title', 'description')
    # raw_id_fields = ('created_by',)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'case', 'uploaded_by', 'upload_date', 'file_type')
    list_filter = ('case', 'uploaded_by', 'upload_date', 'file_type')
    search_fields = ('file_name', 'description', 'file_url')
    # raw_id_fields = ('case', 'uploaded_by',)