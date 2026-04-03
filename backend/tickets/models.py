from django.db import models
from django.conf import settings

class SLAPolicy(models.Model):
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name='sla_policies')
    priority = models.CharField(max_length=20, choices=[
        ('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ('CRITICAL', 'Critical')
    ])
    response_time_hours = models.IntegerField(default=4, help_text="Target hours to first response")
    resolution_time_hours = models.IntegerField(default=24, help_text="Target hours to resolve")
    
    class Meta:
        unique_together = ['organization', 'priority']

class Category(models.Model):
    name = models.CharField(max_length=100)
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name='categories', null=True) # Null for Global/Default
    description = models.TextField(blank=True, null=True)
    sla_hours = models.IntegerField(default=24, help_text="SLA resolution time in hours")
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ['organization', 'name']

from django.utils import timezone
from datetime import timedelta

class Ticket(models.Model):
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        WAITING_FOR_USER = 'WAITING_FOR_USER', 'Waiting for User'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'
        REOPENED = 'REOPENED', 'Reopened'
        
    class SLAStatus(models.TextChoices):
        ON_TRACK = 'ON_TRACK', 'On Track'
        AT_RISK = 'AT_RISK', 'At Risk'
        BREACHED = 'BREACHED', 'Breached'

    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Linked to Category Model (Admin Managed)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tickets')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Organization Link (Multi-Tenancy)
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name='tickets', null=True, blank=True)

    # SLA Tracking
    sla_due_at = models.DateTimeField(null=True, blank=True)
    sla_status = models.CharField(max_length=20, choices=SLAStatus.choices, default=SLAStatus.ON_TRACK)

    # User Feedback
    feedback_rating = models.IntegerField(null=True, blank=True, help_text="Rating from 1 to 5")
    feedback_text = models.TextField(null=True, blank=True, help_text="User feedback comments")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        
        # Calculate SLA on Creation
        if is_new and not self.sla_due_at:
             self.calculate_sla()
             
        # Check Breach Status on every save
        if self.sla_due_at and self.status not in [self.Status.RESOLVED, self.Status.CLOSED]:
            if timezone.now() > self.sla_due_at:
                self.sla_status = self.SLAStatus.BREACHED
            elif timezone.now() + timedelta(hours=2) > self.sla_due_at:
                self.sla_status = self.SLAStatus.AT_RISK
            else:
                self.sla_status = self.SLAStatus.ON_TRACK
        
        super().save(*args, **kwargs)

    def calculate_sla(self):
        hours = 24 # Default
        
        # 1. Check Policy
        policy = None
        if self.organization:
            policy = SLAPolicy.objects.filter(organization=self.organization, priority=self.priority).first()
            
        if policy:
            hours = policy.resolution_time_hours
        elif self.category:
            hours = self.category.sla_hours
        elif self.priority == 'CRITICAL':
            hours = 4
        elif self.priority == 'HIGH':
            hours = 8
        elif self.priority == 'MEDIUM':
            hours = 24
        else:
            hours = 48
            
        self.sla_due_at = timezone.now() + timedelta(hours=hours)
        
    @classmethod
    def auto_close_resolved_tickets(cls):
        """Auto-close tickets that have been resolved for more than 7 days."""
        threshold = timezone.now() - timedelta(days=7)
        resolved_tickets = cls.objects.filter(status=cls.Status.RESOLVED, updated_at__lte=threshold)
        count = resolved_tickets.update(status=cls.Status.CLOSED)
        return count

    def __str__(self):
        return f"{self.id} - {self.title}"

class TicketComment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    is_internal = models.BooleanField(default=False, help_text="Visible only to agents")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.ticket} by {self.author}"

class TicketHistory(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='history')
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    field_name = models.CharField(max_length=100)
    old_value = models.TextField(null=True, blank=True)
    new_value = models.TextField(null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']

class Notification(models.Model):
    class Type(models.TextChoices):
        TICKET_CREATED = 'TICKET_CREATED', 'Ticket Created'
        TICKET_ASSIGNED = 'TICKET_ASSIGNED', 'Ticket Assigned'
        STATUS_CHANGED = 'STATUS_CHANGED', 'Status Changed'
        COMMENT_ADDED = 'COMMENT_ADDED', 'Comment Added'
        SLA_BREACH = 'SLA_BREACH', 'SLA Breach'

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=Type.choices)
    related_ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_notification_type_display()} for {self.recipient}"

class KBTopic(models.Model):
    name = models.CharField(max_length=100)
    organization = models.ForeignKey('users.Organization', on_delete=models.CASCADE, related_name='kb_topics', null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Article(models.Model):
    topic = models.ForeignKey(KBTopic, on_delete=models.CASCADE, related_name='articles')
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    view_count = models.IntegerField(default=0)

    def __str__(self):
        return self.title
