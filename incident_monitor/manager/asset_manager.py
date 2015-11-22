from incident_monitor.util.db_access import DbAccess
from incident_monitor.entity.asset import Asset

class AssetManager(object):
	
	def __init__(self, db_path):
		self.db_access = DbAccess(db_path)

	def get_all_assets(self):
		cmd = 'select * from assets;'
		output = self.db_access.execute(cmd)
		if output:
			pass
		else:
			return self.get_all_assets_tmp()

	def get_all_assets_tmp(self):
		assets = []
		assets.append(Asset('NUS', 1.3049414, 103.7731876, 'Singapore'))
		assets.append(Asset('HBF', 1.2658069, 103.8189014, 'Singapore'))
		assets.append(Asset('OUE', 1.283049, 103.852760, 'Singapore'))
		assets.append(Asset('One Raffles Place', 1.2844948, 103.8511573, 'Singapore'))
		return assets

	def get_assets_by_country(self, country):
		cmd = 'select * from assets where country =%s;'%(country)
		output = self.db_access.execute(cmd)
		if output:
			pass
		else:
			return self.get_all_assets_tmp()
