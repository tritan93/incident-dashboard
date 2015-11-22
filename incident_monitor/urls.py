from django.conf.urls import patterns, url

from incident_monitor import views

urlpatterns = patterns('',
    url(r'^$', views.index),
    url(r'^event/', views.handle_ajax),
    url(r'^asset/', views.handle_ajax),
)