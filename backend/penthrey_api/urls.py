"""
URL configuration for penthrey_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# API Documentation (if drf_yasg is installed)
try:
    from drf_yasg.views import get_schema_view
    from drf_yasg import openapi
    from rest_framework import permissions
    
    schema_view = get_schema_view(
        openapi.Info(
            title="Penthrey API",
            default_version='v1',
            description="Complete business management platform API",
            terms_of_service="https://www.penthrey.com/terms/",
            contact=openapi.Contact(email="contact@penthrey.com"),
            license=openapi.License(name="BSD License"),
        ),
        public=True,
        permission_classes=[permissions.AllowAny],
    )
    
    swagger_patterns = [
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ]
except ImportError:
    swagger_patterns = []


def api_root(request):
    """API root endpoint with information about available endpoints."""
    return JsonResponse({
        'message': 'Welcome to Penthrey API',
        'version': 'v1',
        'endpoints': {
            'authentication': '/api/v1/auth/',
            'organizations': '/api/v1/organizations/',
            'admin': '/admin/',
            'docs': '/swagger/' if swagger_patterns else None,
        }
    })


urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API root
    path('', api_root, name='api_root'),
    path('api/', api_root, name='api_root_alt'),
    
    # API v1 endpoints
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/organizations/', include('organizations.urls')),
    
    # API documentation
    *swagger_patterns,
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
