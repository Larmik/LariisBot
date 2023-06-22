const Discord = require('discord.js');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue } = require('firebase/database');

let CommandsGuildMessage = new Discord.Collection();
let client = null;

//A mettre dans fichier env
const firebaseConfig = {
    apiKey: "AIzaSyBIH6XdclkrvXYGJzImA7wTA-vmU8n4_eI",
    authDomain: "stats-mk.firebaseapp.com",
    databaseURL: "https://stats-mk-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "stats-mk",
    storageBucket: "stats-mk.appspot.com",
    messagingSenderId: "527204567365",
    appId: "1:527204567365:web:32e2bbd5732d753f70162c",
    measurementId: "G-MEKDPDHGT2"
  };
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)

async function handleFirebaseEvent() {
    console.log('Listening fb dispos');
    const disposRef = ref(database, 'dispos/1643723546718');
    onValue(disposRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            var isFirstTime = true;
            data.forEach(dispo => {
                dispo.dispoPlayers.forEach(dispoPlayer => {
                    if (dispoPlayer.players != undefined) {
                        console.log(dispoPlayer.players);
                        isFirstTime = false
                        //TODO ajouter les réactions sur Discord
                        return;
                    } 
                })
               
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
        if (client == null) throw "[COMMANDS] Client could not be loaded!";
        let command = require('../modules/ScheduleWar.js');
        CommandsGuildMessage.set(command.name, command);
        client.on('ready', handleFirebaseEvent);
    }
}