from rest_framework import serializers
from .models import Ticket, Category, TicketComment, TicketHistory, Notification, KBTopic, Article

class KBTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = KBTopic
        fields = '__all__'

class ArticleSerializer(serializers.ModelSerializer):
    topic_name = serializers.ReadOnlyField(source='topic.name')
    author_name = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = Article
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class TicketCommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'author', 'text', 'is_internal', 'created_at']

class TicketHistorySerializer(serializers.ModelSerializer):
    changed_by = serializers.ReadOnlyField(source='changed_by.username')
    class Meta:
        model = TicketHistory
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    assigned_to = serializers.ReadOnlyField(source='assigned_to.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    
    # Allow passing category name (e.g. "Network") to link the FK
    category = serializers.SlugRelatedField(slug_field='name', queryset=Category.objects.all(), required=False)
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 
            'category', 'category_name', 
            'priority', 'status', 
            'created_by', 'assigned_to', 
            'organization',
            'created_at', 'updated_at', 
            'sla_due_at',
            'sla_status',
            'feedback_rating',
            'feedback_text'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'organization']
