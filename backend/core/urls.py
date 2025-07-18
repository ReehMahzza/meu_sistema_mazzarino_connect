# Em backend/core/urls.py

from django.urls import path
from .views import (
    RegisterView,
    DashboardView,
    CaseListCreateView,
    DocumentListCreateView,
    DocumentDetailView,
    ProcessMovementListCreateView,
    RequestContractSearchView # <-- ADICIONE ESTE IMPORT AQUI!
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # Nova rota para andamentos de processo
    path('cases/<int:case_id>/movements/', ProcessMovementListCreateView.as_view(), name='process-movement-list-create'),

    # ADICIONAR NOVA ROTA AQUI para Solicitação de Serviço de Busca de Contrato
    path('cases/<int:case_id>/request-search-service/', RequestContractSearchView.as_view(), name='request-search-service'), # <-- ADICIONE ESTA LINHA AQUI!
]