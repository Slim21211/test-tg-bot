require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN, { polling: true });

bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, 'Я скоро научусь что-то делать');
})