from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.urls import reverse
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service class for handling email operations with styled templates"""
    
    @staticmethod
    def send_verification_email(user, verification_token):
        """Send email verification email with styled template"""
        try:
            # Build verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
            
            # Render HTML email template
            html_content = render_to_string('emails/email_verification.html', {
                'user': user,
                'verification_url': verification_url,
                'verification_token': verification_token,
            })
            
            # Create plain text version
            text_content = strip_tags(html_content)
            
            # Send email
            send_mail(
                subject='Verify Your Email - Penthrey',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f"Verification email sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_login_notification(user, login_info):
        """Send login notification email for new device/location"""
        try:
            # Build dashboard URL
            dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
            
            # Render HTML email template
            html_content = render_to_string('emails/login_notification.html', {
                'user': user,
                'login_time': login_info.get('login_time', timezone.now()),
                'ip_address': login_info.get('ip_address', 'Unknown'),
                'location': login_info.get('location', 'Unknown'),
                'device_info': login_info.get('device_info', 'Unknown Device'),
                'browser_info': login_info.get('browser_info', 'Unknown Browser'),
                'is_new_device': login_info.get('is_new_device', False),
                'dashboard_url': dashboard_url,
            })
            
            # Create plain text version
            text_content = strip_tags(html_content)
            
            # Send email
            send_mail(
                subject='New Login Detected - Penthrey',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f"Login notification sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send login notification to {user.email}: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_email(user, reset_token):
        """Send password reset email with styled template"""
        try:
            # Build password reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"
            
            # Render HTML email template
            html_content = render_to_string('emails/password_reset.html', {
                'user': user,
                'reset_url': reset_url,
                'reset_token': reset_token,
                'frontend_url': settings.FRONTEND_URL,
                'current_year': timezone.now().year,
            })
            
            # Create plain text version
            text_content = strip_tags(html_content)
            
            # Send email
            send_mail(
                subject='Reset Your Password - Penthrey',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f"Password reset email sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
            return False

        
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email after email verification"""
        try:
            # Build dashboard URL
            dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
            
            # Render HTML email template
            html_content = render_to_string('emails/welcome_email.html', {
                'user': user,
                'dashboard_url': dashboard_url,
                'frontend_url': settings.FRONTEND_URL,
                'current_year': timezone.now().year,
            })
            
            # Create plain text version
            text_content = strip_tags(html_content)
            
            # Send email
            send_mail(
                subject='Welcome to Penthrey - Your Account is Ready!',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f"Welcome email sent successfully to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
            return False

    @staticmethod
    def send_invite_email(email, role, organization, invite_token):
        # email sending timeout
        invite_timeout = 7
        try:
            # Build invite URL
            invite_url = f"{settings.FRONTEND_URL}/signup?token={invite_token}"
            
            # Render HTML email template
            html_content = render_to_string('emails/invite_email.html', {
                'user': email,
                'invite_url': invite_url,
                'role': role,
                'organization': organization,
            })
            
            # Create plain text version of the email    
            text_content = strip_tags(html_content)
            
            # Send email
            send_mail(
                subject='You have been invited to join Penthrey',
                message=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_content,
                fail_silently=False,
            )
            
            logger.info(f"Invite email sent successfully to {email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invite email to {email}: {str(e)}")
            return False