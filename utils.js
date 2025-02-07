const { linkToVideoText } = require('./constants');

function getButtons(array) {
  const result = [];
  for (let i = 0; i < array.length; i += 2) {
    result.push(array.slice(i, i + 2));
  }
  return result;
}

function addButtons(array) {
  return {
    "reply_markup": {
      "keyboard": array,
      resize_keyboard: true,
      }
  }
}

function addInlineLink(link) {
  return (linkToVideoText, {
    'reply_markup': {
      'inline_keyboard': [[{text: 'Смотреть видео', url: link}]],
    },
  })
}

module.exports = {
  getButtons,
  addButtons,
  addInlineLink
}
