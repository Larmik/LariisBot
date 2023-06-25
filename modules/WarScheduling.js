const fs = require("fs");

function getData(message) {
  let rawdata = fs.readFileSync(
    process.env.DIR_WORKING +
      process.env.DIR_SPLIT +
      process.env.GUILD_ID +
      process.env.DIR_SPLIT +
      process.env.CHANNEL_ID +
      process.env.DIR_SPLIT +
      message.id +
      ".json"
  );
  return JSON.parse(rawdata);
}

function writeData(message, data) {
  let rawdata = JSON.stringify(data);
  fs.writeFileSync(
    process.env.DIR_WORKING +
      process.env.DIR_SPLIT +
      process.env.GUILD_ID +
      process.env.DIR_SPLIT +
      process.env.CHANNEL_ID +
      process.env.DIR_SPLIT +
      message.id +
      ".json",
    rawdata
  );
}

function buildMessage(data) {
  let msgData = [];
  let canCount = 0;
  if (data.CAN.length > 0) {
    let canStr = "";
    data.CAN.forEach((item) => {
      if (canStr != "") {
        canStr += ", ";
      }
      canStr += item.name;
      canCount++;
    });
    msgData.push({ name: "✅ Can (" + data.CAN.length + ")", value: canStr });
  }
  if (data.SUB.length > 0) {
    let subStr = "";
    data.SUB.forEach((item) => {
      if (subStr != "") {
        subStr += ", ";
      }
      subStr += item.name;
      canCount++;
    });
    msgData.push({
      name: "❕Can sub (" + data.SUB.length + ")",
      value: subStr,
    });
  }
  if (data.NOTSURE.length > 0) {
    let notSureStr = "";
    data.NOTSURE.forEach((item) => {
      if (notSureStr != "") {
        notSureStr += ", ";
      }
      notSureStr += item.name;
    });
    msgData.push({
      name: "❔ Not sure (" + data.NOTSURE.length + ")",
      value: notSureStr,
    });
  }
  if (data.CANT.length > 0) {
    let cantStr = "";
    data.CANT.forEach((item) => {
      if (cantStr != "") {
        cantStr += ", ";
      }
      cantStr += item.name;
    });
    msgData.push({
      name: "❌ Can't (" + data.CANT.length + ")",
      value: cantStr,
    });
  }
  if (data.DROPPED.length > 0) {
    let droppedStr = "";
    data.DROPPED.forEach((item) => {
      if (droppedStr != "") {
        droppedStr += ", ";
      }
      droppedStr += item.name;
    });
    msgData.push({
      name: "❌ Dropped (" + data.DROPPED.length + ")",
      value: droppedStr,
    });
  }

  return {
    title:
      "**Dispos " +
      data.time +
      "h** " +
      (canCount >= 3 && canCount < 6
        ? "(+" + (6 - canCount).toString() + ")"
        : ""),
    fields: msgData,
  };
}

function getIndex(arr, id) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].id == id) {
      return i;
    }
  }
  return -1;
}

function removeFromData(data, user, para) {
  if (para.includes("CAN")) {
    let index = getIndex(data.CAN, user.id);
    if (index > -1) {
      data.CAN.splice(index, 1);
    }
  }
  if (para.includes("CANT")) {
    let index = getIndex(data.CANT, user.id);
    if (index > -1) {
      data.CANT.splice(index, 1);
    }
  }
  if (para.includes("SUB")) {
    let index = getIndex(data.SUB, user.id);
    if (index > -1) {
      data.SUB.splice(index, 1);
    }
  }
  if (para.includes("NOTSURE")) {
    let index = getIndex(data.NOTSURE, user.id);
    if (index > -1) {
      data.NOTSURE.splice(index, 1);
    }
  }
  if (para.includes("DROPPED")) {
    let index = getIndex(data.DROPPED, user.id);
    if (index > -1) {
      data.DROPPED.splice(index, 1);
    }
  }

  return data;
}

function getIsNew(data, userId) {
  return (
    getIndex(data.CAN, userId) == -1 &&
    getIndex(data.SUB, userId) == -1 &&
    getIndex(data.NOTSURE, userId) == -1 &&
    getIndex(data.CANT, userId) == -1 &&
    getIndex(data.DROPPED, userId) == -1
  );
}

function getExistingEntry(data, userId) {
  let index = getIndex(data.CAN, userId);
  if (index > -1) {
    return data.CAN[index];
  }
  index = getIndex(data.CANT, userId);
  if (index > -1) {
    return data.CANT[index];
  }
  index = getIndex(data.SUB, userId);
  if (index > -1) {
    return data.SUB[index];
  }
  index = getIndex(data.NOTSURE, userId);
  if (index > -1) {
    return data.NOTSURE[index];
  }
  index = getIndex(data.DROPPED, userId);
  if (index > -1) {
    return data.DROPPED[index];
  }

  return null;
}

function getIsDropped(data, userId) {
  if (getIndex(data.CAN, userId) != -1) {
    return true;
  } else if (getIndex(data.SUB, userId) != -1) {
    return true;
  } else if (getIndex(data.DROPPED, userId) != -1) {
    return true;
  } else if (
    getIndex(data.NOTSURE, userId) != -1 &&
    data.NOTSURE[getIndex(data.NOTSURE, userId)].dropped == true
  ) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  getMessage: (message) => {
    return buildMessage(getData(message));
  },

  addCan: (message, user, writeFb) => {
    let data = getData(message);
    if (getIndex(data.CAN, user.id) != -1) {
      return;
    }

    let newEntry = getIsNew(data, user.id);

    if (newEntry == true) {
      data.CAN.push({
        name: user.username,
        id: user.id,
        dropped: false,
        created: new Date().toString(),
        changed: new Date().toString(),
      });
    } else {
      let oldEntry = getExistingEntry(data, user.id);
      data = removeFromData(
        data,
        user,
        ["CANT", "SUB", "NOTSURE", "DROPPED"],
        message
      );
      data.CAN.push({
        name: user.username,
        id: user.id,
        dropped: false,
        created: oldEntry.created,
        changed: new Date().toString(),
      });
    }
    if (writeFb) {
      writeData(message, data);
    }

    message.edit({ embeds: [buildMessage(data)] });
  },

  addSub: (message, user, writeFb) => {
    let data = getData(message);

    if (getIndex(data.SUB, user.id) != -1) {
      return;
    }

    let newEntry = getIsNew(data, user.id);

    if (newEntry == true) {
      data.SUB.push({
        name: user.username,
        id: user.id,
        dropped: false,
        created: new Date().toString(),
        changed: new Date().toString(),
      });
    } else {
      let oldEntry = getExistingEntry(data, user.id);
      data = removeFromData(
        data,
        user,
        ["CANT", "CAN", "NOTSURE", "DROPPED"],
        message
      );

      data.SUB.push({
        name: user.username,
        id: user.id,
        dropped: false,
        created: oldEntry.created,
        changed: new Date().toString(),
      });
    }

    if (writeFb) {
      writeData(message, data);
    }
    message.edit({ embeds: [buildMessage(data)] });
  },

  addNotSure: (message, user, writeFb) => {
    let data = getData(message);

    if (getIndex(data.NOTSURE, user.id) != -1) {
      return;
    }

    let newEntry = getIsNew(data, user.id);
    let isDropped = getIsDropped(data, user.id);

    if (newEntry == true) {
      data.NOTSURE.push({
        name: user.username,
        id: user.id,
        dropped: false,
        created: new Date().toString(),
        changed: new Date().toString(),
      });
    } else {
      let oldEntry = getExistingEntry(data, user.id);
      data = removeFromData(
        data,
        user,
        ["CAN", "CANT", "SUB", "DROPPED"],
        message
      );

      if (
        (new Date().getTime() - new Date(oldEntry.created).getTime()) /
          (1000 * 60) >
        30
      ) {
        data.NOTSURE.push({
          name: user.username,
          id: user.id,
          dropped: isDropped,
          created: oldEntry.created,
          changed: new Date().toString(),
        });
      } else {
        data.NOTSURE.push({
          name: user.username,
          id: user.id,
          dropped: false,
          created: oldEntry.created,
          changed: new Date().toString(),
        });
      }
    }

    if (writeFb) {
      writeData(message, data);
    }
    message.edit({ embeds: [buildMessage(data)] });
  },

  addCant: (message, user, writeFb) => {
    let data = getData(message);

    if (
      getIndex(data.CANT, user.id) != -1 ||
      getIndex(data.DROPPED, user.id) != -1
    ) {
      return;
    }

    let newEntry = getIsNew(data, user.id);
    let isDropped = getIsDropped(data, user.id);

    if (newEntry == true) {
      data.CANT.push({
        name: user.username,
        id: user.id,
        dropped: false,
        created: new Date().toString(),
        changed: new Date().toString(),
      });
    } else {
      let oldEntry = getExistingEntry(data, user.id);
      data = removeFromData(data, user, ["CAN", "SUB", "NOTSURE"], message);

      if (
        (new Date().getTime() - new Date(oldEntry.created).getTime()) /
          (1000 * 60) >
        30
      ) {
        if (isDropped == true) {
          data.DROPPED.push({
            name: user.username,
            id: user.id,
            dropped: true,
            created: oldEntry.created,
            changed: new Date().toString(),
          });
        } else {
          data.CANT.push({
            name: user.username,
            id: user.id,
            dropped: false,
            created: oldEntry.created,
            changed: new Date().toString(),
          });
        }
      } else {
        data.CANT.push({
          name: user.username,
          id: user.id,
          dropped: false,
          created: oldEntry.created,
          changed: new Date().toString(),
        });
      }
    }

    if (writeFb) {
      writeData(message, data);
    }
    message.edit({ embeds: [buildMessage(data)] });
  },
  removeEntry: (message, user) => {
    let data = getData(message);
    data = removeFromData(
      data,
      user,
      ["CAN", "CANT", "SUB", "NOTSURE", "DROPPED"],
      message
    );
    writeData(message, data);
    message.edit({ embeds: [buildMessage(data)] });
  },
};
