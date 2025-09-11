from rest_framework.routers import DefaultRouter

from spontaneous.views import OccupationViewSet, SpontaneousApplicationViewSet


router = DefaultRouter()
router.register(r'occupations', OccupationViewSet, basename='occupation')
router.register(r'spontaneous-applications', SpontaneousApplicationViewSet, basename='spontaneou-application')

urlpatterns = router.urls
