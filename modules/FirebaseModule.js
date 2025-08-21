const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, set } = require("firebase/database");
const Message = require("./MessageModule");
const fs = require("fs");
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
const database = getDatabase(app);

function deleteFolder(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
  }
}

async function clearChat(channel) {
  channel.messages.fetch().then(messages => {
    if (messages) {
         channel.bulkDelete(messages, true)
    }
  })
 
 
}

module.exports = {
  writeDispos: (reaction, user) => {
    let reactionIndex;
    let oldDispoIndex;
    let dispoIndex;
    let finalUsers = [];
    let dispoFile = JSON.parse(
      fs.readFileSync(process.env.MESSAGES_ID_FILE_PATH)
    );
    let dispoHour = dispoFile.find(
      ({ messageId }) => messageId == reaction.message.id
    ).hour;

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
    switch (dispoHour) {
      case "18":
        dispoIndex = "0";
        break;
      case "19":
        dispoIndex = "1";
        break;
      case "20":
        dispoIndex = "2";
        break;
      case "21":
        dispoIndex = "3";
        break;
      case "22":
        dispoIndex = "4";
        break;
      case "23":
        dispoIndex = "5";
        break;
      default:
        break;
    }
    onValue(
      ref(database, "/users"),
      (snapshot) => {
        const obj = snapshot.val();
        if (obj) {
          for (let userId of Object.keys(obj)) {
            var fbUser = obj[userId];
            finalUsers.push(fbUser)
          }
          finalUsers.forEach(fbUser => {
            if (fbUser.discordId == user.id) {
            onValue(
              ref(database, "dispos/874/" + dispoIndex),
              (snapshot) => {
                const dispo = snapshot.val();
                if (dispo) {
                  let players = [];
                  let playerNames = [];
                  dispo.dispoPlayers.forEach((dPlayers) => {
                    //Pour chaque dispo, si le user l'a renseigné et qu'il la change, on reprend les players/playerNames et on enève le user
                    if (
                      dPlayers.dispo != reactionIndex &&
                      dPlayers.players &&
                      dPlayers.players.includes(fbUser.mid)
                    ) {
                      oldDispoIndex = dPlayers.dispo;
                      players = [];
                      playerNames = [];
                      if (dPlayers.players) {
                        dPlayers.players.forEach(player => {
                          players.push(player);
                        });
                      }
                      if (dPlayers.playerNames) {
                        dPlayers.playerNames.forEach(name => {
                          playerNames.push(name);
                        })
                      }
                      const playerIndex = players.indexOf(fbUser.mid);
                      const playerNameIndex = playerNames.indexOf(fbUser.name);
                      if (playerIndex > -1) { 
                        players.splice(playerIndex, 1);
                      }
                      if (playerNameIndex > -1) { 
                        playerNames.splice(playerNameIndex, 1);
                      }
                    
                      let newDispo = {
                        dispo: oldDispoIndex,
                        players: players,
                        playerNames: playerNames,
                      };
                      set(
                        ref(
                          database,
                          "/dispos/874/" +
                            dispoIndex +
                            "/dispoPlayers/" +
                            oldDispoIndex
                        ),
                        newDispo
                      );
                    }
                    //Pour chaque dispo, si le user la renseigne pour la première fois, on reprend les players/playerNames et on ajoute celui du user
                    if (
                      dPlayers.dispo == reactionIndex &&
                      (!dPlayers.players ||
                        !dPlayers.players.includes(fbUser.mid))
                    ) {
                      players = [];
                      playerNames = [];
                      if (dPlayers.players) {
                        dPlayers.players.forEach(player => {
                          players.push(player);
                        });
                      }
                      if (dPlayers.playerNames) {
                        dPlayers.playerNames.forEach(name => {
                          playerNames.push(name);
                        })
                      }
                      players.push(fbUser.mid);
                      playerNames.push(fbUser.name);
                      let newDispo = {
                        dispo: reactionIndex,
                        players: players,
                        playerNames: playerNames,
                      };
                      set(
                        ref(
                          database,
                          "/dispos/874/" +
                            dispoIndex +
                            "/dispoPlayers/" +
                            reactionIndex
                        ),
                        newDispo
                      );
                    }
                  });
                }
              },
              { onlyOnce: true }
            );
            return;
            }
          });
        }
      },
      { onlyOnce: true }
    );
  },
  createFile: (channel) => {
    onValue(ref(database, "dispos/874"), (snapshot) => {
      const data = snapshot.val();
      //A chaque fois que les datas sont modifiées, si elles existent
      if (data) {
        var isFirstTime = true
        data.forEach((dispo) => {
          //Si des membres on ajouté ou retiré leurs dispos
          if (dispo.dispoPlayers) {
         
            dispo.dispoPlayers.forEach((dispoPlayer) => {
              if (dispoPlayer.players != undefined) {
                isFirstTime = false;
                return;
              }
            });
        
          }
        });
        if (isFirstTime) {
            clearChat(channel);
            Message.createEmbbedMessages(data, channel);
            channel.send(
              "<@&" +
                process.env.MEMBER_ROLE_ID +
                "> " +
                "<@&" +
                process.env.TEST_ROLE_ID +
                ">"
            )
        }        
      } 
    });
  },

  handleDispos: (channel, dispoIndex, showFirstMessage) => {
    onValue(ref(database, "dispos/874/" + dispoIndex), (snapshot) => {
      const dispo = snapshot.val();
      //A chaque fois que les datas sont modifiées, si elles existent
      if (dispo) {
        var isFirstTime = true;
        //Si des membres on ajouté ou retiré leurs dispos
        if (dispo.dispoPlayers) {
          let dispoFile;
          let dispoMessageId;
          dispo.dispoPlayers.forEach((dispoPlayer) => {
            if (dispoPlayer.players != undefined) {
              isFirstTime = false;
                dispoFile = JSON.parse(
            fs.readFileSync(process.env.MESSAGES_ID_FILE_PATH)
          );
                dispoMessageId = dispoFile.find(
            ({ hour }) => hour === dispo.dispoHour.toString()
          ).messageId;
                  channel.messages.fetch(dispoMessageId).then((message) => {
            Message.updateMessage(message, dispo);
          });
            }
          });

          //Si la lineup est validée, ping Discord
          if (dispo.lineUp && dispo.opponentName) {
            var luMessage =
              dispo.dispoHour.toString() +
              "h vs " +
              dispo.opponentName +
              "\n \n";
            dispo.lineUp.forEach((item) => {
              luMessage += "<@" + item.userDiscordId + "> \n";
            });
            if (dispo.hostName) {
              luMessage += "\n Host: " + dispo.hostName;
            }
            channel.send(luMessage);
          }
        }
      } else if (showFirstMessage) {
        //Si les données n'existent pas (reset) et que le dossier cache existe, nettoyer les messages et le supprimer
        clearChat(channel);
         channel.send(
          "Les dispos du jour ne sont pas encore disponibles. Reviens plus tard !"
        );
        deleteFolder(process.env.MESSAGES_ID_DIR_PATH);
      }
    });
  },
};
