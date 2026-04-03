from django.shortcuts import render
from django.conf import settings
import os

def index(request):
    """Serve the React Frontend index.html"""
    try:
        # For production: index.html will be in STATIC_ROOT or STATICFILES_DIRS
        # With WhiteNoise, we can also try reading it from the dist folder directly
        return render(request, 'index.html')
    except Exception:
        # Fallback for during development/missing build
        from django.http import HttpResponse
        return HttpResponse("Frontend build not found. Run 'npm run build' first.", status=404)
