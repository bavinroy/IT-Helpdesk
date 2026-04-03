from django.contrib.auth.models import AbstractUser
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=100)
    domain = models.CharField(max_length=100, unique=True, help_text="e.g. company.com")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'USER', 'User'
        IT_AGENT = 'IT_AGENT', 'IT Agent'
        ADMIN = 'ADMIN', 'Admin'
        SUPERUSER = 'SUPERUSER', 'Superuser'
        
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.USER)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = self.Role.SUPERUSER
        super().save(*args, **kwargs)
