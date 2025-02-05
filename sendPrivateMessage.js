require('dotenv').config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;
const session = process.env.STRING_SESSION;
const stringSession = new StringSession(session);
const users = ["@Elizaveta_Shishkina", "@Dushnila_007"];

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Введите номер телефона: "),
    password: async () => await input.text("Введите пароль (если есть): "),
    phoneCode: async () => await input.text("Введите код из Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Клиент подключен!");

  // Сохранение сессии (чтобы не вводить код при каждом запуске)
  console.log("Сохраненная сессия:", client.session.save());

  for (const user of users) {
    try {
      await client.sendMessage(user, { message: "Привет! Подтверждааай!." });
      console.log(`Сообщение отправлено ${user}`);
    } catch (error) {
      console.log(`Ошибка при отправке сообщения ${user}:`, error);
    }
  }

  console.log("Все сообщения отправлены!");
})();