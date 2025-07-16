# Em backend/core/urls.py

from django.urls import path
from .views import (
    RegisterView,
    DashboardView,
    CaseListCreateView, # ADICIONADO
    DocumentListCreateView, # ADICIONADO
    DocumentDetailView # ADICIONADO
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # ADICIONAR AQUI: Novas rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    # case_id na URL para documentos de um caso específico
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    # pk para o ID do documento
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
]