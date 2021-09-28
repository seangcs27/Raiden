const { Client, Intents } = require("discord.js");
const logger = require("winston");
const auth = require("./assets/json/auth.json");
const InitMusicCommands = require("./commands/commands");
const PORT = process.env.PORT || 3000;

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = "debug";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

const settings = {
  // prefix: prefix,
  // token: auth.token, // Token from auth.json
  // TOKEN for Heroku Deployment 
  token: process.env.TOKEN
};

InitMusicCommands(client, settings);
const { Player } = require("discord-music-player");
const player = new Player(client, {
  leaveOnEmpty: true, // This options are optional.
});
// // You could define the Player as *client.player* for ease access.
client.player = player;

client.on("ready", () => {
  // logger.info("Connected");
  // logger.info("Logged in as: ");
  // logger.info(client.user.username + " - (" + client.user.id + ")");
  console.log("I am Raiden Bot 🎶");  
  console.log(`Server is listening on port ${PORT}...`);
});

client.login(settings.token);
