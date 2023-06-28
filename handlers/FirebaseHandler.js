const Firebase = require("../modules/FirebaseModule");
let client = null;

async function handleFirebaseEvent() {
  const channel = client.channels.cache.find(
    (channel) => channel.id === process.env.CHANNEL_ID
  );
  Firebase.createFile(channel);
  Firebase.handleDispos(channel, 0, false);
  Firebase.handleDispos(channel, 1, false);
  Firebase.handleDispos(channel, 2, false);
  Firebase.handleDispos(channel, 3, false);
  Firebase.handleDispos(channel, 4, true);

}

module.exports = {
  Initialize: (discordClient) => {
    client = discordClient;
    client.on("ready", handleFirebaseEvent);
  },
};