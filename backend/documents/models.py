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


class CompanyProfile(models.Model):
    """One profile per Supabase user — stores company details and logo."""

    user_id    = models.CharField(max_length=255, unique=True, db_index=True)
    user_email = models.EmailField(blank=True)

    name       = models.CharField(max_length=255, blank=True)
    tagline    = models.CharField(max_length=255, blank=True)
    cin        = models.CharField(max_length=100, blank=True)
    gstin      = models.CharField(max_length=100, blank=True)
    pan        = models.CharField(max_length=50,  blank=True)
    address    = models.TextField(blank=True)
    email      = models.EmailField(blank=True)
    phone      = models.CharField(max_length=50,  blank=True)
    website    = models.CharField(max_length=255, blank=True)

    # base64 encoded logo — stored as text (max ~2MB)
    logo_base64 = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user_email})"