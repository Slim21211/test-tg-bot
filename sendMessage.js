const { db } = require('./db');

const pendingMessage = {};

async function startSendMessage(bot, chatId, userInputState) {
  await bot.sendMessage(chatId, 'Введите текст сообщения для рассылки:');
  userInputState[chatId] = 'awaiting_message';
}

async function confirmSendMessage(bot, chatId) {
  const textToSend = pendingMessage[chatId];
  if (!textToSend) {
    await bot.sendMessage(chatId, 'Не введен текст для рассылки.\nДля начала рассылки нажми: /send.');
    return;
  }

  await bot.sendMessage(chatId, 'Рассылка начата. Это может занять некоторое время.');

  await db.all('SELECT user_id FROM users_info', [], (err, rows) => {
    if (err) {
      bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
      return;
    }

    const userIdsToSend = rows.map((row) => row.user_id);
    userIdsToSend.forEach((userId) => {
      try {
        bot.sendMessage(userId, textToSend);
      } catch (e) {
        console.error(`Ошибка при отправке сообщения пользователю ${userId}: ${e.message}`);
      }
    });

    bot.sendMessage(chatId, 'Рассылка завершена.');
    delete pendingMessage[chatId];
  });
}

async function cancelSendMessage(bot, chatId) {
  if (!pendingMessage[chatId]) {
    await bot.sendMessage(chatId, 'Не введен текст для рассылки.\nДля начала рассылки нажми: /send.');
    return;
  }

  await delete pendingMessage[chatId];
  await bot.sendMessage(chatId, 'Рассылка отменена.');
}

function isAdmin(chatId, adminIds) {
  return adminIds.includes(chatId.toString());
}

module.exports = {
  startSendMessage,
  confirmSendMessage,
  cancelSendMessage,
  isAdmin,
  pendingMessage,
};
