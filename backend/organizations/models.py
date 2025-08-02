from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
import uuid


class Organization(models.Model):
    """
    Organization model to represent businesses using Penthrey.
    """
    
    class OrganizationType(models.TextChoices):
        STARTUP = 'startup', _('Startup')
        SMALL_BUSINESS = 'small_business', _('Small Business')
        MEDIUM_BUSINESS = 'medium_business', _('Medium Business')
        ENTERPRISE = 'enterprise', _('Enterprise')
        NON_PROFIT = 'non_profit', _('Non-Profit')
        FREELANCER = 'freelancer', _('Freelancer')
    
    class SubscriptionPlan(models.TextChoices):
        FREE = 'free', _('Free')
        STANDARD = 'standard', _('Standard')
        PREMIUM = 'premium', _('Premium')
        ENTERPRISE = 'enterprise', _('Enterprise')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Basic Information
    name = models.CharField(
        max_length=255,
        help_text="Organization name"
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        help_text="URL-friendly organization identifier"
    )
    description = models.TextField(
        blank=True,
        help_text="Brief description of the organization"
    )
    
    # Contact Information
    email = models.EmailField(
        help_text="Primary organization email"
    )
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True,
        null=True,
        help_text="Organization phone number"
    )
    website = models.URLField(
        blank=True,
        null=True,
        help_text="Organization website URL"
    )
    
    # Address Information
    address_line_1 = models.CharField(
        max_length=255,
        blank=True,
        help_text="Primary address line"
    )
    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
        help_text="Secondary address line (apartment, suite, etc.)"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        help_text="City"
    )
    state = models.CharField(
        max_length=100,
        blank=True,
        help_text="State/Province"
    )
    postal_code = models.CharField(
        max_length=20,
        blank=True,
        help_text="Postal/ZIP code"
    )
    country = models.CharField(
        max_length=100,
        default='Nigeria',
        help_text="Country"
    )
    
    # Business Information
    organization_type = models.CharField(
        max_length=20,
        choices=OrganizationType.choices,
        default=OrganizationType.SMALL_BUSINESS,
        help_text="Type of organization"
    )
    industry = models.CharField(
        max_length=100,
        blank=True,
        help_text="Industry sector"
    )
    employee_count = models.PositiveIntegerField(
        default=1,
        help_text="Number of employees"
    )
    founded_date = models.DateField(
        blank=True,
        null=True,
        help_text="Date organization was founded"
    )
    
    # Subscription & Billing
    subscription_plan = models.CharField(
        max_length=20,
        choices=SubscriptionPlan.choices,
        default=SubscriptionPlan.FREE,
        help_text="Current subscription plan"
    )
    subscription_start_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Subscription start date"
    )
    subscription_end_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Subscription end date"
    )
    is_trial = models.BooleanField(
        default=True,
        help_text="Whether organization is on trial"
    )
    trial_end_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Trial end date"
    )
    
    # Settings
    logo = models.ImageField(
        upload_to='organization_logos/',
        blank=True,
        null=True,
        help_text="Organization logo"
    )
    currency = models.CharField(
        max_length=3,
        default='NGN',
        help_text="Primary currency (ISO code)"
    )
    timezone = models.CharField(
        max_length=50,
        default='Africa/Lagos',
        help_text="Organization timezone"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether organization is active"
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether organization is verified"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Organization')
        verbose_name_plural = _('Organizations')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def full_address(self):
        """Return the complete address as a string."""
        address_parts = []
        if self.address_line_1:
            address_parts.append(self.address_line_1)
        if self.address_line_2:
            address_parts.append(self.address_line_2)
        if self.city:
            address_parts.append(self.city)
        if self.state:
            address_parts.append(self.state)
        if self.postal_code:
            address_parts.append(self.postal_code)
        if self.country:
            address_parts.append(self.country)
        return ', '.join(address_parts)
    
    @property
    def user_count(self):
        """Return the number of users in this organization."""
        return self.users.count()
    
    @property
    def admin_users(self):
        """Return admin users for this organization."""
        from authentication.models import User
        return self.users.filter(role=User.Role.ADMIN)
    
    @property
    def manager_users(self):
        """Return manager users for this organization."""
        from authentication.models import User
        return self.users.filter(role=User.Role.MANAGER)
    
    @property
    def staff_users(self):
        """Return staff users for this organization."""
        from authentication.models import User
        return self.users.filter(role=User.Role.STAFF)
    
    def can_add_users(self):
        """Check if organization can add more users based on subscription."""
        # This will be enhanced based on subscription limits
        if self.subscription_plan == self.SubscriptionPlan.FREE:
            return self.user_count < 5
        elif self.subscription_plan == self.SubscriptionPlan.STANDARD:
            return self.user_count < 25
        elif self.subscription_plan == self.SubscriptionPlan.PREMIUM:
            return self.user_count < 100
        else:  # Enterprise
            return True
    
    def get_subscription_limits(self):
        """Return subscription limits for this organization."""
        limits = {
            self.SubscriptionPlan.FREE: {
                'users': 5,
                'storage_gb': 1,
                'features': ['basic_crm', 'basic_finance']
            },
            self.SubscriptionPlan.STANDARD: {
                'users': 25,
                'storage_gb': 10,
                'features': ['basic_crm', 'basic_finance', 'hr_module', 'reports']
            },
            self.SubscriptionPlan.PREMIUM: {
                'users': 100,
                'storage_gb': 50,
                'features': ['all_features', 'advanced_reports', 'api_access']
            },
            self.SubscriptionPlan.ENTERPRISE: {
                'users': -1,  # Unlimited
                'storage_gb': -1,  # Unlimited
                'features': ['all_features', 'white_label', 'dedicated_support']
            }
        }
        return limits.get(self.subscription_plan, limits[self.SubscriptionPlan.FREE])


class OrganizationInvite(models.Model):
    """
    Model to track organization invitations.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        ACCEPTED = 'accepted', _('Accepted')
        DECLINED = 'declined', _('Declined')
        EXPIRED = 'expired', _('Expired')
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='invites'
    )
    email = models.EmailField(help_text="Email of the invited user")
    role = models.CharField(
        max_length=20,
        choices=[],  # Will be populated from User.Role.choices
        help_text="Role to assign to the invited user"
    )
    invited_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='sent_invites'
    )
    token = models.CharField(max_length=255, unique=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['organization', 'email']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invite to {self.organization.name} for {self.email}"
