from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Ticket, Category, Notification, TicketComment, TicketHistory, KBTopic, Article
from .serializers import (
    TicketSerializer, 
    NotificationSerializer, 
    TicketCommentSerializer, 
    TicketHistorySerializer,
    KBTopicSerializer,
    ArticleSerializer
)
from django.db.models import Q, Count

class KBTopicViewSet(viewsets.ModelViewSet):
    serializer_class = KBTopicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = KBTopic.objects.all()
        if user.organization:
            qs = qs.filter(Q(organization=user.organization) | Q(organization=None))
        return qs

class ArticleViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Article.objects.filter(is_published=True)
        if user.organization:
            qs = qs.filter(Q(topic__organization=user.organization) | Q(topic__organization=None))
        return qs.order_by('-view_count')

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')

class TicketCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TicketCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by Ticket? Usually nested. But for now flat list with filter.
        # Ideally: /api/tickets/1/comments/
        # Here we just return all visible comments
        user = self.request.user
        qs = TicketComment.objects.all()
        # Scope by Org
        if user.organization:
            qs = qs.filter(ticket__organization=user.organization)
        
        # Hide internal comments from standard Users
        if user.role == 'USER':
            qs = qs.filter(is_internal=False)
            
        return qs.order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class StatsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        tickets = Ticket.objects.all()
        if user.organization:
            tickets = tickets.filter(organization=user.organization)
        
        if user.role not in ['ADMIN', 'IT_AGENT', 'SUPERUSER']:
            tickets = tickets.filter(created_by=user)

        data = {
            "status_counts": tickets.values('status').annotate(count=Count('id')),
            "priority_counts": tickets.values('priority').annotate(count=Count('id')),
            "sla_counts": tickets.values('sla_status').annotate(count=Count('id')),
            "total_tickets": tickets.count(),
        }
        return Response(data)

class TicketHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TicketHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = TicketHistory.objects.all()
        if user.organization:
            qs = qs.filter(ticket__organization=user.organization)
        return qs.order_by('-changed_at')

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        # ... existing ... (will re-paste for safety or use diff)
        user = self.request.user
        if not user.is_authenticated:
            return Ticket.objects.all().order_by('-created_at')
            
        qs = Ticket.objects.all()
        if user.organization:
            qs = qs.filter(organization=user.organization)
        if user.role not in ['ADMIN', 'IT_AGENT', 'SUPERUSER']:
            qs = qs.filter(created_by=user)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        # ... logic as before ...
        user = self.request.user
        # Integrate AI Service for Classification
        from chatbot.services import AIService
        
        description = serializer.validated_data.get('description', '')
        title = serializer.validated_data.get('title', '')
        
        ai_service = AIService()
        classification = ai_service.analyze_ticket(title, description)
        
        priority = classification.get('priority', 'MEDIUM')
        category_name = classification.get('category', 'General')
        
        # Resolve Category Object
        category_obj = None
        if user.organization:
             category_obj = Category.objects.filter(name__iexact=category_name, organization=user.organization).first()
        if not category_obj:
             category_obj = Category.objects.filter(name__iexact=category_name, organization=None).first()
        if not category_obj:
             # Fallback to loose matching if exact name not found (e.g. AI returns 'Network Issue' but DB has 'Network')
             category_obj = Category.objects.filter(name__icontains=category_name.split()[0], organization=None).first()

        serializer.save(
            created_by=user, 
            organization=user.organization,
            priority=priority, 
            category=category_obj, 
            status='OPEN'
        )

        Notification.objects.create(
            recipient=self.request.user,
            message=f"Ticket '{title}' created. ID: #{serializer.instance.id}",
            notification_type='TICKET_CREATED',
            related_ticket=serializer.instance
        )

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def analyze(self, request):
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        from chatbot.services import AIService
        result = AIService().analyze_ticket(title, description)
        # Map result to expected frontend format if needed, or just return raw
        # Frontend expects: { category, priority, reasoning, suggestedSolution }
        # My service returns: { category, priority, reasoning }
        # I'll add a dummy suggestedSolution or ask AI for it.
        # For now, let's keep it simple.
        result['suggestedSolution'] = result.get('reasoning', 'See detailed analysis.')
        return Response(result)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny]) # AllowAny for demo ease
    def draft_reply(self, request, pk=None):
        ticket = self.get_object()
        from chatbot.services import AIService
        
        # Simple history compilation
        history_text = "\n".join([f"Comment: {c.text}" for c in ticket.comments.all()])
        
        draft = AIService().generate_response(ticket.title, ticket.description, history_text)
        return Response({"draft": draft})

    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        ticket = self.get_object()
        
        # Only owner can give feedback
        if ticket.created_by != request.user:
            return Response({"error": "You can only rate your own tickets"}, status=403)
            
        # Ticket must be closed/resolved
        if ticket.status not in ['RESOLVED', 'CLOSED']:
             return Response({"error": "Ticket must be resolved to give feedback"}, status=400)

        rating = request.data.get('rating')
        comment = request.data.get('comment')
        
        if not rating:
             return Response({"error": "Rating is required"}, status=400)

        ticket.feedback_rating = rating
        ticket.feedback_text = comment
        ticket.save()
        
        return Response({"status": "Feedback recorded"})



    def perform_update(self, serializer):
        # AUDIT LOGGING LOGIC
        old_instance = self.get_object()
        new_instance = serializer.save()
        
        changes = []
        if old_instance.status != new_instance.status:
            changes.append(('status', old_instance.status, new_instance.status))
        if old_instance.priority != new_instance.priority:
            changes.append(('priority', old_instance.priority, new_instance.priority))
        if old_instance.assigned_to != new_instance.assigned_to:
            old_name = old_instance.assigned_to.username if old_instance.assigned_to else 'Unassigned'
            new_name = new_instance.assigned_to.username if new_instance.assigned_to else 'Unassigned'
            changes.append(('assigned_to', old_name, new_name))

        for field, old, new in changes:
            TicketHistory.objects.create(
                ticket=new_instance,
                changed_by=self.request.user,
                field_name=field,
                old_value=str(old),
                new_value=str(new)
            )
            
            # Notify on Status Change
            if field == 'status' and new_instance.created_by != self.request.user:
                 Notification.objects.create(
                    recipient=new_instance.created_by,
                    message=f"Your ticket #{new_instance.id} status updated to {new}",
                    notification_type='STATUS_CHANGED',
                    related_ticket=new_instance
                )

            # Notify on Assignment
            if field == 'assigned_to' and new_instance.assigned_to:
                 Notification.objects.create(
                    recipient=new_instance.assigned_to,
                    message=f"You have been assigned ticket #{new_instance.id}",
                    notification_type='TICKET_ASSIGNED',
                    related_ticket=new_instance
                )
