const {db} = require('./db');

const welcomeMessage = `
Добро пожаловать в команду компании <i>Курьер Сервис Экспресс!</i>

Вы подписались на обучающий бот компании.

<b>Введите ваше имя</b>:
`;

const errorMessage = 'Произошла ошибка. Попробуйте снова. /start'

async function startRegistration(bot, chatId, callback) {
  try {
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
    await bot.once('message', (msg) => {
      if (msg.chat.id === chatId) {
        askSurname(bot, chatId, msg.text, callback);
      }
    });
  } catch (error) {
    console.error('Ошибка в startRegistration:', error);
    bot.sendMessage(chatId, errorMessage);
    callback();
  }
}

async function askSurname(bot, chatId, name, callback) {
  try {
    await bot.sendMessage(chatId, 'Введите вашу фамилию:');
    await bot.once('message', (msg) => {
      if (msg.chat.id === chatId) {
        askCity(bot, chatId, name, msg.text, callback);
      }
    });
  } catch (error) {
    await bot.sendMessage(chatId, errorMessage);
    callback();
  }
}

async function askCity(bot, chatId, name, surname, callback) {
  try {
    await bot.sendMessage(chatId, 'Введите ваш город:');
    await bot.once('message', (msg) => {
      if (msg.chat.id === chatId) {
        saveUserData(bot, chatId, name, surname, msg.text, callback);
      }
    });
  } catch (error) {
    await bot.sendMessage(chatId, errorMessage);
    callback();
  }
}

async function saveUserData(bot, chatId, name, surname, city, callback) {
  try {
    const query = `INSERT INTO users_info (user_id, name, surname, city) VALUES (?, ?, ?, ?)`;
    await db.run(query, [chatId, name, surname, city], (err) => {
      if (err) {
        bot.sendMessage(chatId, errorMessage);
      } else {
        bot.sendMessage(chatId, `Спасибо, ${name} ${surname}!\n\nДля начала обучения нажмите /home.`);
      }
      callback();
    });
  } catch (error) {
    await bot.sendMessage(chatId, errorMessage);
    callback();
  }
}

module.exports = {
  startRegistration,
};
