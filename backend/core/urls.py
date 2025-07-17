# Em backend/core/urls.py

from django.urls import path
from .views import (
    RegisterView,
    DashboardView,
    CaseListCreateView,
    DocumentListCreateView,
    DocumentDetailView,
    ProcessMovementListCreateView # ADICIONADO
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    # Rotas para Casos e Documentos
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:case_id>/documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),

    # ADICIONADA: Nova rota para andamentos de processo
    path('cases/<int:case_id>/movements/', ProcessMovementListCreateView.as_view(), name='process-movement-list-create'),
]