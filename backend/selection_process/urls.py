from rest_framework.routers import DefaultRouter
from .views import (
    SelectionProcessViewSet,
    ProcessStageViewSet,
    StageQuestionViewSet,
    CandidateInProcessViewSet,
    CandidateStageResponseViewSet,
    ProcessTemplateViewSet
)

router = DefaultRouter()

router.register(r'selection-processes', SelectionProcessViewSet, basename='selection-process')
router.register(r'process-stages', ProcessStageViewSet, basename='process-stage')
router.register(r'stage-questions', StageQuestionViewSet, basename='stage-question')
router.register(r'candidates-in-process', CandidateInProcessViewSet, basename='candidate-in-process')
router.register(r'stage-responses', CandidateStageResponseViewSet, basename='stage-response')
router.register(r'process-templates', ProcessTemplateViewSet, basename='process-template')

urlpatterns = router.urls
