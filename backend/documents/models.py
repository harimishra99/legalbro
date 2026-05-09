from django.db import models


class Document(models.Model):
    """Represents a single AI-generated legal document."""

    # Maps to Supabase Auth user UUID
    user_id = models.CharField(max_length=255, db_index=True)
    user_email = models.EmailField(blank=True)

    doc_type = models.CharField(max_length=100)          # e.g. "nda", "mou"
    doc_type_label = models.CharField(max_length=200)    # e.g. "Non-Disclosure Agreement"

    # Raw form inputs stored as JSON
    input_data = models.JSONField(default=dict)

    # Full AI-generated document text
    generated_text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.doc_type_label} — {self.user_email} ({self.created_at:%Y-%m-%d})"
