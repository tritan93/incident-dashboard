import sys
import os
import json

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render

from incident_monitor.util.controller_singleton import ControllerSingleton

def get_controller(request):
	requesterAddr = request.META['REMOTE_ADDR']
	print >>sys.stderr, str(os.getpid())+' - Request: '+request.META['REMOTE_ADDR']
	return ControllerSingleton().get_controller(requesterAddr)

def index(request):
    return render(request, 'index.html', {})

def handle_post_request(request):
    if request.method == 'POST':
        response_data = get_controller(request).retrieve_data(request)
        return HttpResponse(json.dumps(response_data), content_type='application/json')
    else:
        return HttpResponseRedirect('/index/')

def get_events_assets(request):
    if request.method == 'POST':
        response_data = get_controller(request).get_events_assets(request)
        return HttpResponse(json.dumps(response_data), content_type='application/json')
    else:
        return HttpResponseRedirect('/index/')