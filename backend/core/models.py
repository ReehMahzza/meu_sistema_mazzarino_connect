# backend/core/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings # Importe settings

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True, verbose_name="CPF")
    telefone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone")
    setor_ou_equipe = models.CharField(max_length=100, null=True, blank=True, verbose_name="Setor/Equipe")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return self.email

class Case(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título do Caso")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cases',
        verbose_name="Criado por"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    current_status = models.CharField(max_length=100, default='Em tramitação interna', verbose_name="Status Atual") # <-- ADICIONE ESTA LINHA AQUI!

    def __str__(self):
        return self.title

class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents', verbose_name="Caso")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Enviado por"
    )
    file_name = models.CharField(max_length=255, verbose_name="Nome do Arquivo")
    file_type = models.CharField(max_length=50, verbose_name="Tipo do Arquivo")
    file_url = models.URLField(max_length=1024, verbose_name="URL do Arquivo") # Para links de OneDrive/Google Drive
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Data de Upload")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição do Documento")

    def __str__(self):
        return f"{self.file_name} (Caso: {self.case.title})"

# ADICIONAR NOVO MODELO AQUI (no final do arquivo)
class ProcessMovement(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='movements', verbose_name="Caso")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, # Mantém o andamento mesmo se o usuário for deletado
        null=True,
        related_name='movements',
        verbose_name="Ator"
    )
    movement_type = models.CharField(max_length=50, verbose_name="Tipo de Movimento")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Data e Hora")
    from_sector = models.CharField(max_length=100, blank=True, null=True, verbose_name="Do Setor")
    to_sector = models.CharField(max_length=100, blank=True, null=True, verbose_name="Para o Setor")
    content = models.TextField(blank=True, null=True, verbose_name="Conteúdo/Despacho")
    associated_document = models.ForeignKey(
        Document,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='movements',
        verbose_name="Documento Associado"
    )
    is_internal = models.BooleanField(default=True, verbose_name="Movimento Interno")
    notes = models.TextField(blank=True, null=True, verbose_name="Anotações Internas")

    class Meta:
        ordering = ['-timestamp'] # Ordena sempre do mais novo para o mais antigo

    def __str__(self):
        # Usamos .get_full_name() para pegar o nome completo se disponível, senão o email
        actor_name = self.actor.get_full_name() if self.actor and self.actor.first_name else (self.actor.email if self.actor else 'N/A')
        return f"Andamento em '{self.case.title}' por {actor_name} em {self.timestamp.strftime('%d/%m/%Y %H:%M')}"