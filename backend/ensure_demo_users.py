import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.models import Organization

User = get_user_model()

def create_demo_users():
    # Ensure Organization
    org, _ = Organization.objects.get_or_create(name="Demo Company", domain="company.com")
    college, _ = Organization.objects.get_or_create(name="Demo College", domain="college.edu")

    users = [
        # (Username/Email, Password, Role, Org)
        ("admin@company.com", "admin", "ADMIN", org),
        ("student@college.edu", "user", "USER", college),
        ("superuser@company.com", "super", "SUPERUSER", org),
        ("user1@company.com", "user1", "USER", org),
    ]

    print("--- Creating/Resetting Demo Users ---")
    
    for email, password, role, organization in users:
        try:
            # We use email as username for simplicity in this demo matching the frontend
            u, created = User.objects.get_or_create(username=email)
            u.email = email
            u.set_password(password)
            u.role = role
            u.organization = organization
            if role == 'SUPERUSER':
                u.is_superuser = True
                u.is_staff = True
            elif role == 'ADMIN':
                u.is_staff = True
            
            u.save()
            action = "Created" if created else "Updated"
            print(f"{action}: {email} (Pass: {password}) [{role}]")
            
        except Exception as e:
            print(f"Error creating {email}: {e}")

if __name__ == '__main__':
    create_demo_users()
