from pprint import pprint

from backend.dbsync.connections import DatabaseConnectionManager
from backend.dbsync.logger import logger

from backend.dbsync.inspector import DatabaseInspector
from backend.dbsync.schema_comparator import SchemaComparator
from backend.dbsync.schema_extractor import SchemaExtractor

from backend.dbsync.schema_sync import SchemaSync
from backend.dbsync.data_sync import DataSync


def print_database_information(manager):

    local_schema = None
    neon_schema = None

    # ----------------------------------------------------------
    # LOCAL DATABASE
    # ----------------------------------------------------------

    if manager.local_conn:

        print("\n")
        print("=" * 80)
        print("LOCAL DATABASE")
        print("=" * 80)

        local = DatabaseInspector(manager.local_conn)

        local_schema = local.inspect()

        pprint(local_schema)

    # ----------------------------------------------------------
    # NEON DATABASE
    # ----------------------------------------------------------

    if manager.neon_conn:

        print("\n")
        print("=" * 80)
        print("NEON DATABASE")
        print("=" * 80)

        neon = DatabaseInspector(manager.neon_conn)

        neon_schema = neon.inspect()

        pprint(neon_schema)

    return local_schema, neon_schema


def print_schema_changes(local_schema, neon_schema):

    if not local_schema or not neon_schema:

        return

    print()
    print("=" * 80)
    print("SCHEMA DIFFERENCES")
    print("=" * 80)

    changes = SchemaComparator(
        local_schema,
        neon_schema
    ).compare()

    if not changes:

        print("✅ Schema tamamen aynı.")

        return

    for change in changes:

        pprint(change)


def print_create_table_sql(manager):

    if not manager.local_conn:

        return

    print()
    print("=" * 80)
    print("LOCAL CREATE TABLE SQL")
    print("=" * 80)

    extractor = SchemaExtractor(manager.local_conn)

    ddl = extractor.extract()

    for table, obj in ddl.items():

        print()
        print("=" * 80)
        print(table)
        print("=" * 80)

        print(obj["create_table"])

        if obj["indexes"]:

            print()

            print("INDEXLER")

            for index in obj["indexes"]:

                print(index)


def main():

    manager = DatabaseConnectionManager()

    try:

        manager.connect()

        local_schema, neon_schema = print_database_information(manager)

        print_schema_changes(local_schema, neon_schema)

        print_create_table_sql(manager)

        # ------------------------------------------------------
        # SCHEMA SYNC
        # ------------------------------------------------------

        if manager.local_conn and manager.neon_conn:

            print()
            print("=" * 80)
            print("SCHEMA SYNC")
            print("=" * 80)

            SchemaSync(
                manager.local_conn,
                manager.neon_conn
            ).synchronize()

        # ------------------------------------------------------
        # DATA SYNC
        # ------------------------------------------------------

        if manager.local_conn and manager.neon_conn:

            print()
            print("=" * 80)
            print("DATA SYNC")
            print("=" * 80)

            DataSync(
                manager.local_conn,
                manager.neon_conn
            ).synchronize()

        print()
        print("=" * 80)
        print("DBSYNC SUCCESSFULLY COMPLETED")
        print("=" * 80)

    except Exception as e:

        logger.exception(e)

        raise

    finally:

        manager.close()


if __name__ == "__main__":

    main()