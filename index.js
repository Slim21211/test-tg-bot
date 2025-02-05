require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN, { polling: true });

bot.on('text', (msg) => {
  if (msg.text === 'www') {
    bot.sendDocument(msg.chat.id, './assets/doc.pdf')
  } else {
    bot.sendMessage(msg.chat.id, 'Я пока не знаю что ответить на это')
  }
})