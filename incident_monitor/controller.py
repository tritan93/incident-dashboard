import json
from incident_monitor.manager.asset_manager import AssetManager
from incident_monitor.manager.event_manager import EventManager
from incident_monitor.util.util import distance as get_distance

class Controller(object):

    def __init__(self):
        self.asset_mgr = AssetManager('')
        self.event_mgr = EventManager('')

    def init_index(self):
        args = {'assets': self.asset_mgr.get_all_assets(),
                'events': self.event_mgr.get_all_events()}
        return args

    def retrieve_data(self, request):
        data_type = request.POST.get('type')
        if data_type == 'event':
            return self.retrieve_assets_by_event(request)
        elif data_type == 'asset':
            return self.retrieve_events_by_asset(request)
        return {}

    def retrieve_assets_by_event(self, request):
        print 'retrieve_assets_by_event'
        assets = []
        country = request.POST.get('country')
        lat = request.POST.get('lat')
        lng = request.POST.get('lng')
        distance_filter = request.POST.get('distance')
        if country and lat and lng and distance_filter:
            for asset in self.asset_mgr.get_assets_by_country(country):
                distance = get_distance(float(lat), float(lng), asset.lat, asset.lng)
                if distance <= float(distance_filter):
                    assets.append({'asset': asset.__dict__,
                                  'distance': distance})
        return {'assets':assets, 'events': [], 'response': 'success'}

    def retrieve_events_by_asset(self, request):
        print 'retrieve_assets_by_event'
        events = []
        country = request.POST.get('country')
        lat = request.POST.get('lat')
        lng = request.POST.get('lng')
        distance_filter = request.POST.get('distance')
        if country and lat and lng and distance_filter:
            for event in self.event_mgr.get_events_by_country(country):
                distance = get_distance(float(lat), float(lng), event.lat, event.lng)
                if distance <= float(distance_filter):
                    events.append({'event': event.__dict__,
                                  'distance': distance})
        return {'events':events, 'assets': [], 'response': 'success'}
