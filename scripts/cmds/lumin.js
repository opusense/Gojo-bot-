const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "lumin",
    version: "1.0",
    author: "O P U",
    countDown: 5,
    role: 0,
    shortDescription: "Generate Luminarium style AI image",
    longDescription: "Generate an AI image using Oculux Luminarium API.",
    category: "Image Gen",
    guide: {
      en: "{pn} <prompt>",
    },
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage(
        "⚠️ Please provide a prompt.\nExample: lumin 1boy, Tanjiro Kamado, flowering trees",
        event.threadID,
        event.messageID
      );

    // React 🫧
    api.setMessageReaction("🫧", event.messageID, () => {}, true);

    // Send wait message
    api.sendMessage(
      "Generate your image please wait...🚮",
      event.threadID,
      async (info) => {
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://api.oculux.xyz/api/luminarium?prompt=${encodedPrompt}`;
        const imgPath = path.join(__dirname, "cache", `lumin_${event.senderID}.png`);

        try {
          const res = await axios.get(url, { responseType: "arraybuffer" });
          fs.writeFileSync(imgPath, res.data);

          api.sendMessage(
            {
              body: "",
              attachment: fs.createReadStream(imgPath),
            },
            event.threadID,
            () => {
              fs.unlinkSync(imgPath);
              api.unsendMessage(info.messageID);
            },
            event.messageID
          );
        } catch (err) {
          console.error("Image generation failed:", err);
          api.sendMessage(
            "❌ Failed to generate the image. Please try again later.",
            event.threadID,
            event.messageID
          );
        }
      }
    );
  },
};
