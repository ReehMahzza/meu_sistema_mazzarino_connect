# backend/core/views.py

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone  # ADICIONADO: Para lidar com data e hora
from datetime import timedelta     # ADICIONADO: Para calcular o intervalo de tempo
from .models import Case, Document, ProcessMovement, Comunicacao, CustomUser
from .serializers import (
    UserRegistrationSerializer, CaseSerializer, DocumentSerializer,
    ProcessMovementSerializer, ComunicacaoSerializer, ActorSerializer,
    TimelineEventSerializer # ADICIONADO
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
        """
        MODIFICADO: Este método agora filtra os andamentos com base no parâmetro
        'movement_type' da URL, além de retornar todos se o parâmetro não for fornecido.
        """
        case_id = self.kwargs['case_id']
        # Queryset base que garante a permissão do usuário ao caso
        queryset = ProcessMovement.objects.filter(
            case_id=case_id,
            case__created_by=self.request.user
        ).select_related('actor', 'associated_document').order_by('-timestamp')

        # ADICIONADO: Lógica de filtro por tipo de andamento
        movement_type = self.request.query_params.get('movement_type', None)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)

        return queryset

    def perform_create(self, serializer):
        """
        MODIFICADO: Este método agora contém uma lógica anti-spam para evitar
        o registro excessivo de andamentos do tipo 'Visualização'.
        """
        case_id = self.kwargs['case_id']
        try:
            case = Case.objects.get(id=case_id, created_by=self.request.user)
        except Case.DoesNotExist:
            raise serializers.ValidationError("Caso não encontrado ou acesso negado.")

        movement_type = serializer.validated_data.get('movement_type')

        # ADICIONADO: Lógica Anti-Spam para andamentos de 'Visualização'
        if movement_type == 'Visualização':
            time_threshold = timezone.now() - timedelta(minutes=15)
            # Verifica se já existe uma visualização recente pelo mesmo usuário no mesmo caso
            recent_view_exists = ProcessMovement.objects.filter(
                case=case,
                actor=self.request.user,
                movement_type='Visualização',
                timestamp__gte=time_threshold
            ).exists()

            # Se já existe, retorna silenciosamente sem criar um novo registro
            if recent_view_exists:
                # Retornamos uma resposta vazia com status 200 OK para o frontend não tratar como erro
                return Response(status=status.HTTP_200_OK)

        # Se não for uma visualização ou se não houver registro recente, a criação prossegue
        serializer.save(
            actor=self.request.user,
            case=case
        )
        # A resposta padrão de 201 Created será enviada automaticamente
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

# ADICIONADO: Nova view para a timeline unificada
class TimelineView(APIView):
    """
    Retorna uma lista cronológica unificada de andamentos (ProcessMovement)
    e comunicações (Comunicacao) para um caso específico.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, case_id, *args, **kwargs):
        try:
            case = Case.objects.get(id=case_id, created_by=request.user)
        except Case.DoesNotExist:
            return Response({"error": "Caso não encontrado ou acesso não permitido."}, status=status.HTTP_404_NOT_FOUND)

        movements = ProcessMovement.objects.filter(case=case).select_related('actor', 'associated_document')
        comunicacoes = Comunicacao.objects.filter(case=case).select_related('autor')

        timeline_events = []

        for movement in movements:
            event = {
                'type': 'Andamento',
                'actor': movement.actor,
                'timestamp': movement.timestamp,
                'content': movement.content or movement.movement_type,
                'event_specific_details': {
                    'movement_type': movement.movement_type,
                    'associated_document': DocumentSerializer(movement.associated_document).data if movement.associated_document else None,
                }
            }
            timeline_events.append(event)

        for comunicacao in comunicacoes:
            event = {
                'type': 'Comunicação',
                'actor': comunicacao.autor,
                'timestamp': comunicacao.timestamp,
                'content': comunicacao.corpo,
                'event_specific_details': {
                    'communication_type': comunicacao.tipo_comunicacao,
                    'subject': comunicacao.assunto,
                    'recipient': comunicacao.destinatario,
                }
            }
            timeline_events.append(event)

        timeline_events.sort(key=lambda x: x['timestamp'], reverse=True)

        serializer = TimelineEventSerializer(timeline_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)