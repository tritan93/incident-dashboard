from incident_monitor.util.db_access import DbAccess
from incident_monitor.entity.asset import Asset
from incident_monitor.settings import EMAILS

class AssetManager(object):
	
	def __init__(self, db_path):
		self.db_access = DbAccess(db_path)

	def get_all_assets(self):
		cmd = 'select * from BANK_ASSET_VIEW;'
		output = self.db_access.execute(cmd)
		return self.get_assets_from_output(output)

	def get_assets_by_region(self, region):
		results = []
		cmd = 'select * from BANK_ASSET_VIEW where upper(REGION)="%s";'%(region.upper())
		output = self.db_access.execute(cmd)
		results.extend(self.get_assets_from_output(output))
		return results

	def get_assets_from_output(self, output):
		assets = []
		for row in output:
			assets.append(Asset(row.get('DISPLAY_NAME'),
								row.get('LATITUDE'),
								row.get('LONGITUDE'),
								row.get('COUNTRY'),
								row.get('SITE_TYPE'),
								row.get('REGION'),
								row.get('ADDRESS'),
								EMAILS.get(row.get('REGION'))))
		return assets