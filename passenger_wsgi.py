import os
import sys

# Set the path to your project directory
INTERP = os.path.expanduser("/home/vin2lawz/venv/bin/python3.10")
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Add your project directory to the Python path
path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.append(path)

# Set the Django settings module
exec(open(os.path.join(path, 'core', 'settings.py')).read())

# Import the Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
