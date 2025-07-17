# Em backend/core/views.py

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import UserRegistrationSerializer, CaseSerializer, DocumentSerializer, ProcessMovementSerializer
from .models import Case, Document, ProcessMovement

CustomUser = get_user_model()

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Usuário registrado com sucesso!"}, status=status.HTTP_201_CREATED)
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
        return Case.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        case = serializer.save(created_by=self.request.user)
        ProcessMovement.objects.create(
            case=case,
            actor=self.request.user,
            movement_type='Criação',
            content='Caso criado no sistema.'
        )

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs['case_id']
        return Document.objects.filter(case_id=case_id, case__created_by=self.request.user)

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
        # O associated_document agora recebe o objeto Document
        ProcessMovement.objects.create(
            case=case,
            actor=self.request.user,
            movement_type='Upload de Documento',
            content=f'Realizado o upload do documento: "{document.file_name}".',
            associated_document=document # Passa o OBJETO document aqui
        )

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return Document.objects.filter(uploaded_by=self.request.user)

class ProcessMovementListCreateView(generics.ListCreateAPIView):
    serializer_class = ProcessMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs['case_id']
        return ProcessMovement.objects.filter(
            case_id=case_id,
            case__created_by=self.request.user
        ).order_by('-timestamp')

    def perform_create(self, serializer):
        case_id = self.kwargs['case_id']
        case = Case.objects.get(id=case_id, created_by=self.request.user)
        # Se 'associated_document_id' foi passado, use o objeto Document
        associated_doc_id = serializer.validated_data.get('associated_document') # Isso virá como objeto Document do serializer

        movement = serializer.save(
            actor=self.request.user,
            case=case,
            associated_document=associated_doc_id # Garante que o objeto Document é passado corretamente
        )
        if movement.movement_type:
            case.current_status = movement.movement_type
            case.save()