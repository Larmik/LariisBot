const Firebase = require("../modules/FirebaseModule");
let client = null;

async function handleFirebaseEvent() {
  const channel = client.channels.cache.find(
    (channel) => channel.id === process.env.CHANNEL_ID
  );
  Firebase.handleDispos(channel, 0);
  Firebase.handleDispos(channel, 1);
  Firebase.handleDispos(channel, 2);
  Firebase.handleDispos(channel, 3);
  Firebase.handleDispos(channel, 4);

}

module.exports = {
  Initialize: (discordClient) => {
    client = discordClient;
    client.on("ready", handleFirebaseEvent);
  },
};