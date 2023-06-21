require('dotenv').config();
const Discord = require('discord.js');
const ClientHandler = require('./handlers/ClientHandler');
const express = require('express');
const { VerifyDiscordRequest } = require('./utils.js');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.listen(PORT, () => {
    const client = new Discord.Client(
        {
            autoReconnect: true,
            intents:
            [   Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ],
            partials: [ 'MESSAGE', 'CHANNEL', 'USER', 'REACTION' ]
        });
        
        ClientHandler.Initialize(client);
        ClientHandler.Login();
        console.log('Listening on port', PORT);
});

