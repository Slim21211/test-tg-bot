const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных установлено.');
  }
});

db.run(
  `CREATE TABLE IF NOT EXISTS users_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    name TEXT,
    surname TEXT,
    city TEXT
  )`,
  (err) => {
    if (err) {
      console.error('Ошибка создания таблицы:', err.message);
    } else {
      console.log('Таблица users_info проверена/создана.');
    }
  }
);

module.exports = {db};
