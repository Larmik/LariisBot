const Discord = require('discord.js');
const fs = require('fs');
const InteractionResponseType = require('discord-interactions');

let CommandsGuildMessage = new Discord.Collection();
let client = null;

async function handleCommands(message) {
    if (message.content == '_dispos') {
        let args = message.content.slice(process.env.PREFIX.length).split(' ');
        let command = args.shift().toLowerCase();
        CommandsGuildMessage.forEach((value) => {
            console.log(value.name);
            console.log(value.alt)
            console.log(command);
            if (command == value.name || value.alt.includes(command)) {
                value.execute(message, args);
            }
        });
    }

    if (message.content.startsWith('_createlu')) {
        let args = message.content.slice(process.env.PREFIX.length).split(' ');
        let command = args.shift().toLowerCase();
        let scheduleDir = fs.readdirSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + message.channel.id)
        let scheduleFile;
        switch (args[0]) {
            case '18':
                scheduleFile = scheduleDir[0]
                break;
            case '20':
                scheduleFile = scheduleDir[1]
                break;
            case '21':
                scheduleFile = scheduleDir[2]
                break;
            case '22':
                scheduleFile = scheduleDir[3]
                break;
            case '23':
                scheduleFile = scheduleDir[4]
                break;
            default:
                break;
        }
        let scheduleFileJSON = JSON.parse(fs.readFileSync('./schedules/scheduleTemp/' + message.guild.id + '/'+ message.channel.id + '/' + scheduleFile));
        if (args[0] && args[1]) {
            var luMessage = args[0] + 'h vs ' + args[1] + '\n \n';
            if (scheduleFileJSON.CAN.length + scheduleFileJSON.SUB.length < 6) {
                message.channel.send('Il n\'y a pas assez de joueurs pour l\'heure spécifiée.')
            } else if (scheduleFileJSON.CAN.length == 6) {
                scheduleFileJSON.CAN.forEach(item => {
                    luMessage += '<@' + item.id + '> \n'
                });
                message.channel.send(luMessage);
            } else if (scheduleFileJSON.CAN.length + scheduleFileJSON.SUB.length == 6) {
                scheduleFileJSON.CAN.forEach(item => {
                    luMessage += '<@' + item.id + '> \n'
                });
                scheduleFileJSON.SUB.forEach(item => {
                    luMessage += '<@' + item.id + '> \n'
                });
                message.channel.send(luMessage);
            } else if (scheduleFileJSON.CAN.length > 6) {
                message.channel.send('Il y a trop de joueurs pour l\'heure spécifiée, tu dois faire la sélection toi-même. Ne t\'inquiètes pas, j\'en serai capable un jour mais pas pour l\'instant.')
            }
          
        } else {
            message.channel.send('Tu dois indiquer une heure et un adversaire après la commande (ex: _createlu 21 Ev)')
        }     
    }
}

module.exports = {
    Initialize: (discordClient) => {
        console.log('MessageHandler init...');
        client = discordClient;
        if (client == null) throw "[COMMANDS] Client could not be loaded!";
        let command = require('../modules/ScheduleWar.js');
        CommandsGuildMessage.set(command.name, command);
        client.on('messageCreate', handleCommands);
    }
}