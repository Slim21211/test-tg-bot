require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { db } = require('./db');
const { startRegistration } = require('./registration');
const { addButtons } = require('./utils');
const homeButtons = require('./buttons/home');
const rookiesButtons = require('./buttons/forRookies');
const {
  startSendMessage,
  confirmSendMessage,
  cancelSendMessage,
  isAdmin,
  pendingMessage
} = require('./sendPrivateMessage');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const adminIds = process.env.ADMIN_IDS;

const declineSendText = 'Вы не можете делать рассылку в этом боте';
const returnHomeText = 'Для возврата нажмите /home';
const chooseChapterText = 'Выберите раздел:';
const defaultText = 'Для возврата в начало нажмите /home\n\nЕсли у Вас возникли вопросы, ответы на которые Вы не нашли в этом боте, обратитесь в Отдел обучения и развития\n\nДля продолжения работы переключите клавиатуру на кнопки и выберите один из разделов ниже:'

// Объект для отслеживания пользовательского ввода
const userInputState = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // отслеживаем ввод, чтобы не срабатывал default при регистрации и вводе текста рассылки
  const currentState = userInputState[chatId];

  if (currentState === 'registration') {
    return;
  }

  if (currentState === 'awaiting_message') {
    pendingMessage[chatId] = messageText;
    delete userInputState[chatId];
    bot.sendMessage(chatId, 'Подтвердить рассылку:\n/confirm_send\nОтменить рассылку:\n/cancel_send');
    return;
  }

  // Основной обработчик сообщений пользователя
  switch (messageText) {
    case '/start':
      await db.get('SELECT * FROM users_info WHERE user_id = ?', [chatId], (err, row) => {
        if (err) {
          bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте позже.');
        } else if (row) {
          bot.sendMessage(chatId, `Приветствуем, ${row.name} ${row.surname}!\n\nДля начала обучения нажмите /home.`);
        } else {
          userInputState[chatId] = 'registration';
          startRegistration(bot, chatId, () => {
            delete userInputState[chatId];
          });
        }
      });
      break;

    case '/send':
      if (!isAdmin(chatId, adminIds)) {
        await bot.sendMessage(chatId, declineSendText);

        return;
      }

      await startSendMessage(bot, chatId, userInputState);
      break;

    case '/confirm_send':
      if (!isAdmin(chatId, adminIds)) {
        await bot.sendMessage(chatId, declineSendText);

        return;
      }

      await confirmSendMessage(bot, chatId);
      break;

    case '/cancel_send':
      if (!isAdmin(chatId, adminIds)) {
        await bot.sendMessage(chatId, declineSendText);
        
        return;        
      }
      
      await cancelSendMessage(bot, chatId);
      break;

    case '/home':
      await bot.sendMessage(chatId, chooseChapterText, addButtons(homeButtons));
      break;

    case 'Для стажеров':
      await bot.sendMessage(chatId, returnHomeText, addButtons(rookiesButtons));
      break;

    case 'Контакты МСК':
      await bot.sendDocument(chatId, './documents/forRookies/contacts.pdf');
      await bot.sendMessage(chatId, returnHomeText);
      break;

    default:
      await bot.sendMessage(chatId, defaultText);
      break;
  }
});
