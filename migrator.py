if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Migrate data from source to output")
    parser.add_argument("--source", type=str, required=True, help="Path to the source SQLite file")
    parser.add_argument("--output", type=str, required=True, help="Path to the output SQLite file")
    args = parser.parse_args()

    import sqlite3

    conn_source = sqlite3.connect(args.source)
    cursor_source = conn_source.cursor()

    cursor_source.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if cursor_source.fetchone() is None:
        print("Table `user` does not exist in the source database.")
        exit(1)

    conn_output = sqlite3.connect(args.output)
    cursor_output = conn_output.cursor()
    cursor_output.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            user_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL
        )
    """)

    import argon2
    import random
    import string

    ph = argon2.PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)


    def generate_random_string(length=16):
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(characters) for _ in range(length))


    def generate_random_example_email():
        return f"{generate_random_string(8)}@changeme.com"


    cursor_source.execute("SELECT user_id, user_name FROM users")
    for row in cursor_source.fetchall():
        user_id, user_name = row
        password = generate_random_string()
        hashed_password = ph.hash(password)
        email = generate_random_example_email()
        cursor_output.execute("INSERT INTO users (user_id, user_name, email, hashed_password) VALUES (?, ?, ?, ?)",
                              (user_id, user_name, email, hashed_password))

    conn_output.commit()
