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
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
        self.conn.execute("""CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            user_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL)""")
        self.conn.commit()

    def update_user(self, look_up_method:str=None, look_up_value:str=None,  field_to_update:str=None, field_new_value:str=None):
        look_up_method_mappping = {
            "1": "user_id",
            "2": "email",
            "3": "user_name"
        }

        field_to_update_mapping = {
            "1": "email",
            "2": "password",
            "3": "user_name"
        }

        prompt_mapping = {
            "password": "Password of the user (leave empty for a random one): ",
            "email": "New email for the user: ",
            "user_name": "New display name for the user: "
        }

        # Find the user to update
        if look_up_method is None:
            look_up_method = input("How do you wanna look up the user? (Select the number below) \n 1. By user_id (hex) \n 2. By email \n 3. By user_name \n")
            look_up_method = look_up_method_mappping[look_up_method]

        if look_up_value is None:
            look_up_value = input(f"Please enter the {look_up_method} of the user whom you wanna update: ")

        sql_cmd = f"SELECT * FROM users WHERE {look_up_method} = '{look_up_value}'"

        self.cursor.execute(sql_cmd)
        user = self.cursor.fetchone()
        if user is None:
            print(f"User of {look_up_method} == {look_up_value} not found. Please try again.")
            exit()

        # Update the user
        if field_to_update is None:
            field_to_update = input("What field do you want to update? (Select the number below) \n 1. Email \n 2. Password \n 3. User Name \n")
            field_to_update = field_to_update_mapping[field_to_update]

        if field_new_value is None:
            field_new_value = input(prompt_mapping[field_to_update]).strip()

        plain_field_value = field_new_value
        if field_to_update == "password": # password
            if field_new_value == "":
                generated_password = generate_random_string(length=6)
                plain_field_value = field_new_value
                field_new_value = self.ph.hash(generated_password)
            print(field_new_value)
            sql_cmd = f"UPDATE users SET hashed_password = '{field_new_value}' WHERE {look_up_method} = '{look_up_value}'"
        else:
            if field_new_value == "":
                print("Field value cannot be empty.")
                return
            sql_cmd = f"UPDATE users SET {field_to_update} = '{field_new_value}' WHERE {look_up_method} = '{look_up_value}'"

        self.cursor.execute(sql_cmd).fetchone()
        self.conn.commit()

        print (f"Successfully updated `{field_to_update}` TO `{plain_field_value}` \n for user whose `{look_up_method}` IS `{look_up_value}` ")


    def list_users(self):
        # get schema of the table users
        self.cursor.execute("PRAGMA table_info(users)")
        rows = self.cursor.fetchall()

        headers  = [row[1] for row in rows][:-1]

        self.cursor.execute("SELECT * FROM users")
        rows = self.cursor.fetchall()

        # print the table in Markdown format
        print("user_id".ljust(32), "| user_name".ljust(17), "| email")
        print("-" * 32, "|", "-" * 15, "|", "-" * 20)
        for row in rows:
            print (row[0].ljust(32), "|", row[1].ljust(15), "|", row[2])
        # -1 to skip the hashed password

    # def reset_user_password(self, user_id, new_password=generate_random_string()):
    #     hashed_password = self.ph.hash(new_password)
    #     self.cursor.execute("UPDATE users SET hashed_password = ? WHERE user_id = ?", (hashed_password, user_id))
    #     self.conn.commit()
    #     return new_password

    # def change_user_email(self, user_id, new_email):
    #     self.cursor.execute("UPDATE users SET email = ? WHERE user_id = ?", (new_email, user_id))
    #     self.conn.commit()

    # def change_user_name(self, user_id, new_username):
    #     self.cursor.execute("UPDATE users SET user_name = ? WHERE user_id = ?", (new_username, user_id))
    #     self.conn.commit()

    # def get_user_by_email(self, email):
    #     self.cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    #     return self.cursor.fetchone()

    # def get_user_by_id(self, user_id):
    #     self.cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    #     return self.cursor.fetchone()

    def new_user(self, user_name:str=None, email:str=None, password:str=None):
        if email in [None, ""]:
            email = input("Email of the user (must be unique): ")

        if password in [None, ""]:
            password = input("Password of the user (leave empty and hit Enter for a random one): ")
            if password == "":
                password = generate_random_string(length=6)

        if user_name in [None, ""]:
            user_name = input("User name (for display only, not as credential) for the user: ")

        hashed_password = self.ph.hash(password)
        user_id = uuid.uuid4().hex
        self.cursor.execute("INSERT INTO users (user_id, user_name, email, hashed_password) VALUES (?, ?, ?, ?)",
                            (user_id, user_name, email, hashed_password))
        self.conn.commit()

        print(f"User created with user_id {user_id}, email {email}, password {password}")
        print ("Please save the email and password in a secure location. You will not be able to reveal password again.")

    # def delete_user(self, user_id):
    #     self.cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    #     self.conn.commit()

    def export(self, csv_path: str):
        csv_fp = open(csv_path, "w", newline="")
        writer = csv.writer(csv_fp)
        writer.writerow(["user_id", "user_name", "email", "password", "delete"])
        rows = self.cursor.execute("SELECT * FROM users")
        for user_id, user_name, email, _ in rows:
            writer.writerow([user_id, user_name, email, "", 0]) # Passwords are hashed, so we don't export them
        csv_fp.close()

    # def apply(self, csv_path: str, destructive: bool):
    #     """Import users from a CSV file into SQLite database.
    #     Disabled as of Jan 13, 2025.
    #     """
    #     csv_fp = open(csv_path, newline="")
    #     reader = csv.DictReader(csv_fp)
    #     for row in reader:
    #         user_id = row["user_id"]
    #         password = row["password"]
    #         user_name = row["user_name"]
    #         email = row["email"]
    #         delete = row["delete"]
    #         if user_id is None:
    #             new_password = self.new_user(user_name, email, password)
    #             print(f"Created new user {user_name} with email {email} and password {new_password}")
    #             continue
    #         if delete == "1":
    #             if destructive:
    #                 self.delete_user(user_id)
    #                 print(f"Deleted user {user_id}")
    #             else:
    #                 print(f"To delete user {user_id}, use the --destructive or -d flag")
    #             continue
    #         if self.get_user_by_id(user_id) is None:
    #             print(f"User {user_id} does not exist, ignored.")
    #             continue
    #         if password is not None and password != "":
    #             self.reset_user_password(user_id, password)
    #         if user_name is not None and user_name != "":
    #             self.change_user_name(user_id, user_name)
    #         if email is not None and email != "":
    #             self.change_user_email(user_id, email)
    #     csv_fp.close()

    def close(self):
        self.conn.close()


def main():
    main_parser = argparse.ArgumentParser(description="Manage users")
    main_parser.add_argument("--user_db", type=str, help="Path to SQLite database storing user info", default="./users.sqlite")

    user_commands_parser = main_parser.add_subparsers(dest="command", required=True)

    user_commands_parser.add_parser("list", help="List users")

    new_parser = user_commands_parser.add_parser("new", help="Create a new user")
    new_parser.add_argument("-e", "--email", type=str, help="Email of the user. Must be unique. For login.")
    new_parser.add_argument("-p", "--password", type=str, help="Password of the user. Leave empty for a random one.")
    new_parser.add_argument("-n", "--user_name", type=str, help="User name for display, not for logging in.")

    update_parser = user_commands_parser.add_parser("update", help="Update a user's info including resetting password")
    update_parser.add_argument("-k", "--look_up_method", type=str, help="How to look up the user")
    update_parser.add_argument("-v", "--look_up_value", type=str, help="Value to look up the user")
    update_parser.add_argument("-f", "--field_to_update", type=str, help="Field to update")
    update_parser.add_argument("-n", "--field_new_value", type=str, help="New value for the field")

    export_parser = user_commands_parser.add_parser("export", help="Export user info to a CSV file")
    export_parser.add_argument("csv", type=str, help="Path to the CSV file for exporting")

    # Disabled as of Jan 13, 2025
    # apply_parser = user_commands_parser.add_parser("apply", help="Apply changes from a CSV file")
    # apply_parser.add_argument("csv", type=str, help="Path to the CSV file for importing")
    # apply_parser.add_argument("-d", "--destructive", action="store_true", help="Delete users")

    args = main_parser.parse_args()

    db_utils = UserUtils(args.user_db)

    match args.command:
        case "export":
            db_utils.export(csv_path=args.csv)
        case "list":
            db_utils.list_users()
        case "new":
            db_utils.new_user(user_name=args.user_name, email=args.email, password=args.password)
        case "update":
            db_utils.update_user(look_up_method=args.look_up_method, look_up_value=args.look_up_value, field_to_update=args.field_to_update, field_new_value=args.field_new_value)
        # case "apply":
        #     db_utils.apply(csv_path=args.csv, destructive=args.destructive)
        case _:
            print("Invalid command")

    db_utils.close()


if __name__ == "__main__":
    main()
