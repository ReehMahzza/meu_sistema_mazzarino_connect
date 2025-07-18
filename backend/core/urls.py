# Em backend/core/urls.py (VERSÃO FINAL E CORRIGIDA, SEM UserListView)

from django.urls import path
from .views import (
    RegisterView,
    DashboardView,
    CaseListCreateView,
    CaseDetailView, # Esta é a CaseDetailView para obter um único caso
    DocumentListCreateView,
    DocumentDetailView,
    ProcessMovementListCreateView,
    RequestContractSearchView,
    CaseAnalysisUpdateView,
    # ADICIONADO: Views das Fases 4, 5, 6, 7
    CaseProposalContractView,
    CaseNegotiationUpdateView,
    CaseFormalizationView,
    CaseLiquidationView,
    UserListView  # ← ADICIONAR ESTA IMPORTAÇÃO
)
# Não importe TokenObtainPairView e TokenRefreshView aqui, elas são importadas no urls.py principal do projeto
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # <-- NÃO IMPORTE AQUI!

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case-detail'), # Para buscar um único caso
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # Rotas de Andamentos e Serviços
    path('cases/<int:case_id>/movements/', ProcessMovementListCreateView.as_view(), name='process-movement-list-create'),
    path('cases/<int:case_id>/request-search-service/', RequestContractSearchView.as_view(), name='request-search-service'),

    # Rotas de Fases do Processo (Update)
    path('cases/<int:pk>/analyze/', CaseAnalysisUpdateView.as_view(), name='case-analysis-update'), # Fase 3
    path('cases/<int:pk>/proposal-contract/', CaseProposalContractView.as_view(), name='case-proposal-contract-update'), # Fase 4
    path('cases/<int:pk>/negotiate/', CaseNegotiationUpdateView.as_view(), name='case-negotiation-update'), # Fase 5
    path('cases/<int:pk>/formalize/', CaseFormalizationView.as_view(), name='case-formalization-update'), # Fase 6
    path('cases/<int:pk>/liquidate/', CaseLiquidationView.as_view(), name='case-liquidation-update'), # Fase 7
    
    # ADICIONAR ESTA LINHA:
    path('users/', UserListView.as_view(), name='user-list'),
]