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

    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    });

    client.once("ready", () => {
      console.log(`${botName} is ready.`);
    });

    client.on("messageCreate", (message) => {
      if (message.content === `${config.prefix || "!"}ping`) {
        message.reply("pong");
      }
    });

    try {
      await client.login(config.token);
      clients[botName] = client;
    } catch (err) {
      console.error(`Failed to login ${botName}:`, err);
    };
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