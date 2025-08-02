from django.contrib import admin
from .models import User
from organizations.models import Organization

# Register your models here.
admin.site.register(User)
admin.site.register(Organization)