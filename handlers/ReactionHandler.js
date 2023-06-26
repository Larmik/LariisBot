const Schedule = require('../modules/ReactionModule');
let client = null;

async function handleReactions(reaction, user) {
    if (reaction.partial) {
        try { await reaction.fetch(); } catch (error) { }
    }
    if (!user.bot && user.id != process.env.BOT_ID && reaction.message.author.id == process.env.BOT_ID) {
        if (reaction.message.embeds && reaction.message.embeds[0] && reaction.message.embeds[0].title.startsWith('**Dispos')) {
            client.users
            .fetch(user.id, {cache: true})
            .then((loadedUser) => {
                Schedule.HandleReaction(reaction, loadedUser);
                try { reaction.users.remove(loadedUser.id); } catch (error) { }
            });
        }    
    }
}

module.exports = {
    Initialize: (discordClient) => {
        client = discordClient;
        client.on('messageReactionAdd', handleReactions);
    }
}