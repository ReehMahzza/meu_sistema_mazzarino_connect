# backend/core/views.py

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q # ADICIONADO: Para buscas complexas
from .models import Case, Document, ProcessMovement, Comunicacao, CustomUser
from .serializers import (
    UserRegistrationSerializer, CaseSerializer, DocumentSerializer,
    ProcessMovementSerializer, ComunicacaoSerializer, ActorSerializer
)

CustomUser = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Usuário registrado com sucesso!",
                "user": ActorSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class ClientListView(generics.ListAPIView):
    """
    View para listar todos os usuários com a função 'CLIENTE'.
    AGORA ACEITA UM PARÂMETRO DE BUSCA 'search'.
    """
    serializer_class = ActorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CustomUser.objects.filter(role='CLIENTE').order_by('first_name', 'last_name')
        
        # LÓGICA DE BUSCA POR NOME, SOBRENOME OU E-MAIL
        search_param = self.request.query_params.get('search', None)
        if search_param:
            queryset = queryset.filter(
                Q(first_name__icontains=search_param) |
                Q(last_name__icontains=search_param) |
                Q(email__icontains=search_param)
            )
        
        return queryset
class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            "message": f"Bem-vindo ao Dashboard, {user.first_name}!",
            "user": { "id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name, }
        }, status=status.HTTP_200_OK)

class CaseListCreateView(generics.ListCreateAPIView):
    """
    View para listar casos (com filtro opcional) ou criar um novo.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Case.objects.filter(created_by=user)

        case_type = self.request.query_params.get('case_type', None)
        if case_type:
            queryset = queryset.filter(case_type=case_type)

        return queryset.select_related('client', 'created_by').order_by('-created_at')

    def perform_create(self, serializer):
        client_id = self.request.data.get('client_id')
        try:
            client = get_user_model().objects.get(id=client_id)
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError("Cliente com o ID fornecido não existe.")
        case = serializer.save(created_by=self.request.user, client=client)
        ProcessMovement.objects.create(case=case, actor=self.request.user, movement_type='Criação', content=f"Caso criado para o cliente {client.email} pelo funcionário {self.request.user.email}.")

class CaseDetailView(generics.RetrieveAPIView):
    """
    View para obter os detalhes de um caso específico.
    MODIFICADO: Garante que o usuário só possa ver casos que ele criou.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # Esta linha garante que a busca por um caso específico
        # seja feita apenas dentro dos casos pertencentes ao usuário logado.
        return Case.objects.filter(created_by=self.request.user)


class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs['case_id']
        return Document.objects.filter(case_id=case_id, case__created_by=self.request.user).select_related('uploaded_by')

    def perform_create(self, serializer):
        case_id = self.kwargs['case_id']
        case = Case.objects.get(id=case_id, created_by=self.request.user)
        file_name = serializer.validated_data.get('file_name')
        safe_file_name = file_name.replace(" ", "_").replace("/", "_")
        fake_url = f"https://docs.mazzarino.com/fake-storage/{case.id}/{self.request.user.id}/{safe_file_name}.{serializer.validated_data.get('file_type')}"

        document = serializer.save(
            uploaded_by=self.request.user,
            case=case,
            file_url=fake_url
        )
        ProcessMovement.objects.create(
            case=case,
            actor=self.request.user,
            movement_type='Upload de Documento',
            content=f'Realizado o upload do documento: "{document.file_name}".',
            associated_document=document
        )

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return Document.objects.filter(uploaded_by=self.request.user).select_related('uploaded_by')

class ProcessMovementListCreateView(generics.ListCreateAPIView):
    serializer_class = ProcessMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs['case_id']
        return ProcessMovement.objects.filter(
            case_id=case_id,
            case__created_by=self.request.user
        ).select_related('actor', 'associated_document').order_by('-timestamp')

    def perform_create(self, serializer):
        case_id = self.kwargs['case_id']
        case = Case.objects.get(id=case_id, created_by=self.request.user)

        associated_doc_obj = serializer.validated_data.get('associated_document') 

        movement = serializer.save(
            actor=self.request.user,
            case=case,
            associated_document=associated_doc_obj
        )
        if movement.movement_type:
            case.current_status = movement.movement_type
            case.save()
class UserListView(generics.ListAPIView):
    serializer_class = ActorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        email = self.request.query_params.get('email')
        if email:
            return CustomUser.objects.filter(email=email)
        return CustomUser.objects.none()

# ADICIONADO: Nova view para a entidade Comunicacao
class ComunicacaoListCreateView(generics.ListCreateAPIView):
    """
    View para listar as comunicações de um caso ou criar uma nova.
    """
    serializer_class = ComunicacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs['case_id']
        return Comunicacao.objects.filter(case_id=case_id, case__created_by=self.request.user)

    def perform_create(self, serializer):
        case_id = self.kwargs['case_id']
        case = Case.objects.get(id=case_id)
        serializer.save(autor=self.request.user, case=case)

# ADICIONAR NOVA VIEW PARA LISTAR TODOS OS USUÁRIOS/CONTATOS
class ContactListView(generics.ListAPIView):
    """
    View para listar todos os usuários/contatos
    """
    serializer_class = ActorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # SIMPLIFICAR TEMPORARIAMENTE PARA DEBUG
        queryset = CustomUser.objects.all().order_by('-date_joined')
        
        # Aplicar filtros apenas se especificados
        search = self.request.query_params.get('search', '')
        user_type = self.request.query_params.get('type', '')
        
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(cpf__icontains=search) if hasattr(CustomUser, 'cpf') else Q()
            )
        
        if user_type:
            queryset = queryset.filter(role=user_type)
        
        return queryset

class ContactCreateView(generics.CreateAPIView):
    """
    View para criar novos contatos/usuários
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        is_full_user = self.request.data.get('is_full_user', False)
        contact_type = self.request.data.get('contact_type', 'CLIENTE')
        
        user = serializer.save()
        user.role = contact_type
        
        if is_full_user:
            password = self.request.data.get('password', None)
            if password:
                user.set_password(password)
            else:
                user.set_password(f"temp{user.id}2024")
            user.is_active = True
        else:
            user.set_unusable_password()
            user.is_active = False
            
        user.save()
        return user