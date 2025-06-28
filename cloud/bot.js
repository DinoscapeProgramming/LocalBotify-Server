global.isLocalBotify = (require("path").basename(require("path").join(process.cwd(), "..")) === "bots");
global.isPackaged = (global.isLocalBotify) ? require("fs").existsSync(require("path").join(process.cwd(), "../../resources/app.asar.unpacked/node_modules")) : null;
global.importCore = (global.isLocalBotify) ? ((module) => import((require("module").builtinModules.includes(module)) ? module : require("path").join(process.cwd(), (global.isPackaged) ? "../../resources/app.asar.unpacked/node_modules" : "../../node_modules", module, JSON.parse(require("fs").readFileSync(require("path").join(process.cwd(), (global.isPackaged) ? "../../resources/app.asar.unpacked/node_modules" : "../../node_modules", module, "package.json"), "utf8") || "{}").main || "index.js"))) : ((module) => import(module));
global.requireCore = (global.isLocalBotify) ? ((module) => require((require("module").builtinModules.includes(module)) ? module : require("path").join(process.cwd(), (global.isPackaged) ? "../../resources/app.asar.unpacked/node_modules" : "../../node_modules", module, JSON.parse(require("fs").readFileSync(require("path").join(process.cwd(), (global.isPackaged) ? "../../resources/app.asar.unpacked/node_modules" : "../../node_modules", module, "package.json"), "utf8") || "{}").main || "index.js"))) : require;

module.exports = async (config) => {
  requireCore("@teeny-tiny/dotenv").config({ raw: await require("./trackers/decrypt.js")() });
  const updateStatus = require("./trackers/status.js");
  const updateStatistics = require("./trackers/statistics.js");
  const fs = require("fs");
  const { REST, Routes, Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType, EmbedBuilder } = requireCore("discord.js");
  const rest = new REST({ ...{ version: "10" }, ...(JSON.parse(fs.readFileSync("./config.json", "utf8") || "{}").proxy) ? { api: JSON.parse(fs.readFileSync("./config.json", "utf8") || "{}").proxy } : {} }).setToken(process.env.TOKEN);
  const SyncStore = requireCore("syncstore.json");
  const db = new SyncStore("./store.json");
  const categories = require("./data/categories.json");
  const PERMISSIONS = require("./data/permissions.json");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent
    ] // --> remember to activate intents in the developer portal settings too!
  });

  if (config.proxy) (client.rest = rest);

  client.once("ready", () => {
    fs.writeFileSync("./channels/invite.txt", `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot${(config.slashCommands) ? "+applications.commands" : ""}&permissions=${Array.from(new Set([
      ...[
        "VIEW_CHANNEL",
        "SEND_MESSAGES"
      ],
      ...fs.readdirSync("./commands").map((command) => require("./commands/" + command)).filter(({ permissions }) => permissions).map(({ permissions }) => permissions),
      ...fs.readdirSync("./events").map((event) => require("./events/" + event)).filter(({ permissions }) => permissions).map(({ permissions }) => permissions),
    ].flat())).reduce((accumulator, permission) => accumulator | PERMISSIONS[permission], 0).toString()}`, "utf8");

    const lines = [
      `🤖  ${client.user.username + ((/(?:\p{Emoji}(?:\p{Emoji_Modifier}|\uFE0F)?(?:\u200D\p{Emoji})*)/gu.test(Array.from(client.user.username).at(-1)) && !/^[0-9]$|[.*+?^${}()|[\]\\]/.test(Array.from(client.user.username).at(-1))) ? " " : "")} is online!`,
      `🚀  Ready to serve your server!`,
      `🔗  Invite Link:`,
      fs.readFileSync("./channels/invite.txt", "utf8") || ""
    ];

    const boxWidth = Math.max(...lines.map(line => line.length)) + 4;
    const horizontal = "═".repeat(boxWidth);

    const hasEmoji = (text) => {
      const emojiRegex = /(?:\p{Emoji}(?:\p{Emoji_Modifier}|\uFE0F)?(?:\u200D\p{Emoji})*)/gu;
      const numberOrSpecialCharacterRegex = /^[0-9]$|[.*+?^${}()|[\]\\]/;
      return Array.from(text).map((character) => emojiRegex.test(character) && !numberOrSpecialCharacterRegex.test(character)).includes(true);
    };

    const center = (text) => {
      const totalPadding = boxWidth - text.length;
      const left = Math.ceil(totalPadding / 2);
      const right = Math.floor(totalPadding / 2);
      return "║" + " ".repeat(left) + text + " ".repeat(right + Array.from(text).filter((character) => hasEmoji(character)).length) + "║";
    };

    console.log("\x1b[38;2;108;160;220m", `
╔${horizontal}╗
${lines.map(center).join("\n")}
╚${horizontal}╝`, "\x1b[0m");

    updateStatus("online");
    updateStatistics(client);

    client.user.setPresence({
      status: PresenceUpdateStatus[config?.status?.[0] || "Online"],
      activities: [
        {
          type: ActivityType[config?.status?.[1]],
          name: config?.status?.[2].replace(/\{(.*?)\}/g, (_, expression) => eval(expression))
        }
      ]
    });

    rest.put(
      Routes.applicationCommands(client.user.id),
      { body: (config.slashCommands ?? true) ? fs.readdirSync("./commands").map((command) => [command.substring(0, command.length - 3), require("./commands/" + command)]).filter(([_, { slashCommand }]) => slashCommand).map(([name, { description, slashCommand }]) => slashCommand.setName(name).setDescription(description || "")) : [] }
    );

    fs.watch("./config.json", (eventType) => {
      if (eventType !== "change") return;

      let previousConfig = config;

      if (JSON.stringify(config.status) !== JSON.stringify(previousConfig.status)) {
        try {
          client.user.setPresence({
            status: PresenceUpdateStatus[config?.status?.[0] || "Online"],
            activities: [
              {
                type: ActivityType[config?.status?.[1]],
                name: config?.status?.[2].replace(/\{(.*?)\}/g, (_, expression) => eval(expression))
              }
            ]
          });
        } catch {};
      };

      if (config.slashCommands !== previousConfig.slashCommands) {
        fs.readdirSync("./commands").forEach((command) => {
          delete require.cache[require.resolve("./commands/" + command)];
        });

        rest.put(
          Routes.applicationCommands(client.user.id),
          { body: (config.slashCommands ?? true) ? fs.readdirSync("./commands").map((command) => [command.substring(0, command.length - 3), require("./commands/" + command)]).filter(([_, { slashCommand }]) => slashCommand).map(([name, { description, slashCommand }]) => slashCommand.setName(name).setDescription(description || "")) : [] }
        );
      };
    });
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith(db[message.guild.id]?.prefix || config.prefix)) return;

    let command = message.content.toLowerCase();
    let commandName = command.substring((db[message.guild.id]?.prefix || config.prefix).length).split(" ")[0];

    try {
      if (db[message.guild.id]?.disabledFeatures?.includes("all")) return message.channel.send({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("⚠️  Command Disabled")
            .setDescription("All commands are currently disabled in this server.")
            .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ]
      });

      if (db[message.guild.id]?.disabledFeatures?.includes(commandName)) return message.channel.send({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("⚠️  Command Disabled")
            .setDescription(`The command \`${commandName}\` is currently disabled in this server.`)
            .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ]
      });

      if (db[message.guild.id]?.disabledFeatures?.includes(Object.entries(categories || {}).find(([_, commands]) => commands.includes(commandName))[0].replace(/^[^\w]+/, "").trim().toLowerCase())) return message.channel.send({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("⚠️  Command Disabled")
            .setDescription(`All commands in the category \`${Object.entries(categories || {}).find(([_, commands]) => commands.includes(commandName))[0].replaceAll("  ", " ")}\` are currently disabled in this server.`)
            .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
            .setTimestamp()
        ]
      });
    } catch {};

    if (fs.readdirSync("./commands").includes(`${commandName}.js`)) {
      delete require.cache[require.resolve(`./commands/${commandName}.js`)];
      const commandFile = require(`./commands/${commandName}.js`);

      if (!Array.from(new Set([...["VIEW_CHANNEL", "SEND_MESSAGES"], ...commandFile.permissions])).every((permission) => message.channel.permissionsFor(message.channel.guild.members.me).has(permission.split("_").map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase()).join("")))) {
        try {
          return await message.channel.send({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("⚠️  Missing Permissions")
                .setDescription(`I don't have the required permissions to execute the command \`${commandName}\` in this channel. Please ensure I have the following permissions: \`\`\`diff\n+ ${Array.from(new Set([...["VIEW_CHANNEL", "SEND_MESSAGES"], ...commandFile.permissions])).map((permission) => permission.split("_").map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase()).join("")).filter((permission) => !message.channel.permissionsFor(message.channel.guild.members.me).has(permission)).join("\n+ ")}\n\`\`\``)
                .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
            ]
          });
        } catch {};
      };

      message.respond = async (...args) => {
        try {
          return await message.channel.send(...args);
        } catch {};
      };

      message.reject = async (error) => {
        try {
          return await message.channel.send({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("⚠️  Error")
                .setDescription(`An error occurred while executing the command \`${commandName}\`\n\`\`\`${error.message || error || "Internal Server Error"}\`\`\``)
                .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
            ]
          });
        } catch {};
      };

      if (!db[message.guild.id]) (db[message.guild.id] = {});
      message.store = db[message.guild.id];

      try {
        commandFile.command({
          ...{
            footer: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)) || "Powered by LocalBotify.app"
          },
          ...Object.fromEntries(Object.entries(commandFile.variables || {}).map(([variableName, { default: defaultValue = null } = {}] = []) => [
            variableName,
            config?.variables?.commands?.[commandName]?.[variableName] ?? defaultValue
          ]))
        }, client, message);
      } catch (error) {
        try {
          message.channel.send({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("⚠️  Error")
                .setDescription(`An error occurred while executing the command \`${commandName}\`\n\`\`\`${error.message || error || "Internal Server Error"}\`\`\``)
                .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
            ]
          });
        } catch {};
      };

      if ((db[message.guild.id].constructor === Object) && !Object.keys(db[message.guild.id]).length) delete db[message.guild.id];

      fs.writeFileSync("./channels/messages.txt", (Number(fs.readFileSync("./channels/messages.txt", "utf8") || "0") + 1).toString(), "utf8");

      const commands = fs.readFileSync("./channels/commands.txt", "utf8").split("\n").filter((line) => line).map((line) => {
        const [key, value] = line.split(":").map((part) => part.trim());
        return [key.toLowerCase(), Number(value)];
      });
      const commandCount = commands.find(([key]) => key === commandName)?.[1] || 0;
      const updatedCommands = commands.filter(([key]) => key !== commandName).concat([[commandName, commandCount + 1]]);
      fs.writeFileSync("./channels/commands.txt", updatedCommands.map(([key, value]) => `${key}: ${value}`).join("\n"), "utf8");
    };
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.user.bot) return;

    let commandName = interaction.commandName;

    try {
      if (db[interaction.guild.id]?.disabledFeatures?.includes("all")) return interaction.reply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("⚠️  Command Disabled")
            .setDescription("All commands are currently disabled in this server.")
            .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        ]
      });

      if (db[interaction.guild.id]?.disabledFeatures?.includes(commandName)) return interaction.reply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("⚠️  Command Disabled")
            .setDescription(`The command \`${commandName}\` is currently disabled in this server.`)
            .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        ]
      });

      if (db[interaction.guild.id]?.disabledFeatures?.includes(Object.entries(categories || {}).find(([_, commands]) => commands.includes(commandName))[0].replace(/^[^\w]+/, "").trim().toLowerCase())) return interaction.reply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("⚠️  Command Disabled")
            .setDescription(`All commands in the category \`${Object.entries(categories || {}).find(([_, commands]) => commands.includes(commandName))[0].replaceAll("  ", " ")}\` are currently disabled in this server.`)
            .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()
        ]
      });
    } catch {};

    if (fs.readdirSync("./commands").includes(`${commandName}.js`)) {
      delete require.cache[require.resolve(`./commands/${commandName}.js`)];
      const commandFile = require(`./commands/${commandName}.js`);

      if (!Array.from(new Set([...["VIEW_CHANNEL", "SEND_MESSAGES"], ...commandFile.permissions])).every((permission) => interaction.channel.permissionsFor(interaction.channel.guild.members.me).has(permission.split("_").map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase()).join("")))) {
        try {
          return await interaction.reply({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("⚠️  Missing Permissions")
                .setDescription(`I don't have the required permissions to execute the command \`${commandName}\` in this channel. Please ensure I have the following permissions: \`\`\`diff\n+ ${Array.from(new Set([...["VIEW_CHANNEL", "SEND_MESSAGES"], ...commandFile.permissions])).map((permission) => permission.split("_").map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase()).join("")).filter((permission) => !interaction.channel.permissionsFor(interaction.channel.guild.members.me).has(permission)).join("\n+ ")}\n\`\`\``)
                .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            ]
          });
        } catch {};
      };
      
      interaction.respond = async (...args) => {
        try {
          return await interaction.reply(...args);
        } catch {};
      };

      interaction.reject = async (error) => {
        try {
          return await interaction.reply({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("⚠️  Error")
                .setDescription(`An error occurred while executing the command \`${commandName}\`\n\`\`\`${error.message || error || "Internal Server Error"}\`\`\``)
                .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
            ]
          });
        } catch {};
      };

      if (!db[interaction.guild.id]) (db[interaction.guild.id] = {});
      interaction.store = db[interaction.guild.id];

      try {
        commandFile.command({
          ...{
            footer: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)) || "Powered by LocalBotify.app"
          },
          ...Object.fromEntries(Object.entries(commandFile.variables || {}).map(([variableName, { default: defaultValue = null } = {}] = []) => [
            variableName,
            config?.variables?.commands?.[commandName]?.[variableName] ?? defaultValue
          ]))
        }, client, interaction);
      } catch (error) {
        try {
          interaction.reply({
            content: null,
            embeds: [
              new EmbedBuilder()
                .setColor(0xff0000)
                .setTitle("⚠️  Error")
                .setDescription(`An error occurred while executing the command \`${commandName}\`\n\`\`\`${error.message || error || "Internal Server Error"}\`\`\``)
                .setFooter({ text: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)), iconURL: message.author.displayAvatarURL() })
                .setTimestamp()
            ]
          });
        } catch {};
      };

      if ((db[interaction.guild.id].constructor === Object) && !Object.keys(db[interaction.guild.id]).length) delete db[interaction.guild.id];

      fs.writeFileSync("./channels/messages.txt", (Number(fs.readFileSync("./channels/messages.txt", "utf8") || "0") + 1).toString(), "utf8");

      const commands = fs.readFileSync("./channels/commands.txt", "utf8").split("\n").filter((line) => line).map((line) => {
        const [key, value] = line.split(":").map((part) => part.trim());
        return [key.toLowerCase(), Number(value)];
      });
      const commandCount = commands.find(([key]) => key === commandName)?.[1] || 0;
      const updatedCommands = commands.filter(([key]) => key !== commandName).concat([[commandName, commandCount + 1]]);
      fs.writeFileSync("./channels/commands.txt", updatedCommands.map(([key, value]) => `${key}: ${value}`).join("\n"), "utf8");
    };
  });

  client.on("guildCreate", () => updateStatistics(client));
  client.on("guildMemberAdd", () => updateStatistics(client));

  fs.readdirSync("./events").forEach((event) => {
    if (!event.endsWith(".js")) return;

    client.on(event.substring(0, event.length - 3).replace(/[^A-Za-z]/g, ""), (...args) => {
      delete require.cache[require.resolve(`./events/${event}`)];
      const eventFile = require(`./events/${event}`);

      const guildId = (["guildCreate", "guildDelete", "guildUnavailable", "guildUpdate"].includes(event.substring(0, event.length - 3))) ? event.id : args.find((argument) => argument.guild?.id || argument.guildId)?.guild?.id || args.find((argument) => argument.guildId)?.guildId

      if (guildId) {
        if (!db[guildId]) (db[guildId] = {});
        args[0].store = db[guildId];
      };

      try {
        eventFile.event({
          ...{
            footer: config.footer.replace(/\{(.*?)\}/g, (_, expression) => eval(expression)) || "Powered by LocalBotify.app"
          },
          ...Object.fromEntries(Object.entries(eventFile.variables || {}).map(([variableName, { default: defaultValue = null } = {}] = []) => [
            variableName,
            config?.variables?.events?.[event.substring(0, event.length - 3)]?.[variableName] ?? defaultValue
          ]))
        }, client, ...args);
      } catch {};

      if (guildId && (db[guildId].constructor === Object) && !Object.keys(db[guildId]).length) delete db[guildId];

      const events = fs.readFileSync("./channels/events.txt", "utf8").split("\n").filter((line) => line).map((line) => {
        const [key, value] = line.split(":").map((part) => part.trim());
        return [key.toLowerCase(), Number(value)];
      });
      const eventCount = events.find(([key]) => key === event.substring(0, event.length - 3))?.[1] || 0;
      const updatedEvents = events.filter(([key]) => key !== event.substring(0, event.length - 3)).concat([[event.substring(0, event.length - 3), eventCount + 1]]);
      fs.writeFileSync("./channels/events.txt", updatedEvents.map(([key, value]) => `${key}: ${value}`).join("\n"), "utf8");
    });
  });

  client.login(process.env.TOKEN);

  return {
    client,
    updateConfig: (newConfig) => {
      config = newConfig;
    }
  };
};