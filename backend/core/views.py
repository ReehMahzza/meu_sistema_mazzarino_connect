# Em backend/core/views.py (VERSÃO FINAL E CORRIGIDA DE TODAS AS VIEWS ATÉ FASE 7)

from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework.serializers import ValidationError # Importar ValidationError
from .serializers import UserRegistrationSerializer, CaseSerializer, DocumentSerializer, ProcessMovementSerializer, ActorSerializer
from .models import Case, Document, ProcessMovement

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
        # GARANTIR QUE O USUÁRIO LOGADO SEJA DEFINIDO COMO created_by:
        print(f"=== CRIANDO CASO ===")
        print(f"Usuario logado: {self.request.user}")
        print(f"Dados validados: {serializer.validated_data}")
        
        instance = serializer.save(created_by=self.request.user)
        
        print(f"=== CASO CRIADO ===")
        print(f"ID: {instance.id}")
        print(f"Título: {instance.title}")
        print(f"Cliente: {instance.client}")
        print(f"Criado por: {instance.created_by}")
        
        return instance

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

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView): # Esta view é para detalhes de DOCUMENTOS
    serializer_class = DocumentSerializer # Era CaseSerializer. Voltando para DocumentSerializer.
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        return Document.objects.filter(uploaded_by=self.request.user).select_related('uploaded_by') # Era Case.objects.all(). Revertendo.

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

class RequestContractSearchView(APIView):
    """
    Registra uma solicitação para o Serviço de Busca de Contrato para um caso.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, case_id, *args, **kwargs):
        try:
            case = Case.objects.get(id=case_id, created_by=request.user)
        except Case.DoesNotExist:
            return Response({"error": "Caso não encontrado ou acesso não permitido."}, status=status.HTTP_404_NOT_FOUND)

        details = request.data.get('request_details', '')
        if not details:
            return Response({"error": "Detalhes da solicitação são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        movement = ProcessMovement.objects.create(
            case=case,
            actor=request.user,
            movement_type='Solicitação de Serviço de Busca',
            content=f"Solicitado serviço de busca de contrato. Detalhes: {details[:100]}...",
            request_details=details
        )

        serializer = ProcessMovementSerializer(movement)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CaseAnalysisUpdateView(generics.UpdateAPIView):
    """
    View para atualizar os campos de análise e parecer técnico de um caso.
    Cria andamentos correspondentes para cada atualização.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        old_ia_result = instance.ia_analysis_result
        old_human_result = instance.human_analysis_result
        old_report_content = instance.technical_report_content

        updated_instance = serializer.save()

        if updated_instance.ia_analysis_result != old_ia_result:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Análise IA',
                content=f'Resultado da análise preliminar por IA atualizado para: "{updated_instance.ia_analysis_result}".'
            )

        if updated_instance.human_analysis_result != old_human_result or updated_instance.technical_report_content != old_report_content:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Emissão Parecer Técnico',
                content='Parecer técnico emitido/atualizado.'
            )

        if updated_instance.human_analysis_result != 'Aguardando Análise':
            updated_instance.current_status = f"Análise Concluída: {updated_instance.human_analysis_result}"
        elif updated_instance.ia_analysis_result != 'Aguardando Análise':
            updated_instance.current_status = f"Análise IA: {updated_instance.ia_analysis_result}"

        updated_instance.save()

# Esta é a view para obter detalhes de um ÚNICO caso.
class CaseDetailView(generics.RetrieveAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()
    lookup_field = 'pk'


# ADICIONAR NOVA VIEW AQUI (FASE 4)
class CaseProposalContractView(generics.UpdateAPIView):
    """
    View para atualizar os campos de proposta e contratação de um caso.
    Cria andamentos correspondentes para cada atualização.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        # Guarda os valores antigos para comparação
        old_proposal_date = instance.proposal_sent_date
        old_client_decision = instance.client_decision
        old_docusign_status = instance.docusign_status

        # Salva a instância com os novos dados
        updated_instance = serializer.save()

        # Verifica o que mudou e cria os andamentos
        if updated_instance.proposal_sent_date != old_proposal_date:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Proposta Enviada',
                content=f'Proposta de renegociação enviada ao cliente em {updated_instance.proposal_sent_date.strftime("%d/%m/%Y")}.'
            )
            updated_instance.current_status = 'Aguardando Decisão do Cliente'

        if updated_instance.client_decision != old_client_decision:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type=f'Proposta {updated_instance.client_decision}',
                content=f'Cliente {updated_instance.client_decision.lower()} a proposta de renegociação.'
            )
            if updated_instance.client_decision == 'Aceita':
                updated_instance.current_status = 'Proposta Aceita - Aguardando Contratação'
            else:
                updated_instance.current_status = 'Proposta Rejeitada'

        if updated_instance.docusign_status != old_docusign_status:
            if updated_instance.docusign_status == 'Assinado':
                movement_type = 'Acordo Assinado'
                content = 'Termo de Acordo Final assinado via DocuSign.'
                updated_instance.current_status = 'Acordo Formalizado'
            elif updated_instance.docusign_status == 'Recusado':
                movement_type = 'Acordo Recusado'
                content = 'Assinatura do Termo de Acordo Final foi recusada.'
                updated_instance.current_status = 'Acordo Recusado na Formalização'
            else: # Para 'Enviado' ou 'Não Enviado'
                movement_type = 'Status DocuSign Atualizado'
                content = f'Status DocuSign do acordo final atualizado para: "{updated_instance.docusign_status}".'

            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type=movement_type,
                content=content
            )

        updated_instance.save() # Salva o status atualizado do caso

# ADICIONAR NOVA VIEW AQUI (FASE 5)
class CaseNegotiationUpdateView(generics.UpdateAPIView):
    """
    View para atualizar os campos da negociação com o banco.
    Cria andamentos correspondentes para cada atualização.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        old_dossier_date = instance.dossier_sent_date
        old_bank_status = instance.bank_response_status
        old_counterproposal = instance.counterproposal_details

        updated_instance = serializer.save()

        if updated_instance.dossier_sent_date != old_dossier_date:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Dossiê Enviado',
                content=f'Dossiê de renegociação enviado ao banco em {updated_instance.dossier_sent_date.strftime("%d/%m/%Y")}.'
            )
            updated_instance.current_status = 'Aguardando Resposta do Banco'

        if updated_instance.bank_response_status != old_bank_status:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Resposta do Banco',
                content=f'Banco respondeu com status: "{updated_instance.bank_response_status}".'
            )
            updated_instance.current_status = f'Negociação: {updated_instance.bank_response_status}'

        if updated_instance.bank_response_status == 'Contraproposta' and updated_instance.counterproposal_details != old_counterproposal:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Contraproposta Recebida',
                content=f'Contraproposta recebida do banco. Detalhes: {updated_instance.counterproposal_details}'
            )

        updated_instance.save() # Salva o status atualizado do caso

# ADICIONAR NOVA VIEW AQUI (FASE 6 - Formalização do Acordo)
class CaseFormalizationView(generics.UpdateAPIView):
    """
    View para atualizar os campos da formalização do acordo (Fase 6).
    Cria andamentos correspondentes para cada atualização.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Capturar valores antigos para comparação
        old_agreement_date = instance.final_agreement_sent_date
        old_docusign_status = instance.docusign_status

        # Salvar as alterações
        updated_instance = serializer.save()

        # Criar andamentos baseados nas mudanças
        if updated_instance.final_agreement_sent_date != old_agreement_date and updated_instance.final_agreement_sent_date is not None:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Acordo Final Enviado',
                content=f'Termo de Acordo Final enviado para assinatura em {updated_instance.final_agreement_sent_date.strftime("%d/%m/%Y")}.'
            )
            updated_instance.current_status = 'Aguardando Assinatura do Acordo'

        if updated_instance.docusign_status != old_docusign_status:
            if updated_instance.docusign_status == 'Assinado':
                ProcessMovement.objects.create(
                    case=updated_instance,
                    actor=self.request.user,
                    movement_type='Acordo Assinado',
                    content='Termo de Acordo Final assinado digitalmente via DocuSign.'
                )
                updated_instance.current_status = 'Acordo Formalizado'
            elif updated_instance.docusign_status == 'Recusado':
                ProcessMovement.objects.create(
                    case=updated_instance,
                    actor=self.request.user,
                    movement_type='Acordo Recusado',
                    content='Assinatura do Termo de Acordo Final foi recusada pelo cliente.'
                )
                updated_instance.current_status = 'Acordo Recusado'
            elif updated_instance.docusign_status == 'Enviado':
                ProcessMovement.objects.create(
                    case=updated_instance,
                    actor=self.request.user,
                    movement_type='DocuSign Enviado',
                    content='Documento enviado para assinatura digital via DocuSign.'
                )

        # Salvar o status atualizado
        updated_instance.save()

# ADICIONAR NOVA VIEW AQUI (FASE 7 - Liquidação Financeira)
class CaseLiquidationView(generics.UpdateAPIView):
    """
    View para atualizar os campos da fase de liquidação financeira.
    Cria andamentos correspondentes para cada atualização.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        # Guarda os valores antigos para comparação
        old_payment_status = instance.bank_payment_status
        old_commission = instance.commission_value
        old_liquidation_date = instance.client_liquidation_date

        # Salva a instância com os novos dados
        updated_instance = serializer.save()

        # Verifica o que mudou e cria os andamentos
        if updated_instance.bank_payment_status != old_payment_status and updated_instance.bank_payment_status == 'Pago pelo Banco':
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Pagamento Banco Recebido',
                content='Pagamento da instituição financeira foi recebido.'
            )
            updated_instance.current_status = 'Aguardando Cálculo de Comissão'

        if updated_instance.commission_value is not None and updated_instance.commission_value != old_commission:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Comissão Calculada',
                content=f'Comissão da Mazzarino Corp calculada: R$ {updated_instance.commission_value}.'
            )
            updated_instance.current_status = 'Comissão Retida - Aguardando Liquidação'

        if updated_instance.client_liquidation_date is not None and updated_instance.client_liquidation_date != old_liquidation_date:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Liquidação Cliente',
                content=f'Valor líquido repassado ao cliente em {updated_instance.client_liquidation_date.strftime("%d/%m/%Y")}.'
            )
            updated_instance.current_status = 'Caso Liquidado e Finalizado'

        updated_instance.save() # Salva o status atualizado do caso

class UserListView(generics.ListAPIView):
    """
    View para listar usuários (usado para busca por email no NewCasePage)
    """
    serializer_class = ActorSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        email = self.request.query_params.get('email')
        if email:
            return CustomUser.objects.filter(email=email)
        return CustomUser.objects.all()[:10]  # Limitar resultado para evitar sobrecarga

class CaseCompletionView(generics.UpdateAPIView):
    """
    View para atualizar os campos da conclusão do caso (Fase 8).
    Cria andamentos correspondentes para cada atualização.
    """
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Case.objects.all()

    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Capturar valores antigos para comparação
        old_completion_date = instance.completion_date
        old_final_communication_sent = instance.final_communication_sent
        old_survey_sent = instance.survey_sent

        # Salvar as alterações
        updated_instance = serializer.save()

        # Criar andamentos baseados nas mudanças
        if updated_instance.completion_date != old_completion_date and updated_instance.completion_date is not None:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Caso Concluído',
                content=f'Caso concluído em {updated_instance.completion_date.strftime("%d/%m/%Y")}.'
            )
            updated_instance.current_status = 'Concluído'

        if updated_instance.final_communication_sent != old_final_communication_sent and updated_instance.final_communication_sent:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Comunicação Final Enviada',
                content='Comunicação final enviada ao cliente.'
            )

        if updated_instance.survey_sent != old_survey_sent and updated_instance.survey_sent:
            ProcessMovement.objects.create(
                case=updated_instance,
                actor=self.request.user,
                movement_type='Pesquisa de Satisfação Enviada',
                content='Pesquisa de satisfação enviada ao cliente.'
            )

        # Salvar o status atualizado
        updated_instance.save()