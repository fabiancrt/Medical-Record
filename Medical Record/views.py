from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate, update_session_auth_hash
from django.contrib import messages
from django.utils.html import format_html
from django.urls import reverse_lazy
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm, LoginForm, CustomPasswordChangeForm, CustomPasswordResetForm, CustomSetPasswordForm, UploadFileForm
from main.models import UploadedFile
from datetime import date
import calendar
from calendar import month_name
from django.shortcuts import render, get_object_or_404
import logging
from urllib.parse import unquote
import urllib.parse
import os
from main.templatetags.custom_filters import endswith
import json
from django.http import JsonResponse
import mimetypes
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import csrf_exempt


def folder_navigation(request, folder_path=None):
    if folder_path:
        files = UploadedFile.objects.filter(folder_path=folder_path)
    else:
        files = UploadedFile.objects.filter(folder_path='')

    context = {
        'files': files,
        'folder_path': folder_path,
    }
    return render(request, 'main/search_results.html', context)

@login_required(login_url='/login_user')
def file_detail(request, file_id):
    file = get_object_or_404(UploadedFile, id=file_id)
    return render(request, 'main/file_detail.html', {'file': file})

@login_required(login_url='/login_user')
def delete_file(request, file_id):
    file = get_object_or_404(UploadedFile, id=file_id, user=request.user)
    file.delete()
    messages.success(request, 'File deleted successfully')
    return redirect('home')  

@login_required(login_url='/login_user')
def search_suggestions(request):
    query = request.GET.get('q', '')
    if query:
        files = UploadedFile.objects.filter(user=request.user, file__icontains=query)
        suggestions = [os.path.basename(file.file.name) for file in files]
    else:
        suggestions = []
    
    return JsonResponse({'suggestions': suggestions})

@login_required(login_url='/login_user')
def search_results(request):
    query = request.GET.get('q', '')
    if query:
        files = UploadedFile.objects.filter(user=request.user, file__icontains=query)
    else:
        files = []
    
    files_with_info = []
    for file in files:
        try:
            file_name = os.path.basename(file.file.name)
            guess_type_result = mimetypes.guess_type(file.file.name)
            file_type = guess_type_result[0]
            
            
            logger.debug(f"File name: {file_name}")
            logger.debug(f"Guess type result: {guess_type_result}")
            logger.debug(f"Guessed file type: {file_type}")
            
            files_with_info.append({
                'filename': file_name,
                'year': file.year,
                'month': file.month,
                'day': file.day,
                'url': file.file.url,
                'uploaded_at': file.uploaded_at,
                'formatted_date': file.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
                'date_specified': f"{file.year}-{file.month:02d}-{file.day:02d}",
                'file_type': file_type if file_type else 'Unknown',  
                'user_id': file.user_id,  
                'username': file.user.username,  
                'id': file.id,  
            })
        except Exception as e:
            logger.error(f"Error processing file {file.file.name}: {e}")
    
    return render(request, 'main/search_results.html', {'files': files_with_info, 'query': query})



logger = logging.getLogger(__name__)

@login_required(login_url='/login_user')
def file_view(request, user_id, year, month, day, filename):
    filename = unquote(filename)
    file = get_object_or_404(UploadedFile, user__id=user_id, year=year, month=month, day=day, file__endswith=filename)
    friendly_name = f"{file.user.username} uploaded: {os.path.basename(file.file.name)}"
    return render(request, 'main/file.html', {'file': file, 'friendly_name': friendly_name})

@login_required(login_url='/login_user')
def home(request):
    years = UploadedFile.objects.filter(user=request.user).values('year').distinct().order_by('-year')
    return render(request, 'main/home.html', {'years': years})


@login_required(login_url='/login_user')
def year_view(request, user_id, year):
    months = UploadedFile.objects.filter(user__id=user_id, year=year).values('month').distinct().order_by('-month')
    return render(request, 'main/year.html', {'year': year, 'months': months})


@login_required(login_url='/login_user')
def month_view(request, user_id, year, month):
    days = UploadedFile.objects.filter(user__id=user_id, year=year, month=month).values('day').distinct().order_by('-day')
    month_name_str = month_name[month]
    return render(request, 'main/month.html', {'year': year, 'month': month, 'month_name': month_name_str, 'days': days})



@login_required(login_url='/login_user')
def day_view(request, user_id, year, month, day):
    files = UploadedFile.objects.filter(user__id=user_id, year=year, month=month, day=day).order_by('-uploaded_at')
    month_name_str = calendar.month_name[int(month)]
    
    files_with_info = []
    for file in files:
        basename = os.path.basename(file.file.name)
        if basename.endswith('.jpg') or basename.endswith('.jpeg') or basename.endswith('.png'):
            file_type = 'image'
        elif basename.endswith('.pdf'):
            file_type = 'pdf'
        else:
            file_type = 'other'
        
        files_with_info.append({
            'basename': basename,
            'fullpath': file.file.url,  
            'friendly_name': f"{file.user.username} uploaded: {basename}",
            'date_specified': file.date_specified.strftime('%Y-%m-%d') if file.date_specified else "N/A",  
            'username': file.user.username,
            'formatted_date': file.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'file_type': file_type,
            'id': file.id
        })
    
    return render(request, 'main/day.html', {
        'user_id': user_id,
        'year': year,
        'month': int(month),
        'month_name': month_name_str,
        'day': day,
        'files': files_with_info
    })


@login_required(login_url='/login_user')
@csrf_exempt  
def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            year = form.cleaned_data['year']
            month = form.cleaned_data['month']
            day = form.cleaned_data['day']
            selected_date = date(year, month, day)
            current_date = date.today()

            if selected_date > current_date:
                return JsonResponse({'success': False, 'message': 'The selected date cannot be greater than the current date.'}, status=400)
            else:
                uploaded_file = form.save(commit=False)
                uploaded_file.user = request.user
                uploaded_file.save()
                messages.success(request, 'File uploaded successfully.')
                return JsonResponse({'success': True, 'message': 'File uploaded successfully.'})
        else:
            errors = []
            for field, error_list in form.errors.items():
                for error in error_list:
                    errors.append(f"{field}: {error}")
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    else:
        form = UploadFileForm()
        return render(request, 'main/upload.html', {'form': form})  

def default(request):
    if request.user.is_authenticated:
        return redirect('home')
    return render(request, 'main/default.html')

def login_user(request):
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            
            user = form.get_user()
            login(request, user)
            username = user.username
            success_message = format_html("Successfully logged in as <strong>{}</strong>!", username)
            messages.success(request, success_message)
            return redirect('home')
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = LoginForm()
    return render(request, 'registration/login.html', {"form": form})

def sign_up(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            username = user.username
            success_message = format_html("Successfully registered as <strong>{}</strong>!", username)
            messages.success(request, success_message)
            return redirect('home')
        else:
            
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{error}")
    else:
        form = RegisterForm()
    
    return render(request, 'registration/sign_up.html', {"form": form})
 
def logout_user(request):
    logout(request)
    messages.success(request, "You were logged out.")
    return redirect('home')

def change_password(request):
    if request.method == 'POST':
        form = CustomPasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  
            messages.success(request, 'Your password was successfully updated!')
            return redirect('home')
        else:
            messages.error(request, 'Please correct the error below.')
    else:
        form = CustomPasswordChangeForm(request.user)
    return render(request, 'registration/change_password.html', {
        'form': form
    })

class CustomPasswordResetView(PasswordResetView):
    email_template_name = 'registration/password_reset_email.html'
    template_name = 'registration/password_reset_form.html'
    form_class = CustomPasswordResetForm
    success_url = reverse_lazy('password_reset_done')

class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'registration/password_reset_confirm.html'
    form_class = CustomSetPasswordForm
    success_url = reverse_lazy('password_reset_complete')

    def form_valid(self, form):
        user = form.save()
        messages.success(self.request, _('Your password has been set. You may go ahead and log in now.'))
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, _('Please correct the error below.'))
        return super().form_invalid(form)

    def post(self, request, *args, **kwargs):
        form = self.get_form()
        if form.is_valid():
            user = self.get_form_kwargs()['user']
            old_password = user.password
            new_password = form.cleaned_data.get('new_password1')
            if user.check_password(new_password):
                messages.error(request, _('The new password cannot be the same as the old password.'))
                return self.form_invalid(form)
            return self.form_valid(form)
        else:
            return self.form_invalid(form)