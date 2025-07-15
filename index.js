/**
 * @author NTKhang
 * ! The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using
 * ! Official source code: https://github.com/ntkhang03/Goat-Bot-V2
 * ! If you do not download the source code from the above address, you are using an unknown version and at risk of having your account hacked
 *
 * English:
 * ! Please do not change the below code, it is very important for the project.
 * It is my motivation to maintain and develop the project for free.
 * ! If you change it, you will be banned forever
 * Thank you for using
 *
 * Vietnamese:
 * ! Vui lòng không thay đổi mã bên dưới, nó rất quan trọng đối với dự án.
 * Nó là động lực để tôi duy trì và phát triển dự án miễn phí.
 * ! Nếu thay đổi nó, bạn sẽ bị cấm vĩnh viễn
 * Cảm ơn bạn đã sử dụng
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const cron = require("node-cron");
const express = require("express");

// Create a simple HTTP server to prevent Render port issues
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => log.info(`Server running on port ${PORT}`));

let childProcess = null;

function startProject() {
    if (childProcess) {
        log.info("Stopping existing bot process...");
        childProcess.kill(); // Kill previous process
    }

    log.info("Starting new bot process...");
    childProcess = spawn("node", ["Goat.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    childProcess.on("close", (code) => {
        log.error(`Bot process exited with code ${code}`);
        if (code === 2) {
            log.info("Restarting bot...");
            startProject();
        }
    });
}

// Start the bot
startProject();

// Auto-restart every 2 hours (ensures only one instance)
cron.schedule("0 */2 * * *", () => {
    log.info("Scheduled restart triggered...");
    if (childProcess) childProcess.kill(); // Kill the running process
    process.exit(2); // Exit with code 2 so Render restarts it
});
