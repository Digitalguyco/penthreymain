from django.urls import path
from . import views

app_name = 'organizations'

urlpatterns = [
    # Organization management
    path('', views.OrganizationDetailView.as_view(), name='organization_detail'),
    path('create/', views.OrganizationCreateView.as_view(), name='organization_create'),
    path('stats/', views.organization_stats, name='organization_stats'),
    path('leave/', views.leave_organization, name='leave_organization'),
    
    # Members management
    path('members/', views.OrganizationMembersView.as_view(), name='members_list'),
    path('members/<uuid:pk>/', views.OrganizationMemberDetailView.as_view(), name='member_detail'),
    
    # Invitations
    path('invites/', views.OrganizationInvitesView.as_view(), name='invites_list'),
    path('invites/send/', views.InviteUserView.as_view(), name='send_invite'),
    path('invites/<uuid:invite_id>/cancel/', views.CancelInviteView.as_view(), name='cancel_invite'),
    path('invites/accept/', views.AcceptInviteView.as_view(), name='accept_invite'),
    path('invites/decline/', views.DeclineInviteView.as_view(), name='decline_invite'),
]
