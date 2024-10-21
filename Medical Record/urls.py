from django.contrib import admin
from django.urls import path , include
from . import views
from .views import CustomPasswordResetView, CustomPasswordResetConfirmView
from django.views.generic import TemplateView
from django.urls import re_path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.default, name='default'),
    path('home', views.home, name='home'),
    path('sign_up', views.sign_up, name='sign_up'),
    path('logout_user', views.logout_user, name='logout_user'),
    path('login_user', views.login_user, name='login_user'),
    path('change_password', views.change_password, name='change_password'),
    path('password_reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', TemplateView.as_view(template_name='registration/password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', TemplateView.as_view(template_name='registration/password_reset_complete.html'), name='password_reset_complete'),
    path('upload/', views.upload_file, name='upload_file'),
    path('<int:user_id>/<int:year>/', views.year_view, name='year_view'),
    path('<int:user_id>/<int:year>/<int:month>/', views.month_view, name='month_view'),
    path('<int:user_id>/<int:year>/<int:month>/<int:day>/', views.day_view, name='day_view'),
    path('file/<int:user_id>/<int:year>/<int:month>/<int:day>/<str:filename>/', views.file_view, name='file_view'),
    path('search_suggestions/', views.search_suggestions, name='search_suggestions'),
    path('search_results/', views.search_results, name='search_results'),
    path('delete_file/<int:file_id>/', views.delete_file, name='delete_file'),  
    path('file/<int:file_id>/', views.file_detail, name='file_detail'),
    path('folder/<path:folder_path>/', views.folder_navigation, name='folder_navigation'),
    path('', include('django.contrib.auth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
