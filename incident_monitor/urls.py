from django.conf.urls import patterns, url

from incident_monitor import views

urlpatterns = patterns('',
    url(r'^$', views.index),
    url(r'^event/', views.handle_post_request),
    url(r'^asset/', views.handle_post_request),
    url(r'^get-events-assets/', views.get_events_assets)
)