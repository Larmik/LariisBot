const Firebase = require("../modules/FirebaseModule");
let client = null;

async function handleFirebaseEvent() {
  const channel = client.channels.cache.find(
    (channel) => channel.id === process.env.CHANNEL_ID
  );
  Firebase.handleDispos(channel);
}

module.exports = {
  Initialize: (discordClient) => {
    console.log("FirebaseHandler init...");
    client = discordClient;
    client.on("ready", handleFirebaseEvent);
  },
};