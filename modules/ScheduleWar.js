const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
  execute: (dispos, client) => {
    const channel = client.channels.cache.find(
      (channel) => channel.id === process.env.CHANNEL_ID
    );

    for (let time of dispos) {
      let scheduleEmbed = new Discord.MessageEmbed().setTitle(
        "**Dispos " + time.dispoHour.toString() + "h**"
      );
      channel.send({ embeds: [scheduleEmbed] }).then((newMessage) => {
        fs.writeFile(
          process.env.DIR_WORKING +
            process.env.DIR_SPLIT +
            process.env.GUILD_ID +
            process.env.DIR_SPLIT +
            process.env.CHANNEL_ID +
            process.env.DIR_SPLIT +
            newMessage.id +
            ".json",
          '{ "time": "' +
            time.dispoHour.toString() +
            '", "CAN": [], "CANT": [], "SUB": [], "NOTSURE": [], "DROPPED": [] }',
          (err) => {
            if (err) console.log(err);
          }
        );
        newMessage
          .react("✅")
          .then(() => newMessage.react("❕"))
          .then(() => newMessage.react("❔"))
          .then(() => newMessage.react("❌"));
      });
    }
  },
};
