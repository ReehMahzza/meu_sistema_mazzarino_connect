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
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='CLIENTE', 
        verbose_name="Função"
    )
    client_id = models.CharField(max_length=20, unique=True, blank=True, null=True, editable=False, verbose_name="ID de Cliente")
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.username:
                # Gera um username único a partir do e-mail para satisfazer o AbstractUser
                base_username = self.email.split('@')[0]
                username = base_username
                counter = 1
                while CustomUser.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                self.username = username

            if self.role == 'CLIENTE' and self.cpf and not self.client_id:
                cpf_digits = ''.join(filter(str.isdigit, self.cpf))
                if len(cpf_digits) >= 3:
                    cpf_prefix = cpf_digits[:3]
                    now = timezone.now()
                    current_month = now.month
                    current_year = now.year
                    sequence_count = CustomUser.objects.filter(
                        date_joined__year=current_year,
                        date_joined__month=current_month
                    ).count()
                    next_sequence = sequence_count + 1
                    self.client_id = f"{cpf_prefix}-{current_month:02d}{next_sequence:02d}/{current_year}"
        super().save(*args, **kwargs)

class ChecklistTemplate(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Nome do Template de Checklist")
    description = models.TextField(blank=True, null=True, verbose_name="Descrição")

    def __str__(self):
        return self.name

class RequiredDocument(models.Model):
    template = models.ForeignKey(ChecklistTemplate, on_delete=models.CASCADE, related_name='required_documents', verbose_name="Template de Checklist")
    document_name = models.CharField(max_length=255, verbose_name="Nome do Documento Obrigatório")
    is_mandatory = models.BooleanField(default=True, verbose_name="É Obrigatório?")

    def __str__(self):
        return f"{self.document_name} ({'Obrigatório' if self.is_mandatory else 'Opcional'}) - Template: {self.template.name}"

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
    STATUS_CHOICES = [
        # Fase 1: Análise e Onboarding
        ('ONBOARDING', '1. Onboarding e Preenchimento'),
        ('VALIDACAO_DOCUMENTAL', '2. Validação Documental'),
        ('EXTRACAO_DADOS', '3. Extração de Dados dos Contratos'),
        ('ANALISE_FINANCEIRA_PREL', '4. Análise Financeira Preliminar'),
        ('PRE_ANALISE_FINAL', '5. Pré-Análise Final'),
        # Fase 2: Comercial e Técnica
        ('FASE_COMERCIAL', '6. Fase Comercial'),
        ('PROPOSTA_COMERCIAL', '7. Proposta Comercial'),
        ('AGUARDANDO_TAXAS', '8. Aguardando Pagamento de Taxas'),
        ('ANALISE_TECNICA', '9. Análise Técnica Aprofundada'),
        ('VALIDACAO_E_CONVERSAO', '10. Validação Final e Conversão'),
        # Estados Finais
        ('FINALIZADO', 'Finalizado'),
        ('ARQUIVADO', 'Arquivado'),
        # Estados de Exceção/Aguardando
        ('AGUARDANDO_OFICIO', 'Aguardando Resolução de Ofício'),
        ('REANALISE', 'Em Reanálise'),
    ]
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
    current_status = models.CharField(
        max_length=100,
        choices=STATUS_CHOICES,
        default='ONBOARDING',
        verbose_name="Status Atual"
    )
    # ADICIONADO: Campo para conectar o caso a um template de checklist
    checklist_template = models.ForeignKey(
        ChecklistTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Checklist de Documentos Aplicável"
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

# ADICIONADO: Novo modelo para o checklist de validação de documentos
class DocumentValidationCheck(models.Model):
    document = models.OneToOneField(
        Document, 
        on_delete=models.CASCADE, 
        related_name='validation_check', 
        verbose_name="Documento"
    )
    VALIDATION_STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('APROVADO', 'Aprovado'),
        ('REPROVADO', 'Reprovado'),
    ]
    status = models.CharField(
        max_length=20, 
        choices=VALIDATION_STATUS_CHOICES, 
        default='PENDENTE',
        verbose_name="Status da Validação"
    )
    visibilidade_ok = models.BooleanField(default=False, verbose_name="Visibilidade e Iluminação OK")
    legibilidade_ok = models.BooleanField(default=False, verbose_name="Legibilidade do Texto OK")
    frente_e_verso_ok = models.BooleanField(default=False, verbose_name="Frente e Verso/Todas as Páginas OK")
    documento_correto_ok = models.BooleanField(default=False, verbose_name="Documento é o Solicitado OK")
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='validated_checks',
        verbose_name="Validado por"
    )
    validated_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Data da Validação"
    )
    rejection_reason = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Motivo da Reprovação"
    )

    def save(self, *args, **kwargs):
        if self.pk is not None:
             self.validated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Checklist para {self.document.file_name} - Status: {self.get_status_display()}"

    class Meta:
        verbose_name = "Checklist de Validação de Documento"
        verbose_name_plural = "Checklists de Validação de Documentos"

class ContractAnalysisData(models.Model):
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name='contract_data',
        verbose_name="Caso Associado"
    )
    valor_credito_liberado = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor do Crédito Liberado")
    valor_total_financiado = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valor Total Financiado (com taxas)")
    valor_parcela = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Valor da Parcela Mensal")
    numero_total_parcelas = models.IntegerField(null=True, blank=True, verbose_name="Número Total de Parcelas")
    taxa_juros_mensal_contrato = models.DecimalField(max_digits=5, decimal_places=3, null=True, blank=True, verbose_name="Taxa de Juros Mensal (%)")
    taxa_juros_anual_contrato = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True, verbose_name="Taxa de Juros Anual (%)")
    cet_anual_contrato = models.DecimalField(max_digits=6, decimal_places=3, null=True, blank=True, verbose_name="CET Anual (%)")
    
    data_assinatura_contrato = models.DateField(null=True, blank=True, verbose_name="Data de Assinatura do Contrato")
    data_vencimento_primeira_parcela = models.DateField(null=True, blank=True, verbose_name="Vencimento da 1ª Parcela")

    tarifa_cadastro = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name="Tarifa de Cadastro (TC)")
    seguro_prestamista = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name="Seguro Prestamista")
    
    dados_extraidos_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='extracted_data')
    data_extracao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dados de Análise para o Protocolo: {self.case.protocol_id}"

    class Meta:
        verbose_name = "Dados de Análise de Contrato"
        verbose_name_plural = "Dados de Análise de Contratos"
