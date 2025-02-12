const { getButtons } = require('../../utils')

const deliveryWithReturnButtons = [
  'Доставка с возвратом (текст)',
  'Доставка с возвратом (видео)',
]

module.exports = getButtons(deliveryWithReturnButtons);