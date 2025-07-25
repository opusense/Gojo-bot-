const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
 config: {
 name: "gen",
 aliases: [],
 author: "O P U",
 version: "1.1",
 cooldowns: 20,
 role: 0,
 shortDescription: "Generate an image based on a prompt.",
 longDescription: "Generates an image using the provided prompt.",
 category: "Image Gen",
 guide: "{p}gen <prompt>",
 },

 onStart: async function ({ message, args, api, event, usersData }) {
 const prompt = args.join(" ");
 const cost = 5;

 if (!prompt) {
 return api.sendMessage("🦆 | Provide a prompt!\nExample: +gen A robot in Tokyo", event.threadID);
 }

 const userData = await usersData.get(event.senderID);
 const current = userData.money || 0;

 if (current < cost) {
 return message.reply(`❌ | You need at least ${cost} coins.\n💰 Your balance: ${current}`);
 }

 await usersData.set(event.senderID, { money: current - cost });

 message.reply("🌸 𝓣𝓱𝓲𝓼 𝓬𝓸𝓼𝓽 5 𝓬𝓸𝓲𝓷𝓼~\n🎨 𝓖𝓮𝓷𝓮𝓻𝓪𝓽𝓲𝓷𝓰 𝓲𝓶𝓪𝓰𝓮...");

 try {
 const url = `https://hopelessmahi.onrender.com/api/image?prompt=${encodeURIComponent(prompt)}`;

 // First try to fetch as JSON (some APIs send JSON with image URL)
 const response = await axios.get(url);
 const contentType = response.headers["content-type"];

 const folder = path.join(__dirname, "cache");
 if (!fs.existsSync(folder)) fs.mkdirSync(folder);

 const filePath = path.join(folder, `${Date.now()}_gen.png`);

 if (contentType.includes("application/json")) {
 // If JSON, parse and get image URL or base64 data
 const data = response.data;
 let imageUrl = "";

 // Example for typical response containing URL or base64
 if (typeof data === "string") {
 // if JSON is stringified inside string
 try {
 const parsed = JSON.parse(data);
 if (parsed.url) imageUrl = parsed.url;
 else if (parsed.image) imageUrl = parsed.image;
 else throw new Error("No image url found");
 } catch {
 throw new Error("Invalid JSON response");
 }
 } else if (typeof data === "object") {
 if (data.url) imageUrl = data.url;
 else if (data.image) imageUrl = data.image;
 else throw new Error("No image url found");
 }

 if (!imageUrl) throw new Error("No image URL or data found in API response");

 if (imageUrl.startsWith("data:image")) {
 // base64 image, decode and save
 const base64Data = imageUrl.split(",")[1];
 fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
 } else {
 // image URL, download binary
 const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
 fs.writeFileSync(filePath, Buffer.from(imgRes.data, "binary"));
 }
 } else if (contentType.startsWith("image/")) {
 // Direct image binary
 const imgRes = await axios.get(url, { responseType: "arraybuffer" });
 fs.writeFileSync(filePath, Buffer.from(imgRes.data, "binary"));
 } else {
 throw new Error(`Unexpected content-type: ${contentType}`);
 }

 await message.reply({
 body: `🖼️ 𝓗𝓮𝓻𝓮'𝓼 𝔂𝓸𝓾𝓻 𝓲𝓶𝓪𝓰𝓮~\n🎨 Prompt: "${prompt}"`,
 attachment: fs.createReadStream(filePath),
 });
 } catch (err) {
 console.error("gen error:", err.response?.data || err.message || err);
 message.reply("❌ | Failed to generate image.");
 }
 },
};
