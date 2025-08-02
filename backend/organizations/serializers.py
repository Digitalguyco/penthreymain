from rest_framework import serializers
from django.utils.text import slugify
from .models import Organization, OrganizationInvite
from authentication.models import User


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer for Organization model.
    """
    user_count = serializers.ReadOnlyField()
    full_address = serializers.ReadOnlyField()
    subscription_limits = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'description', 'email', 'phone_number',
            'website', 'address_line_1', 'address_line_2', 'city', 'state',
            'postal_code', 'country', 'organization_type', 'industry',
            'employee_count', 'founded_date', 'subscription_plan',
            'subscription_start_date', 'subscription_end_date', 'is_trial',
            'trial_end_date', 'logo', 'currency', 'timezone', 'is_active',
            'is_verified', 'created_at', 'updated_at', 'user_count',
            'full_address', 'subscription_limits'
        ]
        read_only_fields = [
            'id', 'slug', 'subscription_plan', 'subscription_start_date',
            'subscription_end_date', 'is_trial', 'trial_end_date',
            'is_verified', 'created_at', 'updated_at'
        ]
    
    def get_subscription_limits(self, obj):
        return obj.get_subscription_limits()
    
    def validate_name(self, value):
        # Check if organization name is unique
        if Organization.objects.filter(name=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Organization with this name already exists.")
        return value
    
    def create(self, validated_data):
        # Auto-generate slug from name
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # Update slug if name changes
        if 'name' in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new organization.
    """
    
    class Meta:
        model = Organization
        fields = [
            'name', 'description', 'email', 'phone_number', 'website',
            'address_line_1', 'address_line_2', 'city', 'state',
            'postal_code', 'country', 'organization_type', 'industry',
            'employee_count', 'founded_date', 'currency', 'timezone'
        ]
    
    def create(self, validated_data):
        # Auto-generate slug from name
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


class OrganizationMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for organization members.
    """
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone_number', 'role', 'profile_picture',
            'is_verified', 'created_at', 'last_login'
        ]
        read_only_fields = [
            'id', 'email', 'username', 'is_verified', 'created_at', 'last_login'
        ]


class OrganizationInviteSerializer(serializers.ModelSerializer):
    """
    Serializer for organization invites.
    """
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = OrganizationInvite
        fields = [
            'id', 'email', 'role', 'invited_by_name', 'organization_name',
            'status', 'created_at', 'expires_at', 'accepted_at'
        ]
        read_only_fields = [
            'id', 'invited_by_name', 'organization_name', 'status',
            'created_at', 'expires_at', 'accepted_at'
        ]


class InviteUserSerializer(serializers.Serializer):
    """
    Serializer for inviting users to organization.
    """
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=User.Role.choices)
    
    def validate_email(self, value):
        # Check if user already exists in the organization
        request = self.context.get('request')
        if request and request.user.organization:
            if User.objects.filter(email=value, organization=request.user.organization).exists():
                raise serializers.ValidationError("User with this email already exists in your organization.")
        
        # Check if there's already a pending invite
        if request and request.user.organization:
            if OrganizationInvite.objects.filter(
                email=value, 
                organization=request.user.organization,
                status=OrganizationInvite.Status.PENDING
            ).exists():
                raise serializers.ValidationError("There's already a pending invite for this email.")
        
        return value


class OrganizationStatsSerializer(serializers.Serializer):
    """
    Serializer for organization statistics.
    """
    total_users = serializers.IntegerField()
    admin_users = serializers.IntegerField()
    manager_users = serializers.IntegerField()
    staff_users = serializers.IntegerField()
    subscription_plan = serializers.CharField()
    subscription_limits = serializers.DictField()
    can_add_users = serializers.BooleanField()
