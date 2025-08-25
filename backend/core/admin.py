# backend/core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Case, Document, ProcessMovement, Comunicacao, 
    ChecklistTemplate, RequiredDocument, DocumentValidationCheck, ContractAnalysisData
)
from .forms import CustomUserCreationForm, CustomUserChangeForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_staff']
    # ... (resto da configuração do CustomUserAdmin sem alterações) ...
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'cpf', 'telefone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Mazzarino Corp Fields', {'fields': ('role', 'setor_ou_equipe')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password2', 'first_name', 'last_name', 'cpf', 'telefone', 'role'),
        }),
    )

# --- Configuração dos Checklists (já implementada) ---
class RequiredDocumentInline(admin.TabularInline):
    model = RequiredDocument
    extra = 1

class ChecklistTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    inlines = [RequiredDocumentInline]

# --- ADICIONADO: Configuração para exibir Documentos dentro de Casos ---
class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0  # Não mostra campos em branco por padrão, apenas os existentes.
    fields = ('file_name', 'file_type', 'description', 'upload_date')
    readonly_fields = ('upload_date',) # A data é preenchida automaticamente

class CaseAdmin(admin.ModelAdmin):
    list_display = ('protocol_id', 'title', 'client', 'current_status', 'created_at')
    list_filter = ('current_status', 'case_type')
    search_fields = ('protocol_id', 'title', 'client__email')
    readonly_fields = ('protocol_id', 'created_at')
    inlines = [DocumentInline] # Adiciona a tabela de documentos na página do caso

# --- Registro de todos os modelos no site de administração ---
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Case, CaseAdmin) # MODIFICADO: Usa o novo CaseAdmin
admin.site.register(Document) # Mantemos o registro individual para acesso direto se necessário
admin.site.register(ProcessMovement)
admin.site.register(Comunicacao)
admin.site.register(DocumentValidationCheck)
admin.site.register(ContractAnalysisData)
admin.site.register(ChecklistTemplate, ChecklistTemplateAdmin)