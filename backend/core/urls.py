# Em backend/core/urls.py

from django.urls import path
from .views import (
    RegisterView,
    DashboardView,
    CaseListCreateView,
    DocumentListCreateView,
    DocumentDetailView,
    ProcessMovementListCreateView,
    RequestContractSearchView,
    CaseAnalysisUpdateView,
    CaseDetailView,
    CaseProposalContractView,
    CaseNegotiationUpdateView,
    CaseFormalizationView # <-- ADICIONE ESTE IMPORT AQUI!
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case-detail'),
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # Nova rota para andamentos de processo
    path('cases/<int:case_id>/movements/', ProcessMovementListCreateView.as_view(), name='process-movement-list-create'),

    # Rota para Solicitação de Serviço de Busca de Contrato
    path('cases/<int:case_id>/request-search-service/', RequestContractSearchView.as_view(), name='request-search-service'),

    # Rota para Análise e Parecer Técnico (Update)
    path('cases/<int:pk>/analyze/', CaseAnalysisUpdateView.as_view(), name='case-analysis-update'),

    # Rota para Proposta e Contratação (Update)
    path('cases/<int:pk>/proposal-contract/', CaseProposalContractView.as_view(), name='case-proposal-contract-update'),

    # Rota para Negociação com a Instituição Financeira (Update)
    path('cases/<int:pk>/negotiate/', CaseNegotiationUpdateView.as_view(), name='case-negotiation-update'),

    # ADICIONAR NOVA ROTA AQUI (FASE 6)
    path('cases/<int:pk>/formalize/', CaseFormalizationView.as_view(), name='case-formalization-update'), # <-- ADICIONE ESTA LINHA AQUI!
]