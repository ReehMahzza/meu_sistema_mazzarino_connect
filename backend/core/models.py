# Em backend/core/models.py (VERSÃO FINAL E CORRIGIDA DE TODAS AS MODELS ATÉ FASE 7)

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class CustomUser(AbstractUser):
    first_name = models.CharField(('first name'), max_length=150, blank=True, null=True)
    last_name = models.CharField(('last name'), max_length=150, blank=True, null=True)

    email = models.EmailField(unique=True)
    # CPF e Telefone são null=True, blank=True (opcionais)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True, verbose_name="CPF")
    telefone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone")
    setor_ou_equipe = models.CharField(max_length=100, null=True, blank=True, verbose_name="Setor/Equipe")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] 

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

    # Fase 3: Análise e Parecer Técnico
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

    # Fase 4: Proposta de Renegociação e Contratação
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

    # Fase 5: Negociação com a Instituição Financeira
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

    # Fase 6: Formalização do Acordo
    final_agreement_sent_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Envio do Acordo Final"
    )

    # Fase 7: Liquidação Financeira
    BANK_PAYMENT_CHOICES = [
        ('Aguardando Pagamento Banco', 'Aguardando Pagamento Banco'),
        ('Pago pelo Banco', 'Pago pelo Banco'),
        ('Reembolso Solicitado', 'Reembolso Solicitado'),
        ('Disputa', 'Disputa'),
    ]
    bank_payment_status = models.CharField(
        max_length=50,
        choices=BANK_PAYMENT_CHOICES,
        default='Aguardando Pagamento Banco',
        verbose_name="Status Pagamento Banco"
    )
    client_liquidation_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Liquidação ao Cliente"
    )
    commission_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Valor da Comissão"
    )
    # ADICIONAR NOVOS CAMPOS AQUI (FASE 8)
    completion_date = models.DateField(
         blank=True,
         null=True,
         verbose_name="Data de Conclusão do Caso"
    )
    final_communication_sent = models.BooleanField(
        default=False,
        verbose_name="Comunicação Final Enviada"
    )
    survey_sent = models.BooleanField(
        default=False,
        verbose_name="Pesquisa de Satisfação Enviada"
    )    

    def __str__(self):
        return self.title

class Document(models.Model): 
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents', verbose_name="Caso")
    file_name = models.CharField(max_length=255, verbose_name="Nome do Arquivo")
    file_type = models.CharField(max_length=50, verbose_name="Tipo do Arquivo")
    file_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="URL do Arquivo")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Data de Upload")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
        verbose_name="Enviado por"
    )

    def __str__(self):
        return self.file_name

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
    request_details = models.TextField(blank=True, null=True, verbose_name="Detalhes da Solicitação de Serviço")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        actor_name = self.actor.get_full_name() if self.actor and self.actor.first_name else (self.actor.email if self.actor else 'N/A')
        return f"Andamento em '{self.case.title}' por {actor_name} em {self.timestamp.strftime('%d/%m/%Y %H:%M')}"