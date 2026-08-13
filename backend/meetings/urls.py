from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MeetingViewSet,
    ActionItemViewSet,
    CommentViewSet,
    GlobalSearchView,
    AnalyticsView,
)

router = DefaultRouter()
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'action-items', ActionItemViewSet, basename='action-item')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
]
