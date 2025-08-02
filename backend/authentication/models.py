from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid


class User(AbstractUser):
    """
    Custom User model with organization scoping and role-based permissions.
    """
    
    class Role(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        MANAGER = 'manager', _('Manager')
        STAFF = 'staff', _('Staff')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(
        validators=[phone_regex], 
        max_length=17, 
        blank=True, 
        null=True,
        help_text="Phone number in international format"
    )
    
    # Role and Organization
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF,
        help_text="User role within the organization"
    )
    
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True,
        help_text="Organization this user belongs to"
    )
    
    # Profile Information
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        blank=True, 
        null=True
    )
    
    # Account Settings
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this user has verified their email address."
    )
    email_verification_token = models.CharField(
        max_length=255, 
        blank=True, 
        null=True
    )
    password_reset_token = models.CharField(
        max_length=255, 
        blank=True, 
        null=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}"
        return full_name.strip()
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name
    
    @property
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == self.Role.ADMIN
    
    @property
    def is_manager(self):
        """Check if user is a manager."""
        return self.role == self.Role.MANAGER
    
    @property
    def is_staff_member(self):
        """Check if user is a staff member."""
        return self.role == self.Role.STAFF
    
    def has_organization_permission(self, organization):
        """Check if user has permission to access a specific organization."""
        return self.organization == organization
    
    def can_manage_users(self):
        """Check if user can manage other users."""
        return self.role in [self.Role.ADMIN, self.Role.MANAGER]
    
    def can_access_admin_features(self):
        """Check if user can access admin features."""
        return self.role == self.Role.ADMIN


class EmailVerification(models.Model):
    """
    Model to track email verification attempts.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verifications')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Email verification for {self.user.email}"


class PasswordReset(models.Model):
    """
    Model to track password reset attempts.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_resets')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Password reset for {self.user.email}"


class UserLoginSession(models.Model):
    """
    Model to track user login sessions for security monitoring.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_sessions')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_fingerprint = models.CharField(max_length=255, help_text="Hash of device characteristics")
    location = models.CharField(max_length=255, blank=True, null=True)
    browser_info = models.CharField(max_length=255, blank=True, null=True)
    device_info = models.CharField(max_length=255, blank=True, null=True)
    is_new_device = models.BooleanField(default=False)
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-login_time']
        indexes = [
            models.Index(fields=['user', 'device_fingerprint']),
            models.Index(fields=['user', 'login_time']),
        ]
    
    def __str__(self):
        return f"Login session for {self.user.email} from {self.ip_address}"
    
    @classmethod
    def create_session(cls, user, request):
        """
        Create a new login session from request data.
        """
        import hashlib
        from django.utils import timezone
        
        # Get IP address
        ip_address = cls.get_client_ip(request)
        
        # Get user agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create device fingerprint
        device_data = f"{user_agent}{ip_address}"
        device_fingerprint = hashlib.md5(device_data.encode()).hexdigest()
        
        # Check if this is a new device
        is_new_device = not cls.objects.filter(
            user=user,
            device_fingerprint=device_fingerprint
        ).exists()
        
        # Parse browser and device info
        browser_info, device_info = cls.parse_user_agent(user_agent)
        
        # Create session
        session = cls.objects.create(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            device_fingerprint=device_fingerprint,
            browser_info=browser_info,
            device_info=device_info,
            is_new_device=is_new_device,
        )
        
        return session
    
    @staticmethod
    def get_client_ip(request):
        """
        Get the client's IP address from the request.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def parse_user_agent(user_agent):
        """
        Parse user agent string to extract browser and device info.
        """
        browser_info = "Unknown Browser"
        device_info = "Unknown Device"
        
        if not user_agent:
            return browser_info, device_info
        
        user_agent_lower = user_agent.lower()
        
        # Browser detection
        if 'chrome' in user_agent_lower:
            browser_info = "Chrome"
        elif 'firefox' in user_agent_lower:
            browser_info = "Firefox"
        elif 'safari' in user_agent_lower and 'chrome' not in user_agent_lower:
            browser_info = "Safari"
        elif 'edge' in user_agent_lower:
            browser_info = "Edge"
        elif 'opera' in user_agent_lower:
            browser_info = "Opera"
        
        # Device detection
        if 'mobile' in user_agent_lower or 'android' in user_agent_lower:
            device_info = "Mobile Device"
        elif 'tablet' in user_agent_lower or 'ipad' in user_agent_lower:
            device_info = "Tablet"
        elif 'windows' in user_agent_lower:
            device_info = "Windows PC"
        elif 'mac' in user_agent_lower:
            device_info = "Mac"
        elif 'linux' in user_agent_lower:
            device_info = "Linux PC"
        else:
            device_info = "Desktop"
        
        return browser_info, device_info
