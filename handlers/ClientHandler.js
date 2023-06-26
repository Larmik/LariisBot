const fs = require("fs");
const ReactionHandler = require("./ReactionHandler");
const FirebaseHandler = require("./FirebaseHandler");
let client = null;

module.exports = {
  Initialize: (discordClient) => {
    client = discordClient;
    if (!fs.existsSync(process.env.MESSAGES_ID_DIR_PATH)) {
      fs.mkdir(process.env.MESSAGES_ID_DIR_PATH, { recursive: true }, (err) => { console.log(err) });
    } 
    client.once("ready", () => {
      console.log("Login success");
      client.user.setActivity("les dispos de la HR");
    });
    client.on("invalidated", () => {
      console.log("Connection closed");
      client.login(process.env.CLIENT_TOKEN);
    });
    process.on("unhandledRejection", (error) => {
      console.log(error);
    });
    ReactionHandler.Initialize(discordClient);
    FirebaseHandler.Initialize(discordClient);
  }, Login: () => {
    if (client != null) {
      client.login(process.env.CLIENT_TOKEN);
    }
  },
};
