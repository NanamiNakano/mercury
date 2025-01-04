import csv
import sqlite3
import uuid
import argon2
import random
import string
import argparse


def generate_random_string(length=16):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))


class UserUtils:
    def __init__(self, db_path, csv_path):
        self.csv_path = csv_path
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
        self.conn.execute("""CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            user_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL)""")
        self.conn.commit()

    def reset_user_password(self, user_id, new_password=generate_random_string()):
        hashed_password = self.ph.hash(new_password)
        self.cursor.execute("UPDATE users SET hashed_password = ? WHERE user_id = ?", (hashed_password, user_id))
        self.conn.commit()
        return new_password

    def change_user_email(self, user_id, new_email):
        self.cursor.execute("UPDATE users SET email = ? WHERE user_id = ?", (new_email, user_id))
        self.conn.commit()

    def change_user_name(self, user_id, new_username):
        self.cursor.execute("UPDATE users SET user_name = ? WHERE user_id = ?", (new_username, user_id))
        self.conn.commit()

    def get_user_by_email(self, email):
        self.cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        return self.cursor.fetchone()

    def get_user_by_id(self, user_id):
        self.cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        return self.cursor.fetchone()

    def new_user(self, user_name, email, password):
        if password is None or password == "":
            password = generate_random_string()
        hashed_password = self.ph.hash(password)
        user_id = uuid.uuid4().hex
        self.cursor.execute("INSERT INTO users (user_id, user_name, email, hashed_password) VALUES (?, ?, ?, ?)",
                            (user_id, user_name, email, hashed_password))
        self.conn.commit()
        return password

    def delete_user(self, user_id):
        self.cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        self.conn.commit()


    def export(self):
        csv_fp = open(self.csv_path, "w", newline="")
        writer = csv.writer(csv_fp)
        writer.writerow(["user_id", "user_name", "email", "password", "delete"])
        rows = self.cursor.execute("SELECT * FROM users")
        for user_id, user_name, email, _ in rows:
            writer.writerow([user_id, user_name, email, "", 0]) # Passwords are hashed, so we don't export them
        csv_fp.close()

    def apply(self, destructive: bool):
        csv_fp = open(self.csv_path, newline="")
        reader = csv.DictReader(csv_fp)
        for row in reader:
            user_id = row["user_id"]
            password = row["password"]
            user_name = row["user_name"]
            email = row["email"]
            delete = row["delete"]
            if (user_id is None or self.get_user_by_id(user_id) is None) and delete != "1":
                new_password = self.new_user(user_name, email, password)
                print(f"Created new user {user_name} with email {email} and password {new_password}")
                break
            if delete == "1":
                if destructive:
                    self.delete_user(user_id)
                    print(f"Deleted user {user_id}")
                else:
                    print(f"To delete user {user_id}, use the --destructive or -d flag")
                continue
            if password is not None and password != "":
                self.reset_user_password(user_id, password)
            if user_name is not None and user_name != "":
                self.change_user_name(user_id, user_name)
            if email is not None and email != "":
                self.change_user_email(user_id, email)
        csv_fp.close()

    def close(self):
        self.conn.close()


def main():
    main_parser = argparse.ArgumentParser(description="Manage users")
    main_parser.add_argument("--sqlite_path", type=str, help="Path to the user SQLite database", default="./users.sqlite")
    main_parser.add_argument("--csv", type=str, help="Path to the CSV file", default="./users.csv")
    user_commands_parser = main_parser.add_subparsers(dest="command", required=True)

    user_commands_parser.add_parser("export", help="Export users to a CSV file")
    apply_parser = user_commands_parser.add_parser("apply", help="Import users from a CSV file")
    apply_parser.add_argument("-d", "--destructive", action="store_true", help="")

    args = main_parser.parse_args()

    db_utils = UserUtils(args.sqlite_path, args.csv)

    match args.command:
        case "export":
            db_utils.export()
        case "apply":
            db_utils.apply(args.destructive)
        case _:
            print("Invalid command")

    db_utils.close()


if __name__ == "__main__":
    main()
