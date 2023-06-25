const Discord = require("discord.js");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue, get } = require("firebase/database");
const Schedule = require("../modules/WarScheduling");
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
let CommandsGuildMessage = new Discord.Collection();
let client = null;

async function handleFirebaseEvent() {
  const disposRef = ref(database, "dispos/1643723546718");
  const channel = client.channels.cache.find(
    (channel) => channel.id === process.env.CHANNEL_ID
  );
  onValue(disposRef, (snapshot) => {
    const data = snapshot.val();
    //A chaque fois que les datas sont modifiées, si elles existent
    if (data) {
      var isFirstTime = true;
      data.forEach((dispo) => {
        if (dispo.dispoPlayers) {
          dispo.dispoPlayers.forEach((dispoPlayer) => {
            //Si des joueurs ont déjà précisé leurs dispos pour la dispo en cours, on va chercher l'ID du DiscordMessage correspondant
            if (dispoPlayer.players != undefined) {
              isFirstTime = false;
              let scheduleDir = fs.readdirSync(
                process.env.DIR_WORKING +
                  process.env.DIR_SPLIT +
                  process.env.GUILD_ID +
                  process.env.DIR_SPLIT +
                  process.env.CHANNEL_ID
              );
              let scheduleFile;
              switch (dispo.dispoHour) {
                case 18:
                  scheduleFile = scheduleDir[0].split(".")[0];
                  break;
                case 20:
                  scheduleFile = scheduleDir[1].split(".")[0];
                  break;
                case 21:
                  scheduleFile = scheduleDir[2].split(".")[0];
                  break;
                case 22:
                  scheduleFile = scheduleDir[3].split(".")[0];
                  break;
                case 23:
                  scheduleFile = scheduleDir[4].split(".")[0];
                  break;
                default:
                  break;
              }
              //On va chercher le FirebaseUser avec son ID et on vérifie si il a un DiscordID
              dispoPlayer.players.forEach((player) => {
                onValue(ref(database, "/users/" + player), (snapshot) => {
                  const fbUser = snapshot.val();
                  channel.messages.fetch(scheduleFile).then((message) => {
                    if (fbUser.discordId) {
                      //On ajoute la bonne dispo sur Discord en veillant à ne pas écraser la db
                      client.users.fetch(fbUser.discordId).then((user) => {
                        switch (dispoPlayer.dispo) {
                          case 0:
                            Schedule.addCan(message, user, false);
                            break;
                          case 1:
                            Schedule.addSub(message, user, false);
                            break;
                          case 2:
                            Schedule.addNotSure(message, user, false);
                            break;
                          case 3:
                            Schedule.addCant(message, user, false);
                            break;
                          default:
                            break;
                        }
                      });
                    }
                  });
                },
                { onlyOnce: true })
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
        CommandsGuildMessage.forEach((value) => {
          value.execute(data, client);
        });
        channel.send('<@' + 'DiscordIDMemberRole' + '> ' + '<@' + 'DiscordIdTestRole' + '>')
      }
    } else {
      //Si les données n'existent pas (reset) et que le dossier cache existe, nettoyer les messages et le supprimer
      clearChat(channel, 10);
      channel.send("Les dispos du jour ne sont pas encore disponibles. Reviens plus tard !")
      deleteFolder(
        process.env.DIR_WORKING +
        process.env.DIR_SPLIT +
        process.env.GUILD_ID +
        process.env.DIR_SPLIT +
        process.env.CHANNEL_ID
      )
    }
  });
}
function deleteFolder(path) {
 if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file) {
              var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolder(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
          }
}

async function clearChat (channel, numb) {
    const messageManager = channel.messages;
    const messages = await messageManager.channel.messages.fetch({ limit: numb });
    console.log("deleting chat")
    channel.bulkDelete(messages,true);

}

module.exports = {
  Initialize: (discordClient) => {
    console.log("MessageHandler init...");
    client = discordClient;
    let command = require("../modules/ScheduleWar.js");
    CommandsGuildMessage.set(command.name, command);
    client.on("ready", handleFirebaseEvent);
  },
};
