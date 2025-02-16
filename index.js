require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { db } = require('./db');
const path = require('path');
const { startRegistration } = require('./registration');
const { addButtons, addInlineLink, searchInPDFs } = require('./utils');
const {
  homeButtons,
  rookiesButtons,
  baseEducationButtons,
  startDayButtons,
  expendMaterialsButtons,
  invoiceButtons,
  personalDeliveryButtons,
  deliveryWithReturnButtons,
  receptionByCashButtons,
} = require('./buttons')
const {
  startSendMessage,
  confirmSendMessage,
  cancelSendMessage,
  isAdmin,
  pendingMessage
} = require('./sendMessage');
const {
  messages,
  startDayVideoLink,
  expendMaterialsVideoLink,
  invoiceVideoLink,
  personalDeliveryVideoLink,
  deliveryWithReturnVideoLink,
 } = require('./constants')

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

const adminIds = process.env.ADMIN_IDS;
const pdfFolderPath = path.join(__dirname, 'documents');


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

  if (currentState === 'awaiting_search_query') {
    delete userInputState[chatId];
  
    const searchResults = await searchInPDFs(pdfFolderPath, messageText);
  
    if (searchResults.length > 0) {
      for (const result of searchResults) {
        const { filePath, sentences } = result;
  
        await bot.sendDocument(chatId, filePath);
  
        if (sentences.length > 0) {
          await bot.sendMessage(chatId, `Найденные совпадения в ${path.basename(filePath)}:\n\n${sentences.join('\n')}`);
        }
      }
      await bot.sendMessage(chatId, messages.returnHomeText)
    } else {
      await bot.sendMessage(chatId, 'Совпадений не найдено. Для другого запроса нажмите /search');
    }
  
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
        await bot.sendMessage(chatId, messages.declineSendText);

        return;
      }

      await startSendMessage(bot, chatId, userInputState);
      break;

    case '/confirm_send':
      if (!isAdmin(chatId, adminIds)) {
        await bot.sendMessage(chatId, messages.declineSendText);

        return;
      }

      await confirmSendMessage(bot, chatId);
      break;

    case '/cancel_send':
      if (!isAdmin(chatId, adminIds)) {
        await bot.sendMessage(chatId, messages.declineSendText);
        
        return;
      }
      
      await cancelSendMessage(bot, chatId);
      break;

    case '/home':
      await bot.sendMessage(chatId, messages.chooseChapterText, addButtons(homeButtons));
      break;

    case '/back':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnText, addButtons(baseEducationButtons));
      break;

    case '/search':
      userInputState[chatId] = 'awaiting_search_query';
      bot.sendMessage(chatId, 'Введите текст для поиска в документах:');
      break;

    // Для стажеров
    case 'Для стажеров':
      await bot.sendMessage(chatId, messages.returnHomeText, addButtons(rookiesButtons));
      break;

    case 'Памятка стажера':
      await bot.sendMessage(chatId, messages.emptyMessage);
      break;

    case 'Контакты МСК':
      await bot.sendDocument(chatId, './documents/forRookies/Контакты.pdf');
      await bot.sendMessage(chatId, messages.returnHomeText);
      break;

    // Базовое обучение
    case 'Базовое обучение':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnText, addButtons(baseEducationButtons));
      break;

    case 'Программа Базового обучения':
      await bot.sendDocument(chatId, './documents/baseEducation/Программа обучения.pdf')
      await bot.sendMessage(chatId, messages.returnHomeText)
      break;

    case 'Начало рабочего дня':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnAndBackText, addButtons(startDayButtons));
      break;

    case 'Начало рабочего дня (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/Начало рабочего дня.pdf')
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Начало рабочего дня (видео)':
      await bot.sendMessage(chatId, messages.linkToVideoText, addInlineLink(startDayVideoLink))
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Расходные материалы':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnAndBackText, addButtons(expendMaterialsButtons));
      break;

    case 'Расходные материалы (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/Расходные материалы.pdf')
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Расходные материалы (видео)':
      await bot.sendMessage(chatId, messages.linkToVideoText, addInlineLink(expendMaterialsVideoLink))
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Накладная':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnAndBackText, addButtons(invoiceButtons));
      break;

    case 'Накладная (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/Накладная.pdf')
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Накладная (видео)':
      await bot.sendMessage(chatId, messages.linkToVideoText,addInlineLink(invoiceVideoLink))
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Доставка лично в руки':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnAndBackText, addButtons(personalDeliveryButtons));
      break;

    case 'Доставка лично в руки (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/Доставка лично в руки.pdf')
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Доставка лично в руки (видео)':
      await bot.sendMessage(chatId, messages.linkToVideoText, addInlineLink(personalDeliveryVideoLink))
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Доставка с возвратом':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnAndBackText, addButtons(deliveryWithReturnButtons));
      break;

    case 'Доставка с возвратом (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/Доставка с возвратом.pdf')
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Доставка с возвратом (видео)':
      await bot.sendMessage(chatId, messages.linkToVideoText, addInlineLink(deliveryWithReturnVideoLink))
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Забор за наличные деньги':
      await bot.sendMessage(chatId, messages.chooseChapterWithReturnAndBackText, addButtons(receptionByCashButtons));
      break;

    case 'Забор за наличные деньги (текст)':
      await bot.sendDocument(chatId, './documents/baseEducation/Забор за наличные деньги.pdf')
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    case 'Забор за наличные деньги (видео)':
      await bot.sendMessage(chatId, messages.emptyMessage)
      await bot.sendMessage(chatId, messages.returnBackText)
      break;

    default:
      await bot.sendMessage(chatId, messages.defaultText);
      break;
  }
});
