# backend/core/views.py

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
# Atualize estas linhas de import no topo do seu views.py
from .models import (
    Case, Document, ProcessMovement, Comunicacao, CustomUser,
    ChecklistTemplate, RequiredDocument, DocumentValidationCheck, ContractAnalysisData
)
from .serializers import (
    UserRegistrationSerializer, CaseSerializer, DocumentSerializer,
    ProcessMovementSerializer, ComunicacaoSerializer, ActorSerializer,
    TimelineEventSerializer, DocumentValidationCheckSerializer,
    ChecklistTemplateSerializer, ContractAnalysisDataSerializer,
    MyTokenObtainPairSerializer  # Adicionado para corrigir o erro
)
from .permissions import IsAdminOrColaboradorUser # Importe sua permissão customizada

# --- Autenticação ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

CustomUser = get_user_model()

# --- Funções Auxiliares ---
def get_case_for_user(case_id, user):
    if not user or not user.is_authenticated:
        return None
    
    if user.role == 'ADMIN':
        return get_object_or_404(Case, pk=case_id)
    elif user.role == 'FUNCIONARIO':
        return get_object_or_404(Case, pk=case_id, created_by=user)
    elif user.role == 'CLIENTE':
        return get_object_or_404(Case, pk=case_id, client=user)
    raise PermissionDenied("Você não tem permissão para acessar este caso.")

# --- Views de Usuários e Contatos ---
class RegisterView(APIView):
    permission_classes = [IsAdminOrColaboradorUser]
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Usuário registrado com sucesso!", "user": ActorSerializer(user).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    serializer_class = ActorSerializer
    permission_classes = [IsAdminOrColaboradorUser]
    def get_queryset(self):
        return CustomUser.objects.all()

class ClientListView(generics.ListAPIView):
    serializer_class = ActorSerializer
    permission_classes = [IsAdminOrColaboradorUser]
    def get_queryset(self):
        return CustomUser.objects.filter(role='CLIENTE').order_by('first_name', 'last_name')

class ContactListView(generics.ListAPIView):
    serializer_class = ActorSerializer
    permission_classes = [IsAdminOrColaboradorUser]
    def get_queryset(self):
        return CustomUser.objects.all().order_by('-date_joined')

class ContactCreateView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAdminOrColaboradorUser]

# --- Views Principais ---
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({"message": f"Bem-vindo ao Dashboard, {user.first_name}!", "user": { "id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name, "role": user.role }}, status=status.HTTP_200_OK)

# --- Views de Casos (Protocols) ---
class CaseListCreateView(generics.ListCreateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Case.objects.all().select_related('client', 'created_by').order_by('-created_at')
        elif user.role == 'FUNCIONARIO':
            return Case.objects.filter(created_by=user).select_related('client', 'created_by').order_by('-created_at')
        elif user.role == 'CLIENTE':
            return Case.objects.filter(client=user).select_related('client', 'created_by').order_by('-created_at')
        return Case.objects.none()
    def perform_create(self, serializer):
        if self.request.user.role not in ['ADMIN', 'FUNCIONARIO']:
            raise PermissionDenied("Apenas Administradores ou Funcionários podem criar casos.")
        client_id = self.request.data.get('client_id')
        client = get_object_or_404(CustomUser, id=client_id, role='CLIENTE')
        case = serializer.save(created_by=self.request.user, client=client)
        ProcessMovement.objects.create(case=case, actor=self.request.user, movement_type='Criação', content=f"Caso criado para o cliente {client.email}.")

class CaseDetailView(generics.RetrieveAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()
    def get_object(self):
        return get_case_for_user(self.kwargs['pk'], self.request.user)

# --- Views de Documentos, Andamentos, Comunicações ---
class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        return Document.objects.filter(case=case).select_related('uploaded_by')
    def perform_create(self, serializer):
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        serializer.save(uploaded_by=self.request.user, case=case)

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Document.objects.all()
    def get_object(self):
        doc = super().get_object()
        get_case_for_user(doc.case.id, self.request.user) # Check permission
        return doc

class ProcessMovementListCreateView(generics.ListCreateAPIView):
    serializer_class = ProcessMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        return ProcessMovement.objects.filter(case=case).select_related('actor')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        movement_type = serializer.validated_data.get('movement_type')

        # Clientes só podem criar andamentos do tipo 'Visualização'
        if self.request.user.role == 'CLIENTE' and movement_type != 'Visualização':
            raise PermissionDenied("Clientes só podem registrar visualizações.")

        # Lógica anti-spam para 'Visualização'
        if movement_type == 'Visualização':
            time_threshold = timezone.now() - timedelta(minutes=15)
            if ProcessMovement.objects.filter(case=case, actor=self.request.user, movement_type='Visualização', timestamp__gte=time_threshold).exists():
                return Response({"message": "Acesso recente já registrado."}, status=status.HTTP_200_OK)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        serializer.save(actor=self.request.user, case=case)

class ComunicacaoListCreateView(generics.ListCreateAPIView):
    serializer_class = ComunicacaoSerializer
    permission_classes = [IsAdminOrColaboradorUser]
    def get_queryset(self):
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        return Comunicacao.objects.filter(case=case).select_related('autor')
    def perform_create(self, serializer):
        case = get_case_for_user(self.kwargs['case_id'], self.request.user)
        serializer.save(autor=self.request.user, case=case)

class TimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, case_id, *args, **kwargs):
        case = get_case_for_user(case_id, request.user)
        movements = ProcessMovement.objects.filter(case=case).select_related('actor', 'associated_document')
        comunicacoes = Comunicacao.objects.filter(case=case).select_related('autor')
        timeline_events = []
        for movement in movements:
            timeline_events.append({'type': 'Andamento', 'actor': movement.actor, 'timestamp': movement.timestamp, 'content': movement.content or movement.movement_type, 'event_specific_details': {'movement_type': movement.movement_type, 'associated_document': DocumentSerializer(movement.associated_document).data if movement.associated_document else None}})
        for comunicacao in comunicacoes:
            timeline_events.append({'type': 'Comunicação', 'actor': comunicacao.autor, 'timestamp': comunicacao.timestamp, 'content': comunicacao.corpo, 'event_specific_details': {'communication_type': comunicacao.tipo_comunicacao, 'subject': comunicacao.assunto, 'recipient': comunicacao.destinatario}})
        timeline_events.sort(key=lambda x: x['timestamp'], reverse=True)
        serializer = TimelineEventSerializer(timeline_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# --- Views de Ação ---
class CaseActionView(APIView):
    """
    Endpoint unificado e expandido para executar ações de workflow em um caso.
    """
    permission_classes = [IsAdminOrColaboradorUser]

    def post(self, request, pk, *args, **kwargs):
        case = get_object_or_404(Case, pk=pk)
        action_id = request.data.get('action_id')
        justification = request.data.get('justification', '')
        target_status = request.data.get('target_status')

        if not action_id:
            return Response({"error": "action_id é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        new_status = None
        movement_type = ""
        content = justification

        if action_id == 'send_to_validation':
            new_status = 'VALIDACAO_DOCUMENTAL'
            movement_type = "Enviado para Validação"
            content = "Protocolo iniciado e enviado para validação documental."
        
        elif action_id == 'approve_documents':
            new_status = 'EXTRACAO_DADOS'
            movement_type = "Documentos Aprovados"
            content = "Documentação validada. O caso segue para extração de dados."
        
        elif action_id == 'reprove_documents':
            new_status = 'AGUARDANDO_OFICIO'
            movement_type = "Documentos Reprovados"
            content = f"Documentação reprovada. Motivo: {justification}"

        elif action_id == 'force_manual_transition':
            if not target_status:
                return Response({"error": "target_status é obrigatório para esta ação."}, status=status.HTTP_400_BAD_REQUEST)
            new_status = target_status
            movement_type = "Andamento Manual Forçado"
            content = f"Status alterado manualmente para '{target_status}'. Justificativa: {justification}"
        
        elif action_id == 'add_internal_note':
            movement_type = "Nota Interna Adicionada"
        
        elif action_id == 'create_internal_request':
            movement_type = "Requisição Interna Criada"

        elif action_id == 'reclassify_case':
            movement_type = "Protocolo Reclassificado"

        elif action_id == 'archive_case':
            new_status = 'ARQUIVADO'
            movement_type = "Caso Arquivado"
            content = f"O caso foi arquivado manualmente. Motivo: {justification}"

        else:
            # Verifica se a ação é apenas de frontend (como abrir um modal)
            possible_actions = CaseSerializer(case, context={'request': request}).data.get('available_actions', [])
            is_frontend_action = any(a['id'] == action_id for a in possible_actions)
            if is_frontend_action:
                 # Ação conhecida, mas sem lógica de backend (ex: external_communication). Retorna sucesso.
                return Response(CaseSerializer(case, context={'request': request}).data, status=status.HTTP_200_OK)
            else:
                 return Response({"error": f"Ação '{action_id}' desconhecida ou não permitida."}, status=status.HTTP_400_BAD_REQUEST)

        if new_status:
            case.current_status = new_status
            case.save()
        
        if movement_type:
            ProcessMovement.objects.create(
                case=case,
                actor=request.user,
                movement_type=movement_type,
                content=content
            )

        return Response(CaseSerializer(case, context={'request': request}).data, status=status.HTTP_200_OK)

class CriarOficioView(APIView):
    permission_classes = [IsAdminOrColaboradorUser]
    def post(self, request, pk, *args, **kwargs):
        parent_case = get_case_for_user(pk, request.user)
        new_oficio_case = Case.objects.create(title=f"Ofício para {parent_case.protocol_id}", parent_case=parent_case, case_type='outros', client=parent_case.client, created_by=request.user)
        parent_case.current_status = 'EM_EXECUCAO_OFICIO'
        parent_case.save()
        ProcessMovement.objects.create(case=parent_case, actor=request.user, movement_type="Criação de Ofício", content=f"Ofício gerado: {new_oficio_case.protocol_id}")
        return Response(CaseSerializer(new_oficio_case, context={'request': request}).data, status=status.HTTP_201_CREATED)

class RegisterAccessView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, case_id, *args, **kwargs):
        case = get_case_for_user(case_id, request.user)
        time_threshold = timezone.now() - timedelta(minutes=15)
        if ProcessMovement.objects.filter(case=case, actor=request.user, movement_type='Visualização', timestamp__gte=time_threshold).exists():
            return Response({'message': 'Acesso recente já registrado.'}, status=status.HTTP_200_OK)
        ProcessMovement.objects.create(case=case, actor=request.user, movement_type='Visualização', content=f'O usuário {request.user.get_full_name() or request.user.username} visualizou o protocolo.')
        return Response({'message': 'Acesso registrado com sucesso.'}, status=status.HTTP_201_CREATED)

# Adicionar estas novas classes ao final do seu views.py

class ContractAnalysisDataView(generics.ListCreateAPIView):
    serializer_class = ContractAnalysisDataSerializer
    permission_classes = [IsAdminOrColaboradorUser]

    def get_queryset(self):
        return ContractAnalysisData.objects.filter(case_id=self.kwargs['case_pk'])

    def perform_create(self, serializer):
        case = get_object_or_404(Case, pk=self.kwargs['case_pk'])
        if ContractAnalysisData.objects.filter(case=case).exists():
            raise serializers.ValidationError("Dados de análise para este caso já existem.")
        serializer.save(case=case, dados_extraidos_por=self.request.user)

class ContractAnalysisDataDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ContractAnalysisDataSerializer
    permission_classes = [IsAdminOrColaboradorUser]
    queryset = ContractAnalysisData.objects.all()

class CaseChecklistView(generics.RetrieveAPIView):
    serializer_class = ChecklistTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        case = get_object_or_404(Case, pk=self.kwargs['case_pk'])
        if not case.checklist_template:
            raise serializers.ValidationError("Este caso não possui um checklist de documentos associado.")
        return case.checklist_template

class DocumentValidationCheckView(generics.ListCreateAPIView):
    serializer_class = DocumentValidationCheckSerializer
    permission_classes = [IsAdminOrColaboradorUser]

    def get_queryset(self):
        return DocumentValidationCheck.objects.filter(document__case_id=self.kwargs['case_pk'])

    def perform_create(self, serializer):
        document_id = self.request.data.get('document')
        document = get_object_or_404(Document, pk=document_id, case_id=self.kwargs['case_pk'])
        if DocumentValidationCheck.objects.filter(document=document).exists():
            raise serializers.ValidationError("Este documento já possui um checklist de validação.")
        serializer.save(validated_by=self.request.user, document=document)

# Adicionar esta view ao final do seu views.py
class DocumentValidationCheckDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DocumentValidationCheckSerializer
    permission_classes = [IsAdminOrColaboradorUser] # Usando a permissão correta
    queryset = DocumentValidationCheck.objects.all()

    def perform_update(self, serializer):
        # Garante que o 'validated_by' seja o usuário que fez a última modificação
        serializer.save(validated_by=self.request.user)