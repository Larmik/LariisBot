const Discord = require("discord.js");
const Schedule = require("./WarScheduling");
const fs = require("fs");

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, set } = require("firebase/database");
const firebaseConfig = {
  apiKey: "AIzaSyBIH6XdclkrvXYGJzImA7wTA-vmU8n4_eI",
  authDomain: "stats-mk.firebaseapp.com",
  databaseURL:
    "https://stats-mk-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stats-mk",
  storageBucket: "stats-mk.appspot.com",
  messagingSenderId: "527204567365",
  appId: "1:527204567365:web:32e2bbd5732d753f70162c",
  measurementId: "G-MEKDPDHGT2",
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
  console.log("Write dispo begin");
  let msg = getData(reaction.message);
  let userDiscordId = user.id;
  let dispoHour = msg.time;
  let reactionIndex;
  let dispoIndex;
  let oldDispoIndex;

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
  let finalUsers = [];
  onValue(
    ref(db, "/users"),
    (snapshot) => {
      console.log("get users");
      const obj = snapshot.val();
      if (obj) {
        console.log("get users OK");
        for (let userId of Object.keys(obj)) {
          var user = obj[userId];
          finalUsers.push(user);
          if (user.discordId == userDiscordId) {
            console.log("user has discord id");
            onValue(
              ref(db, "dispos/1643723546718"),
              (snapshot) => {
                console.log("get dispos");
                const data = snapshot.val();
                if (data) {
                  data.forEach((dispo) => {
                    if (dispo.dispoHour == dispoHour) {
                      let newDispoPlayers = [];
                      dispo.dispoPlayers.forEach((dPlayers) => {
                        if (
                          dPlayers.dispo != reactionIndex &&
                          dPlayers.players &&
                          dPlayers.players.includes(user.mid)
                        ) {
                          newDispoPlayers = [];
                          dPlayers.players.forEach((player) => {
                            if (player != user.mid) {
                              newDispoPlayers.push(player);
                            }
                          });

                          oldDispoIndex = dPlayers.dispo;
                          console.log(
                            "On supprime " +
                              user.name +
                              " pour la dispo " +
                              dPlayers.dispo +
                              " sur la war de " +
                              dispoHour
                          );
                          let playerNames = [];
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

                          console.log(
                            "On ajoute " +
                              user.name +
                              " pour la dispo " +
                              dPlayers.dispo +
                              " sur la war de " +
                              dispoHour
                          );

                          newDispoPlayers.push(user.mid);
                          let playerNames = [];
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
              {
                onlyOnce: true,
              }
            );
          }
        }
      }
    },
    {
      onlyOnce: true,
    }
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
        Schedule.addCan(reaction.message, user);
        break;
      case "❌":
        Schedule.addCant(reaction.message, user);
        break;
      case "❕":
        Schedule.addSub(reaction.message, user);
        break;
      case "❔":
        Schedule.addNotSure(reaction.message, user);
        break;
      case "♿":
        Schedule.removeEntry(reaction.message, user);
        break;
    }
    writeDispo(reaction, user);
  },
};
