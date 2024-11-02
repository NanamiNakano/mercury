import sqlite3
import uuid
import argon2
import random
import string
import argparse


def generate_random_string(length=16):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for _ in range(length))


class DatabaseUtils:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)

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

    def new_user(self, user_name, email, password=generate_random_string()):
        hashed_password = self.ph.hash(password)
        user_id = uuid.uuid4().hex
        self.cursor.execute("INSERT INTO users (user_id, user_name, email, hashed_password) VALUES (?, ?, ?, ?)",
                            (user_id, user_name, email, hashed_password))
        self.conn.commit()
        return password

    def delete_user(self, user_id):
        self.cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        self.conn.commit()

    def close(self):
        self.conn.close()


def main():
    main_parser = argparse.ArgumentParser(description="Manage users")
    main_parser.add_argument("--sqlite_path", type=str, required=True, help="Path to the user SQLite database")
    user_commands_parser = main_parser.add_subparsers(dest="command", required=True)

    new_user_parser = user_commands_parser.add_parser("new", help="Create a new user")
    new_user_parser.add_argument("--user_name", type=str, required=True, help="Username of the new user")
    new_user_parser.add_argument("--email", type=str, required=True, help="Email of the new user")
    new_user_parser.add_argument("--password", type=str, help="Password of the new user")

    delete_user_parser = user_commands_parser.add_parser("delete", help="Delete a user")
    delete_user_parser.add_argument("--user_id", type=str, required=True, help="User ID to delete")

    reset_password_parser = user_commands_parser.add_parser("reset_password", help="Reset a user's password")
    reset_password_parser.add_argument("--user_id", type=str, required=True, help="User ID to reset the password")
    reset_password_parser.add_argument("--new_password", type=str, help="New password for the user")

    change_email_parser = user_commands_parser.add_parser("change_email", help="Change a user's email")
    change_email_parser.add_argument("--user_id", type=str, required=True, help="User ID to change the email")
    change_email_parser.add_argument("--new_email", type=str, required=True, help="New email for the user")

    change_username_parser = user_commands_parser.add_parser("change_username", help="Change a user's username")
    change_username_parser.add_argument("--user_id", type=str, required=True, help="User ID to change the username")
    change_username_parser.add_argument("--new_username", type=str, required=True, help="New username for the user")

    get_user_parser = user_commands_parser.add_parser("get", help="Get a user")
    get_user_parser.add_argument("--user_id", type=str, help="User ID to get")
    get_user_parser.add_argument("--email", type=str, help="Email to get")

    args = main_parser.parse_args()

    db_utils = DatabaseUtils(args.sqlite_path)

    match args.command:
        case "new":
            if args.password:
                password = db_utils.new_user(args.user_name, args.email, args.password)
            else:
                password = db_utils.new_user(args.user_name, args.email)
            print(f"New user created with password: {password}")
        case "delete":
            db_utils.delete_user(args.user_id)
            print("User deleted")
        case "reset_password":
            if args.new_password:
                new_password = db_utils.reset_user_password(args.user_id, args.new_password)
            else:
                new_password = db_utils.reset_user_password(args.user_id)
            print(f"Password reset to: {new_password}")
        case "change_email":
            db_utils.change_user_email(args.user_id, args.new_email)
            print("Email changed")
        case "change_username":
            db_utils.change_user_name(args.user_id, args.new_username)
            print("Username changed")
        case "get":
            if args.user_id:
                user = db_utils.get_user_by_id(args.user_id)
            elif args.email:
                user = db_utils.get_user_by_email(args.email)
            else:
                user = None

            if user:
                print(f"User ID: {user[0]}")
                print(f"Username: {user[1]}")
                print(f"Email: {user[2]}")
            else:
                print("User not found")
        case _:
            print("Invalid command")

    db_utils.close()


if __name__ == "__main__":
    main()
