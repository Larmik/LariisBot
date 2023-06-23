const Discord = require('discord.js');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue } = require('firebase/database');
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)
let CommandsGuildMessage = new Discord.Collection();
let client = null;

async function handleFirebaseEvent() {
    console.log('Listening fb dispos');
    const disposRef = ref(database, 'dispos/1643723546718');
    onValue(disposRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            var isFirstTime = true;
            data.forEach(dispo => {
                if (dispo.dispoPlayers) {
                      dispo.dispoPlayers.forEach(dispoPlayer => {
                    if (dispoPlayer.players != undefined) {
                        isFirstTime = false
                        //TODO ajouter les réactions sur Discord
                        return;
                    } 
                })
                }
            });
            if (isFirstTime) {
                 CommandsGuildMessage.forEach((value) => {
                    value.execute(data, client);
                });
            } 
        }
    });
}

module.exports = {
    Initialize: (discordClient) => {
        console.log('MessageHandler init...');
        client = discordClient;
        let command = require('../modules/ScheduleWar.js');
        CommandsGuildMessage.set(command.name, command);
        client.on('ready', handleFirebaseEvent);
    }
}