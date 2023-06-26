const Discord = require("discord.js");
const fs = require("fs");


function buildMessage(dispo) {
  console.log(dispo)
    let msgData = [];
    let canCount = 0;
    
    if (dispo.dispoPlayers && dispo.dispoPlayers[0].playerNames && dispo.dispoPlayers[0].playerNames.length > 0) {
      let canStr = "";
      dispo.dispoPlayers[0].playerNames.forEach((item) => {
        if (canStr != "") {
          canStr += ", ";
        }
        canStr += item;
        canCount++;
      });
      msgData.push({ name: "✅ Can (" + dispo.dispoPlayers[0].playerNames.length + ")", value: canStr });
    }
    if (dispo.dispoPlayers && dispo.dispoPlayers[1].playerNames && dispo.dispoPlayers[1].playerNames.length > 0) {
      let subStr = "";
      dispo.dispoPlayers[1].playerNames.forEach((item) => {
        if (subStr != "") {
          subStr += ", ";
        }
        subStr += item;
        canCount++;
      });
      msgData.push({
        name: "❕Can sub (" + dispo.dispoPlayers[1].playerNames.length + ")",
        value: subStr,
      });
    }
    if (dispo.dispoPlayers && dispo.dispoPlayers[2].playerNames && dispo.dispoPlayers[2].playerNames.length > 0) {
      let notSureStr = "";
      dispo.dispoPlayers[2].playerNames.forEach((item) => {
        if (notSureStr != "") {
          notSureStr += ", ";
        }
        notSureStr += item;
      });
      msgData.push({
        name: "❔ Not sure (" + dispo.dispoPlayers[2].playerNames.length + ")",
        value: notSureStr,
      });
    }
    if (dispo.dispoPlayers && dispo.dispoPlayers[3].playerNames && dispo.dispoPlayers[3].playerNames.length > 0) {
      let cantStr = "";
      dispo.dispoPlayers[3].playerNames.forEach((item) => {
        if (cantStr != "") {
          cantStr += ", ";
        }
        cantStr += item;
      });
      msgData.push({
        name: "❌ Can't (" + dispo.dispoPlayers[3].playerNames.length + ")",
        value: cantStr,
      });
    }

  
    return {
      title:
        "**Dispos " +
        dispo.dispoHour.toString() +
        "h** " +
        (canCount >= 3 && canCount < 6
          ? "(+" + (6 - canCount).toString() + ")"
          : ""),
      fields: msgData,
    };
}

module.exports = {
     updateMessage: (message, dispo) => {
       message.edit({ embeds: [buildMessage(dispo)] });
     },
     createEmbbedMessages: (dispos, channel) => {
      let messagesId = '[ '
      for (let time of dispos) {
        let scheduleEmbed = new Discord.MessageEmbed().setTitle(
          "**Dispos " + time.dispoHour.toString() + "h**"
        );
        channel.send({ embeds: [scheduleEmbed] }).then((newMessage) => {
          messagesId += ('{ "hour": "' + time.dispoHour.toString() + '",  "messageId" : "' + newMessage.id.toString() + '" }' )
          if (time.dispoHour.toString() != '23') {
            messagesId += ', '
          } else {
            messagesId += ' ]'
            fs.writeFile(
              process.env.MESSAGES_ID_FILE_PATH,
              messagesId,
              (err) => {
                if (err) console.log(err);
              }
            );
          }
          newMessage
            .react("✅")
            .then(() => newMessage.react("❕"))
            .then(() => newMessage.react("❔"))
            .then(() => newMessage.react("❌"));
        });
      }
    },
}