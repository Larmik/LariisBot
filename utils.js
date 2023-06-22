require('dotenv').config();
const { verifyKey } = require('discord-interactions');

module.exports = {
    VerifyDiscordRequest: (clientKey) => {
        return function (req, res, buf, encoding) {
            const signature = req.get('X-Signature-Ed25519');
            const timestamp = req.get('X-Signature-Timestamp');
            const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
            if (!isValidRequest) {
              res.status(401).send('Bad request signature');
              throw new Error('Bad request signature');
            }
          };
    }

}


