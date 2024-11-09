const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'heru',
  description: 'Interact with Heru API',
  usage: 'Heru [your message]',
  author: 'Jay Mar',
  
  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    if (!prompt) return sendMessage(senderId, { text: "Usage: Heru <question>" }, pageAccessToken);

    try {
      const apiUrl = `https://heru-apiv2.onrender.com/api/heru?prompt=${encodeURIComponent(prompt)}`;
      const { data: { response } } = await axios.get(apiUrl);
      await sendResponseInChunks(senderId, response, pageAccessToken, sendMessage);
    } catch (error) {
      console.error('Error calling Heru API:', error);
      sendMessage(senderId, { text: 'There was an error generating the content. Please try again later.' }, pageAccessToken);
    }
  }
};

async function sendResponseInChunks(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let chunk = '';
  const words = message.split(' ');

  for (const word of words) {
    if ((chunk + word).length > chunkSize) {
      chunks.push(chunk.trim());
      chunk = '';
    }
    chunk += `${word} `;
  }
  
  if (chunk) {
    chunks.push(chunk.trim());
  }

  return chunks;
}
