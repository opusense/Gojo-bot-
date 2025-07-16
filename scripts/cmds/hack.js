const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "hack",
    author: "Rasin",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Just for fun",
    },
    guide: {
      en: "{pn} \nor {pn} [UID/mention/Message reply]",
    },
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      const words = text.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
          line += `${words.shift()} `;
        } else {
          lines.push(line.trim());
          line = "";
        }
      }
      if (line) lines.push(line.trim());
      resolve(lines);
    });
  },

  hackMessage: async function ({ api, event, name }) {
    try {
      const loadingMessage = await api.sendMessage(
        `Hacking Facebook Password for ${name}, Please wait...`,
        event.threadID
      );

      if (!loadingMessage || !loadingMessage.messageID) {
        return api.sendMessage(
          "❌ An error occurred while starting the process.",
          event.threadID,
          event.messageID
        );
      }

      const loadingMessageID = loadingMessage.messageID;

      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        await api.editMessage(
          `Successfully Cracked Facebook password for *${name}*`,
          loadingMessageID
        );
      } catch (error) {
        await api.sendMessage(
          `Successfully Cracked Facebook password for *${name}*`,
          event.threadID
        );
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        await api.editMessage(
          `Login failed! 2FA is enabled on *${name}*'s account.`,
          loadingMessageID
        );
      } catch (error) {
        await api.sendMessage(
          `Login failed! 2FA is enabled on *${name}*'s account.`,
          event.threadID
        );
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        await api.editMessage(
          `2FA Bypass Successful! Logged into *${name}*'s account.`,
          loadingMessageID
        );
      } catch (error) {
        await api.sendMessage(
          `2FA Bypass Successful! Logged into ${name} account.`,
          event.threadID
        );
      }

    } catch (error) {
      api.sendMessage(
        "❌ An error occurred during the hacking process. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },

  onStart: async function ({ args, usersData, threadsData, api, event }) {
    try {
      const pathImg = __dirname + "/cache/background.png";
      const pathAvt1 = __dirname + "/cache/Avtmot.png";

      let id;

      if (event.messageReply) {
        id = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        id = Object.keys(event.mentions)[0];
      } else if (args.length > 0) {
        id = args[0];
      } else {
        id = event.senderID;
      }

      let userInfo;
      try {
        userInfo = await api.getUserInfo(id);
      } catch (error) {
        return api.sendMessage(
          "❌ Unable to fetch user information. Please try again.",
          event.threadID,
          event.messageID
        );
      }

      const name = userInfo[id]?.name || "Unknown User";

      await this.hackMessage({ api, event, name });

      const backgroundImageURL = "https://i.ibb.co/DCLzrQQ/VQXViKI.png";
      let avatarData, backgroundData;
      try {
        avatarData = (
          await axios.get(
            `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            { responseType: "arraybuffer" }
          )
        ).data;
        backgroundData = (
          await axios.get(backgroundImageURL, { responseType: "arraybuffer" })
        ).data;

        fs.writeFileSync(pathAvt1, Buffer.from(avatarData, "utf-8"));
        fs.writeFileSync(pathImg, Buffer.from(backgroundData, "utf-8"));
      } catch (error) {
        return api.sendMessage(
          "❌ Unable to generate the hacking image. Please try again.",
          event.threadID,
          event.messageID
        );
      }

      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseAvt1, 83, 437, 100, 101);

      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";
      const lines = await this.wrapText(ctx, name, 1160);
      ctx.fillText(lines.join("\n"), 200, 497);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      fs.removeSync(pathAvt1);

      return api.sendMessage(
        {
          body: `Successfully hacked ${name}\nPlease check your inbox to get Number and Password`,
          attachment: fs.createReadStream(pathImg),
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (error) {
      api.sendMessage(
        "An error occurred while processing. Please try again later.",
        event.threadID,
        event.messageID
      );
    }
  },
};
