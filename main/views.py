import json
import logging

from django.core.mail import send_mail, BadHeaderError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_http_methods

logger = logging.getLogger(__name__)


def home(request):
    return render(request, 'main/home.html')


@require_http_methods(["POST"])
def contact_submit(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    if not all([name, email, message]):
        return JsonResponse({'success': False, 'message': 'All fields are required.'}, status=400)

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({'success': False, 'message': 'Please provide a valid email address.'}, status=400)

    subject = f'New contact form submission from {name}'
    email_message = f'''
    Name: {name}
    Email: {email}

    Message:
    {message}
    '''

    try:
        send_mail(
            subject,
            email_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.DEFAULT_FROM_EMAIL],
            fail_silently=False,
        )
    except BadHeaderError:
        return JsonResponse({'success': False, 'message': 'Invalid header found.'}, status=400)
    except Exception:
        logger.exception('Failed to send contact form email')
        return JsonResponse({'success': False, 'message': 'Could not send message. Please try again later.'}, status=500)

    return JsonResponse({'success': True, 'message': 'Message sent successfully!'})
