# Em backend/core/urls.py

from django.urls import path
from .views import (
    RegisterView,
    DashboardView,
    CaseListCreateView,
    CaseDetailView,
    DocumentListCreateView,
    DocumentDetailView,
    ProcessMovementListCreateView,
    UserListView,
    ComunicacaoListCreateView,
    ClientListView,
    ContactListView,      # CORRETO: Import direto
    ContactCreateView,    # CORRETO: Import direto
    TimelineView,
    CaseActionView, # Adicionado
    CriarOficioView, RegisterAccessView,
    ContractAnalysisDataView,
    ContractAnalysisDataDetailView,
    CaseChecklistView,
    DocumentValidationCheckView,
    DocumentValidationCheckDetailView, # ADICIONADO
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case-detail'),
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # Rotas de Andamentos e Serviços
    path('cases/<int:case_id>/movements/', ProcessMovementListCreateView.as_view(), name='process-movement-list-create'),

    # Comunicações
    path('cases/<int:case_id>/comunicacoes/', ComunicacaoListCreateView.as_view(), name='comunicacao-list-create'),
    
    # Clientes (rota antiga)
    path('clients/', ClientListView.as_view(), name='client-list'),

    # CONTATOS (CORRETO - SEM views. no início)
    path('contacts/', ContactListView.as_view(), name='contact-list'),
    path('contacts/create/', ContactCreateView.as_view(), name='contact-create'),
    
    # Usuários (manter para compatibilidade)
    path('users/', UserListView.as_view(), name='user-list'),

    # ADICIONADO: Nova rota para a timeline unificada
    path('cases/<int:case_id>/timeline/', TimelineView.as_view(), name='case-timeline'),

    # ADICIONADO: Novas rotas de ação para um caso específico
    path('cases/<int:pk>/action/', CaseActionView.as_view(), name='case-action'),
    path('cases/<int:pk>/criar-oficio/', CriarOficioView.as_view(), name='case-create-oficio'),

    # Novas rotas para o workflow de BPM
    path('cases/<int:case_pk>/checklist/', CaseChecklistView.as_view(), name='case-checklist'),
    path('cases/<int:case_pk>/document-validations/', DocumentValidationCheckView.as_view(), name='document-validation-list'),
    path('cases/<int:case_pk>/contract-data/', ContractAnalysisDataView.as_view(), name='contract-data-list-create'),
    path('contract-data/<int:pk>/', ContractAnalysisDataDetailView.as_view(), name='contract-data-detail'),
    path('document-validations/<int:pk>/', DocumentValidationCheckDetailView.as_view(), name='document-validation-detail'),
    
]