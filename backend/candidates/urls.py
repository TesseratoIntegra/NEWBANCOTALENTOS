from rest_framework.routers import DefaultRouter

from candidates.views import (
    CandidateProfileViewSet, CandidateEducationViewSet, CandidateExperienceViewSet,
    CandidateLanguageViewSet, CandidateSkillViewSet
)


router = DefaultRouter()

router.register(r'candidates/profiles', CandidateProfileViewSet, basename='candidate-profile')
router.register(r'candidates/educations', CandidateEducationViewSet, basename='candidate-education')
router.register(r'candidates/experiences', CandidateExperienceViewSet, basename='candidate-experience')
router.register(r'candidates/languages', CandidateLanguageViewSet, basename='candidate-language')
router.register(r'candidates/skills', CandidateSkillViewSet, basename='candidate-skill')

urlpatterns = router.urls
