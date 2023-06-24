const Discord = require("discord.js");
const Schedule = require("./WarScheduling");
const fs = require("fs");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, set } = require("firebase/database");
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function getData(message) {
  let rawdata = fs.readFileSync(
    process.env.DIR_WORKING +
      process.env.DIR_SPLIT +
      "scheduleTemp" +
      process.env.DIR_SPLIT +
      message.guild.id +
      process.env.DIR_SPLIT +
      message.channel.id +
      process.env.DIR_SPLIT +
      message.id +
      ".json"
  );
  return JSON.parse(rawdata);
}

/**
 * @param {Discord.Client} client
 * @param {Discord.MessageReaction} reaction
 * @param {Discord.User} user
 */
function writeDispo(reaction, user) {
  let msg = getData(reaction.message);
  let userDiscordId = user.id;
  let dispoHour = msg.time;
  let reactionIndex;
  let dispoIndex;
  let oldDispoIndex;
  let finalUsers = [];

  switch (dispoHour) {
    case "18":
      dispoIndex = "0";
      break;
    case "20":
      dispoIndex = "1";
      break;
    case "21":
      dispoIndex = "2";
      break;
    case "22":
      dispoIndex = "3";
      break;
    case "23":
      dispoIndex = "4";
      break;
    default:
      break;
  }

  switch (reaction.emoji.name) {
    case "✅":
      reactionIndex = 0;
      break;
    case "❌":
      reactionIndex = 3;
      break;
    case "❕":
      reactionIndex = 1;
      break;
    case "❔":
      reactionIndex = 2;
      break;
  }

  onValue(
    ref(db, "/users"),
    (snapshot) => {
      const obj = snapshot.val();
      if (obj) {
        for (let userId of Object.keys(obj)) {
          var user = obj[userId];
          finalUsers.push(user);
          if (user.discordId == userDiscordId) {
            onValue(
              ref(db, "dispos/1643723546718"),
              (snapshot) => {
                const data = snapshot.val();
                if (data) {
                  data.forEach((dispo) => {
                    if (dispo.dispoHour == dispoHour) {
                      let newDispoPlayers = [];
                      let playerNames = [];
                      dispo.dispoPlayers.forEach((dPlayers) => {
                        if (
                          dPlayers.dispo != reactionIndex &&
                          dPlayers.players &&
                          dPlayers.players.includes(user.mid)
                        ) {
                          newDispoPlayers = [];
                          playerNames = [];
                          dPlayers.players.forEach((player) => {
                            if (player != user.mid) {
                              newDispoPlayers.push(player);
                            }
                          });
                          oldDispoIndex = dPlayers.dispo;
                          finalUsers.forEach((user) => {
                            newDispoPlayers.forEach((player) => {
                              if (player == user.mid) {
                                playerNames.push(user.name);
                              }
                            });
                          });
                          let newDispo = {
                            dispo: oldDispoIndex,
                            players: newDispoPlayers,
                            playerNames: playerNames,
                          };
                          set(
                            ref(
                              db,
                              "/dispos/1643723546718/" +
                                dispoIndex +
                                "/dispoPlayers/" +
                                oldDispoIndex
                            ),
                            newDispo
                          );
                        }
                        if (
                          dPlayers.dispo == reactionIndex &&
                          (!dPlayers.players ||
                            !dPlayers.players.includes(user.mid))
                        ) {
                          newDispoPlayers.push(user.mid);
                          playerNames = [];
                          finalUsers.forEach((user) => {
                            newDispoPlayers.forEach((player) => {
                              if (player == user.mid) {
                                playerNames.push(user.name);
                              }
                            });
                          });
                          let newDispo = {
                            dispo: reactionIndex,
                            players: newDispoPlayers,
                            playerNames: playerNames,
                          };
                          set(
                            ref(
                              db,
                              "/dispos/1643723546718/" +
                                dispoIndex +
                                "/dispoPlayers/" +
                                reactionIndex
                            ),
                            newDispo
                          );
                        }
                      });
                    }
                  });
                }
              },
              { onlyOnce: true }
            );
          }
        }
      }
    },
    { onlyOnce: true }
  );
}

module.exports = {
  /**
   * @param {Discord.Client} client
   * @param {Discord.MessageReaction} reaction
   * @param {Discord.User} user
   */
  HandleReaction: (reaction, user) => {
    if (reaction.partial) {
      try {
        reaction.fetch();
      } catch (error) {
        return;
      }
    }
    switch (reaction.emoji.name) {
      case "✅":
        Schedule.addCan(reaction.message, user, true);
        break;
      case "❌":
        Schedule.addCant(reaction.message, user, true);
        break;
      case "❕":
        Schedule.addSub(reaction.message, user, true);
        break;
      case "❔":
        Schedule.addNotSure(reaction.message, user, true);
        break;
      case "♿":
        Schedule.removeEntry(reaction.message, user);
        break;
    }
    writeDispo(reaction, user);
  },
};
