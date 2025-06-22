Object.assign(process.env, require("fs").readFileSync(require("path").join(__dirname, ".env"), "utf8").split("\n").filter((line) => !line.startsWith("#") && (line.split("=").length > 1)).map((line) => line.trim().split("#")[0].split("=")).reduce((data, accumulator) => ({
  ...data,
  ...{
    [accumulator[0]]: JSON.parse(accumulator[1].trim())
  }
}), {}));
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});
const requestIp = require("request-ip");
const rateLimit = require("express-rate-limit");
const PantrySDK = require("pantry.js");
const pantry = new PantrySDK(process.env.PANTRY_ID);
const jwt = require("jsonwebtoken");
const proxy = require("express-http-proxy");
const fs = require("fs");
const crypto = require("crypto");

app.use(express.json());
app.use(requestIp.mw());
app.use(["/api/v1/store/add", "/api/v1/store/install", "/api/v1/store/like", "/api/v1/reports/add", "/api/v1/feedback/send"], rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
}));
app.use("/proxy", proxy("https://discord.com", {
  proxyReqPathResolver: (req) => req.originalUrl.replace("/proxy/api", "/api")
}));
app.set("views", __dirname);
app.set("view engine", "ejs");
app.use(express.static("pages/home"));
app.use(express.static("data"));
app.use("/assets", express.static("assets"));
app.use("/pages", express.static("pages"));
app.use("/packages", express.static("packages"));

async function initializeBaskets() {
  const store = await pantry.store; 
  const proTokens = await pantry.proTokens;
  const botSites = await pantry.botSites;
  const reports = await pantry.reports;
  const developerModeKeys = await pantry.developerModeKeys;

  if (!store.version) store.version = "1";
  if (!proTokens.proTokens) proTokens.proTokens = [];
  if (!botSites.version) botSites.version = "1";
  if (!reports.version) reports.version = "1";
  if (!developerModeKeys.developerModeKeys) developerModeKeys.developerModeKeys = [];
  
  proTokens.activity = Date.now();
  botSites.activity = Date.now();
  store.activity = Date.now();
  reports.activity = Date.now();
  developerModeKeys.activity = Date.now();

  setInterval(() => {
    proTokens.activity = Date.now();
    botSites.activity = Date.now();
    store.activity = Date.now();
    reports.activity = Date.now();
    developerModeKeys.activity = Date.now();
  }, 3600000);
}

if ((process.env.SAFE_MODE || "false") === "true") {
  try {
    initializeBaskets().catch(() => {});
  } catch {};
};

io.on("connection", (socket, name) => {
  socket.on("joinRoom", async (id) => {
    if ((typeof id !== "string") || (id.length < 1) || ["version", "activity"].includes(id) || !io.of("/").adapter.rooms.has(id)) return;

    socket.join(id);

    socket.to(id).emit("retrieveFileSystem");

    socket.on("retrieveFileContent", (fileName) => {
      socket.to(id).emit("retrieveFileContent", fileName);
    });

    socket.on("newFileSystem", ([fileAction, fileNames]) => {
      if (!["createFile", "createFolder", "delete", "rename"].includes(fileAction) || !Array.isArray(fileNames) || !fileNames.every((entry) => typeof entry === "string")) return;

      socket.to(id).emit("newFileSystem", [
        fileAction,
        fileNames
      ]);
    });

    socket.on("newFileContent", ([fileName, fileContent]) => {
      if ((typeof fileName !== "string") || (typeof fileContent !== "string")) return;

      socket.to(id).emit("newFileContent", [
        fileName,
        fileContent
      ]);
    });
  });

  socket.on("createRoom", () => {
    let id = crypto.randomUUID();

    socket.join(id);

    socket.emit("createRoom", id);

    socket.on("retrieveFileSystem", ([fileSystem, fileName, fileContent]) => {
      if (!Array.isArray(fileSystem) || !fileSystem.every((entry) => typeof entry === "string") || (typeof fileName !== "string") || (typeof fileContent !== "string")) return;

      socket.to(id).emit("retrieveFileSystem", [
        fileSystem,
        fileName,
        fileContent
      ]);
    });

    socket.on("retrieveFileContent", ([fileName, fileContent]) => {
      if (typeof fileName !== "string") return;

      socket.to(id).emit("retrieveFileContent", [
        fileName,
        fileContent
      ]);
    });

    socket.on("newFileSystem", (fileSystem) => {
      if (!Array.isArray(fileSystem) || !fileSystem.every((entry) => typeof entry === "string")) return;

      socket.to(id).emit("newFileSystem", fileSystem);
    });

    socket.on("newFileContent", ([fileName, fileContent]) => {
      if ((typeof fileName !== "string") || (typeof fileContent !== "string")) return;

      socket.to(id).emit("newFileContent", [
        fileName,
        fileContent
      ]);
    });

    socket.on("newLink", () => {
      socket.to(id).emit("newLink");
      io.in(id).socketsLeave(id);

      id = crypto.randomUUID();

      socket.join(id);
      socket.emit("newLink", id);
    });

    socket.on("disconnect", () => {
      io.in(id).fetchSockets().then((sockets) => {
        sockets.forEach((socket) => {
          socket.leave(id);
          socket.disconnect();
        });
      });
    });
  });
});

app.all("/", (req, res) => {
  res.sendFile("pages/home/index.html", {
    root: __dirname
  });
});

app.all("/ai", (req, res) => {
  res.sendFile("pages/ai/index.html", {
    root: __dirname
  });
});

app.all("/landingPage", (req, res) => {
  res.sendFile("pages/landingPage/index.html", {
    root: __dirname
  });
});

app.all("/sessions/:sessionId", (req, res) => {
  res.sendFile("pages/sessions/index.html", {
    root: __dirname
  });
});

app.all("/appLock", (req, res) => {
  res.sendFile("pages/appLock/index.html", {
    root: __dirname
  });
});

app.post("/api/v1/pro/generate-token", async (req, res) => {
  if (!req.body.proToken || (typeof req.body.proToken !== "string")) return res.status(400).json({ err: "Invalid input data", accessToken: null });

  const { proTokens } = await pantry.proTokens;
  const hashedToken = crypto.createHash("sha256").update(req.body.proToken).digest("hex");

  if (!proTokens.includes(hashedToken)) return res.status(400).json({ err: "Invalid input data", accessToken: null });

  res.json({
    err: null,
    accessToken: jwt.sign(
      {
        pro: true,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7)
      },
      fs.readFileSync("./private.pem", "utf8"),
      { algorithm: "RS256" }
    )
  });
});

/*app.all("/bots/:botId", async (req, res) => {
  const botSites = await pantry.botSites;
  const bot = botSites[req.params.botId];
  if (bot && botSites.version === "1") {
    res.render("pages/bot/index.ejs", {
      name: bot[1],
      description: bot[2],
      stats: [bot[3], bot[4], bot[5]],
      invite: bot[6],
      features: bot.slice(7)
    });
  } else {
    res.status(404).send({ err: "Bot not found" });
  }
});

app.post("/api/v1/bots/add", async (req, res) => {
  const bot = req.body;
  const proTokens = await pantry.proTokens;
  const isValidToken = proTokens.proTokens.includes(crypto.createHash("sha256").update(bot[0]).digest("hex"));
  
  if (!isValidToken) {
    return res.status(400).json({ err: "Invalid pro token" });
  }

  if (!["string"].some(type => !bot.slice(1, 7).every(val => typeof val === type)) ||
    bot.slice(7).length > 30 || (bot.slice(7).length % 3) !== 0 ||
    [20, 100, 10, 10, 10, 50].map((len, idx) => bot[idx].length > len).includes(true) ||
    bot.slice(7).some((feature, idx) => feature.length > [20, 20, 100][idx % 3])) {
    return res.status(400).json({ err: "Invalid input data" });
  }

  try {
    new URL(bot[6]);
  } catch {
    return res.status(400).json({ err: "Invalid repository URL" });
  }

  const botSites = await pantry.botSites;
  let id = Date.now();
  botSites[id] = [req.clientIp || null, ...bot.slice(1)];

  res.status(200).json({ id });
});*/

app.get("/api/v1/store/all", async (req, res) => {
  const store = await pantry.store;
  if (store.version === "1") {
    const responseData = {
      version: store.version,
      activity: store.activity,
      ...Object.fromEntries(Object.entries(store)
        .filter(([key]) => !["version", "activity"].includes(key))
        .sort((a, b) => b[1].verified - a[1].verified || b[1].installs - a[1].installs))
    };
    res.status(200).json(responseData);
  } else {
    res.status(400).json({ err: "Version mismatch" });
  }
});

app.post("/api/v1/store/add", async (req, res) => {
  const store = await pantry.store;
  const bot = req.body;

  if (![bot.avatar, bot.name, bot.description, bot.repository].every((val) => typeof val === "string") || !/(?:\p{Emoji}(?:\p{Emoji_Modifier}|\uFE0F)?(?:\u200D\p{Emoji})*)/gu.test(bot.avatar)) {
    return res.status(400).json({ err: "Invalid input data" });
  }

  try {
    let match = bot.repository.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/)?$/);
    if (!match) return res.status(400).json({ err: "Invalid repository URL" });

    let response = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`);
    if (response.status !== 200) return res.status(400).json({ err: "Invalid repository URL" });
  } catch (err) {
    return res.status(400).json({ err: err.message });
  }

  const id = Date.now();
  store[id] = [bot.avatar, bot.name, bot.description, bot.repository, false, 0, 0, [], []];

  res.status(200).json({ id });
});

app.post("/api/v1/store/install", async (req, res) => {
  const store = await pantry.store;
  const id = req.body.id;

  if (store.version === "1" && store[id]) {
    const installs = store[id][7];
    if (installs.includes(req.clientIp)) {
      return res.status(400).json({ err: "Already installed" });
    }

    store[id][5] = (store[id][5] || 0) + 1;
    store[id][7].push(req.clientIp);

    res.status(200).json({ id });
  } else {
    res.status(400).json({ err: "Version mismatch" });
  }
});

app.post("/api/v1/store/like", async (req, res) => {
  const store = await pantry.store;
  const id = req.body.id;

  if (store.version === "1" && store[id]) {
    const likes = store[id][8];
    if (likes.includes(req.clientIp)) {
      return res.status(400).json({ err: "Already liked" });
    }

    store[id][6] = (store[id][6] || 0) + 1;
    store[id][8].push(req.clientIp);

    res.status(200).json({ id });
  } else {
    res.status(400).json({ err: "Version mismatch" });
  }
});

app.post("/api/v1/reports/add", async (req, res) => {
  const reports = await pantry.reports;
  const report = req.body;

  if (!["version", "activity"].includes(report.id) && ["malicious", "tosViolation", "privacyAbuse", "broken", "misleading", "stolen", "other"].includes(report.reason) && typeof report.context === "string" && report.context.length <= 200) {
    reports[report.id] = reports[report.id] || [];
    reports[report.id].push([["malicious", "tosViolation", "privacyAbuse", "broken", "misleading", "stolen", "other"].indexOf(report.reason), report.context]);
    res.status(200).json({ message: "Success" });
  } else {
    res.status(400).json({ err: "Invalid input data" });
  }
});

app.post("/api/v1/developerMode/verify", async (req, res) => {
  const { developerModeKeys } = await pantry.developerModeKeys;
  const hashedToken = crypto.createHash("sha256").update(req.body.key).digest("hex");
  const isValid = developerModeKeys.includes(hashedToken);
  res.json(isValid);
});

app.all("/api/v1/feedback/send", (req, res) => {
  if ((typeof req.body.rating !== "number") || (req.body.rating < 0) || (req.body.rating > 5) || !req.body.user || (typeof req.body.user !== "string") || (req.body.user.length > 254) || ((typeof req.body.comment === "string") && req.body.comment.length > 1000)) return res.status(400).json({ err: "Invalid input data" });

  fetch(process.env.FEEDBACK_WEBHOOK, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      embeds: [
        {
          title: "📝 Feedback",
          color: 0x00b0f4,
          fields: [
            ...[
              {
                name: "Rating",
                value: `${"⭐".repeat(req.body.rating)} (${req.body.rating}/5)`,
                inline: true
              },
              {
                name: "User",
                value: req.body.user,
                inline: true
              }
            ],
            ...(req.body.comment) ? [
              {
                name: "Comment",
                value: req.body.comment
              }
            ] : []
          ],
          timestamp: new Date().toISOString()
        }
      ]
    })
  }).catch(() => {});
});

const listen = http.listen(3000, () => {
  console.log("Server is now ready on port", listen.address().port);
});