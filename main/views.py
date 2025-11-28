from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.core.mail import send_mail, BadHeaderError
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import json

def home(request):
    return render(request, 'main/home.html')

@require_http_methods(["POST"])
@csrf_exempt  # Only for development. In production, handle CSRF properly with cookies

def contact_submit(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            message = data.get('message', '').strip()
            
            # Basic validation
            if not all([name, email, message]):
                return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)
            
            # Email subject and message
            subject = f'New contact form submission from {name}'
            email_message = f'''
            Name: {name}
            Email: {email}
            
            Message:
            {message}
            '''
            
            # Send email
            send_mail(
                subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.DEFAULT_FROM_EMAIL],  # Send to yourself
                fail_silently=False,
            )
            
            return JsonResponse({'success': True, 'message': 'Message sent successfully!'})
            
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
        except BadHeaderError:
            return JsonResponse({'success': False, 'message': 'Invalid header found.'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error sending message: {str(e)}'}, status=500)
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
