from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import User, EmailVerification, PasswordReset
from organizations.models import Organization


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with organization creation or joining.
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    # Organization fields
    organization_name = serializers.CharField(
        required=False,
        help_text="Name of new organization to create"
    )
    organization_invite_token = serializers.CharField(
        required=False,
        write_only=True,
        help_text="Token to join existing organization"
    )
    
    class Meta:
        model = User
        fields = (
            'email', 'username', 'first_name', 'last_name', 
            'phone_number', 'password', 'password_confirm',
            'organization_name', 'organization_invite_token'
        )
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Validate that either organization_name or organization_invite_token is provided
        if not attrs.get('organization_name') and not attrs.get('organization_invite_token'):
            raise serializers.ValidationError({
                "organization": "Either provide organization_name to create a new organization or organization_invite_token to join existing one."
            })
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        organization_name = validated_data.pop('organization_name', None)
        organization_invite_token = validated_data.pop('organization_invite_token', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Handle organization creation or joining
        if organization_name:
            # Create new organization and make user admin
            organization = Organization.objects.create(
                name=organization_name,
                slug=organization_name.lower().replace(' ', '-'),
                email=user.email
            )
            user.organization = organization
            user.role = User.Role.ADMIN
            user.save()
        elif organization_invite_token:
            # Join existing organization via invite token
            # This logic will be implemented when we handle invites
            pass
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    _('Unable to log in with provided credentials.'),
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    _('User account is disabled.'),
                    code='authorization'
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                _('Must include "email" and "password".'),
                code='authorization'
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    """
    organization_name = serializers.CharField(
        source='organization.name', 
        read_only=True
    )
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone_number', 'profile_picture', 'role',
            'organization_name', 'is_verified', 'created_at', 'last_login'
        )
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'created_at', 'last_login')


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    """
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_('Current password is incorrect.'))
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting password reset.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            # Don't reveal whether email exists for security
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset.
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    """
    token = serializers.CharField(required=True)
