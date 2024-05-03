import sqlite3


class Database:
    def __init__(self, db_name):
        self.db_name = db_name
        self.connection = None
        self.cursor = None

    def connect(self):
        self.connection = sqlite3.connect(self.db_name)
        self.cursor = self.connection.cursor()

    def close(self):
        if self.connection:
            self.connection.commit()
            self.cursor.close()
            self.connection.close()

    async def insert_data(self, table_name, data):
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data])
        query = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
        self.cursor.execute(query, tuple(data.values()))
        self.connection.commit()

    async def update_data(self, table_name, data, condition):
        set_clause = ', '.join([f'{key}=?' for key in data.keys()])
        query = f"UPDATE {table_name} SET {set_clause} WHERE {condition}"
        self.cursor.execute(query, tuple(data.values()))
        self.connection.commit()

    async def delete_data(self, table_name, condition):
        query = f"DELETE FROM {table_name} WHERE {condition}"
        self.cursor.execute(query)
        self.connection.commit()

    async def select_data(self, table_name, columns='*', condition='1=1'):
        column_list = ', '.join(columns)
        query = f"SELECT {column_list} FROM {table_name} WHERE {condition}"
        self.cursor.execute(query)
        result = self.cursor.fetchall()
        self.connection.commit()
        return result
