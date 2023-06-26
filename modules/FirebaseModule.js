const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, set } = require("firebase/database");
const Message = require("./MessageModule")
const fs = require("fs")
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
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file) {
      var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) { 
            deleteFolder(curPath);
        } else { 
            fs.unlinkSync(curPath);
        }
    });
  }
 }
 
 async function clearChat (channel, numb) {
    const messageManager = channel.messages;
    const messages = await messageManager.channel.messages.fetch({ limit: numb });
    channel.bulkDelete(messages,true);
 }

module.exports = {
    writeDispos: (reaction, user) => {
        let reactionIndex;
        let oldDispoIndex;
        let finalUsers = [];
        let userDiscordId = user.id;
        let dispoFile = JSON.parse(fs.readFileSync(process.env.MESSAGES_ID_FILE_PATH));
        let dispoHour = dispoFile.find(({messageId}) => messageId == reaction.message.id).hour;

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
        onValue(ref(database, "/users"),(snapshot) => {
              const obj = snapshot.val();
              if (obj) {
                for (let userId of Object.keys(obj)) {
                  var user = obj[userId];
                  finalUsers.push(user);
                  if (user.discordId == userDiscordId) {
                    onValue(ref(database, "dispos/1643723546718"), (snapshot) => {
                        const data = snapshot.val();
                        if (data) {
                          data.forEach((dispo) => {
                            let dispoIndex;
                            switch (dispo.dispoHour.toString()) {
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
                            if (dispo.dispoHour == dispoHour) {
                              let newDispoPlayers = [];
                              let playerNames = [];
                              dispo.dispoPlayers.forEach((dPlayers) => {
                                if (dPlayers.dispo != reactionIndex && dPlayers.players && dPlayers.players.includes(user.mid)) {
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
                                  set(ref(database,"/dispos/1643723546718/" + dispoIndex + "/dispoPlayers/" + oldDispoIndex), newDispo);
                                }
                                if (dPlayers.dispo == reactionIndex && (!dPlayers.players || !dPlayers.players.includes(user.mid))) {
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
                                  set(ref(database,"/dispos/1643723546718/" + dispoIndex + "/dispoPlayers/" + reactionIndex), newDispo);
                                }
                              });
                              Message.updateMessage(reaction.message, dispo);
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
    },
    handleDispos: (channel) => {
      onValue(ref(database, "dispos/1643723546718"), (snapshot) => {
        const data = snapshot.val();
        //A chaque fois que les datas sont modifiées, si elles existent
        if (data) {
          var isFirstTime = true;
          data.forEach((dispo) => {
            //Si des membres on ajouté ou retiré leurs dispos
            if (dispo.dispoPlayers) {
              dispo.dispoPlayers.forEach((dispoPlayer) => {
                if (dispoPlayer.players != undefined) {
                  isFirstTime = false;
                  let dispoFile = JSON.parse(fs.readFileSync(process.env.MESSAGES_ID_FILE_PATH));
                  let dispoMessageId = dispoFile.find(({hour}) => hour === dispo.dispoHour.toString()).messageId;
                  channel.messages.fetch(dispoMessageId).then((message) => {
                    Message.updateMessage(message, dispo)
                  });              
                  return;
                }
              });
              //Si la lineup est validée, ping Discord
              if (dispo.lineUp && dispo.opponentName) {
                var luMessage = dispo.dispoHour.toString() + 'h vs ' + dispo.opponentName + '\n \n';
                    dispo.lineUp.forEach(item => {
                        luMessage += '<@' + item.userDiscordId + '> \n'
                    });
                    if (dispo.hostName) {
                      luMessage += '\n Host: ' + dispo.hostName
                    }
                    channel.send(luMessage);
              }
            }
          });
          //Si les dispos vienent d'être publiées, envoyer sur Discord
          if (isFirstTime) {
            clearChat(channel, 1)
            Message.createEmbbedMessages(data, channel)
            channel.send('<@' + 'DiscordIDMemberRole' + '> ' + '<@' + 'DiscordIdTestRole' + '>')
          }
        } else {
          //Si les données n'existent pas (reset) et que le dossier cache existe, nettoyer les messages et le supprimer
          clearChat(channel, 10);
          channel.send("Les dispos du jour ne sont pas encore disponibles. Reviens plus tard !")
          deleteFolder(process.env.MESSAGES_ID_DIR_PATH)
        }
      });
    }
};