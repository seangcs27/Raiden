const { Client, Intents } = require('discord.js');
const logger = require("winston");
const auth = require("./auth.json");
const InitMusicCommands = require('./helpers/music/commands');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
  colorize: true,
});
logger.level = "debug";

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
});
const settings = {
    prefix: '\*',
    token: auth.token
};

InitMusicCommands(client, settings);

const { Player } = require("discord-music-player");
const player = new Player(client, {
    leaveOnEmpty: false, // This options are optional.
});
// You can define the Player as *client.player* to easly access it.
client.player = player;

client.on("ready", () => {
	logger.info("Connected");
	logger.info("Logged in as: ");
	logger.info(client.user.username + " - (" + client.user.id + ")");
    console.log("I am ready to Play with DMP 🎶");
});


client.login(settings.token);