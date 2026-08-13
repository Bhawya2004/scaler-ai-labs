import time
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection

SERVER_START_TIME = time.time()

def health_check_view(request):
    """Lightweight and robust health check endpoint for UptimeRobot and Render keepalive."""
    db_status = "ok"
    try:
        connection.ensure_connection()
    except Exception as e:
        db_status = f"error: {str(e)}"

    return JsonResponse({
        "status": "healthy" if db_status == "ok" else "degraded",
        "database": db_status,
        "uptime_seconds": round(time.time() - SERVER_START_TIME, 1),
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }, status=200 if db_status == "ok" else 503)

def api_root_view(request):
    """Healthcheck and API discovery view."""
    return JsonResponse({
        "name": "Fireflies.ai Clone API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "health": "/health/",
            "meetings": "/api/v1/meetings/",
            "action_items": "/api/v1/action-items/",
            "comments": "/api/v1/comments/",
            "search": "/api/v1/search/",
            "analytics": "/api/v1/analytics/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('health/', health_check_view, name='health-check'),
    path('healthz/', health_check_view, name='healthz-check'),
    path('api/health/', health_check_view, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('meetings.urls')),
]
