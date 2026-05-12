from datetime import date

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Document
from .prompts import SYSTEM_PROMPT, build_user_prompt
from .serializers import DocumentSerializer, GenerateRequestSerializer


def call_groq(user_prompt: str) -> str:
    """Call Groq API (OpenAI-compatible endpoint) and return generated text."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.3-70b-versatile",   # best Groq model for long structured text
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        "temperature": 0.3,       # low temperature = consistent legal language
        "max_tokens": 3000,
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


class GenerateDocumentView(APIView):
    """
    POST /api/generate/
    Body: { doc_type, doc_type_label, fields: {key: value} }
    Returns the saved Document object including generated_text.
    """

    def post(self, request):
        serializer = GenerateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        today = date.today()

        # ── Rate limit ────────────────────────────────────────────────────────
        daily_count = Document.objects.filter(
            user_id=user.id,
            created_at__date=today,
        ).count()

        if daily_count >= settings.DOCUMENT_DAILY_LIMIT:
            return Response(
                {"error": "Daily limit of 10 documents reached. Try again tomorrow."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        data          = serializer.validated_data
        doc_type      = data["doc_type"]
        doc_type_label = data["doc_type_label"]
        fields        = data["fields"]

        user_prompt = build_user_prompt(doc_type, doc_type_label, fields)

        # ── Call Groq ─────────────────────────────────────────────────────────
        try:
            generated_text = call_groq(user_prompt)
        except requests.exceptions.HTTPError as exc:
            return Response(
                {"error": f"Groq API error: {exc.response.status_code} — {exc.response.text}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except requests.exceptions.RequestException as exc:
            return Response(
                {"error": f"Groq request failed: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # ── Save to DB ────────────────────────────────────────────────────────
        doc = Document.objects.create(
            user_id=user.id,
            user_email=user.email,
            doc_type=doc_type,
            doc_type_label=doc_type_label,
            input_data=fields,
            generated_text=generated_text,
        )

        return Response(DocumentSerializer(doc).data, status=status.HTTP_201_CREATED)


class DocumentListView(APIView):
    """GET /api/documents/ — all documents for the current user."""

    def get(self, request):
        docs = Document.objects.filter(user_id=request.user.id)
        return Response(DocumentSerializer(docs, many=True).data)


class DocumentDetailView(APIView):
    """GET /api/documents/<pk>/ and DELETE /api/documents/<pk>/"""

    def _get_doc(self, pk, user_id):
        try:
            return Document.objects.get(pk=pk, user_id=user_id)
        except Document.DoesNotExist:
            return None

    def get(self, request, pk):
        doc = self._get_doc(pk, request.user.id)
        if not doc:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(DocumentSerializer(doc).data)

    def delete(self, request, pk):
        doc = self._get_doc(pk, request.user.id)
        if not doc:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RateLimitStatusView(APIView):
    """GET /api/rate-limit/ — how many documents the user has generated today."""

    def get(self, request):
        today = date.today()
        count = Document.objects.filter(
            user_id=request.user.id, created_at__date=today
        ).count()
        return Response({
            "used":      count,
            "limit":     settings.DOCUMENT_DAILY_LIMIT,
            "remaining": max(0, settings.DOCUMENT_DAILY_LIMIT - count),
        })


class CompanyProfileView(APIView):
    """
    GET  /api/profile/  — fetch current user's company profile
    POST /api/profile/  — create or update company profile
    """

    def get(self, request):
        from .models import CompanyProfile
        from .serializers import CompanyProfileSerializer
        try:
            profile = CompanyProfile.objects.get(user_id=request.user.id)
            return Response(CompanyProfileSerializer(profile).data)
        except CompanyProfile.DoesNotExist:
            return Response({})

    def post(self, request):
        from .models import CompanyProfile
        from .serializers import CompanyProfileSerializer

        profile, _ = CompanyProfile.objects.get_or_create(
            user_id=request.user.id,
            defaults={"user_email": request.user.email},
        )

        # Validate logo size — base64 of 2MB image ~ 2.7MB string
        logo = request.data.get("logo_base64", "")
        if logo and len(logo) > 3 * 1024 * 1024:
            return Response(
                {"error": "Logo too large. Max 2 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CompanyProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)