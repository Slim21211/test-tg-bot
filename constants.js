// Тексты сообщений
const messages = {
  emptyMessage: 'Материал на доработке...\n\nДля возврата в начало нажмите /home',
  declineSendText: 'Вы не можете делать рассылку в этом боте',
  returnHomeText: 'Для возврата нажмите /home',
  chooseChapterText: 'Выберите раздел:',
  defaultText: 'Для возврата в начало нажмите /home\n\nЕсли у Вас возникли вопросы, ответы на которые Вы не нашли в этом боте, обратитесь в Отдел обучения и развития\n\nДля продолжения работы переключите клавиатуру на кнопки и выберите один из разделов ниже:',
  chooseChapterWithReturnText: 'Выберите интересующий раздел\n\nДля возврата нажмите /home',
  chooseChapterWithReturnAndBackText: 'Выберите формат обучающего материала:\n\nДля возврата в начало нажмите /home\n\nДля возврата к списку разделов нажмите /back',
  linkToVideoText: 'Для просмотра видео перейдите по ссылке:',
  returnBackText: 'Для возврата нажмите /back',
}

// Ссылки на видео
const startDayVideoLink = 'https://drive.google.com/file/d/10hm8iQ8OyytR-phHhQmwh25Lr2BUtDpR/view?usp=drive_link'
const expendMaterialsVideoLink = 'https://drive.google.com/file/d/1c55YdtzeFyOfyQIQRVcqdFOTZYgnh7c6/view?usp=drive_link'
const invoiceVideoLink = 'https://drive.google.com/file/d/1ddLAjq9t8mki7M-Dr33pv_Z4SkJ1H_Cq/view?usp=drive_link'
const personalDeliveryVideoLink = 'https://drive.google.com/file/d/1dT0o7FTahiWOPKY3UmyBmHy4g-5xS7cE/view?usp=drive_link'
const deliveryWithReturnVideoLink = 'https://drive.google.com/file/d/1VA0TZDJV9cfCTiR93vHnOQ9U2mix0QR-/view?usp=drive_link'

module.exports = {
  messages,
  startDayVideoLink,
  expendMaterialsVideoLink,
  invoiceVideoLink,
  personalDeliveryVideoLink,
  deliveryWithReturnVideoLink,
};