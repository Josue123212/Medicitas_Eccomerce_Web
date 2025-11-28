"""Celery configuration for Django project."""

import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Create the Celery app
app = Celery('config')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Optional configuration, see the application user guide.
app.conf.update(
    task_serializer='json',
    accept_content=['json'],  # Ignore other content
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    result_expires=3600,
)

@app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    print(f'Request: {self.request!r}')
    return 'Debug task completed successfully!'

@app.task
def test_celery():
    """Simple test task to verify Celery is working."""
    return 'Celery is working correctly!'

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'test-every-30-seconds': {
        'task': 'config.celery.test_celery',
        'schedule': 30.0,
    },
}

app.conf.timezone = 'UTC'

if __name__ == '__main__':
    app.start()