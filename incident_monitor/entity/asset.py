class Asset(object):

    def __init__(self, name, lat, lng, country, site_type, region, address, email):
        self.name = name
        self.lat = lat
        self.lng = lng
        self.country = country
        self.site_type = site_type
        self.region = region
        self.address = address
        self.email = email