"""
Serviços para lógica de negócio do Processo Seletivo
"""
from django.utils import timezone
from django.db import transaction
from rest_framework.exceptions import ValidationError, PermissionDenied

from ..models import (
    SelectionProcess,
    ProcessStage,
    CandidateInProcess,
    CandidateStageResponse
)


def add_candidate_to_process(process, candidate_profile, added_by, recruiter_notes=''):
    """
    Adiciona um candidato aprovado ao processo seletivo.

    Args:
        process: SelectionProcess instance
        candidate_profile: CandidateProfile instance
        added_by: UserProfile instance (recrutador)
        recruiter_notes: str (observações opcionais)

    Returns:
        CandidateInProcess instance

    Raises:
        ValidationError se candidato não aprovado ou já no processo
    """
    # Validar que o perfil está aprovado
    if candidate_profile.profile_status != 'approved':
        raise ValidationError({
            'candidate_profile': 'Apenas candidatos com perfil aprovado podem participar do processo seletivo.'
        })

    # Validar que não está duplicado
    if CandidateInProcess.objects.filter(
        process=process,
        candidate_profile=candidate_profile,
        is_active=True
    ).exists():
        raise ValidationError({
            'candidate_profile': 'Este candidato já está participando deste processo seletivo.'
        })

    with transaction.atomic():
        # Buscar a primeira etapa do processo
        first_stage = process.stages.filter(is_active=True).order_by('order').first()

        # Criar o candidato no processo
        candidate_in_process = CandidateInProcess.objects.create(
            process=process,
            candidate_profile=candidate_profile,
            current_stage=first_stage,
            status='in_progress' if first_stage else 'pending',
            added_by=added_by,
            recruiter_notes=recruiter_notes
        )

        # Se houver primeira etapa, criar a resposta inicial
        if first_stage:
            CandidateStageResponse.objects.create(
                candidate_in_process=candidate_in_process,
                stage=first_stage,
                evaluation='pending'
            )

        return candidate_in_process


def evaluate_candidate_stage(candidate_in_process, stage, evaluation, answers=None,
                              recruiter_feedback='', rating=None, evaluated_by=None):
    """
    Avalia um candidato em uma etapa específica.

    Args:
        candidate_in_process: CandidateInProcess instance
        stage: ProcessStage instance
        evaluation: str ('approved' ou 'rejected')
        answers: dict (respostas às perguntas)
        recruiter_feedback: str
        rating: int (1-10)
        evaluated_by: UserProfile instance

    Returns:
        CandidateStageResponse instance
    """
    with transaction.atomic():
        # Buscar ou criar a resposta da etapa
        stage_response, created = CandidateStageResponse.objects.get_or_create(
            candidate_in_process=candidate_in_process,
            stage=stage,
            defaults={'evaluation': 'pending'}
        )

        # Atualizar a resposta
        stage_response.evaluation = evaluation
        stage_response.answers = answers
        stage_response.recruiter_feedback = recruiter_feedback
        stage_response.rating = rating
        stage_response.evaluated_by = evaluated_by
        stage_response.evaluated_at = timezone.now()
        stage_response.is_completed = True
        stage_response.completed_at = timezone.now()
        stage_response.save()

        # Processar o resultado
        if evaluation == 'approved':
            _handle_stage_approved(candidate_in_process, stage)
        elif evaluation == 'rejected':
            _handle_stage_rejected(candidate_in_process, stage)

        return stage_response


def _handle_stage_approved(candidate_in_process, current_stage):
    """
    Processa aprovação em uma etapa.
    Avança para próxima etapa ou finaliza como aprovado.
    """
    process = candidate_in_process.process

    # Buscar próxima etapa
    next_stage = process.stages.filter(
        is_active=True,
        order__gt=current_stage.order
    ).order_by('order').first()

    if next_stage:
        # Avançar para próxima etapa
        candidate_in_process.current_stage = next_stage
        candidate_in_process.save(update_fields=['current_stage', 'updated_at'])

        # Criar resposta para a nova etapa
        CandidateStageResponse.objects.get_or_create(
            candidate_in_process=candidate_in_process,
            stage=next_stage,
            defaults={'evaluation': 'pending'}
        )
    else:
        # Última etapa - candidato aprovado no processo
        candidate_in_process.status = 'approved'
        candidate_in_process.save(update_fields=['status', 'updated_at'])


def _handle_stage_rejected(candidate_in_process, current_stage):
    """
    Processa reprovação em uma etapa.
    Se etapa eliminatória, reprova no processo.
    """
    if current_stage.is_eliminatory:
        candidate_in_process.status = 'rejected'
        candidate_in_process.save(update_fields=['status', 'updated_at'])


def advance_candidate_manually(candidate_in_process, advanced_by):
    """
    Avança manualmente o candidato para a próxima etapa.

    Args:
        candidate_in_process: CandidateInProcess instance
        advanced_by: UserProfile instance

    Returns:
        CandidateInProcess instance

    Raises:
        ValidationError se não puder avançar
    """
    if candidate_in_process.status not in ['pending', 'in_progress']:
        raise ValidationError({
            'status': 'Não é possível avançar um candidato que já foi aprovado, reprovado ou desistiu.'
        })

    current_stage = candidate_in_process.current_stage
    if not current_stage:
        raise ValidationError({
            'current_stage': 'O candidato não está em nenhuma etapa.'
        })

    process = candidate_in_process.process

    # Buscar próxima etapa
    next_stage = process.stages.filter(
        is_active=True,
        order__gt=current_stage.order
    ).order_by('order').first()

    if not next_stage:
        raise ValidationError({
            'current_stage': 'O candidato já está na última etapa.'
        })

    with transaction.atomic():
        # Marcar etapa atual como completa (se não estiver)
        stage_response = CandidateStageResponse.objects.filter(
            candidate_in_process=candidate_in_process,
            stage=current_stage
        ).first()

        if stage_response and not stage_response.is_completed:
            stage_response.is_completed = True
            stage_response.completed_at = timezone.now()
            stage_response.evaluation = 'approved'
            stage_response.evaluated_by = advanced_by
            stage_response.evaluated_at = timezone.now()
            stage_response.save()

        # Avançar para próxima etapa
        candidate_in_process.current_stage = next_stage
        candidate_in_process.status = 'in_progress'
        candidate_in_process.save(update_fields=['current_stage', 'status', 'updated_at'])

        # Criar resposta para a nova etapa
        CandidateStageResponse.objects.get_or_create(
            candidate_in_process=candidate_in_process,
            stage=next_stage,
            defaults={'evaluation': 'pending'}
        )

        return candidate_in_process


def get_process_statistics(process):
    """
    Retorna estatísticas do processo seletivo.

    Args:
        process: SelectionProcess instance

    Returns:
        dict com estatísticas
    """
    candidates = process.candidates_in_process.filter(is_active=True)
    stages = process.stages.filter(is_active=True).order_by('order')

    # Candidatos por status
    candidates_by_status = {
        'pending': candidates.filter(status='pending').count(),
        'in_progress': candidates.filter(status='in_progress').count(),
        'approved': candidates.filter(status='approved').count(),
        'rejected': candidates.filter(status='rejected').count(),
        'withdrawn': candidates.filter(status='withdrawn').count(),
    }

    # Candidatos por etapa
    candidates_by_stage = []
    for stage in stages:
        count = candidates.filter(
            current_stage=stage,
            status__in=['pending', 'in_progress']
        ).count()
        candidates_by_stage.append({
            'stage_id': stage.id,
            'stage_name': stage.name,
            'stage_order': stage.order,
            'candidates_count': count
        })

    # Média de notas
    all_ratings = CandidateStageResponse.objects.filter(
        candidate_in_process__process=process,
        candidate_in_process__is_active=True,
        rating__isnull=False,
        is_active=True
    ).values_list('rating', flat=True)

    average_rating = None
    if all_ratings:
        average_rating = round(sum(all_ratings) / len(all_ratings), 2)

    # Taxa de conclusão (aprovados / total)
    total = candidates.count()
    approved = candidates_by_status['approved']
    completion_rate = round((approved / total * 100), 2) if total > 0 else 0

    return {
        'total_candidates': total,
        'candidates_by_status': candidates_by_status,
        'candidates_by_stage': candidates_by_stage,
        'average_rating': average_rating,
        'completion_rate': completion_rate
    }


def reorder_stages(process, stage_ids, user):
    """
    Reordena as etapas do processo.

    Args:
        process: SelectionProcess instance
        stage_ids: list de IDs das etapas na nova ordem
        user: UserProfile do recrutador

    Raises:
        ValidationError se IDs inválidos
        PermissionDenied se não for da empresa
    """
    # Validar que todos os IDs pertencem ao processo
    stages = ProcessStage.objects.filter(
        id__in=stage_ids,
        process=process,
        is_active=True
    )

    if stages.count() != len(stage_ids):
        raise ValidationError({
            'stage_ids': 'Alguns IDs de etapas são inválidos ou não pertencem a este processo.'
        })

    with transaction.atomic():
        for new_order, stage_id in enumerate(stage_ids, start=1):
            ProcessStage.objects.filter(id=stage_id).update(order=new_order)


def withdraw_candidate(candidate_in_process, withdrawn_by):
    """
    Marca o candidato como desistente.

    Args:
        candidate_in_process: CandidateInProcess instance
        withdrawn_by: UserProfile instance

    Returns:
        CandidateInProcess instance
    """
    if candidate_in_process.status in ['approved', 'rejected']:
        raise ValidationError({
            'status': 'Não é possível marcar como desistente um candidato já aprovado ou reprovado.'
        })

    candidate_in_process.status = 'withdrawn'
    candidate_in_process.recruiter_notes += f'\n[Desistência registrada por {withdrawn_by.name}]'
    candidate_in_process.save(update_fields=['status', 'recruiter_notes', 'updated_at'])

    return candidate_in_process
