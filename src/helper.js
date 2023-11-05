// Discord event handler
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ]
});

const {mow, add, remove, total, MOW_COMMAND, TOTAL_COMMAND, ADD_COMMAND, REMOVE_COMMAND} = require("./stock-commands.js");

const CONSTANTS = require("../constants.js");

const STOCK_CHANNEL = "stocks"
const MUSIC_CHANNEL = "music-bot"
const BOT_PREFIX = "."

function main() {
    const DISCORD_KEY = CONSTANTS.DISCORD_KEY

    client.on("ready", () => {
        console.log("Discord Client Starting");
    });

    client.login(DISCORD_KEY);
    console.log("Logged in with token: ", DISCORD_KEY)

    client.once('ready', () => {
        console.log('Ready!');
    });
    client.once('reconnecting', () => {
        console.log('Reconnecting!');
    });
    client.once('disconnect', () => {
        console.log('Disconnect!');
    });

    // Functions for the stocks channel
    client.on("messageCreate", (message) => {
        // Make sure bot doesn't reply to itself, and uses the right channel
        if (message.author.bot || message.channel.name != STOCK_CHANNEL) return; 

        const user_message = message.content.split(" ")
        const command = user_message[0]

        switch (command) {
            case BOT_PREFIX + MOW_COMMAND:
                message.channel.send(mow(user_message))
                break
            case BOT_PREFIX + REMOVE_COMMAND:
                message.channel.send(remove(user_message))
                break
            case BOT_PREFIX + ADD_COMMAND:
                message.channel.send(add(user_message))
                break
            case BOT_PREFIX + TOTAL_COMMAND:
                message.channel.send(total(user_message))
                break
            default:
                break
        }
    });

    const queue = new Map();

    // Music bot
    client.on("messageCreate", async message => {
        console.log('yo')
        if (message.author.bot) return;
        if (!message.content.startsWith(BOT_PREFIX)) return;
        if (message.channel.name != MUSIC_CHANNEL) return
        console.log('y2o')
        const serverQueue = queue.get(message.guild.id);
      
        if (message.content.startsWith(`${BOT_PREFIX}play`)) {
          execute(message, serverQueue);
          return;
        } else if (message.content.startsWith(`${BOT_PREFIX}skip`)) {
          skip(message, serverQueue);
          return;
        } else if (message.content.startsWith(`${BOT_PREFIX}stop`)) {
          stop(message, serverQueue);
          return;
        } else {
          message.channel.send("You need to enter a valid command!");
        }
      });
      
      async function execute(message, serverQueue) {
        const args = message.content.split(" ");
      
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
          return message.channel.send(
            "You need to be in a voice channel to play music!"
          );
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
          return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
          );
        }
      
        let songInfo
        if (!args[1]) {
            return message.channel.send(
                "Please use a valid youtube url!"
              );
        }
        try {
            songInfo = await ytdl.getInfo(args[1]);
        } catch (error) {
            return message.channel.send(
                "Please use a valid youtube url!"
              );
        }

        const song = {
              title: songInfo.videoDetails.title,
              url: songInfo.videoDetails.video_url,
         };
      
        if (!serverQueue) {
          const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
          };
      
          queue.set(message.guild.id, queueContruct);
      
          queueContruct.songs.push(song);
      
          try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
          } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
          }
        } else {
          serverQueue.songs.push(song);
          return message.channel.send(`${song.title} has been added to the queue!`);
        }
      }
      
      function skip(message, serverQueue) {
        if (!message.member.voice.channel)
          return message.channel.send(
            "You have to be in a voice channel to stop the music!"
          );
        if (!serverQueue)
          return message.channel.send("There is no song that I could skip!");
        serverQueue.connection.dispatcher.end();
      }
      
      function stop(message, serverQueue) {
        if (!message.member.voice.channel)
          return message.channel.send(
            "You have to be in a voice channel to stop the music!"
          );
          
        if (!serverQueue)
          return message.channel.send("There is no song that I could stop!");
          
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
      }
      
      function play(guild, song) {
        const serverQueue = queue.get(guild.id);
        if (!song) {
          serverQueue.voiceChannel.leave();
          queue.delete(guild.id);
          return;
        }
      
        const dispatcher = serverQueue.connection
          .play(ytdl(song.url))
          .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
          })
          .on("error", error => console.error(error));
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.textChannel.send(`Start playing: **${song.title}**`);
      }
}

main()
