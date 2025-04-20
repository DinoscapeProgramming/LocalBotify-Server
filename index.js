require("@teeny-tiny/dotenv").config();
const express = require("express");
const app = express();
const pantry = require("pantry-node");
const pantryClient = new pantry(process.env.PANTRY_ID);

pantryClient.basket.get("proTokens").then(() => {
  pantryClient.basket.create("proTokens", []);
});

pantryClient.basket.get("bots").then(() => {
  pantryClient.basket.create("bots", {
    version: "1"
  });
});

app.use(express.json());
app.set("views", __dirname);
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));
app.use("/pages", express.static("pages"));

app.post("/api/v1/pro/verify", (req, res) => {
  pantryClient.basket.get("proTokens", {
    parseJSON: true
  }).then((proTokens) => {
    res.json(proTokens.includes(req.body));
  });
});

app.all("/bots/:botId", (req, res) => {
  pantryClient.basket.get("bots", {
    parseJSON: true
  }).then(({ version, [req.params.botId]: bot }) => {
    if (version === "1") {
      if (!bot) return res.status(404).send("Bot not found");
      res.render("pages/bot/index.ejs", {
        name: bot[1],
        description: bot[2],
        stats: [
          bot[3],
          bot[4],
          bot[5]
        ],
        invite: bot[6],
        features: bot.slice(7)
      });
    };
  });
});

app.post("/api/v1/bots/add", (req, res) => {
  let bot = req.body;

  pantryClient.basket.get("proTokens", {
    parseJSON: true
  }).then((proTokens) => {
    if (!proTokens.includes(bot[0])) return res.status(400).json({
      err: "Invalid pro token",
      message: null
    });

    if ((JSON.stringify(Array.from(new Set([
      ...[
        typeof bot[1],
        typeof bot[2],
        typeof bot[6]
      ],
      ...bot.slice(7).map((feature) => typeof feature)
    ]))) !== `["string"]`) || (JSON.stringify(Array.from(new Set([
      typeof bot[3],
      typeof bot[4],
      typeof bot[5]
    ]))) !== `["number"]`) || (bot.slice(7).length > 30) || ((bot.slice(7).length % 3) !== 0) || [
      20,
      100,
      10,
      10,
      10,
      50
    ].map((length, index) => bot[index].length > length).includes(true) || bot.slice(7).map((feature, index) => feature.length > [
      20,
      20,
      100
    ][index % 3])) return res.status(400).json({
      err: "Invalid input data",
      message: null
    });

    try {
      new URL(bot[6]);
    } catch {
      return res.status(400).json({
        err: "Invalid input data",
        message: null
      });
    };

    pantryClient.basket.update("bots", bot, {
      parseJSON: true
    }).then(() => {
      res.status(200).json({
        err: null,
        message: "Success"
      });
    });
  });
});

const listen = app.listen(3000, () => {
  console.log("Server is now ready on port", listen.address().port);
});