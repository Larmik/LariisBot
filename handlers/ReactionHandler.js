const Discord = require('discord.js');
const Schedule = require('../modules/ScheduleReactions');

let client = null;


/**
 * @param {Discord.MessageReaction|Discord.PartialMessageReaction} reaction 
 * @param {Discord.User|Discord.PartialUser} user 
 */
async function handleReactions(reaction, user) {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.log(error)
        }
    }

    if (!user.bot && user.id != process.env.BOT_ID && reaction.message.author.id == process.env.BOT_ID) {
        if (reaction.message.embeds && reaction.message.embeds[0] && reaction.message.embeds[0].title.startsWith('**Dispos')) {
            client.users.fetch(user.id, {cache: true})
            .then((loadedUser) => {
                Schedule.HandleReaction(reaction, loadedUser);
                try {
                    reaction.users.remove(loadedUser.id);
                } catch (error) {
                    console.log(error)
                }
            });
        }    
    }
}

module.exports = {
    Initialize: (discordClient) => {
        console.log('ReactionHandler init...');
        client = discordClient;
        if (client == null) throw "[REACTIONS] Client could not be loaded!";
        client.on('messageReactionAdd', handleReactions);
    }
}