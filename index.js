const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession("");

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // Авторизация
  await client.start({
    phoneNumber: async () => await input.text("Введите номер телефона: "),
    password: async () => await input.text("Введите пароль (если есть): "),
    phoneCode: async () => await input.text("Введите код из Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("Клиент подключен!");

  // Сохранение сессии (чтобы не вводить код при каждом запуске)
  console.log("Сохраненная сессия:", client.session.save());

  await client.sendMessage("@username", { message: "Привет! Это тестовое сообщение." });

  console.log("Сообщение отправлено!");
})();