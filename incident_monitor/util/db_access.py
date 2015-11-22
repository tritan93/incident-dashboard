import sqlite3

class DbAccess(object):

	def __init__(self, db_path):
		self.db_path = db_path

	def execute(self, cmd):
		try:
			connection = sqlite3.connect(self.db_path)
			db = connection.cursor()
			db.execute(cmd)
			return db.fetchall()
		except Exception as e:
			print 'Error executing command.', cmd, str(e)
			return ''