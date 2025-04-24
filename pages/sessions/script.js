const workspaceView = document.querySelector(".workspace-view");

workspaceView.innerHTML = `
      <div class="workspace-tabs">
        <button class="active currentView">
          <i class="fas fa-tools"></i>
          Workbench
        </button>
        <button>
          <i class="fas fa-code"></i>
          Code Lab
        </button>
        <button>
          <i class="fas fa-trophy"></i>
          Pro Suite
        </button>
      </div>

      <button class="workspace-close-btn">
        <i class="fas fa-times"></i>
      </button>

      <div class="workbench-view">
        <div id="workbenchMainView" style="animation: slideUp 0.5s ease;">
          <div class="bot-header" style="margin-bottom: 1.65rem;">
            <div class="bot-avatar" style="width: 60px; height: 60px; font-size: ${(
              50 -
              ((this.isEmoji(bot.avatar)
                ? this.escapeHtml(bot.avatar)
                : "🤖") ===
                "🤖") *
                2.5
            ).toString()}px;">${
  this.isEmoji(bot.avatar) ? this.escapeHtml(bot.avatar) : "🤖"
}</div>
            <div class="bot-info" style="margin-top: 2px; margin-left: -${(
              8.5 +
              ((this.isEmoji(bot.avatar)
                ? this.escapeHtml(bot.avatar)
                : "🤖") ===
                "🤖") *
                0.75
            ).toString()}px;">
              <h3 style="font-size: 1.5rem; margin-left: 2.5px;">${this.escapeHtml(
                bot.name
              )}</h3>
              <p style="font-size: 0.95rem; margin-left: 2.5px; margin-top: -2.5px;">${
                bot.description ? this.escapeHtml(bot.description) : ""
              }</p>
            </div>
            <div style="
              position: absolute;
              right: 4rem;
              display: flex;
            ">
              <button id="workbench-play-btn" class="workbench-action-btn" style="margin-right: 7.5px;">
                ${
                  ((
                    this.readFileSafelySync(
                      path.join(
                        process.cwd(),
                        "bots",
                        bot.id.toString(),
                        "channels/process.txt"
                      )
                    ) || "OFFLINE"
                  ).trim() || "OFFLINE") === "OFFLINE"
                    ? `<i class="fas fa-play"></i>Run`
                    : `<i class="fas fa-stop"></i>Stop`
                }
              </button>
              <button id="workbench-publish-btn" class="workbench-action-btn" style="padding: 0.5rem 0.65rem; margin-right: 7.25px;">
                <i class="fas fa-upload"></i>
              </button>
              <button id="workbench-settings-btn" class="workbench-action-btn" style="padding: 0.5rem 0.65rem;">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
          <div class="setting-item" style="margin-bottom: 0.85rem;">
            <label data-tooltip="Enable classic !commands and modern /commands with autocomplete">
              <span>Prefix</span>
              <input type="text" id="botPrefix" placeholder="Enter prefix..." value="${this.escapeHtml(
                configFile.prefix
              )}" style="width: ${(
  2.75 +
  (configFile.prefix.length - 1) * 0.5
).toString()}rem; text-align: center;">
              <span style="margin-left: 0.75rem;">Slash Commands</span>
              <input type="checkbox" id="slashCommands"${
                configFile.slashCommands ? " checked" : ""
              }>
            </label>
            <div class="setting-description">
              Personalize how your bot talks
            </div>
          </div>
          <div class="setting-item" style="margin-bottom: 0.85rem;">
            <label data-tooltip="Choose the status for your bot">
              <span>Bot Status</span>
              <select id="botStatusSymbol" style="width: fit-content; border-top-right-radius: 0; border-bottom-right-radius: 0;">
                <option value="Online" ${
                  (configFile.status[0] || "Online") === "Online"
                    ? "selected"
                    : ""
                }>🟢</option>
                <option value="Idle" ${
                  (configFile.status[0] || "Online") === "Idle"
                    ? "selected"
                    : ""
                }>🌙</option>
                <option value="DoNotDisturb" ${
                  (configFile.status[0] || "Online") === "DoNotDisturb"
                    ? "selected"
                    : ""
                }>🔴</option>
                <option value="Invisible" ${
                  (configFile.status[0] || "Online") === "Invisible"
                    ? "selected"
                    : ""
                }>🔘</option>
              </select>
              <select id="botStatusActivity" style="width: fit-content; border-radius: 0; margin-left: -0.75rem;">
                <option value="Playing" ${
                  (configFile.status[1] || "Playing") === "Playing"
                    ? "selected"
                    : ""
                }>Playing</option>
                <option value="Watching" ${
                  (configFile.status[1] || "Playing") === "Watching"
                    ? "selected"
                    : ""
                }>Watching</option>
                <option value="Listening" ${
                  (configFile.status[1] || "Playing") === "Listening"
                    ? "selected"
                    : ""
                }>Listening</option>
                <option value="Competing" ${
                  (configFile.status[1] || "Playing") === "Competing"
                    ? "selected"
                    : ""
                }>Competing</option>
                <option value="Streaming" ${
                  (configFile.status[1] || "Playing") === "Streaming"
                    ? "selected"
                    : ""
                }>Streaming</option>
                <option value="Custom" ${
                  (configFile.status[1] || "Playing") === "Custom"
                    ? "selected"
                    : ""
                }>Custom</option>
              </select>
              <input type="text" id="botStatusMessage" placeholder="Enter status..." value="${this.escapeHtml(
                configFile.status[2] || ""
              )}" style="width: 14rem; margin-left: -0.75rem; border-top-left-radius: 0; border-bottom-left-radius: 0;" />
            </label>
            <div class="setting-description">
              Give your bot a personality
            </div>
          </div>
          <div class="setting-item" style="margin-bottom: 0.85rem;">
            <label data-tooltip="Show yourself using the footer">
              <span>Bot Embed Footer</span>
              <input type="text" id="botFooter" placeholder="Enter footer..."  value="${this.escapeHtml(
                configFile.footer || ""
              )}" style="width: 14rem;" />
            </label>
            <div class="setting-description">
              Customize your bot embed footer
            </div>
          </div>
          <div class="workbench-section settings-section" style="
            padding: 1.5rem 2rem;
            margin-top: 1.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
            border: 1px solid transparent;
            box-shadow: none;
          ">
            <h3 style="flex-direction: row; margin-bottom: 1rem;">
              <i class="fas fa-code"></i>Commands
              <button class="add-command-btn" style="right: 25px;">
                <i class="fas fa-plus"></i>
                Add Command
              </button>
            </h3>
            ${
              !fs.readdirSync(
                path.join(process.cwd(), "bots", bot.id.toString(), "commands")
              ).length
                ? `<span style="color: grey;">No commands found</span>`
                : fs
                    .readdirSync(
                      path.join(
                        process.cwd(),
                        "bots",
                        bot.id.toString(),
                        "commands"
                      )
                    )
                    .map((command) =>
                      command.endsWith(".js")
                        ? `
              <div class="setting-item" style="width: calc(100% + 12.5px); margin-left: -2.5px; margin-bottom: 0.5rem; padding: 0.5rem 1rem; cursor: pointer;" data-category="commands">${this.escapeHtml(
                command.substring(0, command.length - 3)
              )}</div>
            `
                        : ""
                    )
                    .join("")
            }
            <h3 style="flex-direction: row; margin-bottom: 1rem; margin-top: 2rem;">
              <i class="fas fa-calendar-days"></i>Events
              <button class="add-command-btn" style="right: 25px;">
                <i class="fas fa-plus"></i>
                Add Event
              </button>
            </h3>
            ${
              !fs.readdirSync(
                path.join(process.cwd(), "bots", bot.id.toString(), "events")
              ).length
                ? `<span style="color: grey;">No events found</span>`
                : fs
                    .readdirSync(
                      path.join(
                        process.cwd(),
                        "bots",
                        bot.id.toString(),
                        "events"
                      )
                    )
                    .map((command) =>
                      command.endsWith(".js")
                        ? `
              <div class="setting-item" style="width: calc(100% + 12.5px); margin-left: -2.5px; margin-bottom: 0.5rem; padding: 0.5rem 1rem; cursor: pointer;" data-category="events">${
                this.escapeHtml(
                  command
                    .substring(0, command.length - 3)
                    .replace(/[^a-zA-Z]+$/, "")
                ) +
                (command.substring(0, command.length - 3).match(/[^a-zA-Z]+$/)
                  ? `<code style="background: #242323b0; font-family: monospace; padding: 0.2rem 0.4rem; margin-left: 7.5px; border-radius: var(--radius-sm); position: fixed; height: 23.25px;">${command
                      .substring(0, command.length - 3)
                      .match(/[^a-zA-Z]+$/)}</code>`
                  : "")
              }</div>
            `
                        : ""
                    )
                    .join("")
            }
          </div>
        </div>

        <div id="workbenchEditorView" style="display: none; animation: slideUp 0.5s ease;"></div>
      </div>

      <div class="code-editor-view" style="visibility: hidden;">
        <div class="file-explorer">
          <div class="file-explorer-header">
            <span class="file-explorer-title">Files</span>
            <div class="file-explorer-actions">
              <button class="file-explorer-btn" title="New File">
                <i class="fas fa-plus"></i>
              </button>
              <button class="file-explorer-btn" title="New Folder">
                <i class="fas fa-folder-plus"></i>
              </button>
            </div>
          </div>
          <div class="file-tree">
            ${this.renderFileTree(
              this.generateFileTree(
                path.join(process.cwd(), "bots", bot.id.toString())
              )
            )}
          </div>
        </div>

        <div class="editor-container">
          <button class="editor-play-btn">
            <i class="${
              ((
                this.readFileSafelySync(
                  path.join(
                    process.cwd(),
                    "bots",
                    bot.id.toString(),
                    "channels/process.txt"
                  )
                ) || "OFFLINE"
              ).trim() || "OFFLINE") === "OFFLINE"
                ? "fas fa-play"
                : "fas fa-stop"
            }"></i>
          </button>
          <div class="editor-content">
            <textarea spellcheck="false">${
              fs
                .readdirSync(
                  path.join(process.cwd(), "bots", bot.id.toString())
                )
                .find(
                  (file) =>
                    !fs
                      .statSync(
                        path.join(
                          process.cwd(),
                          "bots",
                          bot.id.toString(),
                          file
                        )
                      )
                      .isDirectory()
                )
                ? this.escapeHtml(
                    fs.readFileSync(
                      path.join(
                        process.cwd(),
                        "bots",
                        bot.id.toString(),
                        ((dir) => {
                          const files = fs.readdirSync(dir);
                          if (files.includes("index.js")) return "index.js";
                          if (files.includes("package.json")) {
                            try {
                              const packageJson = JSON.parse(
                                fs.readFileSync(
                                  path.join(dir, "package.json"),
                                  "utf8"
                                )
                              );
                              if (
                                packageJson.main &&
                                fs.existsSync(path.join(dir, packageJson.main))
                              )
                                return packageJson.main;
                              return "package.json";
                            } catch {
                              return "package.json";
                            }
                          }
                          const firstJsFile = files.find((file) =>
                            file.endsWith(".js")
                          );
                          if (firstJsFile) return firstJsFile;
                          const firstNonFolder = files.find(
                            (file) =>
                              !fs.statSync(path.join(dir, file)).isDirectory()
                          );
                          if (firstNonFolder) return firstNonFolder;
                          const firstFile = this.getFlatFileList(dir).find(
                            (file) =>
                              !fs
                                .statSync(path.join(dir, file.substring(2)))
                                .isDirectory()
                          );
                          if (firstFile) return firstFile.substring(2);
                          return null;
                        })(path.join(process.cwd(), "bots", bot.id.toString()))
                      ),
                      "utf8"
                    )
                  )
                : ""
            }</textarea>
            ${
              !fs
                .readdirSync(
                  path.join(process.cwd(), "bots", bot.id.toString())
                )
                .find(
                  (file) =>
                    !fs
                      .statSync(
                        path.join(
                          process.cwd(),
                          "bots",
                          bot.id.toString(),
                          file
                        )
                      )
                      .isDirectory()
                )
                ? `
              <div class="editor-content-missing">
                <h2>No file found</h2>
                <div>
                  <button>
                    <i class="fas fa-plus"></i>
                    New File
                  </button>
                  <button>
                    <i class="fas fa-plus"></i>
                    New Folder
                  </button>
                </div>
              </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="editor-terminal"></div>
      </div>

      <div class="workbench-view suite-view">
        <div id="suiteMainView">
          <div id="assistantSection" class="workbench-section settings-section" style="
            padding: 1.5rem 2rem;
            margin-top: 1.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
            border: 1px solid transparent;
            box-shadow: none;
            overflow-x: auto;
            overflow-y: hidden;
          ">
            <h3 style="flex-direction: row; margin-bottom: 1rem;">
              <i class="fas fa-robot"></i>AI Assistant
            </h3>
            <div class="command-item setting-item" style="padding: 0; background-color: transparent;">
              <form>
                <div style="display: flex; flex-direction: row;">
                  <select style="margin-top: 0.35rem; margin-bottom: 0.5rem; margin-right: 0.625rem; min-height: 3.15rem; font-family: system-ui; background-color: #00000030; resize: vertical; cursor: pointer;">
                    <option style="background-color: #151618;" selected>Command</option>
                    <option style="background-color: #151618;">Event</option>
                  </select>
                  <input style="margin-top: 0.35rem; margin-bottom: 0.5rem; min-height: 3.15rem; font-family: system-ui; background-color: #00000030; resize: vertical;" placeholder="Enter command name..." required>
                </div>
                <textarea style="height: 150px; margin-top: 0.25rem; min-height: 3.15rem; font-family: system-ui; background-color: #00000030; resize: vertical;" placeholder="Enter prompt..."></textarea>
                <button type="submit" style="margin-top: 0.5rem; margin-bottom: 0.375rem; background-color: #b7841d; resize: vertical; cursor: pointer; font-family: cursive; height: 2.55rem; display: flex; justify-content: center; align-items: center; font-size: 15px; box-shadow: 0 4px 10px rgb(255 215 0 / 16%);" placeholder="Enter prompt...">
                  <span style="margin-bottom: 2.25px;">Generate <span style="margin-left: 2.5px;">🪄</span></span>
                </button>
              </form>
            </div>
          </div>
          <div id="analyticsSection" class="workbench-section settings-section" style="
            padding: 1.5rem 2rem;
            padding-bottom: 4.75rem;
            margin-top: 1.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
            border: 1px solid transparent;
            box-shadow: none;
            height: 44.25vh;
            overflow-x: auto;
            overflow-y: hidden;
          ">
            <h3 style="flex-direction: row; margin-bottom: 1rem;">
              <i class="fas fa-chart-simple"></i>Analytics
            </h3>
            <div style="display: flex; flex-direction: row; height: calc(44.25vh - 7rem);">
              <canvas id="analyticsChart"></canvas>
              <canvas id="commandsChart" style="margin-top: -2.25rem; margin-left: 3.5rem; opacity: 0.8;"></canvas>
              <canvas id="eventsChart" style="margin-top: -2.25rem; margin-left: 1.75rem; opacity: 0.8;"></canvas>
            </div>
          </div>
          <div id="landingPageSection" class="workbench-section settings-section" style="
            padding: 1.5rem 2rem 2rem;
            margin-top: 1.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
            border: 1px solid transparent;
            box-shadow: none;
          ">
            <h3 style="flex-direction: row; margin-bottom: 1rem;">
              <i class="fas fa-laptop-code"></i>Landing Page
              <button class="add-command-btn" style="right: 117.5px;">
                <i class="fas fa-plus"></i>
                Add Feature
              </button>
              <button class="add-command-btn" style="right: 74.7px; padding: 0.55rem 0.65rem;">
                <i class="fas fa-upload"></i>
              </button>
              <button class="add-command-btn" style="right: 32.5px; padding: 0.55rem 0.65rem;">
                <i class="fas fa-arrow-up-right-from-square"></i>
              </button>
            </h3>
            <div class="grid-container">
              ${
                !(bot.features || []).length
                  ? `<span style="color: grey; margin-bottom: -0.5rem;">No features found</span>`
                  : (bot.features || [])
                      .map(
                        (feature) => `
                  <div class="card" data-id="${this.escapeHtml(
                    feature.id.toString()
                  )}">
                    <i class="fas fa-xmark" style="
                      float: right;
                      cursor: pointer;
                      opacity: 0.85;
                    "></i>
                    <div class="icon">
                      <i class="fas fa-${this.escapeHtml(feature.icon)}"></i>
                    </div>
                    <p class="title" contenteditable spellcheck="false" placeholder="Enter title...">${this.escapeHtml(
                      feature.name
                    )}</p>
                    <p class="description" contenteditable spellcheck="false" placeholder="Enter description...">${this.escapeHtml(
                      feature.description
                    )}</p>
                  </div>
                `
                      )
                      .join("\n")
              }
            </div>
          </div>
          <div id="vanityLinksSection" class="workbench-section settings-section" style="
            padding: 1.5rem 2rem;
            margin-top: 1.75rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: var(--radius-md);
            transition: all 0.3s ease;
            border: 1px solid transparent;
            box-shadow: none;
          ">
            <h3 style="flex-direction: row; margin-bottom: 1rem;">
              <i class="fas fa-link"></i>Vanity Links
              <button class="add-command-btn" style="right: 25px;">
                <i class="fas fa-plus"></i>
                Create Vanity Link
              </button>
            </h3>
            ${
              !bot?.vanityLinks?.length
                ? `<span style="color: grey;">No vanity links found</span>`
                : bot?.vanityLinks
                    ?.map(
                      (shortenedUrl) => `
              <div class="setting-item" style="width: calc(100% + 12.5px); margin-left: -2.5px; margin-bottom: 0.5rem; padding: 0.5rem 1rem; cursor: pointer;">${this.escapeHtml(
                shortenedUrl
              )}</div>
            `
                    )
                    .join("")
            }
          </div>
        </div>

        <div id="suiteDetailView" style="display: none;"></div>
      </div>
    `;
