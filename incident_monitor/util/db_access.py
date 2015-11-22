import sqlite3

class DbAccess(object):

	def __init__(self, db_path):
		self.db_path = db_path

	def execute(self, cmd):
		print cmd
		try:
			connection = sqlite3.connect(self.db_path)
			connection.row_factory = self.dict_factory
			db = connection.cursor()
			db.execute(cmd)
			return db.fetchall()
		except Exception as e:
			print 'Error executing command.', cmd, str(e)
			return ''

	def dict_factory(self, cursor, row):
		d = {}
		for idx, col in enumerate(cursor.description):
			d[col[0]] = row[idx]
		return d