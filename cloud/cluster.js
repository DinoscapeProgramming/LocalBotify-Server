const { Client, GatewayIntentBits } = require("discord.js");
let clients = {};

process.on("message", async (msg) => {
  if (msg.type === "start") {
    await startBots(msg.bots);
    process.send({ type: "ready" });
  };

  if (msg.type === "stopBot") {
    await stopBot(msg.botName);
  };

  if (msg.type === "addBots") {
    await startBots(msg.bots);
  };

  if (msg.type === "stop") {
    for (const client of Object.values(clients)) {
      await client.destroy();
    };

    clients = {};
    process.send({ type: "stopped" });
  };
});

async function startBots(bots) {
  for (const [botName, config] of Object.entries(bots)) {
    if (clients[botName]) continue;

    const { client } = await require("./cloud/bot.js")(config);

    clients[botName] = client;
  };
};

async function stopBot(botName) {
  const client = clients[botName];
  if (client) {
    await client.destroy();
    delete clients[botName];
    process.send({ type: "botStopped", botName });
  };

  if (Object.keys(clients).length === 0) {
    process.send({ type: "stopped" });
  };
};