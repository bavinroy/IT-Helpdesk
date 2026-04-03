from django.contrib import admin
from django.urls import path, include, re_path
from .views import index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('tickets.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    # Catch-all for React frontend
    re_path(r'^.*$', index, name='index'),
]
