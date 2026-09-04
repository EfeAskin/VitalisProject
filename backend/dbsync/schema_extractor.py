from psycopg2.extras import RealDictCursor

from backend.dbsync.logger import info


class SchemaExtractor:
    """
    PostgreSQL şema objelerinin DDL bilgisini üretir.

    Desteklenen:
        - CREATE TABLE
        - SERIAL / BIGSERIAL sequence
        - PRIMARY KEY
        - FOREIGN KEY
        - CREATE INDEX

    Daha sonra:
        - UNIQUE
        - CHECK
        - TRIGGER
        - FUNCTION
        - VIEW
        - EXTENSION
    """

    def __init__(self, connection):

        self.conn = connection

    # ==========================================================
    # SEQUENCE BİLGİSİ
    # ==========================================================

    def get_sequence_name_from_default(self, default):

        """
        PostgreSQL column_default içerisindeki sequence adını
        tespit eder.

        Örnek:

            nextval('appointments_id_seq'::regclass)

        sonucu:

            appointments_id_seq
        """

        if not default:
            return None

        default = str(default)

        marker_start = "nextval('"

        if marker_start not in default:
            return None

        start = (
            default.find(marker_start)
            + len(marker_start)
        )

        end = default.find(
            "'::regclass",
            start
        )

        if end == -1:
            return None

        sequence_name = default[
            start:end
        ]

        # PostgreSQL bazı durumlarda schema adı içerebilir.
        # Sadece son parçayı kullanıyoruz.
        if "." in sequence_name:

            sequence_name = sequence_name.split(
                "."
            )[-1]

        # PostgreSQL bazı identifier'larda çift tırnak
        # döndürebilir. Bunları temizle.
        sequence_name = sequence_name.strip(
            '"'
        )

        return sequence_name

    # ==========================================================
    # SEQUENCE DDL
    # ==========================================================

    def get_sequence_definition(
        self,
        sequence_name
    ):

        """
        PostgreSQL sequence için CREATE SEQUENCE DDL üretir.
        """

        if not sequence_name:
            return None

        return (
            f'CREATE SEQUENCE IF NOT EXISTS '
            f'"{sequence_name}";'
        )

    # ==========================================================
    # SEQUENCE LIST
    # ==========================================================

    def get_table_sequences(self, table):

        """
        Tablonun kolon default değerlerinde kullanılan
        sequence'leri bulur.

        LIKE / % kullanılmadığı için psycopg2 parameter
        parsing problemi oluşturmaz.
        """

        query = """
        SELECT
            column_name,
            column_default
        FROM information_schema.columns
        WHERE
            table_schema='public'
            AND table_name=%s
            AND position('nextval(' in column_default) > 0;
        """

        with self.conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                query,
                (table,)
            )

            rows = cur.fetchall()

        sequences = []

        for row in rows:

            sequence_name = (
                self.get_sequence_name_from_default(
                    row["column_default"]
                )
            )

            if sequence_name:

                sequences.append(
                    sequence_name
                )

        return list(
            dict.fromkeys(
                sequences
            )
        )

    # ==========================================================
    # CREATE TABLE SQL
    # ==========================================================

    def get_table_definition(
        self,
        table
    ):

        """
        Tablo kolonlarını okuyup CREATE TABLE SQL'i üretir.

        Sequence-backed default değerleri korunur.
        Sequence'lerin kendisi ayrıca extract edilir.
        """

        query = """
        SELECT
            column_name,
            data_type,
            is_nullable,
            column_default,
            udt_name
        FROM information_schema.columns
        WHERE
            table_schema='public'
            AND table_name=%s
        ORDER BY ordinal_position;
        """

        with self.conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                query,
                (table,)
            )

            rows = cur.fetchall()

        ddl = []

        ddl.append(
            f'CREATE TABLE "{table}" ('
        )

        columns = []

        for row in rows:

            data_type = row["data_type"]

            column_default = (
                row["column_default"]
            )

            col = (
                f'"{row["column_name"]}" '
                f'{data_type}'
            )

            if column_default:

                col += (
                    f' DEFAULT '
                    f'{column_default}'
                )

            if row["is_nullable"] == "NO":

                col += " NOT NULL"

            columns.append(
                col
            )

        ddl.append(
            ",\n".join(
                columns
            )
        )

        ddl.append(
            ");"
        )

        return "\n".join(
            ddl
        )

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    def get_primary_key_definition(
        self,
        table
    ):

        """
        Primary Key constraint'ini ayrı DDL olarak üretir.
        """

        query = """
        SELECT
            tc.constraint_name,
            kcu.column_name,
            kcu.ordinal_position
        FROM information_schema.table_constraints tc

        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
            AND tc.table_name = kcu.table_name

        WHERE
            tc.table_schema='public'
            AND tc.table_name=%s
            AND tc.constraint_type='PRIMARY KEY'

        ORDER BY
            kcu.ordinal_position;
        """

        with self.conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                query,
                (table,)
            )

            rows = cur.fetchall()

        if not rows:
            return None

        constraint_name = rows[0][
            "constraint_name"
        ]

        columns = ", ".join(
            f'"{row["column_name"]}"'
            for row in rows
        )

        return (
            f'ALTER TABLE "{table}" '
            f'ADD CONSTRAINT '
            f'"{constraint_name}" '
            f'PRIMARY KEY ({columns});'
        )

    # ==========================================================
    # FOREIGN KEYS
    # ==========================================================

    def get_foreign_keys(
        self,
        table
    ):

        """
        Tabloya ait FOREIGN KEY constraint'lerini çıkarır.

        Örnek:

            ticket_messages.ticket_id
                ->
            tickets.id
        """

        query = """
        SELECT
            tc.constraint_name,
            kcu.column_name AS child_column,
            ccu.table_name AS parent_table,
            ccu.column_name AS parent_column,
            rc.update_rule,
            rc.delete_rule,
            kcu.ordinal_position
        FROM information_schema.table_constraints tc

        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
            AND tc.table_name = kcu.table_name

        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema

        LEFT JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
            AND tc.constraint_schema = rc.constraint_schema

        WHERE
            tc.table_schema='public'
            AND tc.table_name=%s
            AND tc.constraint_type='FOREIGN KEY'

        ORDER BY
            tc.constraint_name,
            kcu.ordinal_position;
        """

        with self.conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                query,
                (table,)
            )

            rows = cur.fetchall()

        if not rows:
            return []

        constraints = {}

        for row in rows:

            constraint_name = (
                row["constraint_name"]
            )

            if constraint_name not in constraints:

                constraints[constraint_name] = {
                    "name": constraint_name,
                    "columns": [],
                    "parent_table": row[
                        "parent_table"
                    ],
                    "parent_columns": [],
                    "update_rule": row[
                        "update_rule"
                    ],
                    "delete_rule": row[
                        "delete_rule"
                    ]
                }

            constraints[
                constraint_name
            ]["columns"].append(
                row["child_column"]
            )

            constraints[
                constraint_name
            ]["parent_columns"].append(
                row["parent_column"]
            )

        foreign_keys = []

        for constraint in constraints.values():

            child_columns = ", ".join(
                f'"{column}"'
                for column in constraint[
                    "columns"
                ]
            )

            parent_columns = ", ".join(
                f'"{column}"'
                for column in constraint[
                    "parent_columns"
                ]
            )

            sql_parts = [
                f'ALTER TABLE "{table}"',
                f'ADD CONSTRAINT '
                f'"{constraint["name"]}"',
                f'FOREIGN KEY ({child_columns})',
                f'REFERENCES '
                f'"{constraint["parent_table"]}" '
                f'({parent_columns})'
            ]

            delete_rule = (
                constraint["delete_rule"]
            )

            update_rule = (
                constraint["update_rule"]
            )

            if (
                delete_rule
                and delete_rule != "NO ACTION"
            ):

                sql_parts.append(
                    f"ON DELETE {delete_rule}"
                )

            if (
                update_rule
                and update_rule != "NO ACTION"
            ):

                sql_parts.append(
                    f"ON UPDATE {update_rule}"
                )

            foreign_keys.append(
                " ".join(
                    sql_parts
                ) + ";"
            )

        return foreign_keys

    # ==========================================================
    # INDEXLER
    # ==========================================================


    def get_indexes(
        self,
        table
    ):

        query = """
        SELECT
            pi.indexdef
        FROM pg_indexes pi
        JOIN pg_class idx
            ON idx.relname = pi.indexname
        JOIN pg_namespace nsp
            ON nsp.oid = idx.relnamespace
            AND nsp.nspname = pi.schemaname
        LEFT JOIN pg_constraint con
            ON con.conindid = idx.oid
        LEFT JOIN pg_index pgi
            ON pgi.indexrelid = idx.oid
        WHERE
            pi.schemaname='public'
            AND pi.tablename=%s
            AND COALESCE(pgi.indisprimary, FALSE) = FALSE
        ORDER BY
            pi.indexname;
        """

        with self.conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                query,
                (table,)
            )

            return [
                row["indexdef"]
                for row in cur.fetchall()
            ]

    # ==========================================================
    # TÜM ŞEMA
    # ==========================================================

    def extract(self):

        query = """
        SELECT
            table_name
        FROM information_schema.tables
        WHERE
            table_schema='public'
            AND table_type='BASE TABLE'
        ORDER BY
            table_name;
        """

        with self.conn.cursor(
            cursor_factory=RealDictCursor
        ) as cur:

            cur.execute(
                query
            )

            tables = [
                row["table_name"]
                for row in cur.fetchall()
            ]

        result = {}

        for table in tables:

            info(
                f"DDL hazırlanıyor : {table}"
            )

            sequences = (
                self.get_table_sequences(
                    table
                )
            )

            sequence_ddls = []

            for sequence_name in sequences:

                sequence_ddl = (
                    self.get_sequence_definition(
                        sequence_name
                    )
                )

                if sequence_ddl:

                    sequence_ddls.append(
                        sequence_ddl
                    )

            result[table] = {

                "create_table":
                    self.get_table_definition(
                        table
                    ),

                "sequences":
                    sequence_ddls,

                "primary_key":
                    self.get_primary_key_definition(
                        table
                    ),

                "foreign_keys":
                    self.get_foreign_keys(
                        table
                    ),

                "indexes":
                    self.get_indexes(
                        table
                    )

            }

        return result