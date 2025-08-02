from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj == request.user


class IsAdminOrManager(permissions.BasePermission):
    """
    Custom permission to only allow admin or manager users.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_admin or request.user.is_manager


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.is_admin


class IsSameOrganization(permissions.BasePermission):
    """
    Custom permission to ensure users can only access data from their organization.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.organization is not None

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if the object has an organization field
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization
        
        # Check if the object is a user and belongs to the same organization
        if hasattr(obj, 'id') and hasattr(request.user, 'organization'):
            if hasattr(obj, 'organization'):
                return obj.organization == request.user.organization
        
        return False


class CanManageUsers(permissions.BasePermission):
    """
    Custom permission for users who can manage other users.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return request.user.can_manage_users()
