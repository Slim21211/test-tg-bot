const { getButtons } = require('../../utils')

const personalDeliveryButtons = [
  'Доставка лично в руки (текст)',
  'Доставка лично в руки (видео)',
]

module.exports = getButtons(personalDeliveryButtons);