from incident_monitor.entity.event import Event
from incident_monitor.util.db_access import DbAccess
from datetime import datetime

class EventManager(object):

	def __init__(self, db_path):
		self.db_access = DbAccess(db_path)

	def get_all_events(self):
		cmd = 'select * from incident_views;'
		output = self.db_access.execute(cmd)
		if output:
			pass
		else:
			return self.get_all_events_tmp()

	def get_all_events_tmp(self):
		events = []
		events.append(Event('Haze', str(datetime.now()), 1.0456264, 104.0304535, 'Indonesia'))
		events.append(Event('Fire', str(datetime.now()), 1.406624, 103.740463, 'Singapore'))
		events.append(Event('Flood', str(datetime.now()), 1.313266, 103.824234, 'Singapore'))
		return events

	def get_events_by_country(self, country):
		cmd = 'select * from incident_views where country =%s;'%(country)
		output = self.db_access.execute(cmd)
		if output:
			pass
		else:
			return self.get_all_events_tmp()