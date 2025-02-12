require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { db } = require('./db');
const { startRegistration } = require('./registration');
const { addButtons, addInlineLink } = require('./utils');
const {
  homeButtons,
  rookiesButtons,
  baseEducationButtons,
  startDayButtons,
  expendMaterialsButtons,
  invoiceButtons,
  personalDeliveryButtons,
  deliveryWithReturnButtons,
} = require('./buttons')
const {
  startSendMessage,
  confirmSendMessage,
  cancelSendMessage,
  isAdmin,
  pendingMessage
} = require('./sendMessage');
const {
  emptyMessage,
  declineSendText,
  returnHomeText,
  chooseChapterText,
  defaultText,
  chooseChapterWithReturnText,
  chooseChapterWithReturnAndBackText,
  linkToVideoText,
  returnBackText,
  startDayVideoLink,
  expendMaterialsVideoLink,
  invoiceVideoLink,
  personalDeliveryVideoLink,
  deliveryWithReturnVideoLink,
 } = require('./constants')

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

const adminIds = process.env.ADMIN_IDS;


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

    case '/back':
      await bot.sendMessage(chatId, chooseChapterWithReturnText, addButtons(baseEducationButtons));
      break;

    // Для стажеров
    case 'Для стажеров':
      await bot.sendMessage(chatId, returnHomeText, addButtons(rookiesButtons));
      break;

    case 'Памятка стажера':
      await bot.sendMessage(chatId, emptyMessage);
      break;

    case 'Контакты МСК':
      await bot.sendDocument(chatId, './documents/forRookies/contacts.pdf');
      await bot.sendMessage(chatId, returnHomeText);
      break;

    // Базовое обучение
    case 'Базовое обучение':
      await bot.sendMessage(chatId, chooseChapterWithReturnText, addButtons(baseEducationButtons));
      break;

    case 'Программа Базового обучения':
      await bot.sendDocument(chatId, './documents/baseEducation/study_program.pdf')
      await bot.sendMessage(chatId, returnHomeText)
      break;

    case 'Начало рабочего дня':
      await bot.sendMessage(chatId, chooseChapterWithReturnAndBackText, addButtons(startDayButtons));
      break;

    case 'Начало рабочего дня (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/start_day.pdf')
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Начало рабочего дня (видео)':
      await bot.sendMessage(chatId, linkToVideoText, addInlineLink(startDayVideoLink))
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Расходные материалы':
      await bot.sendMessage(chatId, chooseChapterWithReturnAndBackText, addButtons(expendMaterialsButtons));
      break;

    case 'Расходные материалы (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/expend_materials.pdf')
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Расходные материалы (видео)':
      await bot.sendMessage(chatId, linkToVideoText, addInlineLink(expendMaterialsVideoLink))
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Накладная':
      await bot.sendMessage(chatId, chooseChapterWithReturnAndBackText, addButtons(invoiceButtons));
      break;

    case 'Накладная (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/invoice.pdf')
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Накладная (видео)':
      await bot.sendMessage(chatId, linkToVideoText,addInlineLink(invoiceVideoLink))
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Доставка лично в руки':
      await bot.sendMessage(chatId, chooseChapterWithReturnAndBackText, addButtons(personalDeliveryButtons));
      break;

    case 'Доставка лично в руки (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/deliv_person.pdf')
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Доставка лично в руки (видео)':
      await bot.sendMessage(chatId, linkToVideoText, addInlineLink(personalDeliveryVideoLink))
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Доставка с возвратом':
      await bot.sendMessage(chatId, chooseChapterWithReturnAndBackText, addButtons(deliveryWithReturnButtons));
      break;

    case 'Доставка с возвратом (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/return_shipping.pdf')
      await bot.sendMessage(chatId, returnBackText)
      break;

    case 'Доставка с возвратом (видео)':
      await bot.sendMessage(chatId, linkToVideoText, addInlineLink(deliveryWithReturnVideoLink))
      await bot.sendMessage(chatId, returnBackText)
      break;

    default:
      await bot.sendMessage(chatId, defaultText);
      break;
  }
});
