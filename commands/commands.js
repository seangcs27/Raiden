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

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const channelToReply = client.channels.cache.get(message.channelId);

    let guildQueue = client.player.getQueue(message.guild.id);

    if (command.length === 0) return;

    if (command === "me") {
      channelToReply.send(message.author.displayAvatarURL());
    }

    if (command === "stfu") {
      channelToReply.send("再BB老娘就把你砌进神像里!");
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
      } catch {
        channelToReply.send("Invalid command. No songs are queued. Try !help");
        return;
      }
    }
    // Disconnect Service
    if (command === "quit" || command === "end" || command === "disconnect" || command === "dc") {
      try {
        guildQueue.stop();
      } catch {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Remove Loop
    if (command === "removeLoop" || command === "rl" || command === "sl") {
      try {
        guildQueue.setRepeatMode(0); // or 0 instead of RepeatMode.DISABLED
        channelToReply.send("Loop Stopped.");
      } catch {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Single Song Loop
    if (command === "toggleLoop" || command === "loop") {
      try {
        guildQueue.setRepeatMode(1); // or 1 instead of RepeatMode.SONG
        channelToReply.send("Song loop toggled.");
      } catch {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Queue Loop
    if (command === "toggleQueueLoop" || command === "ql") {
      try {
        guildQueue.setRepeatMode(2); // or 2 instead of RepeatMode.QUEUE
        channelToReply.send("Queue loop toggled.");
      } catch {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Set Volume
    if (command === "setVolume") {
      guildQueue.setVolume(parseInt(args[0]));
    }
    // Get Volume
    if (command === "getVolume" || command === "vol") {
      console.log(guildQueue.volume);
    }
    // Seek
    if (command === "seek") {
      guildQueue.seek(parseInt(args[0]) * 1000);
    }
    // Clear Queue
    if (command === "clear" || command === "clr") {
      try {
        guildQueue.clearQueue();
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Shuffle Queue
    if (command === "shuffle" || command === "sf") {
      try {
        guildQueue.shuffle();
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Now Playing
    if (command === "nowPlaying" || command === "np" || command === "now") {
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
    // Remove Song
    if (command === "remove" || command === "rm") {
      try {
        guildQueue.remove(parseInt(args[0]));
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
    // Create Progress Bar
    // if (command === "createProgressBar" || command === "cpb") {
    //   try {
    //     const ProgressBar = guildQueue.createProgressBar();
    //     // [======>              ][00:35/2:20]
    //     channelToReply.send(ProgressBar.prettier);
    //   } catch (err) {
    //     channelToReply.send("Invalid command.");
    //     return;
    //   }
    // }
    // Help
    if (command === "halp" || command === "h" || command === "command") {
      try {
        const helpMsg = new MessageEmbed()
          .setColor("#3d213e")
          .setTitle("Raiden Commands")
          .setAuthor("Potato & Edumundo", message.author.displayAvatarURL(), "")
          .setDescription("I can't cook but I can code.")
          .addFields(
            { name: "Asking for help ?", value: "`Halp or h`", inline: true },
            { name: "Command Prefix:", value: "`-`", inline: true },
            { name: "Note:", value: "**Not** case sensitive", inline: true },
            { name: "Play", value: "`Play or p <SONG_NAME>/<YOUTUBE_SONG_URL>`" },
            { name: "Pause/Stop", value: "`Pause or Stop`", inline: true },
            { name: "Resume", value: "`Resume or re`", inline: true },
            { name: "Skip/Next", value: "`Skip or next`", inline: true },
            { name: "Display Queue", value: "`Queue or q`", inline: true },
            { name: "Clear Queue", value: "`Clear or clr`", inline: true },
            { name: "Shuffle", value: "`Shuffle or sf`", inline: true },
            { name: "Loop Single Song", value: "`ToggleLoop or loop`", inline: true },
            { name: "Loop Queue", value: "`QueueLoop or ql`", inline: true },
            { name: "Remove/Stop Loop", value: "`RemoveLoop or rl`", inline: true },
            { name: "Disconnect Bot from Channel", value: "`Disconnect or dc`" },
            // { name: '\u200B', value: '\u200B' },
          )
          .setFooter("Raiden is for Personal & Private use only.");
        // .addField('Inline field title', 'Some value here', true)
        // .setTimestamp()
        channelToReply.send({ embeds: [helpMsg] });
      } catch (err) {
        channelToReply.send("Invalid command.");
        return;
      }
    }
  });
}

module.exports = InitMusicCommands;
