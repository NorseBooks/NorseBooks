import os
import pathlib
import json
import decimal
import argparse
from datetime import datetime

import psycopg2
from psycopg2._psycopg import cursor

from typing import Any, List, Tuple


def getRootPath() -> str:
    """Get the project root path."""

    thisPath = str(pathlib.Path(__file__).parent.absolute())
    rootPath = os.path.split(thisPath)[0]

    return rootPath


def getBackupPath() -> str:
    """Get the path to the backups directory."""

    rootPath = getRootPath()
    backupPath = os.path.join(rootPath, "backups")

    return backupPath


def getDBBackupPath(backupDir: str) -> str:
    """Get a database backup path."""

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    dbFile = f"norsebooks.backup.{timestamp}.json"
    dbPath = os.path.join(backupDir, dbFile)

    return dbPath


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


def fixValues(tableData: Any) -> Any:
    """Convert non-serializable objects to strings."""

    fixedData = []

    for row in tableData:
        fixedRow = []

        for value in row:
            if type(value) in [decimal.Decimal, datetime]:
                fixedRow.append(str(value))
            else:
                fixedRow.append(value)

        fixedData.append(tuple(fixedRow))

    return fixedData


def saveBackup(dbPath: str, dbData: Any) -> None:
    """Save the database backup."""

    with open(dbPath, "w") as f:
        json.dump(dbData, f, indent=2)


def backup(db: cursor, backupDir: str) -> str:
    """Perform the backup."""

    dbPath = getDBBackupPath(backupDir)
    dbData = {}

    tables = getTables(db)
    for table in tables:
        tableColumns = getTableColumns(db, table)
        tableData = getTableData(db, table, tableColumns)

        dbData[table] = {}
        dbData[table]["columns"] = tableColumns
        dbData[table]["data"] = fixValues(tableData)

    saveBackup(dbPath, dbData)

    return dbPath


def backupDB(dbUrl: str, backupDir: str) -> str:
    """Back up the database."""

    conn = psycopg2.connect(dbUrl, sslmode="require")
    cur = conn.cursor()

    os.makedirs(backupDir, exist_ok=True)

    dbPath = backup(cur, backupDir)

    cur.close()
    conn.close()

    return dbPath


def main() -> None:
    """Process the command line arguments."""

    parser = argparse.ArgumentParser(description="Backup the database")
    parser.add_argument("-u", "--url", type=str, required=True, help="The database URL")
    args = parser.parse_args()

    dbUrl: str = args.url
    backupPath = getBackupPath()
    dbPath = backupDB(dbUrl, backupPath)

    print(dbPath)


if __name__ == "__main__":
    main()
