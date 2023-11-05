// Discord event handler
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ]
});

const {mow, add, remove, total, MOW_COMMAND, TOTAL_COMMAND, ADD_COMMAND, REMOVE_COMMAND} = require("./commands.js");

const CONSTANTS = require("../constants.js")

const BOT_CHANNEL = "stocks"
const BOT_PREFIX = "."

function main() {
    const DISCORD_KEY = CONSTANTS.DISCORD_KEY

    client.on("ready", () => {
        console.log("Discord Client Starting");
    });

    client.login(DISCORD_KEY);
    console.log("Logged in with token: ", DISCORD_KEY)

    // Functions for the stocks channel
    client.on("messageCreate", (message) => {
        // Make sure bot doesn't reply to itself, and uses the right channel
        if (message.author.bot || message.channel.name != BOT_CHANNEL) return; 

        const user_message = message.content.split(" ")
        console.log(user_message)

        switch (user_message[0]) {
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
}

main()
