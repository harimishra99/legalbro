from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "doc_type",
            "doc_type_label",
            "input_data",
            "generated_text",
            "created_at",
        ]
        read_only_fields = ["id", "generated_text", "created_at"]


class GenerateRequestSerializer(serializers.Serializer):
    doc_type = serializers.CharField(max_length=100)
    doc_type_label = serializers.CharField(max_length=200)
    fields = serializers.DictField(child=serializers.CharField(allow_blank=True))


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import CompanyProfile
        model  = CompanyProfile
        fields = [
            "id", "name", "tagline", "cin", "gstin", "pan",
            "address", "email", "phone", "website", "logo_base64",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]