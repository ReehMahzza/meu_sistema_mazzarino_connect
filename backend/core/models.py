# Em backend/core/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    # MODIFICAR AQUI: Tornar campos de nome opcionais
    first_name = models.CharField(('first name'), max_length=150, blank=True, null=True)
    last_name = models.CharField(('last name'), max_length=150, blank=True, null=True)

    email = models.EmailField(unique=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True, verbose_name="CPF")
    telefone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone")
    setor_ou_equipe = models.CharField(max_length=100, null=True, blank=True, verbose_name="Setor/Equipe")

    USERNAME_FIELD = 'email'
    # O username ainda é necessário para o Django, mas o tornaremos não obrigatório na API
    # e o geraremos automaticamente a partir do e-mail.
    REQUIRED_FIELDS = ['username'] # <-- MODIFICADO

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

class Case(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título do Caso")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_cases',
        verbose_name="Criado por (Funcionário)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    current_status = models.CharField(max_length=100, default='Em tramitação interna', verbose_name="Status Atual")
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='client_cases',
        verbose_name="Cliente Associado"
    )
    IA_ANALYSIS_CHOICES = [
        ('Aguardando Análise', 'Aguardando Análise'),
        ('Potencialmente Abusivo', 'Potencialmente Abusivo'),
        ('Não Abusivo', 'Não Abusivo'),
    ]
    HUMAN_ANALYSIS_CHOICES = [
        ('Aguardando Análise', 'Aguardando Análise'),
        ('Viável', 'Viável'),
        ('Não Viável', 'Não Viável'),
    ]
    ia_analysis_result = models.CharField(
        max_length=50,
        choices=IA_ANALYSIS_CHOICES,
        default='Aguardando Análise',
        verbose_name="Resultado Análise IA"
    )
    human_analysis_result = models.CharField(
        max_length=50,
        choices=HUMAN_ANALYSIS_CHOICES,
        default='Aguardando Análise',
        verbose_name="Resultado Análise Humana"
    )
    technical_report_content = models.TextField(
        blank=True,
        null=True,
        verbose_name="Conteúdo do Parecer Técnico"
    )

    # ADICIONAR NOVOS CAMPOS AQUI (logo abaixo de technical_report_content)
    PROPOSAL_DECISION_CHOICES = [
        ('Aguardando Decisão', 'Aguardando Decisão'),
        ('Aceita', 'Aceita'),
        ('Rejeita', 'Rejeita'),
    ]
    DOCUSIGN_STATUS_CHOICES = [
        ('Não Enviado', 'Não Enviado'),
        ('Enviado', 'Enviado'),
        ('Assinado', 'Assinado'),
        ('Recusado', 'Recusado'),
    ]

    proposal_sent_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Envio da Proposta"
    )
    client_decision = models.CharField(
        max_length=50,
        choices=PROPOSAL_DECISION_CHOICES,
        default='Aguardando Decisão',
        verbose_name="Decisão do Cliente"
    )
    docusign_status = models.CharField(
        max_length=50,
        choices=DOCUSIGN_STATUS_CHOICES,
        default='Não Enviado',
        verbose_name="Status DocuSign"
    )
# ADICIONAR NOVOS CAMPOS AQUI (FASE 5)
    BANK_RESPONSE_CHOICES = [
        ('Aguardando Resposta', 'Aguardando Resposta'),
        ('Aceita', 'Aceita'),
        ('Negada', 'Negada'),
        ('Reuniao Solicitada', 'Reunião Solicitada'),
        ('Contraproposta', 'Contraproposta'),
    ]

    dossier_sent_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Envio do Dossiê ao Banco"
    )
    bank_response_status = models.CharField(
        max_length=50,
        choices=BANK_RESPONSE_CHOICES,
        default='Aguardando Resposta',
        verbose_name="Resposta do Banco"
    )
    counterproposal_details = models.TextField(
        blank=True,
        null=True,
        verbose_name="Detalhes da Contraproposta"
    )
# ADICIONAR NOVO CAMPO AQUI (FASE 6)
    final_agreement_sent_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Envio do Acordo Final"
    )

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
        on_delete=models.SET_NULL,
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

    # ADICIONAR CAMPO AQUI
    request_details = models.TextField(blank=True, null=True, verbose_name="Detalhes da Solicitação de Serviço") # <-- ADICIONE ESTA LINHA AQUI!

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        # Usamos .get_full_name() para pegar o nome completo se disponível, senão o email
        actor_name = self.actor.get_full_name() if self.actor and self.actor.first_name else (self.actor.email if self.actor else 'N/A')
        return f"Andamento em '{self.case.title}' por {actor_name} em {self.timestamp.strftime('%d/%m/%Y %H:%M')}"