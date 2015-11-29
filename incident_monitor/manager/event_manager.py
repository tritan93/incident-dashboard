from incident_monitor.entity.event import Event
from incident_monitor.util.db_access import DbAccess
from datetime import datetime
from incident_monitor.settings import REGIONS

class EventManager(object):

	def __init__(self, db_path):
		self.db_access = DbAccess(db_path)

	def get_all_events(self):
		cmd = 'select * from incidents_view;'
		output = self.db_access.execute(cmd)
		return self.get_events_from_output(output)

	def get_events_by_country(self, country):
		cmd = 'select * from incidents_view where upper(country)="%s";'%(country.upper())
		output = self.db_access.execute(cmd)
		return self.get_events_from_output(output)

	def get_events_by_date_region(self, date, region):
		events = []
		for country in REGIONS.get(region):
			cmd = 'select * from incidents_view where upper(country)="%s" and event_date >= date("%s") AND event_date <  date("%s", "+1 day");'%(country.upper(), self.format_date(date), self.format_date(date))
			output = self.db_access.execute(cmd)
			events.extend(self.get_events_from_output(output))
		return events

	def format_date(self, date):
		try:
			return datetime.strptime(date, '%m/%d/%Y').strftime('%Y-%m-%d')
		except:
			return date

	def get_events_from_output(self, output):
		events = []
		for row in output:
			events.append(Event(row.get('EVENT_NAME'),
								row.get('EVENT_DATE'),
								row.get('LATITUDE'),
								row.get('LONGITUDE'),
								row.get('COUNTRY'),
								row.get('ROUTE_NAME'),
								row.get('LOCALITY'),
								row.get('NEIGHBOURHOOD'),
								row.get('ADMIN_AREA_LEVEL1'),
								row.get('FORMATTED_ADDRESS')))
		return events