const Firebase = require("./FirebaseModule");

module.exports = {
  HandleReaction: (reaction, user) => {
    if (reaction.partial) {
      try {
        reaction.fetch();
      } catch (error) {
        return;
      }
    }
    Firebase.writeDispos(reaction, user);
  },
};
