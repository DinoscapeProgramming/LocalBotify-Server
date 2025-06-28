const { fork } = require("child_process");

const botsPerCluster = 15;
const clusters = new Map();
let clusterIdCounter = 0;

function chunkBots(botList, size) {
  const entries = Object.entries(botList);
  const chunks = [];

  for (let i = 0; i < entries.length; i += size) {
    const chunk = Object.fromEntries(entries.slice(i, i + size));
    chunks.push(chunk);
  };

  return chunks;
};

function spawnCluster(botGroup) {
  const clusterId = `cluster_${++clusterIdCounter}`;
  const child = fork("./cluster.js");
  const botNames = Object.keys(botGroup);
  clusters.set(clusterId, { child, botNames });

  child.send({ type: "start", bots: botGroup });

  child.on("message", (msg) => {
    if (msg.type === 'ready') {
      console.log(`[${clusterId}] is ready.`);
    } else if (msg.type === 'botStopped') {
      console.log(`[${clusterId}] Bot ${msg.botName} stopped.`);
    } else if (msg.type === 'stopped') {
      console.log(`[${clusterId}] Stopped.`);
      child.kill();
      clusters.delete(clusterId);
    };
  });

  return clusterId;
};

function stopBot(botName) {
  for (const [clusterId, { child, botNames }] of clusters.entries()) {
    if (botNames.includes(botName)) {
      child.send({ type: "stopBot", botName });
      clusters.set(clusterId, {
        child,
        botNames: botNames.filter(name => name !== botName),
      });

      return true;
    };
  };

  console.log(`Bot ${botName} not found.`);
  return false;
};

function addBots(newBots) {
  let currentCluster = [...clusters.entries()].pop();
  let remaining = { ...newBots };

  if (currentCluster && currentCluster[1].botNames.length < botsPerCluster) {
    const room = botsPerCluster - currentCluster[1].botNames.length;
    const entries = Object.entries(remaining);
    const toAdd = Object.fromEntries(entries.slice(0, room));
    const leftover = Object.fromEntries(entries.slice(room));

    currentCluster[1].child.send({ type: "addBots", bots: toAdd });
    clusters.set(currentCluster[0], {
      child: currentCluster[1].child,
      botNames: [...currentCluster[1].botNames, ...Object.keys(toAdd)],
    });

    if (Object.keys(leftover).length > 0) addBots(leftover);
  } else {
    const newChunk = Object.fromEntries(Object.entries(remaining).slice(0, botsPerCluster));
    const rest = Object.fromEntries(Object.entries(remaining).slice(botsPerCluster));
    spawnCluster(newChunk);
    if (Object.keys(rest).length > 0) addBots(rest);
  };
};

function init(botBasket) {
  if (!botBasket || !Object.keys(botBasket).length) return;

  const botChunks = chunkBots(botBasket, botsPerCluster);
  botChunks.forEach(spawnCluster);

  return {
    stopBot,
    addBots,
  };
}

module.exports = init;