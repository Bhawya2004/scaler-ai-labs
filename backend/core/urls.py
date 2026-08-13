from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root_view(request):
    """Healthcheck and API discovery view."""
    return JsonResponse({
        "name": "Fireflies.ai Clone API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
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
    path('admin/', admin.site.urls),
    path('api/v1/', include('meetings.urls')),
]
