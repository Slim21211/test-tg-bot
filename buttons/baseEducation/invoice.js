const { getButtons } = require('../../utils')

const invoiceButtons = [
  'Накладная (текст)',
  'Накладная (видео)',
]

module.exports = getButtons(invoiceButtons);