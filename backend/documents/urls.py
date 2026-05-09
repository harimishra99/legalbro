from django.urls import path
from .views import (
    GenerateDocumentView,
    DocumentListView,
    DocumentDetailView,
    RateLimitStatusView,
)

urlpatterns = [
    path("generate/", GenerateDocumentView.as_view(), name="generate"),
    path("documents/", DocumentListView.as_view(), name="document-list"),
    path("documents/<int:pk>/", DocumentDetailView.as_view(), name="document-detail"),
    path("rate-limit/", RateLimitStatusView.as_view(), name="rate-limit"),
]
