const Discord = require('discord.js');
 const { getRandomColor } = require('./ColorHelper');
 const fs = require('fs');

module.exports = {
    name: 'schedulewar',
    alt: ['dispos'],
    description: '',
    
    /**
    * @desc execution of the command
    * @param {Discord.Message} message 
    * @param {string[]} args 
    */
    execute: (message, args) => {
        if (!fs.existsSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id)) {
            fs.mkdirSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id);
        }
        if (!fs.existsSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + message.channel.id)) {
            fs.mkdirSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + message.channel.id);
        }
        if (!fs.existsSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + 'guildConfig.json')) {
            fs.writeFileSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + 'guildConfig.json', 
                '{ "channels": [ { "id": ' + message.channel.id + ', "defaults": ["18","20","21","22","23"], "active": [], "timeout": 24 } ] }');
        }

        let config = JSON.parse(fs.readFileSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + 'guildConfig.json'));

        let currentChannelIndex = -1;
        while(currentChannelIndex == -1) {
            for (let i = (config.channels.length - 1); i >= 0; i--) {
                if (config.channels[i].id == message.channel.id) {
                    currentChannelIndex = i;
                }
            }
            if (currentChannelIndex == -1) {
                config.channels.push({
                    id: message.channel.id,
                    defaults: config.channels[0].defaults,
                    active: [],
                    timeout: config.channels[0].timeout
                });
            }
        }

        let times = config.channels[currentChannelIndex].defaults;

        if(!message.guild.me.permissionsIn(message.channel).has([Discord.Permissions.FLAGS.SEND_MESSAGES, Discord.Permissions.FLAGS.EMBED_LINKS, Discord.Permissions.FLAGS.ADD_REACTIONS, Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY])) {
            message.channel.send('I don\'t have the permissions, I need for this command!\nPlease make sure to give me at least the following permissions:\n```Required permissions:\n  SEND MESSAGES\n  EMBED LINKS\n  ADD REACTIONS\n  READ MESSAGE HISTORY\n\nOptional, but useful for the full functionality:\n  MANAGE MESSAGES```');
            return;
        }

        for (let time of times) {
            let timeFormat = '24';
            let rawTime = time;
            let clockDiscriminator = '';
            if (/^(?:(?:0?[0-9]|1[0-2])(:[0-5][0-9])?[aApP][mM])$/.test(time)) {
                timeFormat = '12';
                rawTime = time.substring(0, time.length - 2);
                clockDiscriminator = time.replace(/\d+/g, '').replace(/:/g, '').toUpperCase();
            }

            let colorCode = getRandomColor(((timeFormat == 24 ? (rawTime.replace(/:/g, '.')) : (clockDiscriminator == 'PM' ? (rawTime.replace(/:/g, '.')) * 2 : (rawTime.replace(/:/g, '.')))) + new Date().getDate()), message.guild, message.channel);
            let scheduleEmbed = new Discord.MessageEmbed()
                .setColor(colorCode)
                .setTitle('**Dispos ' + (rawTime + ' ' + clockDiscriminator).trim() + 'h**');

            message.channel
                .send({ embeds: [scheduleEmbed] })
                .then(newMessage => {
                    fs.writeFile(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + message.channel.id + process.env.DIR_SPLIT 
                        + newMessage.id + '.json', '{ "time": "' + time + '", "rawTime": "' + rawTime + '", "clockDiscriminator": "' + clockDiscriminator + '", "format": "' + timeFormat + '", "CAN": [], "CANT": [], "SUB": [], "NOTSURE": [], "DROPPED": [] }', (err) => { if (err) console.log(err); });
                    for (let i = (config.channels[currentChannelIndex].active.length - 1); i >= 0; i--) {
                        if (config.channels[currentChannelIndex].active[i].time == time || 
                            ((new Date().getTime() - new Date(config.channels[currentChannelIndex].active[i].created).getTime()) / (1000 * 3600)) > config.channels[currentChannelIndex].timeout) {
                                config.channels[currentChannelIndex].active.splice(i, 1);
                                i = (config.channels[currentChannelIndex].active.length);
                        }
                    }
                    config.channels[currentChannelIndex].active.push({ 
                        id: newMessage.id, 
                        time: time, 
                        created: new Date() });
                    
                    newMessage.react('✅').then(() => newMessage.react('❕')).then(() => newMessage.react('❔')).then(() => newMessage.react('❌'));
                })
                .then(() => fs.writeFileSync(process.env.DIR_WORKING + process.env.DIR_SPLIT + 'scheduleTemp' + process.env.DIR_SPLIT + message.guild.id + process.env.DIR_SPLIT + 'guildConfig.json', JSON.stringify(config)))
                
        }
    }
}