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
    CaseDetailView # <-- ADICIONE ESTE IMPORT AQUI!
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    # ADICIONAR NOVA ROTA AQUI para detalhe de caso
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case-detail'), # <-- ADICIONE ESTA LINHA AQUI!
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # Nova rota para andamentos de processo
    path('cases/<int:case_id>/movements/', ProcessMovementListCreateView.as_view(), name='process-movement-list-create'),

    # Rota para Solicitação de Serviço de Busca de Contrato
    path('cases/<int:case_id>/request-search-service/', RequestContractSearchView.as_view(), name='request-search-service'),

    # Rota para Análise e Parecer Técnico (Update)
    path('cases/<int:pk>/analyze/', CaseAnalysisUpdateView.as_view(), name='case-analysis-update'),
]