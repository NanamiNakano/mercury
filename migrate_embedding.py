import sqlite3
import sqlite_vec
import argparse


class Migrator:
    def __init__(self, db_path):

        self.conn = sqlite3.connect(db_path)
        self.conn.enable_load_extension(True)
        sqlite_vec.load(self.conn)
        self.conn.enable_load_extension(False)
        table = self.conn.execute(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='chunks' OR name='embeddings'").fetchone()
        if table is None or table[0] != 2:
            print("No table found")
            exit(0)

    def migrate(self):
        cursor = self.conn.cursor()
        dimension = cursor.execute("SELECT value FROM config WHERE key = 'embedding_dimension'").fetchone()[0]
        if dimension is None:
            print("No embedding dimension found")
            return
        cursor.execute(
            f"CREATE VIRTUAL TABLE IF NOT EXISTS chunks_new USING vec0(chunk_id INTEGER PRIMARY KEY, text TEXT, text_type TEXT, sample_id INTEGER, char_offset INTEGER, chunk_offset INTEGER, embedding float[{dimension}])")

        old_embeddings = cursor.execute("SELECT * FROM embeddings").fetchall()
        for rowid, old_embedding in old_embeddings:
            metadata = cursor.execute(
                "SELECT chunk_id, text, text_type, sample_id, char_offset, chunk_offset FROM chunks WHERE rowid = ?",
                (rowid,)).fetchone()
            cursor.execute(
                "INSERT INTO chunks_new (chunk_id, text, text_type, sample_id, char_offset, chunk_offset, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (*metadata, old_embedding))

        # cursor.execute("DROP TABLE IF EXISTS embeddings")
        # cursor.execute("DROP TABLE IF EXISTS chunks")
        # cursor.execute("ALTER TABLE chunks_new RENAME TO chunks")
        # https://github.com/asg017/sqlite-vec/issues/154 & 155
        self.conn.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate the database to the new schema")
    parser.add_argument("--db_path", help="Path to the database", default="./mercury.sqlite")
    args = parser.parse_args()
    migrator = Migrator(args.db_path)
    migrator.migrate()
