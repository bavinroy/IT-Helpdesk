from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketViewSet, 
    NotificationViewSet, 
    TicketCommentViewSet, 
    TicketHistoryViewSet,
    KBTopicViewSet,
    ArticleViewSet,
    StatsViewSet
)

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'comments', TicketCommentViewSet, basename='comment')
router.register(r'history', TicketHistoryViewSet, basename='history')
router.register(r'kb-topics', KBTopicViewSet, basename='kb-topic')
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'stats', StatsViewSet, basename='stats')

urlpatterns = [
    path('', include(router.urls)),
]
