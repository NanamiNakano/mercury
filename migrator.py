import argparse
import sqlite3
import argon2
import random
import string
import csv


def export(source, output):
    conn_source = sqlite3.connect(source)
    cursor_source = conn_source.cursor()

    cursor_source.execute("SELECT * FROM users")
    with open(output, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["user_id", "user_name", "email", "password"])
        writer.writeheader()
        for row in cursor_source.fetchall():
            writer.writerow({"user_id": row[0], "user_name": row[1]})


def migrate(source, target):
    conn_target = sqlite3.connect(target)
    cursor_target = conn_target.cursor()

    cursor_target.execute("DROP TABLE IF EXISTS users")

    cursor_target.execute("""
            CREATE TABLE users (
                user_id TEXT PRIMARY KEY,
                user_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                hashed_password TEXT NOT NULL
            )
        """)

    ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
    source_file = open(source, newline="")
    reader = csv.DictReader(source_file)
    for row in reader:
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
        cursor_target.execute("INSERT INTO users (user_id, user_name, email, hashed_password) VALUES (?, ?, ?, ?)",
                              (row["user_id"], row["user_name"], email, hashed_password))
    conn_target.commit()


if __name__ == "__main__":
    main_parser = argparse.ArgumentParser(description="Migrate data from source to output")
    commands_parser = main_parser.add_subparsers(dest="command", required=True)

    export_parser = commands_parser.add_parser("export", help="Export user_id from source for labeling")
    export_parser.add_argument("--source", type=str, required=True, help="Path to the source SQLite file")
    export_parser.add_argument("--output", type=str, help="Path to the output csv", default="output.csv")

    migrate_parser = commands_parser.add_parser("migrate", help="Migrate data from source to output")
    migrate_parser.add_argument("--source", type=str, required=True, help="Path to the source csv file")
    migrate_parser.add_argument("--target", type=str, help="Path to the output SQLite file", default="users.sqlite")
    args = main_parser.parse_args()

    if args.command == "migrate":
        migrate(args.source, args.target)
    elif args.command == "export":
        export(args.source, args.output)
    else:
        print("Invalid command")
        exit(1)
