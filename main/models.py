from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone  # Import timezone
def user_directory_path(instance, filename):
    return f'user_{instance.user.id}/{instance.year}/{instance.month}/{instance.day}/{filename}'

class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to=user_directory_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    year = models.IntegerField(null=True, blank=True)
    month = models.IntegerField(null=True, blank=True)
    day = models.IntegerField(null=True, blank=True)
    date_specified = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.uploaded_at:
            self.uploaded_at = timezone.now()
        if not self.year:
            self.year = self.uploaded_at.year
        if not self.month:
            self.month = self.uploaded_at.month
        if not self.day:
            self.day = self.uploaded_at.day
        if not self.date_specified:
            self.date_specified = self.uploaded_at.date()
        super().save(*args, **kwargs)

    @property
    def filename(self):
        return self.file.name.split('/')[-1]

    @property
    def file_type(self):
        return self.filename.split('.')[-1] if '.' in self.filename else 'Unknown'

    @property
    def formatted_date(self):
        return self.uploaded_at.strftime('%Y-%m-%d')