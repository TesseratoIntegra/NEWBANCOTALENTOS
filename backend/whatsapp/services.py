import logging
import requests
from django.conf import settings

logger = logging.getLogger('whatsapp')


def _clean_phone_number(phone: str) -> str:
    """Remove formatação e retorna apenas dígitos com código do país."""
    digits = ''.join(c for c in phone if c.isdigit())
    # Adiciona código do Brasil se não tiver
    if len(digits) == 11 or len(digits) == 10:
        digits = '55' + digits
    return digits


def send_whatsapp_message(phone_number: str, message: str) -> dict:
    """
    Envia uma mensagem de texto via Evolution API.

    Args:
        phone_number: Número do destinatário (com ou sem formatação)
        message: Texto da mensagem

    Returns:
        dict com a resposta da API ou {'error': ...} em caso de falha
    """
    api_url = getattr(settings, 'EVOLUTION_API_URL', '')
    api_key = getattr(settings, 'EVOLUTION_API_KEY', '')
    instance_name = getattr(settings, 'EVOLUTION_INSTANCE_NAME', '')

    if not all([api_url, api_key, instance_name]):
        logger.warning('Evolution API não configurada. Variáveis EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE_NAME ausentes.')
        return {'error': 'Evolution API não configurada'}

    clean_number = _clean_phone_number(phone_number)

    url = f'{api_url}/message/sendText/{instance_name}'
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key,
    }
    payload = {
        'number': clean_number,
        'text': message,
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        logger.info(f'WhatsApp enviado para {clean_number}: {message[:50]}...')
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f'Erro ao enviar WhatsApp para {clean_number}: {e}')
        return {'error': str(e)}


def format_template(template: str, context: dict) -> str:
    """
    Substitui placeholders no template.
    Placeholders não encontrados no contexto são removidos.
    """
    result = template
    for key, value in context.items():
        result = result.replace('{' + key + '}', str(value) if value else '')
    return result


def notify_candidate_status_change(candidate_profile, status_event: str, extra_context: dict = None):
    """
    Função principal que busca o template, formata e envia a mensagem.
    Não bloqueia o fluxo principal em caso de erro.

    Args:
        candidate_profile: CandidateProfile instance
        status_event: Chave do evento (ex: 'profile_approved')
        extra_context: Dict com variáveis extras (observacoes, vaga, processo, documento)
    """
    if candidate_profile is None:
        return

    try:
        # Verificar se candidato aceita WhatsApp e tem telefone
        if not candidate_profile.accepts_whatsapp:
            logger.info(f'Candidato {candidate_profile.user.name} não aceita WhatsApp. Pulando notificação.')
            return

        phone = candidate_profile.phone_secondary
        if not phone:
            logger.info(f'Candidato {candidate_profile.user.name} sem telefone cadastrado. Pulando notificação.')
            return

        # Buscar template
        from whatsapp.models import WhatsAppTemplate
        try:
            template = WhatsAppTemplate.objects.get(status_event=status_event, is_active=True)
        except WhatsAppTemplate.DoesNotExist:
            logger.info(f'Template WhatsApp para evento "{status_event}" não encontrado ou inativo.')
            return

        # Montar contexto
        context = {
            'nome': candidate_profile.user.full_name,
        }
        if extra_context:
            context.update(extra_context)

        # Formatar e enviar
        message = format_template(template.message_template, context)
        send_whatsapp_message(phone, message)

    except Exception as e:
        logger.error(f'Erro na notificação WhatsApp ({status_event}): {e}')
