# backend/core/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from django.db.models import Max

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('CLIENTE', 'Cliente'),
        ('FUNCIONARIO', 'Funcionário'),
        ('ADMIN', 'Administrador'),
    ]
    first_name = models.CharField(('first name'), max_length=150, blank=True, null=True)
    last_name = models.CharField(('last name'), max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True, verbose_name="CPF")
    telefone = models.CharField(max_length=20, null=True, blank=True, verbose_name="Telefone")
    setor_ou_equipe = models.CharField(max_length=100, null=True, blank=True, verbose_name="Setor/Equipe")
    client_id = models.CharField(max_length=20, unique=True, blank=True, null=True, editable=False, verbose_name="ID de Cliente")

    # ADICIONADO: Campo role para distinguir tipos de usuário
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='CLIENTE', 
        verbose_name="Função"
    )
    
    # ADICIONADO: Campo para o ID de Cliente personalizado
    client_id = models.CharField(max_length=20, unique=True, blank=True, null=True, editable=False, verbose_name="ID de Cliente")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

    # ADICIONADO: Lógica para gerar o client_id automaticamente
    def save(self, *args, **kwargs):
        if not self.pk and not self.client_id:
            # A lógica depende do CPF. Se não houver CPF, o ID não será gerado.
            if self.cpf:
                cpf_digits = ''.join(filter(str.isdigit, self.cpf))
                if len(cpf_digits) >= 3:
                    cpf_prefix = cpf_digits[:3]

                    now = timezone.now()
                    current_month = now.month
                    current_year = now.year

                    # Conta quantos clientes já foram criados neste mês/ano para obter a sequência
                    sequence_count = CustomUser.objects.filter(
                        date_joined__year=current_year,
                        date_joined__month=current_month
                    ).count()
                    next_sequence = sequence_count + 1

                    # Formata o ID final: XXX-MMSS/AAAA
                    self.client_id = f"{cpf_prefix}-{current_month:02d}{next_sequence:02d}/{current_year}"

        super(CustomUser, self).save(*args, **kwargs)

class Case(models.Model):
    CASE_TYPE_CHOICES = [
        ('renegociacao_credito', 'Renegociação de Crédito'),
        ('resolucao_conflitos_telecom', 'Resolução de Conflitos - Telecom'),
        ('outros', 'Outros'),
    ]
    CONTRACT_TYPE_CHOICES = [
        ('renegociacao_consignado', 'Renegociação Consignado INSS'),
        ('credito_pessoal', 'Crédito Pessoal'),
        ('financiamento_veicular', 'Financiamento Veicular'),
        ('financiamento_imovel', 'Financiamento Imóvel'),
        ('cartao_consignado', 'Cartão Consignado'),
        ('cartao_beneficio', 'Cartão Benefício'),
    ]
    # ADICIONADO: Choices para a máquina de estados do protocolo
    STATUS_CHOICES = [
        ('AGUARDANDO_DOCUMENTOS', 'Aguardando Documentos'),
        ('EM_ANALISE_IA', 'Em Análise (IA)'),
        ('PENDENTE_SOLICITACAO_CONTRATOS', 'Pendente - Solicitação de Contratos'),
        ('ANALISE_HUMANA', 'Em Análise (Humana)'),
        ('EM_EXECUCAO_OFICIO', 'Em Execução de Ofício'),
    ]

    # ADICIONADO: Campo para o ID de Protocolo personalizado
    protocol_id = models.CharField(max_length=30, unique=True, blank=True, null=True, editable=False, verbose_name="ID do Protocolo")

    title = models.CharField(max_length=255, verbose_name="Título do Caso")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_cases',
        verbose_name="Criado por (Funcionário)"
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='client_cases',
        verbose_name="Cliente Associado"
    )
    # MODIFICADO: O campo current_status agora usa as choices definidas
    current_status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='AGUARDANDO_DOCUMENTOS',
        verbose_name="Status Atual"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    case_type = models.CharField(
        max_length=50,
        choices=CASE_TYPE_CHOICES,
        default='renegociacao_credito',
        verbose_name="Tipo de Caso"
    )
    parent_case = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_cases',
        verbose_name="Caso Pai"
    )
    bank_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Nome do Banco")
    bank_code = models.CharField(max_length=3, null=True, blank=True, verbose_name="Código do Banco")
    contract_type = models.CharField(
        max_length=50,
        choices=CONTRACT_TYPE_CHOICES,
        default='renegociacao_consignado',
        verbose_name="Tipo de Contrato"
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
    final_agreement_sent_date = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Envio do Acordo Final"
    )
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
        # Mostra o ID personalizado se existir, senão o título.
        return self.protocol_id or self.title

    # ADICIONADO: Lógica para gerar o protocol_id personalizado e ofuscado
    def save(self, *args, **kwargs):
        if not self.pk and not self.protocol_id:
            prefix_map = {
                'renegociacao_credito': 'PT',
                'resolucao_conflitos_telecom': 'PA',
                # Adicione outros mapeamentos aqui se necessário
                'outros': 'OT' 
            }
            prefix = prefix_map.get(self.case_type, 'CS') # 'CS' como um prefixo padrão

            current_year = timezone.now().year

            cpf_part = "000"
            if self.client and self.client.cpf:
                numeric_cpf = ''.join(filter(str.isdigit, self.client.cpf))
                if len(numeric_cpf) >= 3:
                    cpf_part = numeric_cpf[:3]

            sequential_real = Case.objects.filter(created_at__year=current_year).count() + 1
            obfuscated_sequential = (sequential_real * 137) + 10000

            self.protocol_id = f"{prefix}-{current_year}-{obfuscated_sequential}-{cpf_part}"

        super(Case, self).save(*args, **kwargs)

class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents', verbose_name="Caso")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_documents',
        verbose_name="Enviado por"
    )
    file_name = models.CharField(max_length=255, verbose_name="Nome do Arquivo")
    file_type = models.CharField(max_length=50, verbose_name="Tipo do Arquivo")
    file_url = models.URLField(max_length=1024, default='', blank=True, verbose_name="URL do Arquivo")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Data de Upload")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição do Documento")

    def __str__(self):
        return f"{self.file_name} (Caso: {self.case.title})"

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
        actor_str = self.actor.email if self.actor else "[Usuário Removido]"
        return f"Andamento em '{self.case.title}' por {actor_str} em {self.timestamp.strftime('%d/%m/%Y %H:%M')}"

class Comunicacao(models.Model):
    TIPO_CHOICES = [
        ('Nota Interna', 'Nota Interna'),
        ('Email para Cliente', 'Email para Cliente'),
        ('Notificação para Banco', 'Notificação para Banco'),
    ]
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='comunicacoes', verbose_name="Caso")
    autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='comunicacoes',
        verbose_name="Autor"
    )
    tipo_comunicacao = models.CharField(max_length=50, choices=TIPO_CHOICES, verbose_name="Tipo de Comunicação")
    destinatario = models.CharField(max_length=255, blank=True, null=True, verbose_name="Destinatário (e-mail)")
    assunto = models.CharField(max_length=255, verbose_name="Assunto")
    corpo = models.TextField(verbose_name="Corpo da Mensagem")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="Data e Hora")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Comunicação"
        verbose_name_plural = "Comunicações"

    def __str__(self):
        return f"{self.tipo_comunicacao} em '{self.case.title}' - {self.assunto}"