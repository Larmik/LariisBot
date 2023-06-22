const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    execute: (dispos, client) => {
        const channel = client.channels.cache.find(channel => channel.id === "1121021754870075405")
        if (!fs.existsSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + '1121021754303852624')) {
            fs.mkdirSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + '1121021754303852624');
        }
        if (!fs.existsSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + '1121021754303852624' + process.env.DIR_SPLIT + channel.id)) {
            fs.mkdirSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + '1121021754303852624' + process.env.DIR_SPLIT + channel.id);
        }
        for (let time of dispos) {
            let scheduleEmbed = new Discord.MessageEmbed()
                .setTitle('**Dispos ' + time.dispoHour.toString() + 'h**');
                channel
                    .send({ embeds: [scheduleEmbed] })
                    .then(newMessage => {
                        fs.writeFile(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + '1121021754303852624' + process.env.DIR_SPLIT + channel.id + process.env.DIR_SPLIT 
                        + newMessage.id + '.json', '{ "time": "' + time.dispoHour.toString() + '", "CAN": [], "CANT": [], "SUB": [], "NOTSURE": [], "DROPPED": [] }', (err) => { if (err) console.log(err); });
                                            newMessage.react('✅').then(() => newMessage.react('❕')).then(() => newMessage.react('❔')).then(() => newMessage.react('❌'));
                    })    
            
        }
    }
}