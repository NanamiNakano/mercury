import argparse
import sqlite3


class Migrator:
    def __init__(self, db_path):
        conn = sqlite3.connect(db_path)
        self.conn = conn
        version = self.conn.execute("SELECT count(*) FROM config WHERE key = 'version'").fetchone()
        if version[0] != 0:
            print("Can not migrate database with existing version")
            exit(0)

    def migrate(self):
        self.conn.execute("ALTER TABLE config RENAME TO config_old")
        self.conn.execute("CREATE TABLE config(key TEXT PRIMARY KEY UNIQUE , value TEXT)")
        self.conn.execute("INSERT INTO config SELECT key, value FROM config_old")
        self.conn.execute("INSERT INTO config VALUES ('version', '0.1.0')")
        self.conn.commit()
        print("Migration completed")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate the database to 0.1.0")
    parser.add_argument("--db_path", help="Path to the database", default="../mercury.sqlite")
    args = parser.parse_args()
    migrator = Migrator(args.db_path)
    migrator.migrate()
