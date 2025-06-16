require("@teeny-tiny/dotenv").config();
const express = require("express");
const app = express();
const requestIp = require("request-ip");
const pantry = new (require("pantry-node"))(process.env.PANTRY_ID);
const basket = pantry.basket;
const crypto = require("crypto");

if ((process.env.SAFE_MODE || "false") === "true") {
  try {
    basket.get("proTokens").catch(() => {
      basket.create("proTokens", {
        proTokens: [],
        activity: 0
      }).catch(() => {});
    });
  } catch {
    basket.create("proTokens", {
      proTokens: [],
      activity: 0
    }).catch(() => {});
  };

  try {
    basket.get("botSites").catch(() => {
      basket.create("botSites", {
        version: "1",
        activity: Date.now()
      }).catch(() => {});
    });
  } catch {
    basket.create("botSites", {
      version: "1",
      activity: Date.now()
    }).catch(() => {});
  };

  try {
    basket.get("store").catch(() => {
      basket.create("store", {
        version: "1",
        activity: Date.now()
      }).catch(() => {});
    });
  } catch {
    basket.create("store", {
      version: "1",
      activity: Date.now()
    }).catch(() => {});
  };

  try {
    basket.get("reports").catch(() => {
      basket.create("reports", {
        version: "1",
        activity: Date.now()
      }).catch(() => {});
    });
  } catch {
    basket.create("reports", {
      version: "1",
      activity: Date.now()
    }).catch(() => {});
  };

  basket.get("proTokens").then((proTokens) => {
    basket.update("proTokens", {
      ...proTokens,
      ...{
        activity: Date.now()
      }
    }, {
      parseJSON: true
    }).catch(() => {});
  });

  basket.get("botSites").then((botSites) => {
    basket.update("botSites", {
      ...botSites,
      ...{
        activity: Date.now()
      }
    }, {
      parseJSON: true
    }).catch(() => {});
  });

  basket.get("store").then((store) => {
    basket.update("store", {
      ...store,
      ...{
        activity: Date.now()
      }
    }, {
      parseJSON: true
    }).catch(() => {});
  });

  basket.get("reports").then((reports) => {
    basket.update("reports", {
      ...reports,
      ...{
        activity: Date.now()
      }
    }, {
      parseJSON: true
    }).catch(() => {});
  });

  setInterval(() => {
    basket.get("proTokens").then((proTokens) => {
      basket.update("proTokens", {
        ...proTokens,
        ...{
          activity: Date.now()
        }
      }, {
        parseJSON: true
      }).catch(() => {});
    }).catch(() => {});
    
    basket.get("botSites").then((botSites) => {
      basket.update("botSites", {
        ...botSites,
        ...{
          activity: Date.now()
        }
      }, {
        parseJSON: true
      }).catch(() => {});
    }).catch(() => {});

    basket.get("store").then((store) => {
      basket.update("store", {
        ...store,
        ...{
          activity: Date.now()
        }
      }, {
        parseJSON: true
      }).catch(() => {});
    }).catch(() => {});

    basket.get("reports").then((reports) => {
      basket.update("reports", {
        ...reports,
        ...{
          activity: Date.now()
        }
      }, {
        parseJSON: true
      }).catch(() => {});
    }).catch(() => {});
  }, 3600000);
};

app.use(express.json());
app.use(requestIp.mw());
app.set("views", __dirname);
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"));
app.use("/pages", express.static("pages"));

app.post("/api/v1/pro/verify", (req, res) => {
  basket.get("proTokens", {
    parseJSON: true
  }).then(({ proTokens }) => {
    res.json(proTokens.includes(crypto.createHash("sha256").update(req.body).digest("hex")));
  }).catch(() => {});
});

app.all("/bots/:botId", (req, res) => {
  basket.get("botSites", {
    parseJSON: true
  }).then(({ version, [req.params.botId]: bot }) => {
    if (version === "1") {
      if (["version", "activity"].includes(req.params.botId) || !bot) return res.status(404).send({
        err: "Bot not found",
        message: null,
        result: null
      });

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
  }).catch(() => {});
});

app.post("/api/v1/bots/add", (req, res) => {
  let bot = req.body;

  basket.get("proTokens", {
    parseJSON: true
  }).then(({ proTokens }) => {
    if (!proTokens.includes(crypto.createHash("sha256").update(bot[0]).digest("hex"))) return res.status(400).json({
      err: "Invalid pro token",
      message: null,
      result: null
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
      message: null,
      result: null
    });

    try {
      new URL(bot[6]);
    } catch {
      return res.status(400).json({
        err: "Invalid input data",
        message: null,
        result: null
      });
    };

    let id = Date.now();

    basket.get("botSites", {
      parseJSON: true
    }).then((botSites) => {
      basket.update("botSites", {
        ...botSites,
        ...{
          [id]: [
            ...[
              req.clientIp || null
            ],
            ...bot.slice(1)
          ]
        }
      }, {
        parseJSON: true
      }).then(() => {
        res.status(200).json({
          err: null,
          message: "Success",
          result: {
            id
          }
        });
      }).catch(() => {});
    }).catch(() => {});
  }).catch(() => {});
});

app.get("/api/v1/store/all", (req, res) => {
  basket.get("store", {
    parseJSON: true
  }).then((store) => {
    if (store.version === "1") {
      res.status(200).json({
        ...{
          version: store.version,
          activity: store.activity
        },
        ...Object.fromEntries(Object.entries(store).filter(([id]) => !["version", "activity"].includes(id)).sort((firstBot, secondBot) => {
          if (firstBot[1].verified !== secondBot[1].verified) {
            return secondBot[1].verified - firstBot[1].verified;
          };
        
          return secondBot[1].installs - firstBot[0].installs;
        }))
      });
    } else {
      res.status(400).json({
        err: "Version mismatch",
        message: null,
        result: null
      });
    };
  });
});

app.post("/api/v1/store/add", async (req, res) => {
  let bot = req.body;

  if (![
    bot.avatar,
    bot.name,
    bot.description,
    bot.repository
  ].every((property) => typeof property === "string") || !/(?:\p{Emoji}(?:\p{Emoji_Modifier}|\uFE0F)?(?:\u200D\p{Emoji})*)/gu.test(bot.avatar) || /^[0-9]$|[.*+?^${}()|[\]\\]/.test(bot.avatar)) return res.status(400).json({
    err: "Invalid input data",
    message: null,
    result: null
  });

  try {
    let match = bot.repository.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/)?$/);

    if (!match) return res.status(400).json({
      err: "Invalid repository URL",
      message: null,
      result: null
    });

    let response = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}`);

    if (response.status !== 200) return res.status(400).json({
      err: "Invalid repository URL",
      message: null,
      result: null
    });
  } catch (err) {
    return res.status(400).json({
      err,
      message: null,
      result: null
    })
  };

  let id = Date.now();

  basket.get("store", {
    parseJSON: true
  }).then((store) => {
    if (store.version === "1") {
      basket.update("store", {
        ...store,
        ...{
          [id]: [
            bot.avatar,
            bot.name,
            bot.description || null,
            bot.repository,
            false,
            0,
            0,
            [],
            []
          ]
        }
      }, {
        parseJSON: true
      }).then(() => {
        res.status(200).json({
          err: null,
          message: "Success",
          result: {
            id
          }
        });
      }).catch(() => {});
    } else {
      res.status(400).json({
        err: "Version mismatch",
        message: null,
        result: null
      });
    };
  }).catch(() => {});
});

app.post("/api/v1/store/install", (req, res) => {
  let id = req.body.id;

  basket.get("store", {
    parseJSON: true
  }).then((store) => {
    if (store.version === "1") {
      if (["version", "activity"].includes(id) || !Object.keys(store).includes(id)) return res.status(400).json({
        err: "Invalid input data",
        message: null,
        result: null
      });

      if (store[id][7].includes(req.clientIp)) return res.status(400).json({
        err: "Already installed",
        message: null,
        result: null
      });

      basket.update("store", {
        ...store,
        ...{
          [id]: [
            ...store[id].slice(0, 5),
            ...[
              (store[id][5] || 0) + 1,
              store[6],
              [
                ...store[7],
                ...[
                  req.clientIp
                ]
              ],
              store[8]
            ]
          ]
        }
      }, {
        parseJSON: true
      }).then(() => {
        res.status(200).json({
          err: null,
          message: "Success",
          result: {
            id
          }
        })
      }).catch(() => {});
    } else {
      res.status(400).json({
        err: "Version mismatch",
        message: null,
        result: null
      });
    };
  }).catch(() => {});
});

app.post("/api/v1/store/like", (req, res) => {
  let id = req.body.id;

  basket.get("store", {
    parseJSON: true
  }).then((store) => {
    if (store.version === "1") {
      if (["version", "activity"].includes(id) || !Object.keys(store).includes(id)) return res.status(400).json({
        err: "Invalid input data",
        message: null,
        result: null
      });

      if (store[id][8].includes(req.clientIp)) return res.status(400).json({
        err: "Already liked",
        message: null,
        result: null
      });

      basket.update("store", {
        ...store,
        ...{
          [id]: [
            ...store[id].slice(0, 6),
            ...[
              (store[id][6] || 0) + 1,
              store[7],
              [
                ...store[8],
                ...[
                  req.clientIp
                ]
              ]
            ]
          ]
        }
      }, {
        parseJSON: true
      }).then(() => {
        res.status(200).json({
          err: null,
          message: "Success",
          result: {
            id
          }
        })
      }).catch(() => {});
    } else {
      res.status(400).json({
        err: "Version mismatch",
        message: null,
        result: null
      });
    };
  }).catch(() => {});
});

app.post("/api/v1/reports/add", (req, res) => {
  let report = req.body;

  if (["version", "activity"].includes(report.id) || ![
    report.reason,
    report.context
  ].every((property) => typeof property === "string") || ![
    "malicious",
    "tosViolation",
    "privacyAbuse",
    "broken",
    "misleading",
    "stolen",
    "other"
  ].includes(report.reason) || (report.context.length > 200)) return res.status(400).json({
    err: "Invalid input data",
    message: null,
    result: null
  });

  basket.get("reports", {
    parseJSON: true
  }).then((reports) => {
    if (reports.version === "1") {
      basket.get("store", {
        parseJSON: true
      }).then((store) => {
        if (store.version === "1") {
          if (!Object.keys(store).includes(report.id)) return res.status(400).json({
            err: "Invalid input data",
            message: null,
            result: null
          });

          basket.update("reports", {
            ...reports,
            ...{
              [report.id]: [
                ...reports[report.id] || [],
                ...[
                  [
                    "malicious",
                    "tosViolation",
                    "privacyAbuse",
                    "broken",
                    "misleading",
                    "stolen",
                    "other"
                  ].indexOf(report.reason),
                  report.context
                ]
              ]
            }
          }, {
            parseJSON: true
          });
        } else {
          res.status(400).json({
            err: "Version mismatch",
            message: null,
            result: null
          });
        };
      });
    } else {
      res.status(400).json({
        err: "Version mismatch",
        message: null,
        result: null
      });
    };
  }).catch(() => {});
});

const listen = app.listen(3000, () => {
  console.log("Server is now ready on port", listen.address().port);
});