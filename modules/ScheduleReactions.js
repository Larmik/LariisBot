const Discord = require('discord.js');
const Schedule = require('./WarScheduling');


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
            }
            catch (error) {
                return;
            }
        }
        switch(reaction.emoji.name) {
            case '✅':
                Schedule.addCan(reaction.message, user);
                break;
            case '❌':
                Schedule.addCant(reaction.message, user);
                break;
            case '❕':
                Schedule.addSub(reaction.message, user);
                break;
            case '❔':
                Schedule.addNotSure(reaction.message, user);
                break;
            case '♿':
                Schedule.removeEntry(reaction.message, user);
                break;
        }
    }
}