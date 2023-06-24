const Discord = require("discord.js");
const fs = require("fs");
const MessageHandler = require("./MessageHandler");
const ReactionHandler = require("./ReactionHandler");
const FirebaseHandler = require("./FirebaseHandler");

let client = null;

module.exports = {
  Messages: MessageHandler,
  Reactions: ReactionHandler,

  /**
   *
   * @param {Discord.Client} discordClient
   */
  Initialize: (discordClient) => {
    client = discordClient;

    //Création du dossier de stockage des dispos Discord
    if (
      !fs.existsSync(
        process.env.DIR_WORKING + process.env.DIR_SPLIT 
      )
    ) {
      fs.mkdir(
        process.env.DIR_WORKING + process.env.DIR_SPLIT,
        { recursive: true },
        (err) => {}
      );
    }
    if (
      !fs.existsSync(
        process.env.DIR_WORKING +
          process.env.DIR_SPLIT +
          process.env.GUILD_ID
      )
    ) {
      fs.mkdir(
        process.env.DIR_WORKING +
          process.env.DIR_SPLIT +
          process.env.GUILD_ID,
        { recursive: true },
        (err) => {}
      );
    }
    if (
      !fs.existsSync(
        process.env.DIR_WORKING +
          process.env.DIR_SPLIT +
          process.env.GUILD_ID +
          process.env.DIR_SPLIT +
          process.env.CHANNEL_ID
      )
    ) {
      fs.mkdir(
        process.env.DIR_WORKING +
          process.env.DIR_SPLIT +
          process.env.GUILD_ID +
          process.env.DIR_SPLIT +
          process.env.CHANNEL_ID,
        { recursive: true },
        (err) => {}
      );
    }
    // Write to log on successful connection to discord-API
    client.once("ready", () => {
      console.log("Login success");
      client.user.setActivity("les dispos de la HR");
    });

    // Reconnect, if discord-API closes the connection
    client.on("invalidated", () => {
      console.log("Connection closed");
      client.login(process.env.CLIENT_TOKEN);
    });

    process.on("unhandledRejection", (error) => {
      console.log(error);
    });
    MessageHandler.Initialize(discordClient);
    ReactionHandler.Initialize(discordClient);
    FirebaseHandler.Initialize(discordClient);
  },

  Login: () => {
    if (client != null) {
      client.login(process.env.CLIENT_TOKEN);
    }
  },
};
