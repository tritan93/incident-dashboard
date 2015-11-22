from incident_monitor.util.db_access import DbAccess
from incident_monitor.entity.asset import Asset

class AssetManager(object):
	
	def __init__(self, db_path):
		self.db_access = DbAccess(db_path)

	def get_all_assets(self):
		cmd = 'select * from BANK_ASSET_VIEW;'
		output = self.db_access.execute(cmd)
		return self.get_assets_from_output(output)

	def get_assets_by_country(self, country):
		cmd = 'select * from BANK_ASSET_VIEW where COUNTRY="%s";'%(country.upper())
		output = self.db_access.execute(cmd)
		return self.get_assets_from_output(output)

	def get_assets_from_output(self, output):
		assets = []
		for row in output:
			assets.append(Asset(row.get('DISPLAY_NAME'),
								row.get('LATITUDE'),
								row.get('LONGITUDE'),
								row.get('COUNTRY'),
								row.get('SITE_TYPE'),
								row.get('REGION'),
								row.get('ADDRESS')))
		return assets