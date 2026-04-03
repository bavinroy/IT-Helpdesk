from django.core.management.base import BaseCommand
from tickets.models import Ticket

class Command(BaseCommand):
    help = 'Ran background maintenance checks for tickets (Auto-close, SLA)'

    def handle(self, *args, **options):
        # 1. Auto-Close Logic
        closed_count = Ticket.auto_close_resolved_tickets()
        if closed_count > 0:
            self.stdout.write(self.style.SUCCESS(f'Auto-closed {closed_count} resolved tickets.'))
        else:
             self.stdout.write(f'No tickets found to auto-close.')

        # 2. SLA Update (Trigger save on active tickets to re-calc status)
        # This is a naive implementation; normally we would bulk update or use a specialized query
        # But for correctness with our models.save() logic, we iterate.
        active_tickets = Ticket.objects.exclude(status__in=[Ticket.Status.RESOLVED, Ticket.Status.CLOSED])
        for t in active_tickets:
            # Saving triggers the SLA calculation logic in models.py
            t.save()
            
        self.stdout.write(f'Refreshed SLA status for {active_tickets.count()} active tickets.')
