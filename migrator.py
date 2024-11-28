import argparse
import sqlite3
import argon2
import random
import string
import csv
import os

class Migrator:
    def __init__(self, workdir=None, keep_users=False):
        self.workdir = workdir
        self.keep_users = keep_users # whether to keep the `users` table in the SQLite files
    
    def load_users_from_sqlite(self, dbfile):
        """
        Return is a list of 4-tuples, 
        ('3843397537424bf2ab4ca550533dd39e', 'John Doe', 'john@example.com', '123456')
        """

        print (f"Loading users from {dbfile}")
        conn = sqlite3.connect(dbfile)
        cursor = conn.cursor()
        try: 
            cursor.execute("SELECT * FROM users")
        except sqlite3.OperationalError:
            print (f"Table `users` does not exist in {dbfile}")
            conn.close()
            return []
        
        users = cursor.fetchall()

        if not self.keep_users:
            # Drop the `users` table 
            cursor.execute("DROP TABLE users")

        conn.commit()
        conn.close()

        return users
    
    def load_users_from_dir(self):
        """Iterate throught all SQLite files in workdir and load users, and combine into one list"""
        users = []
        print (os.listdir(self.workdir))
        for file in os.listdir(self.workdir):
            if file.endswith(".sqlite"):
                sqlite_file = os.path.join(self.workdir, file)
                users_local = self.load_users_from_sqlite(sqlite_file)
                print (f"Loaded {len(users_local)} users from {sqlite_file}")
                users.extend(users_local)
        self.users = users
    
    def unify_userid_by_username(self, exclude_new_users=True):
        """Group user_id by user_name. For each group find one use_id to be the representative. 
        Return a dictionary that maps each user_id in the group to the representative user_id        
        
        """

        users = self.users

        if exclude_new_users:
            users = [user for user in users if user[1] != "New User"]

        user_id_by_name = {}
        id_to_name = {user_id: user_name for user_id, user_name in users}
        print (id_to_name)

        for user_id, user_name in users:
            if user_name in user_id_by_name:
                user_id_by_name[user_name].append(user_id)
            else:
                user_id_by_name[user_name] = [user_id]

        print (user_id_by_name)
        user_name_to_unified_id = {user_name: random.choice(user_ids) for user_name, user_ids in user_id_by_name.items()}
        unified_id_to_user_name = {user_id: user_name for user_name, user_id in user_name_to_unified_id.items()}
        raw_id_to_unified_id = {user_id: user_name_to_unified_id[user_name] for user_id, user_name in id_to_name.items()}

        print (raw_id_to_unified_id)
        self.raw_id_to_unified_id = raw_id_to_unified_id
        self.unified_id_to_user_name = unified_id_to_user_name

    def update_user_id_in_sqlite(self, dbfile):
        """Update user_id in the tables `users`  and `annotations` in SQLite file

        In `users`, this field is `user_id`
        In `annotations`, this field is `annotator`        
        
        """

        print (f"Updating user_id in {dbfile}")

        conn = sqlite3.connect(dbfile)
        cursor = conn.cursor()

        # Update column `user_id` in table `users`
        # No need, actually. Comment out. 
        # cursor.execute("SELECT user_id, user_name FROM users")
        # users = cursor.fetchall()
        # for user_id, user_name in users:
        #     unified_id = self.raw_id_to_unified_id.get(user_id)
        #     user_name_previously = self.unified_id_to_user_name.get(unified_id)

        #     # check whether the user_name is the same as before
        #     if user_name_previously != user_name:
        #         print (f"User name mismatch: {user_name_previously} != {user_name}")
        #         continue
        #     else: 
        #         cursor.execute("UPDATE users SET user_id = ? WHERE user_id = ?", (unified_id, user_id))
            

        # Update column `annotator` in table `annotations`
        cursor.execute("SELECT annotator FROM annotations")
        annotators = cursor.fetchall()
        for annotator in annotators:
            annotator = annotator[0]
            unified_id = self.raw_id_to_unified_id.get(annotator)
            cursor.execute("UPDATE annotations SET annotator = ? WHERE annotator = ?", (unified_id, annotator))

        conn.commit()
        conn.close()

    def update_user_id_in_dir(self):
        """Iterate throught all SQLite files in workdir and update user_id"""

        for file in os.listdir(self.workdir):
            if file.endswith(".sqlite"):
                sqlite_file = os.path.join(self.workdir, file)
                try: 
                    self.update_user_id_in_sqlite(sqlite_file)
                except sqlite3.OperationalError:
                    print (f"Table `annotations` does not exist in {sqlite_file}")

    def dump_unified_user_info_to_csv(self, unified_user_csv: str): 
        """Write unified user information to csv

        insert two empty columns `email` and `password` to the csv file
        
        """
            
        print (f"Writing unified user information to csv {unified_user_csv}")

        csv_fp = open(unified_user_csv, "w", newline="")
        writer = csv.writer(csv_fp)
        writer.writerow(["user_id", "user_name", "email", "password"])
        for user_id, user_name in self.unified_id_to_user_name.items():
            password = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
            writer.writerow([user_id, user_name, "", password])
        csv_fp.close()

    def ingest_users_csv_to_sqlite(self, csvfile, dbfile):
        """Load user credentials from a CSV file and insert into SQLite

        The CSV file should have the following columns:
        - user_id (automatically extracted and unified)
        - user_name (original)
        - email (entered by admin)
        - password (entered by admin)

        """
        
        print (f"Importing data from {csvfile} to {dbfile}")

        conn = sqlite3.connect(dbfile)
        cursor = conn.cursor()

        cursor.execute("""
                CREATE TABLE users(
                    user_id TEXT PRIMARY KEY,
                    user_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    hashed_password TEXT NOT NULL
                )
            """)

        ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
        csv_fp = open(csvfile, newline="")
        reader = csv.DictReader(csv_fp)
        for row in reader:
            print (row["user_name"])
            password = row["password"]
            if password is None or password == "":
                print("Password is missing for user_id: %s", row["user_id"])
                print ("Migration failed.")
                exit(1)
            hashed_password = ph.hash(password)
            email = row["email"]
            if email is None or email == "":
                print("Email is missing for user_id: %s", row["user_id"])
                print ("Migration failed.")
                exit(1)
            cursor.execute("INSERT INTO users (user_id, user_name, email, hashed_password) VALUES (?, ?, ?, ?)",
                            (row["user_id"], row["user_name"], email, hashed_password))
        conn.commit()
        conn.close()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Migrate data from source to output")
    commands_parser = parser.add_subparsers(dest="command", required=True)

    export_parser = commands_parser.add_parser("export", help="Export, Unify, and remove user information in existing SQLite files")
    export_parser.add_argument("--workdir", type=str, required=True, help="Path to the directory containing SQLite files. The script will scan all .sqlite files in the directory.")
    export_parser.add_argument("--csv", type=str, required=True, help="Path to the CSV file that contains user_id, user_name, email (empty), password (empty) for editing")
    export_parser.add_argument("--keep-users", action="store_true", help="Keep the `users` table in the SQLite files")

    register_parser = commands_parser.add_parser("register", help="Create a user SQLite file from CSV file manually edited with email and password")
    register_parser.add_argument("--csv", type=str, required=True, help="Path to the CSV file that contains user_id, user_name, email, password")
    register_parser.add_argument("--db", type=str, required=True, help="Path to the output SQLite file that will be used for login")

    args = parser.parse_args()

    if args.command == "export":
        migrator = Migrator(args.workdir, args.keep_users)
        users = migrator.load_users_from_dir()
        migrator.unify_userid_by_username()
        migrator.update_user_id_in_dir()
        migrator.dump_unified_user_info_to_csv(args.csv)
    elif args.command == "register":
        migrator = Migrator()
        migrator.ingest_users_csv_to_sqlite(args.csv, args.db)