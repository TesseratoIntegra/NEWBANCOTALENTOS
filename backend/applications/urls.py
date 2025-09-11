from rest_framework.routers import DefaultRouter

from applications.views import (
    ApplicationViewSet,
    InterviewScheduleViewSet,
)


router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'interviews-schedules', InterviewScheduleViewSet, basename='interview-schedule')

urlpatterns = router.urls
