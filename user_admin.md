# User administration in Mercury

Mercury uses a SQLite DB for user info (denoted as `USER_DB`) that is separate from the main corpus DB `CORPUS_DB`. By decoupling the user administration from the corpus, we can have a single user DB for multiple corpora and the annotation is always de-anonymized. The Default names for the user DB is `users.sqlite`. 

In a Mercury `USER_DB`, the following fields are stored for each user:
* `user_id`: Hash string that uniquely identifies a user
* `user_name`: User's name (for display purpose only, not for login)
* `email`: User's email (for login)
* `hashed_password`: Hashed password (for login)

The script for user administration is `user_admin.py`. 

Actions that can be performed:
* Creating a new user

  There are two ways to create a new user:

   1. Using interactive mode:
      ```bash
      python user_admin.py new
      ```
      then follow the prompts.

  2. Using command line arguments:
   
     ```bash
     python user_admin.py new -n <user_name> -e <email> -p <password>
     ```
     For example, to create a user with name `Test User`, email `test@example.com` and a random password:

     ```bash
     python user_admin.py new -n "Test User" -e "test@example.com" 
     ```

* Listing all users
 
   ```bash
   python user_admin.py list
   ```

* Changing the password or email of a user, including resetting password

  There are two ways to update a user's info:
  1. Using interactive mode:
   
     ```bash
     python user_admin.py update
     ```
     then follow the prompts.
    
  2. Using command line arguments:
     ```bash
     python user_admin.py update -k <field_to_locate_user> -v <value_to_locate_user> -f <field_to_update> -n <new_value_of_the_field>
     ```

     For example, to change the password of a user with email `test@example.com` to `abcdefg`:

     ```bash
     python user_admin.py update -k email -v test@example.com -f password -n abcdefg
     ```

For various reasons, Mercury does not support deleting users. However, you can simply change the password of a user to a random string to effectively disable the user.



Mercury has minimal exception handling for user administration. 