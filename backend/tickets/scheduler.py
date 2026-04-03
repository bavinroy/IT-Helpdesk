from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import atexit
import threading
import sys

# Ensure this only runs once and not in management commands like migrations
_has_started = False

def close_old_tickets():
    from .models import Ticket
    try:
        count = Ticket.auto_close_resolved_tickets()
        print(f"APScheduler: Auto-closed {count} resolved tickets.")
    except Exception as e:
        print(f"APScheduler Error: {e}")

def start():
    global _has_started
    if _has_started:
        return
        
    # Prevent running during migrations, collectstatic, etc.
    if 'runserver' not in sys.argv:
        return

    _has_started = True

    scheduler = BackgroundScheduler()
    # Run everyday at midnight
    scheduler.add_job(close_old_tickets, CronTrigger(hour=0, minute=0), id='close_old_tickets', replace_existing=True)
    
    # We can also add a cron for SLA breaches if we wanted:
    # scheduler.add_job(check_sla_breaches, CronTrigger(minute='*/30'))
    
    scheduler.start()
    print("APScheduler Started!")

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
