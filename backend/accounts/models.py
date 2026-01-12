# accounts/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class SmsUserManager(BaseUserManager):
    def create_user(self, username, password, email=None, role="student", **extra_fields):
        if not username or not username.strip():
            return None, "Username is required"
        if not password or not password.strip():
            return None, "Password is required"

        valid_roles = ['admin', 'staff', 'teacher', 'student', 'parent']
        if role not in valid_roles:
            return None, f"Invalid role. Must be one of: {', '.join(valid_roles)}"

        if email:
            email = self.normalize_email(email)


        if SmsUser.objects.filter(username=username).exists():
            return None, "Username already exists"
        if email and SmsUser.objects.filter(email=email).exists():
            return None, "Email already exists"

    
        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            role=role,
            created_at=timezone.now(),
            **extra_fields
        )
        user.set_password(password)  
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, email=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(username, password, email=email, role="admin", **extra_fields)


class SmsUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('staff', 'Staff'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('parent', 'Parent'),
    ]

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)


    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = SmsUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.username} ({self.role})"
