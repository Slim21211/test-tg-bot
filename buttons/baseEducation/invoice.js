const { getButtons } = require('../../utils')

const invoiceButtons = [
  'Расходные материалы (текст)',
  'Расходные материалы (видео)',
]

module.exports = getButtons(invoiceButtons);