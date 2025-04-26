// services/database.ts
import * as SQLite from 'expo-sqlite';

export function openDatabase() {
  const db = SQLite.openDatabase('habits.db');
  
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS habits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, streak INTEGER, last_completed TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, date TEXT, time TEXT, reminder BOOLEAN);'
    );
  });

  return db;
}