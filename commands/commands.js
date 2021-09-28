const { RepeatMode } = require("discord-music-player");
const { MessageEmbed } = require("discord.js");
const avatarURL = "https://cdn.discordapp.com/avatars";

function InitMusicCommands(client, settings) {
  client.on("messageCreate", async (message) => {
    const prefix = "-";
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);
    
    let guildQueue = client.player.getQueue(message.guild.id);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const channelToReply = client.channels.cache.get(message.channelId);

    if (command.length === 0) return;

    if (command === "me") {
      channelToReply.send(message.author.displayAvatarURL());
    }

    if (command === "stfu") {
      channelToReply.send("STFU You lil'non-eternal jerk!sss");
    }

    if (command === "play" || command === "p") {
      let queue = client.player.createQueue(message.guild.id);
      if (!message.member.voice.channel) {
        channelToReply.send("Not in voice channel.");
        return;
      }
      await queue.join(message.member.voice.channel);
      const searchKeyword = args.join(" ");
      let song = await queue
        .play(searchKeyword, {
          requestedBy: message.member.user.tag,
        })
        .catch((_) => {
          console.log("error! => " + _);
          if (!guildQueue) queue.stop();
        });

      await channelToReply.send(`:face_with_monocle: **Searching** \`${searchKeyword}\``);
      const EmbedSongInfo = new MessageEmbed()
        .setColor("#ffff00")
        .setTitle(song.name)
        .setURL(song.url)
        .setAuthor("Added to queue", message.author.displayAvatarURL(), "")
        // .setDescription('Some description here')
        .setThumbnail(song.thumbnail)
        .addFields(
          { name: "**Channel**", value: song.author, inline: true },
          { name: "**Song Duration**", value: song.duration, inline: true },
          // { name: '\u200B', value: '\u200B' }
        );
      // .addField('Inline field title', 'Some value here', true)
      // .setTimestamp()
      // .setFooter('Some footer text here');
      channelToReply.send({ embeds: [EmbedSongInfo] });
    }
    // Song Queue
    if (command === "queue" || command === "q") {
      try {
        let songs = client.player.createQueue(message.guild.id).songs;
        if (songs.length < 1) {
          channelToReply.send("No songs are queued.");
          return;
        }
        const embedMsg = new MessageEmbed()
          .setTitle("Queue for " + message.guild.name)
          .addField(
            "__**Now Playing:**__",
            `[${songs[0].name}](${songs[0].url}) | \`${songs[0].duration} Requested by: ${songs[0].requestedBy}\``,
          );
        if (songs.length > 1) {
          var str = "";
          for (let i = 1; i < songs.length; i++) {
            str += `\`${i}.\`[${songs[i].name}](${songs[i].url}) | \`${songs[i].duration} Requested by: ${songs[i].requestedBy}\`\n`;
          }
          embedMsg.addField("__**Up Next:**__", str);
        }
        channelToReply.send({ embeds: [embedMsg] });
      } catch (err) {
        channelToReply.send("Invalid command format.");
        return;
      }
    }
    // Display Playlist ?
    if (command === "playlist" || command === "list") {
      let queue = client.player.createQueue(message.guild.id);
      await queue.join(message.member.voice.channel);
      let song = await queue.playlist(args.join(" ")).catch((_) => {
        if (!guildQueue) queue.stop();
      });
    }
    // Next Song
    if (command === "skip" || command === "next") {
      try {
        guildQueue.skip();
      } catch (err) {
        channelToReply.send("Invalid command. No songs are queued. Try !help");
        return;
      }
    }
    // Disconnect Service
    if (command === "disconnect" || command === "dc" || command === "quit" || command === "end") {
      try {
        guildQueue.stop();
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Remove Loop
    if (command === "removeLoop" || command === "noLoop") {
      try {
        guildQueue.setRepeatMode(0); // or 0 instead of RepeatMode.DISABLED
        channelToReply.send("Loop Stopped.");
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Single Song Loop
    if (command === "toggleLoop" || command === "loop") {
      try {
        guildQueue.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
        channelToReply.send("Song loop toggled.");
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Queue Loop
    if (command === "toggleQueueLoop" || command === "qLoop") {
      try {
        guildQueue.setRepeatMode(2); // or 2 instead of RepeatMode.QUEUE
        channelToReply.send("Queue loop toggled.");
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Set Volume
    // if (command === "setVolume") {
    //   guildQueue.setVolume(parseInt(args[0]));
    // }
    // Get Volume
    // if (command === "getVolume") {
    //   console.log(guildQueue.volume);
    // }
    // Seek
    // if (command === "seek") {
    //   guildQueue.seek(parseInt(args[0]) * 1000);
    // }
    // Clear Queue
    if (command === "clearQueue" || command === "clear") {
      try {
        guildQueue.clearQueue();
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Shuffle Queue
    if (command === "shuffle" || command === "mix") {
      try {
        guildQueue.shuffle();
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Now Playing
    if (command === "nowPlaying" || command === "np") {
      try {
        let songs = client.player.createQueue(message.guild.id).songs;
        const embedMsg = new MessageEmbed().addField(
          "__**Now Playing:**__",
          `[${songs[0].name}](${songs[0].url}) | \`${songs[0].duration} Requested by: ${songs[0].requestedBy}\``,
        );
        channelToReply.send({ embeds: [embedMsg] });
        // channelToReply.send(`Now playing: ${guildQueue.nowPlaying}`);
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Pause
    if (command === "pause" || command === "stop") {
      try {
        guildQueue.setPaused(true);
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Resume
    if (command === "resume" || command === "re") {
      try {
        guildQueue.setPaused(false);
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Remove
    if (command === "remove") {
      try {
        guildQueue.remove(parseInt(args[0]));
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Create Progress Bar
    if (command === "createProgressBar" || command === "cpb") {
      try {
        const ProgressBar = guildQueue.createProgressBar();
        // [======>              ][00:35/2:20]
        channelToReply.send(ProgressBar.prettier);
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Help
    if (command === "help") {
      try {
        let helpMsg = "I'm lazy af bruh.";
        channelToReply.send(helpMsg);
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
  });
}

module.exports = InitMusicCommands;
