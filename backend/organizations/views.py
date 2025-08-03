from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import secrets
from authentication import email_service

from .models import Organization, OrganizationInvite
from .serializers import (
    OrganizationSerializer,
    OrganizationCreateSerializer,
    OrganizationMemberSerializer,
    OrganizationInviteSerializer,
    InviteUserSerializer,
    OrganizationStatsSerializer
)
from authentication.models import User
from authentication.permissions import IsAdminOrManager, IsAdmin, IsSameOrganization


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for viewing and updating organization details.
    """
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated, IsSameOrganization]
    
    def get_object(self):
        return self.request.user.organization


class OrganizationCreateView(generics.CreateAPIView):
    """
    API endpoint for creating a new organization.
    """
    serializer_class = OrganizationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user already belongs to an organization
        if request.user.organization:
            return Response({
                'error': 'You already belong to an organization'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create organization
        organization = serializer.save()
        
        # Make the current user the admin of the new organization
        user = request.user
        user.organization = organization
        user.role = User.Role.ADMIN
        user.save()
        
        return Response({
            'message': 'Organization created successfully',
            'organization': OrganizationSerializer(organization).data
        }, status=status.HTTP_201_CREATED)


class OrganizationMembersView(generics.ListAPIView):
    """
    API endpoint for listing organization members.
    """
    serializer_class = OrganizationMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsSameOrganization]
    
    def get_queryset(self):
        return User.objects.filter(
            organization=self.request.user.organization
        ).order_by('-created_at')


class OrganizationMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for managing individual organization members.
    """
    serializer_class = OrganizationMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    
    def get_queryset(self):
        return User.objects.filter(
            organization=self.request.user.organization
        )
    
    def update(self, request, *args, **kwargs):
        member = self.get_object()
        
        # Prevent non-admins from modifying admin users
        if member.is_admin and not request.user.is_admin:
            return Response({
                'error': 'Only admins can modify admin users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent users from changing their own role
        if member == request.user and 'role' in request.data:
            return Response({
                'error': 'You cannot change your own role'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        member = self.get_object()
        
        # Prevent users from deleting themselves
        if member == request.user:
            return Response({
                'error': 'You cannot remove yourself from the organization'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent non-admins from removing admin users
        if member.is_admin and not request.user.is_admin:
            return Response({
                'error': 'Only admins can remove admin users'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)


class InviteUserView(APIView):
    """
    API endpoint for inviting users to organization.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    
    def post(self, request):
        # Check if organization can add more users
        organization = request.user.organization
        print(request.data)
        if not organization.can_add_users():
            return Response({
                'error': 'User limit reached for your subscription plan'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InviteUserSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        role = serializer.validated_data['role']
        
        # Generate invite token
        invite_token = secrets.token_urlsafe(32)

                # Send email to the invited user
        email_service.EmailService.send_invite_email(email, role, organization, invite_token)
        
        # Create invite
        invite = OrganizationInvite.objects.create(
            organization=organization,
            email=email,
            role=role,
            invited_by=request.user,
            token=invite_token,
            expires_at=timezone.now() + timedelta(days=7)
        )


        # In production, send email with invite link
        return Response({
            'message': 'Invitation sent successfully',
            'invite': OrganizationInviteSerializer(invite).data,
            'invite_token': invite_token  # Remove in production
        }, status=status.HTTP_201_CREATED)


class OrganizationInvitesView(generics.ListAPIView):
    """
    API endpoint for listing organization invites.
    """
    serializer_class = OrganizationInviteSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    
    def get_queryset(self):
        return OrganizationInvite.objects.filter(
            organization=self.request.user.organization
        ).order_by('-created_at')


class AcceptInviteView(APIView):
    """
    API endpoint for accepting organization invites.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        invite_token = request.data.get('token')
        
        if not invite_token:
            return Response({
                'error': 'Invite token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invite = OrganizationInvite.objects.get(
                token=invite_token,
                email=request.user.email,
                status=OrganizationInvite.Status.PENDING,
                expires_at__gt=timezone.now()
            )
        except OrganizationInvite.DoesNotExist:
            return Response({
                'error': 'Invalid or expired invite token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already belongs to an organization
        if request.user.organization:
            return Response({
                'error': 'You already belong to an organization'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Accept invite
        user = request.user
        user.organization = invite.organization
        user.role = invite.role
        user.save()
        
        # Mark invite as accepted
        invite.status = OrganizationInvite.Status.ACCEPTED
        invite.accepted_at = timezone.now()
        invite.save()
        
        return Response({
            'message': 'Invite accepted successfully',
            'organization': OrganizationSerializer(invite.organization).data
        })


class DeclineInviteView(APIView):
    """
    API endpoint for declining organization invites.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        invite_token = request.data.get('token')
        
        if not invite_token:
            return Response({
                'error': 'Invite token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invite = OrganizationInvite.objects.get(
                token=invite_token,
                status=OrganizationInvite.Status.PENDING,
                expires_at__gt=timezone.now()
            )
        except OrganizationInvite.DoesNotExist:
            return Response({
                'error': 'Invalid or expired invite token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Decline invite
        invite.status = OrganizationInvite.Status.DECLINED
        invite.save()
        
        return Response({
            'message': 'Invite declined successfully'
        })


class CancelInviteView(APIView):
    """
    API endpoint for canceling organization invites.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManager]
    
    def post(self, request, invite_id):
        try:
            invite = OrganizationInvite.objects.get(
                id=invite_id,
                organization=request.user.organization,
                status=OrganizationInvite.Status.PENDING
            )
        except OrganizationInvite.DoesNotExist:
            return Response({
                'error': 'Invite not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Cancel invite
        invite.status = OrganizationInvite.Status.EXPIRED
        invite.save()
        
        return Response({
            'message': 'Invite canceled successfully'
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsSameOrganization])
def organization_stats(request):
    """
    API endpoint for organization statistics.
    """
    organization = request.user.organization
    
    stats = {
        'total_users': organization.user_count,
        'admin_users': organization.admin_users.count(),
        'manager_users': organization.manager_users.count(),
        'staff_users': organization.staff_users.count(),
        'subscription_plan': organization.subscription_plan,
        'subscription_limits': organization.get_subscription_limits(),
        'can_add_users': organization.can_add_users(),
    }
    
    serializer = OrganizationStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdmin])
def leave_organization(request):
    """
    API endpoint for leaving organization (admin only and must transfer ownership).
    """
    user = request.user
    organization = user.organization
    
    if not organization:
        return Response({
            'error': 'You are not part of any organization'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user is the only admin
    admin_count = organization.admin_users.count()
    if user.is_admin and admin_count == 1:
        return Response({
            'error': 'You cannot leave as the only admin. Please promote another user to admin first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Remove user from organization
    user.organization = None
    user.role = User.Role.STAFF
    user.save()
    
    return Response({
        'message': 'Successfully left the organization'
    })
