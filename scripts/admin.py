import argparse

import psycopg2
from psycopg2._psycopg import cursor

import env

from typing import Any, List


# The user table name
userTableName = "NB_USER"

# Fields required for the admin
ADMIN_FIELDS: List[str] = ["id", "firstname", "lastname", "email"]


def addAdmin(db: cursor, email: str) -> str:
    """Adds an admin to the list of admins."""

    err = ""

    db.execute(f'SELECT "id" FROM "{userTableName}" WHERE email = \'{email}\';')
    res = db.fetchall()
    if len(res) == 0:
        err = "a user with the specified email does not exist"
    else:
        db.execute(
            f'SELECT "id" FROM "{userTableName}" WHERE "email" = \'{email}\' AND "admin" = FALSE;'
        )
        res = db.fetchall()
        if len(res) == 0:
            err = "the user is already an admin"
        else:
            db.execute(
                f'UPDATE "{userTableName}" SET "admin" = TRUE WHERE "email" = \'{email}\';'
            )

    return err


def removeAdmin(db: cursor, email: str) -> str:
    """Removes an admin from the list of admins."""

    err = ""

    db.execute(f'SELECT "id" FROM "{userTableName}" WHERE "email" = \'{email}\';')
    res = db.fetchall()
    if len(res) == 0:
        err = "a user with the specified email does not exist"
    else:
        db.execute(
            f'SELECT "id" FROM "{userTableName}" WHERE "email" = \'{email}\' AND "admin" = TRUE;'
        )
        res = db.fetchall()
        if len(res) == 0:
            err = "the user is not an admin"
        else:
            db.execute(
                f'UPDATE "{userTableName}" SET "admin" = FALSE WHERE "email" = \'{email}\';'
            )

    return err


def listAdmins(db: cursor) -> List[str]:
    """Lists all admins."""

    db.execute(
        f'SELECT {", ".join(ADMIN_FIELDS)} FROM "{userTableName}" WHERE "admin" = TRUE;'
    )
    res = db.fetchall()

    return res


def maxLength(list: List[Any], index: int) -> int:
    """Computs the maximum length."""

    maxlen = 0

    for item in list:
        if len(item[index]) > maxlen:
            maxlen = len(item[index])

    return maxlen


def displayAdmins(admins: List[Any]) -> None:
    """Show all admins."""

    maxlens = {
        ADMIN_FIELDS[i]: max(maxLength(admins, i), len(ADMIN_FIELDS[i]))
        for i in range(len(ADMIN_FIELDS))
    }

    print("   ".join([field.ljust(maxlens[field]) for field in ADMIN_FIELDS]))
    print("-" * (sum(list(maxlens.values())) + (3 * (len(maxlens) - 1))))

    for admin in admins:
        admin_fields = {ADMIN_FIELDS[i]: admin[i] for i in range(len(ADMIN_FIELDS))}
        print(
            "   ".join(
                [admin_fields[field].ljust(maxlens[field]) for field in ADMIN_FIELDS]
            )
        )


def main() -> None:
    """Execute the script."""

    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="An admin utility")

    # The database URL
    parser.add_argument("-u", "--url", type=str, help="The database URL")

    # Register as an admin
    parser.add_argument(
        "-a",
        "--add",
        type=str,
        default="",
        help="Add user as admin",
    )

    # Remove admin status
    parser.add_argument(
        "-r",
        "--remove",
        type=str,
        default="",
        help="Remove user's admin status",
    )

    # List all admins
    parser.add_argument(
        "-l",
        "--list",
        action="store_true",
        help="List all admins",
    )

    # Get the values of the arguments
    args = parser.parse_args()

    dbUrl = env.getVariable("DATABASE_URL", ".env")

    if dbUrl is None:
        if args.url is not None:
            dbUrl = args.url
        else:
            parser.error("could not find database URL")

    conn = psycopg2.connect(dbUrl, sslmode="require")
    cur = conn.cursor()

    # Handle the add case
    if args.add:
        err = addAdmin(cur, args.add)
        print(f"Error: {err}" if err else "Added user as admin")

    # Handle the remove case next
    elif args.remove:
        err = removeAdmin(cur, args.remove)
        print(f"Error: {err}" if err else "Removed user's admin status")

    # Handle the list case last
    elif args.list:
        admins = listAdmins(cur)
        displayAdmins(admins)

    cur.close()
    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()
