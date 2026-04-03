from django.apps import AppConfig
import sys

class TicketsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tickets'

    def ready(self):
        # Only start scheduler once apps are fully loaded to avoid AppsNotReady exception
        import tickets.scheduler
        # We start it in a separate thread so it doesn't block the ready() phase
        import threading
        t = threading.Thread(target=tickets.scheduler.start, daemon=True)
        t.start()
