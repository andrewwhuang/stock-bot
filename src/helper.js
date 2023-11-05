// Discord event handler
const { Client, GatewayIntentBits } = require("discord.js");
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
const {play, skip, pause, stop, PLAY_COMMAND, STOP_COMMAND, SKIP_COMMAND, PAUSE_COMMAND} = require("./music-bot-commands.js")

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

    const playlist = [];

    // Music bot
    client.on("messageCreate", async (message) => {
        // Make sure bot doesn't reply to itself, and uses the right channel
        if (message.author.bot || message.channel.name != MUSIC_CHANNEL) return; 

        const user_message = message.content.split(" ")
        const command = user_message[0]
        const metadata = user_message[1]

        switch (command) {
            case BOT_PREFIX + PLAY_COMMAND:             
                const voiceChannel = message.member.voice.channel;
                if (!voiceChannel) {
                    return message.channel.send("You need to be in a voice channel to play music!");
                }
                const permissions = voiceChannel.permissionsFor(message.client.user);
                if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                    return message.channel.send("I need the permissions to join and speak in your voice channel!");
                }
                if (!metadata) {
                    return message.channel.send("Please link a youtube url!");
                }
                let songInfo
                try {
                    songInfo = await ytdl.getInfo(metadata);
                } catch (error) {
                    return message.channel.send("Please link a valid url!");
                }
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url,
                };
                playlist.push(song)
                console.log(song)
                break
            case BOT_PREFIX + STOP_COMMAND:
                message.channel.send("in the stop command")
                break
            case BOT_PREFIX + SKIP_COMMAND:
                message.channel.send("in the skip command")
                break
            case BOT_PREFIX + PAUSE_COMMAND:
                message.channel.send("in the pause command")
                break
            default:
                break
        }
    });
}

main()
