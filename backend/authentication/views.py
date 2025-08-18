from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import secrets
import uuid

from .models import User, EmailVerification, PasswordReset, UserLoginSession
from .email_service import EmailService
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer
)
from .permissions import IsOwnerOrReadOnly, IsAdminOrManager


class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        # print('here')
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
           
    #    create user but dont commit yet
        user = serializer.save()
        
        # Check if this is an invite-based registration
        is_invite_registration = bool(request.data.get('organization_invite_token'))
        
        if is_invite_registration:
            # FLOW 2: Invite-based registration (staff/manager)
            # No email verification needed, auto-login
            refresh = RefreshToken.for_user(user)
            # set user is_verified to true
            user.is_verified = True
            user.save()
            
            return Response({
                'message': 'Registration successful! Welcome to the team.',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'flow_type': 'invite',
                'auto_login': True
            }, status=status.HTTP_201_CREATED)
        
        else:
            # FLOW 1: Organization owner registration
            # Requires email verification, no auto-login
            verification_token = None
    
          
            try:
                email_verification = EmailVerification.objects.create(
                    user=user,
                    expires_at=timezone.now() + timedelta(hours=24)
                )
                verification_token = email_verification.token
                print(user,verification_token)
                EmailService.send_verification_email(user, verification_token)
            except Exception as e:
                # Log the error but don't fail registration
                print(f"Failed to send verification email: {e}")
            
            return Response({
                'message': 'Organization registered successfully! Please check your email to verify your account before logging in.',
                'user': UserProfileSerializer(user).data,
                'flow_type': 'organization_owner',
                'verification_required': True,
                'verification_token': verification_token  # Remove in production
            }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    API endpoint for user login with JWT token generation.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):

        try:
            serializer = UserLoginSerializer(
                data=request.data,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
        
            user = serializer.validated_data['user']
        except Exception as e:
            return Response({
                'error': "Email or Password is incorrect please try again or Reset Password",
                'message': 'Login failed'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check email verification for organization owners (admin role)
        if user.role == User.Role.ADMIN and not user.is_verified:
            return Response({
                'error': 'Please verify your email address before logging in.',
                'verification_required': True,
                'email': user.email,
                'message': 'Check your email for the verification link or request a new one.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Update last login IP
        user.last_login_ip = self.get_client_ip(request)
        user.save(update_fields=['last_login_ip'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Create login session and send notification if new device
        try:
            login_session = UserLoginSession.create_session(user, request)
            
            # Send login notification if it's a new device
            if login_session.is_new_device:
                login_info = {
                    'login_time': login_session.login_time,
                    'ip_address': login_session.ip_address,
                    'location': login_session.location,
                    'device_info': login_session.device_info,
                    'browser_info': login_session.browser_info,
                    'is_new_device': True,
                }
                EmailService.send_login_notification(user, login_info)
        except Exception as e:
            # Don't fail login if session tracking fails
            print(f"Failed to create login session: {e}")
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for viewing and updating user profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    """
    API endpoint for changing password.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Password changed successfully'
        })


class PasswordResetRequestView(APIView):
    """
    API endpoint for requesting password reset.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            PasswordReset.objects.create(
                user=user,
                token=reset_token,
                expires_at=timezone.now() + timedelta(hours=2)
            )
            
            # In production, send email with reset link
            # set Rest email service
            EmailService.send_password_reset_email(user, reset_token)
            return Response({
                'message': 'Password reset email sent',
                'reset_token': reset_token  # Remove in production
            })
            
        except User.DoesNotExist:
            # Don't reveal whether email exists for security
            return Response({
                'message': 'Password reset email sent'
            })


class PasswordResetConfirmView(APIView):
    """
    API endpoint for confirming password reset.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print(request.data)
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            reset_request = PasswordReset.objects.get(
                token=token,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            # Reset password
            user = reset_request.user
            user.set_password(new_password)
            user.save()
            
            # Mark reset request as used
            reset_request.is_used = True
            reset_request.used_at = timezone.now()
            reset_request.save()
            
            return Response({
                'message': 'Password reset successful'
            })
            
        except PasswordReset.DoesNotExist:
            return Response({
                'error': 'Invalid or expired reset token'
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(APIView):
    """
    API endpoint for email verification.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        
        try:
            verification = EmailVerification.objects.get(
                token=token,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            # Verify email
            user = verification.user
            user.is_verified = True
            user.save()
            
            # Mark verification as used
            verification.is_used = True
            verification.verified_at = timezone.now()
            verification.save()
            
            return Response({
                'message': 'Email verified successfully'
            })
            
        except EmailVerification.DoesNotExist:
            return Response({
                'error': 'Invalid or expired verification token'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailVerificationView(APIView):
    """
    API endpoint for resending email verification.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if user.is_verified:
            return Response({
                'message': 'Email is already verified'
            })
        
        # Generate new verification token
        verification_token = secrets.token_urlsafe(32)
        EmailVerification.objects.create(
            user=user,
            token=verification_token,
            expires_at=timezone.now() + timedelta(days=1)
        )
        
        return Response({
            'message': 'Verification email sent',
            'verification_token': verification_token  # Remove in production
        })


class UserListView(generics.ListAPIView):
    """
    API endpoint for listing users (admin/manager only).
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    
    def get_queryset(self):
        # Filter users by organization
        return User.objects.filter(
            organization=self.request.user.organization
        ).order_by('-created_at')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for user detail (admin/manager only).
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    
    def get_queryset(self):
        # Filter users by organization
        return User.objects.filter(
            organization=self.request.user.organization
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """
    API endpoint for user dashboard data.
    """
    user = request.user
    organization = user.organization
    
    dashboard_data = {
        'user': UserProfileSerializer(user).data,
        'organization': {
            'name': organization.name if organization else None,
            'user_count': organization.user_count if organization else 0,
            'subscription_plan': organization.subscription_plan if organization else None,
        },
        'permissions': {
            'can_manage_users': user.can_manage_users(),
            'can_access_admin_features': user.can_access_admin_features(),
            'is_admin': user.is_admin,
            'is_manager': user.is_manager,
            'is_staff_member': user.is_staff_member,
        }
    }
    
    return Response(dashboard_data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    API endpoint for user logout (blacklist refresh token).
    """
    print(request.data)
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({
            'message': 'Successfully logged out'
        })
    except Exception as e:
        return Response({
            'error': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)
