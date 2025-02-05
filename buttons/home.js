const {getButtons} = require('../utils')

const homeButtons = [
  'Для стажеров',
  'Базовое обучение',
  'КАРГО',
  'ПВЗ и почтоматы',
  'СБП',
  'Для наставника',
  'Вымпелком',
]

module.exports = getButtons(homeButtons);