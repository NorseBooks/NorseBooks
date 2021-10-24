import argparse
from datetime import datetime
from io import BytesIO
import base64

import psycopg2
from psycopg2._psycopg import cursor
import requests

from typing import Any, Dict, List, Tuple, Callable


def transformTimestamps(timestamp: Any, args: List[Any]) -> datetime:
    """Transform a timestamp."""

    return datetime.fromtimestamp(int(timestamp))


def transformEmails(email: str, args: List[Any]) -> str:
    """Transform emails."""

    if "@" in email:
        return email
    else:
        return f"{email}@luther.edu"


def transformIntToBool(value: int, args: List[Any]) -> bool:
    """Transform integers to booleans."""

    return bool(value)


def transformUserIDs(userID: str, args: List[Any]) -> str:
    """Transform user IDs."""

    userIDMap: Dict[str, str] = args[0]
    return userIDMap[userID]


def getTables(db: cursor) -> List[str]:
    """Get the list of tables in the database."""

    sql = "SELECT table_name AS table FROM information_schema.tables WHERE table_schema = 'public';"
    db.execute(sql)
    tables = [row[0] for row in db.fetchall()]

    return tables


def getTableColumns(db: cursor, table: str) -> List[str]:
    """Get a table's column names."""

    sql = f"SELECT column_name AS column FROM information_schema.columns WHERE table_name = '{table}';"
    db.execute(sql)
    columns = [row[0] for row in db.fetchall()]

    return columns


def getTableData(db: cursor, table: str, columns: List[str]) -> List[Tuple]:
    """Get all data in a table."""

    if "id" not in columns:
        sql = f'SELECT * FROM "{table}";'
    else:
        sql = f'SELECT * FROM "{table}" ORDER BY id ASC;'

    db.execute(sql)
    tableData = db.fetchall()

    return tableData


def getTableDataObjects(db: cursor, table: str) -> List[Dict[str, Any]]:
    """Get all data in a table as a list of dictionaries."""
    tableColumns = getTableColumns(db, table)
    tableData = getTableData(db, table, tableColumns)
    tableDataObjects = []

    for data in tableData:
        row = {}

        for i in range(len(tableColumns)):
            row[tableColumns[i]] = data[i]

        tableDataObjects.append(row)

    return tableDataObjects


def insertTableValues(db: cursor, table: str, values: Dict[str, Any]) -> Dict[str, Any]:
    """Insert values into a table."""

    columns = [f'"{column}"' for column in values.keys()]
    vals = ["%s" for _ in values.values()]

    sql = f"INSERT INTO \"{table}\" ({', '.join(columns)}) VALUES ({', '.join(vals)}) RETURNING *"
    db.execute(sql, tuple(values.values()))
    data = db.fetchall()

    tableColumns = getTableColumns(db, table)
    tableDataObjects = []

    for data in data:
        row = {}

        for i in range(len(tableColumns)):
            row[tableColumns[i]] = data[i]

        tableDataObjects.append(row)

    return tableDataObjects


def migrateTable(
    db1: cursor,
    db2: cursor,
    oldTable: str,
    newTable: str,
    columnMap: Dict[str, Any],
    transformColumns: Dict[str, Tuple[Callable[[Any, List[Any]], Any], List[Any]]] = {},
    imageColumn: str = None,
    imageTable: str = None,
    idMap: Tuple[str, str] = None,
) -> Dict[str, str]:
    """Migrate a table, mapping old columns to new ones."""

    tableIDMap = {}
    tableData = getTableDataObjects(db1, oldTable)

    for row in tableData:
        values = {}
        print(
            "MIGRATING",
            oldTable,
            row[idMap[0]],
            "...",
            end=" ",
            flush=True,
        )

        for key in row.keys():
            if key in columnMap and row[key] is not None:
                if key in transformColumns:
                    values[columnMap[key]] = (transformColumns[key][0])(
                        row[key], transformColumns[key][1]
                    )
                else:
                    values[columnMap[key]] = row[key]

        if imageColumn is not None:
            imageValues = insertTableValues(db2, imageTable, {"data": ""})[0]
            values[imageColumn] = imageValues["id"]

        res = insertTableValues(db2, newTable, values)[0]
        tableIDMap[row[idMap[0]]] = res[idMap[1]]
        print("DONE")

    return tableIDMap


def migrateImages(
    db: cursor,
    table: str,
    column: str,
    urlPath: str,
    idParam: str,
    tableIDMap: Dict[str, str],
    tableIDColumn: str,
) -> None:
    """Migrate database images."""

    tableData = getTableDataObjects(db, table)

    for row in tableData:
        if row[column] is not None:
            url = row[column]
            idParamValue = tableIDMap[row[tableIDColumn]]
            print(
                "MIGRATING image",
                table,
                row[tableIDColumn],
                idParamValue,
                "...",
                end=" ",
                flush=True,
            )

            try:
                r = requests.get(url)
                imageBytes = BytesIO(r.content).read()
                buffer = base64.b64encode(imageBytes)
            except Exception as e:
                print(e)
            else:
                r = requests.patch(
                    f"http://localhost:3000{urlPath}",
                    {idParam: idParamValue, "imageData": buffer},
                )

                if r.status_code != 200:
                    raise Exception(r.content)

                print(f"DONE ({len(buffer):,} bytes)")
                del imageBytes
                del buffer


def migrate(oldDBUrl: str, newDBUrl: str) -> None:
    """Migrate the database."""

    conn1 = psycopg2.connect(oldDBUrl, sslmode="require")
    cur1 = conn1.cursor()

    conn2 = psycopg2.connect(newDBUrl, sslmode="require")
    cur2 = conn2.cursor()

    # Migrate users
    userIDMap = migrateTable(
        cur1,
        cur2,
        "nbuser",
        "NB_USER",
        {
            "firstname": "firstname",
            "lastname": "lastname",
            "email": "email",
            "password": "passwordHash",
            "itemslisted": "numBooksListed",
            "itemssold": "numBooksSold",
            "moneymade": "moneyMade",
            "verified": "verified",
            "admin": "admin",
            "jointimestamp": "joinTime",
            "lastlogin": "lastLoginTime",
        },
        transformColumns={
            "jointimestamp": (transformTimestamps, []),
            "lastlogin": (transformTimestamps, []),
            "email": (transformEmails, []),
            "verified": (transformIntToBool, []),
            "admin": (transformIntToBool, []),
        },
        imageColumn="imageID",
        imageTable="NB_IMAGE",
        idMap=("id", "id"),
    )

    # Migrate books
    bookIDMap = migrateTable(
        cur1,
        cur2,
        "book",
        "NB_BOOK",
        {
            "title": "title",
            "author": "author",
            "departmentid": "departmentID",
            "coursenumber": "courseNumber",
            "userid": "userID",
            "price": "price",
            "conditionid": "conditionID",
            "description": "description",
            "listedtimestamp": "listTime",
            "isbn10": "ISBN10",
            "isbn13": "ISBN13",
        },
        transformColumns={
            "listedtimestamp": (transformTimestamps, []),
            "userid": (transformUserIDs, [userIDMap]),
        },
        imageColumn="imageID",
        imageTable="NB_IMAGE",
        idMap=("bookid", "id"),
    )

    # Commit changes so endpoints can see new users and books
    conn2.commit()

    # Migrate user and book images
    migrateImages(
        cur1,
        "nbuser",
        "imageurl",
        "/api/migration/user-image",
        "userID",
        userIDMap,
        "id",
    )
    migrateImages(
        cur1,
        "book",
        "imageurl",
        "/api/migration/book-image",
        "bookID",
        bookIDMap,
        "bookid",
    )

    cur1.close()
    conn1.close()

    cur2.close()
    conn2.commit()
    conn2.close()


def main() -> None:
    """Execute the script."""

    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Backup the database")

    # The database URL
    parser.add_argument(
        "-o", "--old-url", type=str, help="The old database URL", dest="oldUrl"
    )
    parser.add_argument(
        "-n", "--new-url", type=str, help="The new database URL", dest="newUrl"
    )

    # Get the values of the arguments
    args = parser.parse_args()

    oldDBUrl = args.oldUrl
    newDBUrl = args.newUrl

    if oldDBUrl is None or newDBUrl is None:
        parser.error("could not find old or new database URL")

    try:
        r = requests.get("http://localhost:3000/")
        assert r.status_code == 200
    except:
        parser.error("app must be running locally on port 3000")

    migrate(oldDBUrl, newDBUrl)


if __name__ == "__main__":
    main()
