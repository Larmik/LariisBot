require('dotenv').config();
const Discord = require('discord.js');
const ClientHandler = require('./handlers/ClientHandler');
const express = require('express');
const { VerifyDiscordRequest } = require('./utils.js');
const app = express();
const PORT = process.env.PORT || 3000;
const {
    InteractionType,
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes,
  } = require('discord-interactions');

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', async function (req, res) {
    const { type, id, data } = req.body;
  
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }
  });

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

