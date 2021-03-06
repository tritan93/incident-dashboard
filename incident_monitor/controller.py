import json
from incident_monitor.manager.asset_manager import AssetManager
from incident_monitor.manager.event_manager import EventManager
from incident_monitor.util.util import distance as get_distance
from incident_monitor.settings import DB_LOCATION, REGIONS

class Controller(object):

    def __init__(self):
        self.asset_mgr = AssetManager(DB_LOCATION)
        self.event_mgr = EventManager(DB_LOCATION)

    def get_events_assets(self, request):
        date_filter = request.POST.get('dateFilter')
        region_filter = request.POST.get('regionFilter')
        type_filter = request.POST.get('type')
        print date_filter, region_filter, type_filter
        if type_filter.lower() == 'events':
            if date_filter and region_filter:
                events = []
                for event in self.event_mgr.get_events_by_date_region(date_filter, region_filter):
                    events.append({'event': event.__dict__})
                print events
                return {'assets':[], 'events': events, 'response': 'success'}
        elif type_filter.lower() =='assets':
            if region_filter:
                assets = []
                for asset in self.asset_mgr.get_assets_by_region(region_filter):
                    assets.append({'asset': asset.__dict__})
                print assets
                return {'assets':assets, 'events': [], 'response': 'success'}
        return {'assets':[], 'events': [], 'response': 'failed'}

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
        events = []
        country = request.POST.get('country')
        lat = request.POST.get('lat')
        lng = request.POST.get('lng')
        date = request.POST.get('date')
        distance_filter = request.POST.get('distance')
        if country and lat and lng and distance_filter:
            region = [key for key, value in REGIONS.iteritems() if country in value]
            if region:
                for asset in self.asset_mgr.get_assets_by_region(region[0]):
                    distance = get_distance(float(lat), float(lng), asset.lat, asset.lng)
                    if distance <= float(distance_filter):
                        assets.append({'asset': asset.__dict__,
                                      'distance': distance})
                for event in self.event_mgr.get_events_by_date_region(date, region[0]):
                    distance = get_distance(float(lat), float(lng), event.lat, event.lng)
                    if distance <= float(distance_filter):
                        events.append({'event': event.__dict__,
                                      'distance': distance})
        if assets:
            assets.sort(key=lambda x:x.get('distance'))
        return {'assets':assets, 'events': events, 'response': 'success'}

    def retrieve_events_by_asset(self, request):
        print 'retrieve_assets_by_event'
        assets = [] 
        events = []
        country = request.POST.get('country')
        lat = request.POST.get('lat')
        lng = request.POST.get('lng')
        date = request.POST.get('date')
        distance_filter = request.POST.get('distance')
        if country and lat and lng and distance_filter:
            region = [key for key, value in REGIONS.iteritems() if country in value]
            if region:
                for asset in self.asset_mgr.get_assets_by_region(region[0]):
                    distance = get_distance(float(lat), float(lng), asset.lat, asset.lng)
                    if distance <= float(distance_filter):
                        assets.append({'asset': asset.__dict__,
                                      'distance': distance})
                for event in self.event_mgr.get_events_by_date_region(date, region[0]):
                    distance = get_distance(float(lat), float(lng), event.lat, event.lng)
                    if distance <= float(distance_filter):
                        events.append({'event': event.__dict__,
                                      'distance': distance})
        if events:
            events.sort(key=lambda x:x.get('distance'))
        return {'assets':assets, 'events': events, 'response': 'success'}