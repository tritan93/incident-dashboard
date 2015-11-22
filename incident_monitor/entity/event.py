class Event(object):
	
	def __init__(self, name, date, lat, lng, country, route = None, locality = None, neighbor = None, admin_area_lvl_1 = None, address = None):
		self.name = name
		self.date = date
		self.lat = lat
		self.lng = lng
		self.country = country