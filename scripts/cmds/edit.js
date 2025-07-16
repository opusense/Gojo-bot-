const axios = require("axios");

module.exports = {
  config: {
    name: "edit",
    aliases: ['editz'],
    version: "3.0.0",
    author: "Rasin",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Edit images with AI"
    },
    longDescription: {
      en: "Edit images with AI"
    },
    category: "image",
    guide: {
      en: "Usage:\n" +
           "• {pn} <prompt> - reply an image\n" +
           "• nothing" +
           "nothing"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const prompt = args.join(" ");
    if (!prompt) {
      const sentMsg = await message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚙𝚛𝚘𝚖𝚙𝚝 𝚘𝚛 𝚛𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 𝚊 𝚙𝚛𝚘𝚖𝚙𝚝");
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        messageID: sentMsg.messageID,
        commandName: this.config.name,
        type: "prompt",
        author: event.senderID
      });
      return;
    }

    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      const sentMsg = await message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        messageID: sentMsg.messageID,
        commandName: this.config.name,
        type: "image",
        prompt: prompt,
        author: event.senderID
      });
      return;
    }

    const attachment = event.messageReply.attachments[0];
    if (attachment.type !== "photo") return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");

    await this.processEdit(message, event, api, prompt, attachment.url);
  },

  onReply: async function ({ message, event, api, Reply }) {
    const { type, prompt, author } = Reply;
    
    if (event.senderID !== author) {
      return message.reply("𝙾𝚗𝚕𝚢 𝚝𝚑𝚎 𝚞𝚜𝚎𝚛 𝚠𝚑𝚘 𝚒𝚗𝚒𝚝𝚒𝚊𝚝𝚎𝚍 𝚝𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚛𝚎𝚙𝚕𝚢");
    }

    if (type === "continue_edit") {
      const newPrompt = event.body.trim();
      if (!newPrompt) {
        return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚟𝚊𝚕𝚒𝚍 𝚎𝚍𝚒𝚝 𝚒𝚗𝚜𝚝𝚛𝚞𝚌𝚝𝚒𝚘𝚗");
      }

      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");
      }

      await this.processEdit(message, event, api, newPrompt, attachment.url);
      Reply.delete();
      return;
    }

    if (type === "prompt") {
      const userPrompt = event.body.trim();
      if (!userPrompt) {
        return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚟𝚊𝚕𝚒𝚍 𝚙𝚛𝚘𝚖𝚙𝚝");
      }

      const sentMsg = await message.reply("𝙽𝚘𝚠 𝚙𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");
      
      global.GoatBot.onReply.set(sentMsg.messageID, {
        messageID: sentMsg.messageID,
        commandName: this.config.name,
        type: "image",
        prompt: userPrompt,
        author: event.senderID
      });
      
      Reply.delete();
      return;
    }

    if (type === "image") {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");
      }

      const attachment = event.messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return message.reply("𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚠𝚒𝚝𝚑 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎");
      }

      await this.processEdit(message, event, api, prompt, attachment.url);
      Reply.delete();
      return;
    }
  },

  async processEdit(message, event, api, prompt, imageUrl) {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const rasin = `https://rasin-x-apis.onrender.com/api/rasin/edit?prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}&apikey=rs_jgcrn577-hh4x-358p-9na9-vf`;

      const res = await axios.get(rasin);
      const resultImageUrl = res.data.img_url;

      if (!resultImageUrl) return message.reply("𝙽𝚘 𝚒𝚖𝚊𝚐𝚎 𝚛𝚎𝚝𝚞𝚛𝚗𝚎𝚍 😐");

      const sentMsg = await message.reply({
        attachment: await global.utils.getStreamFromURL(resultImageUrl)
      });

      global.GoatBot.onReply.set(sentMsg.messageID, {
        messageID: sentMsg.messageID,
        commandName: this.config.name,
        type: "continue_edit",
        author: event.senderID
      });

      api.setMessageReaction("🌸", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      message.reply("𝙵𝚊𝚒𝚕𝚎𝚍 💔");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
