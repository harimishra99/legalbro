from django.urls import path
from .views import (
    GenerateDocumentView,
    DocumentListView,
    DocumentDetailView,
    RateLimitStatusView,
    CompanyProfileView,
)

urlpatterns = [
    path("generate/",          GenerateDocumentView.as_view(), name="generate"),
    path("documents/",         DocumentListView.as_view(),     name="document-list"),
    path("documents/<int:pk>/",DocumentDetailView.as_view(),   name="document-detail"),
    path("rate-limit/",        RateLimitStatusView.as_view(),  name="rate-limit"),
    path("profile/",           CompanyProfileView.as_view(),   name="company-profile"),
]