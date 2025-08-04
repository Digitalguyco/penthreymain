# Gunicorn configuration file for Penthrey production deployment

import multiprocessing
import os

# Server socket
bind = "127.0.0.1:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "/var/log/penthrey/gunicorn_access.log"
errorlog = "/var/log/penthrey/gunicorn_error.log"
loglevel = "info"

# Process naming
proc_name = "penthrey_gunicorn"

# Server mechanics
daemon = False
pidfile = "/var/run/penthrey/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL (if you want to handle SSL at Gunicorn level - usually handled by Nginx)
# keyfile = None
# certfile = None

# Application
# This should point to your WSGI application
# Format: module_name:variable_name
wsgi_module = "penthrey_api.wsgi:application"

# Environment variables
raw_env = [
    "DJANGO_SETTINGS_MODULE=penthrey_api.settings_production",
]

# Preload application for better performance
preload_app = True

# Graceful timeout for worker restart
graceful_timeout = 30
