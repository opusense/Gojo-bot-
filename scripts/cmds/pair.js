const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    countDown: 10,
    role: 0,
    author: "opu",
    shortDescription: {
      en: "Get to know your partner"
    },
    longDescription: {
      en: "Know your destiny and know who you will complete your life with"
    },
    category: "fun",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, usersData }) {
    const { loadImage, createCanvas } = require("canvas");
    const pathImg = __dirname + "/assets/background.png";
    const pathAvt1 = __dirname + "/assets/any.png";
    const pathAvt2 = __dirname + "/assets/avatar.png";

    const id1 = event.senderID;
    const name1 = await usersData.getName(id1);
    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const all = ThreadInfo.userInfo;

    let gender1 = null;
    for (const user of all) {
      if (user.id === id1) gender1 = user.gender;
    }

    const botID = api.getCurrentUserID();
    let candidates = all.filter(user =>
      user.id !== id1 && user.id !== botID &&
      (
        (gender1 === "FEMALE" && user.gender === "MALE") ||
        (gender1 === "MALE" && user.gender === "FEMALE") ||
        (!gender1 || !user.gender)
      )
    );

    if (candidates.length === 0) {
      return api.sendMessage("No suitable partner found in this chat.", event.threadID, event.messageID);
    }

    const randomPartner = candidates[Math.floor(Math.random() * candidates.length)];
    const id2 = randomPartner.id;
    const name2 = await usersData.getName(id2) || "Unknown";

    const percentageList = [
      `${Math.floor(Math.random() * 100) + 1}`, "0", "-1", "99,99", "-99", "-100", "101", "0,01"
    ];
    const tile = percentageList[Math.floor(Math.random() * percentageList.length)];

    const backgroundUrl = "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg";

    // Download avatars and background
    const getAvatar = async (id, path) => {
      const avatar = (
        await axios.get(`https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
          responseType: "arraybuffer"
        })
      ).data;
      fs.writeFileSync(path, Buffer.from(avatar, "utf-8"));
    };

    await getAvatar(id1, pathAvt1);
    await getAvatar(id2, pathAvt2);

    const bgData = (await axios.get(backgroundUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgData, "utf-8"));

    // Canvas drawing
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 111, 175, 330, 330);
    ctx.drawImage(baseAvt2, 1018, 173, 330, 330);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    return api.sendMessage({
      body: `╭── 𝐏𝐚𝐢𝐫 𝐑𝐞𝐬𝐮𝐥𝐭 ──╮\n\n✨ 𝐇𝐞𝐲 ${name1}~!\n\n💘 𝐘𝐨𝐮𝐫 𝐬𝐨𝐮𝐥𝐦𝐚𝐭𝐞 𝐢𝐬: ${name2}!\n\n❤️ 𝐋𝐨𝐯𝐞 𝐌𝐚𝐭𝐜𝐡: ${tile}%\n\n⛓️ 𝐃𝐞𝐬𝐭𝐢𝐧𝐲 𝐛𝐫𝐨𝐮𝐠𝐡𝐭 𝐲𝐨𝐮 𝐭𝐰𝐨 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫~\n\n╰── ✨ 🌬️ Mizuhara Chizuru ✨ ──╯`,
      mentions: [
        { tag: name1, id: id1 },
        { tag: name2, id: id2 }
      ],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
  },

  onChat: async function (context) {
    const { event, message } = context;
    if (event.body && event.body.toLowerCase() === "pair") {
      this.onStart(context);
    }
  }
};
