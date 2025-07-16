# backend/core/views.py
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Portal Mazzarino Connect</h1><p>O motor está funcionando!</p>")