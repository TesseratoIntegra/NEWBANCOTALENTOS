from rest_framework.routers import DefaultRouter

from companies.views import CompanyGroupViewSet, CompanyViewSet


router = DefaultRouter()
router.register(r'companies-groups', CompanyGroupViewSet, basename='company-group')
router.register(r'companies', CompanyViewSet, basename='company')

urlpatterns = router.urls
