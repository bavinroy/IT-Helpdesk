import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from tickets.models import Category, Ticket, KBTopic, Article
from users.models import Organization

User = get_user_model()

def seed():
    print("Seeding data...")

    # 1. Create Organization
    org, created = Organization.objects.get_or_create(name="TechCorp", defaults={'domain': 'techcorp.com'})
    if created:
        print(f"Organization '{org.name}' created")
    
    # 2. Create Categories (Global & Org Specific)
    cats = ['Network', 'Hardware', 'Software', 'Access']
    for c in cats:
        Category.objects.get_or_create(name=c, organization=None, defaults={'description': f'Global {c} issues'})
        Category.objects.get_or_create(name=c, organization=org, defaults={'description': f'{org.name} {c} issues'})
    print(f"Categories created/verified.")

    # 3. Create Users
    if not User.objects.filter(email='superuser@company.com').exists():
        su = User.objects.create_superuser('superuser', 'superuser@company.com', 'super')
        su.role = 'SUPERUSER'
        su.save()
        print("Superuser created")

    if not User.objects.filter(email='admin@company.com').exists():
        admin = User.objects.create_user('admin', 'admin@company.com', 'admin')
        admin.role = 'ADMIN'
        admin.is_staff = True
        admin.organization = org
        admin.save()
        print("Admin created")

    if not User.objects.filter(email='agent@company.com').exists():
        agent = User.objects.create_user('agent', 'agent@company.com', 'agent')
        agent.role = 'IT_AGENT'
        agent.organization = org
        agent.save()
        print("Agent created")

    if not User.objects.filter(email='student@college.edu').exists():
        user = User.objects.create_user('student', 'student@college.edu', 'user')
        user.role = 'USER'
        user.organization = org
        user.save()
        print("User created")

    # 4. Create KB Topics and Articles
    su_author = User.objects.filter(role='SUPERUSER').first()
    admin_author = User.objects.filter(role='ADMIN', organization=org).first()

    net_topic, _ = KBTopic.objects.get_or_create(name="Global Network Guide", organization=None)
    Article.objects.get_or_create(
        topic=net_topic,
        title="How to connect to WiFi",
        defaults={'content': "Select 'HelpDesk_Guest' and enter the password shared with you.", 'author': su_author}
    )

    corp_topic, _ = KBTopic.objects.get_or_create(name="TechCorp VPN Instructions", organization=org)
    Article.objects.get_or_create(
        topic=corp_topic,
        title="Installing Company VPN",
        defaults={'content': "Download the client from portal.techcorp.com/vpn and login with your employee ID.", 'author': admin_author}
    )
    print("KB Data seeded.")
        
    print("Seeding complete.")

if __name__ == '__main__':
    seed()
