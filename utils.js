const { linkToVideoText } = require('./constants');
const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');
const pdfjsLib = require('pdfjs-dist');

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

async function extractTextFromPDF(filePath) {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text;
  } catch (error) {
    console.error(`Ошибка чтения PDF ${filePath}:`, error);
    return '';
  }
}

async function searchInPDFs(folderPath, query) {
  function getPDFFilesRecursively(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(getPDFFilesRecursively(filePath));
      } else if (file.endsWith('.pdf')) {
        results.push(filePath);
      }
    }
    return results;
  }

  const pdfFiles = getPDFFilesRecursively(folderPath);
  if (pdfFiles.length === 0) return [];

  const pdfTexts = [];
  for (const filePath of pdfFiles) {
    const text = await extractTextFromPDF(filePath);
    pdfTexts.push({ filePath, text });
  }

  const options = {
    includeScore: true,
    threshold: 0.3,
    minMatchCharLength: 3,
    ignoreLocation: true,
    findAllMatches: true,
    keys: ['text'],
  };

  const fuse = new Fuse(pdfTexts, options);
  const results = fuse.search(query);

  let searchResults = [];
  for (const result of results) {
    if (result.score < 0.5) {
      const matchedSentences = result.item.text
        .match(/[^.!?]+[.!?]/g)
        ?.filter(sentence => sentence.toLowerCase().includes(query.toLowerCase())) || [];
      
      searchResults.push({
        filePath: result.item.filePath,
        sentences: matchedSentences
      });
    }
  }

  if (searchResults.length === 0) {
    searchResults = pdfTexts
      .filter(doc => doc.text.toLowerCase().includes(query.toLowerCase()))
      .map(doc => ({
        filePath: doc.filePath,
        sentences: doc.text.match(/[^.!?]+[.!?]/g)?.filter(sentence => sentence.toLowerCase().includes(query.toLowerCase())) || []
      }));
  }

  return searchResults;
}


module.exports = {
  getButtons,
  addButtons,
  addInlineLink,
  searchInPDFs
}
