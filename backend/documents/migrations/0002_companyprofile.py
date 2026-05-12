from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CompanyProfile",
            fields=[
                ("id",          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user_id",     models.CharField(db_index=True, max_length=255, unique=True)),
                ("user_email",  models.EmailField(blank=True)),
                ("name",        models.CharField(blank=True, max_length=255)),
                ("tagline",     models.CharField(blank=True, max_length=255)),
                ("cin",         models.CharField(blank=True, max_length=100)),
                ("gstin",       models.CharField(blank=True, max_length=100)),
                ("pan",         models.CharField(blank=True, max_length=50)),
                ("address",     models.TextField(blank=True)),
                ("email",       models.EmailField(blank=True)),
                ("phone",       models.CharField(blank=True, max_length=50)),
                ("website",     models.CharField(blank=True, max_length=255)),
                ("logo_base64", models.TextField(blank=True)),
                ("created_at",  models.DateTimeField(auto_now_add=True)),
                ("updated_at",  models.DateTimeField(auto_now=True)),
            ],
        ),
    ]