from rest_framework.routers import DefaultRouter
from .views import DocumentTypeViewSet, CandidateDocumentViewSet, AdmissionDataViewSet

router = DefaultRouter()

router.register(r'document-types', DocumentTypeViewSet, basename='document-type')
router.register(r'candidate-documents', CandidateDocumentViewSet, basename='candidate-document')
router.register(r'admission-data', AdmissionDataViewSet, basename='admission-data')

urlpatterns = router.urls
