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
  console.log("Listening fb dispos");
  const disposRef = ref(database, "dispos/1643723546718");
  const channel = client.channels.cache.find(
    (channel) => channel.id === process.env.CHANNEL_ID
  );
  onValue(disposRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      var isFirstTime = true;
      data.forEach((dispo) => {
        if (dispo.dispoPlayers) {
          dispo.dispoPlayers.forEach((dispoPlayer) => {
            if (dispoPlayer.players != undefined) {
              isFirstTime = false;
              let scheduleDir = fs.readdirSync(
                process.env.DIR_WORKING +
                  process.env.DIR_SPLIT +
                  "scheduleTemp" +
                  process.env.DIR_SPLIT +
                  process.env.GUILD_ID +
                  process.env.DIR_SPLIT +
                  channel.id
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
              dispoPlayer.players.forEach((player) => {
                get(ref(database, "/users/" + player)).then((snapshot) => {
                  const fbUser = snapshot.val();
                  channel.messages.fetch(scheduleFile).then((message) => {
                    if (fbUser.discordId) {
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
                });
              });
              return;
            }
          });
        }
      });
      if (isFirstTime) {
        CommandsGuildMessage.forEach((value) => {
          value.execute(data, client);
        });
      }
    } else {
      if (
        fs.existsSync(
          process.env.DIR_WORKING +
            process.env.DIR_SPLIT +
            "scheduleTemp" +
            process.env.DIR_SPLIT +
            process.env.GUILD_ID +
            process.env.DIR_SPLIT +
            channel.id
        )
      ) {
        fs.unlinkSync(
          process.env.DIR_WORKING +
            process.env.DIR_SPLIT +
            "scheduleTemp" +
            process.env.DIR_SPLIT +
            process.env.GUILD_ID +
            process.env.DIR_SPLIT +
            channel.id
        );
      }
    }
  });
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
