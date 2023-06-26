const fs = require("fs");
const ReactionHandler = require("./ReactionHandler");
const FirebaseHandler = require("./FirebaseHandler");
let client = null;

module.exports = {
  Initialize: (discordClient) => {
    client = discordClient;
    if (!fs.existsSync(process.env.MESSAGES_ID_DIR_PATH)) {
      fs.mkdir(process.env.MESSAGES_ID_DIR_PATH, { recursive: true }, (err) => { });
    } 
    client.once("ready", () => {
      client.user.setActivity("les dispos de la HR");
    });
    client.on("invalidated", () => {
      client.login(process.env.CLIENT_TOKEN);
    });
    ReactionHandler.Initialize(discordClient);
    FirebaseHandler.Initialize(discordClient);
  }, Login: () => {
    if (client != null) {
      client.login(process.env.CLIENT_TOKEN);
    }
  },
};
