# Em backend/core/views.py

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import UserRegistrationSerializer, CaseSerializer, DocumentSerializer, ProcessMovementSerializer, ActorSerializer # Adicione ActorSerializer aqui
from .models import Case, Document, ProcessMovement

CustomUser = get_user_model()

class RegisterView(APIView):
    # MODIFICAR AQUI: Retornar dados do usuário criado
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Retorna os dados do usuário para que o frontend possa usá-los
            return Response({
                "message": "Usuário registrado com sucesso!",
                "user": ActorSerializer(user).data # Usar ActorSerializer para formatar a saída do usuário
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            "message": f"Bem-vindo ao Dashboard, {user.first_name}!",
            "user": { "id": user.id, "email": user.email, "first_name": user.first_name, "last_name": user.last_name, }
        }, status=status.HTTP_200_OK)


class CaseListCreateView(generics.ListCreateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Inclui 'created_by' e 'client' para que o serializer possa acessá-los diretamente
        return Case.objects.filter(created_by=self.request.user).select_related('created_by', 'client')

    # MODIFICAR AQUI: Associar o caso ao cliente e ao funcionário
    def perform_create(self, serializer):
        client_id = serializer.validated_data.pop('client_id') # Pega o client_id do serializer
        client = get_user_model().objects.get(id=client_id) # Busca o objeto Cliente

        case = serializer.save(
            created_by=self.request.user, # O funcionário logado
            client=client # O novo cliente associado
        )

        # Cria o primeiro andamento
        ProcessMovement.objects.create(
            case=case,
            actor=self.request.user,
            movement_type='Criação',
            content=f"Caso criado para o cliente {client.email} pelo funcionário {self.request.user.email}."
        )

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