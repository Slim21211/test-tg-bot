const { getButtons } = require('../../utils')

const receptionByCashButtons = [
  'Забор за наличные деньги (текст)',
  'Забор за наличные деньги (видео)',
]

module.exports = getButtons(receptionByCashButtons);