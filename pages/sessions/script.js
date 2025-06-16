const id = location.pathname.split("/")[2];
const socket = io("/");

let editor = null;

socket.emit("joinRoom", id);

socket.on("retrieveFileSystem", ([fileSystem, fileName, fileContent]) => {
  const workspaceView = document.querySelector(".workspace-view");
  const editorView = workspaceView.querySelector(".code-editor-view");

  workspaceView.querySelectorAll(".workspace-tabs button").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.querySelector("i").className === "fas fa-tools") {
        tab.classList.add("active");
        Array.from(workspaceView.querySelectorAll(".workspace-tabs button")).find((tab) => tab.querySelector("i").className === "fas fa-code").classList.remove("active");

        showDownloadModal();
      } else if (tab.querySelector("i").className === "fas fa-trophy") {
        tab.classList.add("active");
        Array.from(workspaceView.querySelectorAll(".workspace-tabs button")).find((tab) => tab.querySelector("i").className === "fas fa-code").classList.remove("active");

        showUpgradeModal();
      };
    });
  });

  editorView.style.display = "grid";
  editorView.style.animation = "slideUp 0.5s ease";
  editorView.querySelector(".file-tree").innerHTML = renderFileTree(generateFileTree(fileSystem));
  editorView.querySelector(".editor-content textarea").value = fileContent || "";
  editorView.querySelector(".editor-content-missing").style.display = (fileName) ? "none" : "block";

  const addFileBtn = editorView.querySelector(`.file-explorer-btn[title="New File"]`);
  [
    ...[
      addFileBtn
    ],
    ...(editorView.querySelector(".editor-content-missing")) ? [
      editorView.querySelectorAll(".editor-content-missing button")[1]
    ] : []
  ].forEach((button) => {
    button.addEventListener("click", () => {
      let newFileTreeItem = document.createElement("div");
      newFileTreeItem.className = "file-tree-item";
      newFileTreeItem.style.cursor = "text";
      newFileTreeItem.innerHTML = `
        <i class="fas fa-file"></i>
        <span contenteditable="true"></span>
      `;

      newFileTreeItem.querySelector("span").addEventListener("blur", () => {
        if (!newFileTreeItem.querySelector("span").textContent.trim()) return newFileTreeItem.remove();
        if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

        newFileTreeItem.style.removeProperty("cursor");
        newFileTreeItem.querySelector("i").className = `fas ${(newFileTreeItem.querySelector("span").textContent.endsWith(".json")) ? "fa-file" : "fa-file-code"}`;
        newFileTreeItem.querySelector("span").contentEditable = false;
        newFileTreeItem.dataset.filename = newFileTreeItem.querySelector("span").textContent;

        socket.emit("newFileSystem", [
          "createFile",
          [
            getFilePath(newFileTreeItem)
          ]
        ]);

        newFileTreeItem.addEventListener("click", () => {
          const fileItems = editorView.querySelectorAll(".file-tree-item");

          fileItems.forEach((i) => i.classList.remove("active", "active-file"));
          newFileTreeItem.classList.add("active", "active-file");

          socket.emit("retrieveFileContent", getFilePath(newFileTreeItem));
        });

        newFileTreeItem.addEventListener("contextmenu", (e) => {
          if (document.body.querySelector(".file-tree-context-menu")) document.body.querySelector(".file-tree-context-menu").remove();

          const contextMenu = document.createElement("div");
          contextMenu.className = "file-tree-context-menu";

          contextMenu.innerHTML = `
            <div class="context-menu-rename-btn">
              <i class="fas fa-pen" style="margin-right: 8.75px;"></i>Rename
            </div>
            <div class="context-menu-delete-btn">
              <i class="fas fa-trash" style="margin-right: 10.5px;"></i>Delete
            </div>
          `;

          contextMenu.style.top = `${e.clientY}px`;
          contextMenu.style.left = `${e.clientX}px`;

          contextMenu.querySelector(".context-menu-rename-btn").addEventListener("click", () => {
            const oldFilePath = getFilePath(item);

            const span = newFileTreeItem.querySelector("span");
            span.style.cursor = "text";
            span.contentEditable = true;
            span.focus();
            span.addEventListener("blur", () => {
              if (!span.textContent.trim()) return newFileTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFileTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFileTreeItem)
                ]
              ]);

              newFileTreeItem.click();
            });

            span.addEventListener("keydown", (e) => {
              if (e.key !== "Enter") return;

              if (!span.textContent.trim()) return newFileTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFileTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFileTreeItem)
                ]
              ]);

              newFileTreeItem.click();
            });
          });

          contextMenu.querySelector(".context-menu-delete-btn").addEventListener("click", () => {
            confirm("Delete File", `Are you sure you want to delete ${escapeHtml(newFileTreeItem.dataset.filename || newFileTreeItem.querySelector("span").textContent.trim())}?`, "dangerous").then(() => {
              item.remove();

              socket.emit("newFileSystem", [
                "delete",
                [
                  getFilePath(newFileTreeItem)
                ]
              ]);
            }).catch(() => {});
          });

          document.body.appendChild(contextMenu);

          window.addEventListener("click", () => {
            contextMenu.remove();
          });
        });

        newFileTreeItem.click();
      });

      newFileTreeItem.querySelector("span").addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        if (!newFileTreeItem.querySelector("span").textContent.trim()) return newFileTreeItem.remove();
        if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

        newFileTreeItem.style.removeProperty("cursor");
        newFileTreeItem.querySelector("i").className = `fas ${(newFileTreeItem.querySelector("span").textContent.endsWith(".json")) ? "fa-file" : "fa-file-code"}`;
        newFileTreeItem.querySelector("span").contentEditable = false;

        socket.emit("newFileSystem", [
          "createFile",
          [
            getFilePath(newFileTreeItem)
          ]
        ]);

        newFileTreeItem.addEventListener("click", () => {
          const fileItems = editorView.querySelectorAll(".file-tree-item");

          fileItems.forEach((i) => i.classList.remove("active", "active-file"));
          newFileTreeItem.classList.add("active", "active-file");

          socket.emit("retrieveFileContent", getFilePath(newFileTreeItem));
        });

        newFileTreeItem.addEventListener("contextmenu", (e) => {
          if (document.body.querySelector(".file-tree-context-menu")) document.body.querySelector(".file-tree-context-menu").remove();

          const contextMenu = document.createElement("div");
          contextMenu.className = "file-tree-context-menu";

          contextMenu.innerHTML = `
            <div class="context-menu-rename-btn">
              <i class="fas fa-pen" style="margin-right: 8.75px;"></i>Rename
            </div>
            <div class="context-menu-delete-btn">
              <i class="fas fa-trash" style="margin-right: 10.5px;"></i>Delete
            </div>
          `;

          contextMenu.style.top = `${e.clientY}px`;
          contextMenu.style.left = `${e.clientX}px`;

          contextMenu.querySelector(".context-menu-rename-btn").addEventListener("click", () => {
            const oldFilePath = getFilePath(item);

            const span = newFileTreeItem.querySelector("span");
            span.style.cursor = "text";
            span.contentEditable = true;
            span.focus();
            span.addEventListener("blur", () => {
              if (!span.textContent.trim()) return newFileTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFileTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFileTreeItem)
                ]
              ]);

              newFileTreeItem.click();
            });

            span.addEventListener("keydown", (e) => {
              if (e.key !== "Enter") return;

              if (!span.textContent.trim()) return newFileTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFileTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFileTreeItem)
                ]
              ]);

              newFileTreeItem.click();
            });
          });

          contextMenu.querySelector(".context-menu-delete-btn").addEventListener("click", () => {
            confirm("Delete File", `Are you sure you want to delete ${escapeHtml(newFileTreeItem.dataset.filename || newFileTreeItem.querySelector("span").textContent.trim())}?`, "dangerous").then(() => {
              item.remove();

              socket.emit("newFileSystem", [
                "delete",
                [
                  getFilePath(newFileTreeItem)
                ]
              ]);
            }).catch(() => {});
          });

          document.body.appendChild(contextMenu);

          window.addEventListener("click", () => {
            contextMenu.remove();
          });
        });

        newFileTreeItem.click();
      });

      ((document.querySelector(".file-tree-item.active.active-file")) ? document.querySelector(".file-tree-item.active.active-file").parentElement : ((document.querySelector(".file-tree-item.active")) ? document.querySelector(".file-tree-item.active").nextElementSibling : document.querySelector(".file-tree"))).appendChild(newFileTreeItem);
      newFileTreeItem.querySelector("span").focus();
    });
  });

  const addFolderBtn = editorView.querySelector(`.file-explorer-btn[title="New Folder"]`);
  [
    ...[
      addFolderBtn
    ],
    ...(editorView.querySelector(".editor-content-missing")) ? [
      editorView.querySelectorAll(".editor-content-missing button")[0]
    ] : []
  ].forEach((button) => {
    button.addEventListener("click", () => {
      let newFolderTreeItem = document.createElement("div");
      newFolderTreeItem.className = "file-tree-item folder";
      newFolderTreeItem.style.cursor = "text";
      newFolderTreeItem.innerHTML = `
        <i class="fas fa-folder"></i>
        <span contenteditable="true"></span>
      `;

      let newFolderTreeContent = document.createElement("div");
      newFolderTreeContent.className = "folder-content";
      newFolderTreeContent.style.display = "none";
      newFolderTreeContent.style.paddingLeft = "1rem";

      newFolderTreeItem.querySelector("span").addEventListener("blur", () => {
        if (!newFolderTreeItem.querySelector("span").textContent.trim()) return newFolderTreeItem.remove();
        if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

        newFolderTreeItem.style.removeProperty("cursor");
        newFolderTreeItem.querySelector("span").contentEditable = false;

        socket.emit("newFileSystem", [
          "createFolder",
          [
            getFilePath(newFolderTreeItem)
          ]
        ]);

        newFolderTreeItem.addEventListener("click", () => {
          const fileItems = editorView.querySelectorAll(".file-tree-item");

          fileItems.forEach((i) => i.classList.remove("active"));
          newFolderTreeItem.classList.add("active");

          newFolderTreeItem.nextElementSibling.style.display = (newFolderTreeItem.nextElementSibling.style.display === "none") ? "block" : "none";
        });

        newFolderTreeItem.addEventListener("contextmenu", (e) => {
          if (document.body.querySelector(".file-tree-context-menu")) document.body.querySelector(".file-tree-context-menu").remove();

          const contextMenu = document.createElement("div");
          contextMenu.className = "file-tree-context-menu";

          contextMenu.innerHTML = `
            <div class="context-menu-rename-btn">
              <i class="fas fa-pen" style="margin-right: 8.75px;"></i>Rename
            </div>
            <div class="context-menu-delete-btn">
              <i class="fas fa-trash" style="margin-right: 10.5px;"></i>Delete
            </div>
          `;

          contextMenu.style.top = `${e.clientY}px`;
          contextMenu.style.left = `${e.clientX}px`;

          contextMenu.querySelector(".context-menu-rename-btn").addEventListener("click", () => {
            const oldFilePath = getFilePath(item);

            const span = newFolderTreeItem.querySelector("span");
            span.style.cursor = "text";
            span.contentEditable = true;
            span.focus();
            span.addEventListener("blur", () => {
              if (!span.textContent.trim()) return newFolderTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFolderTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFolderTreeItem)
                ]
              ]);

              newFolderTreeItem.click();
            });

            span.addEventListener("keydown", (e) => {
              if (e.key !== "Enter") return;

              if (!span.textContent.trim()) return newFolderTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFolderTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFolderTreeItem)
                ]
              ]);

              newFolderTreeItem.click();
            });
          });

          contextMenu.querySelector(".context-menu-delete-btn").addEventListener("click", () => {
            confirm("Delete File", `Are you sure you want to delete ${escapeHtml(newFolderTreeItem.dataset.filename || newFolderTreeItem.querySelector("span").textContent.trim())}?`, "dangerous").then(() => {
              item.remove();

              socket.emit("newFileSystem", [
                "delete",
                [
                  getFilePath(newFolderTreeItem)
                ]
              ]);
            }).catch(() => {});
          });

          document.body.appendChild(contextMenu);

          window.addEventListener("click", () => {
            contextMenu.remove();
          });
        });

        newFolderTreeItem.click();
      });

      newFolderTreeItem.querySelector("span").addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        if (!newFolderTreeItem.querySelector("span").textContent.trim()) return newFolderTreeItem.remove();
        if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

        newFolderTreeItem.style.removeProperty("cursor");
        newFolderTreeItem.querySelector("span").contentEditable = false;

        socket.emit("newFileSystem", [
          "createFolder",
          [
            getFilePath(newFolderTreeItem)
          ]
        ]);

        newFolderTreeItem.addEventListener("click", () => {
          const fileItems = editorView.querySelectorAll(".file-tree-item");

          fileItems.forEach((i) => i.classList.remove("active"));
          newFolderTreeItem.classList.add("active");

          newFolderTreeItem.nextElementSibling.style.display = (newFolderTreeItem.nextElementSibling.style.display === "none") ? "block" : "none";
        });

        newFolderTreeItem.addEventListener("contextmenu", (e) => {
          if (document.body.querySelector(".file-tree-context-menu")) document.body.querySelector(".file-tree-context-menu").remove();

          const contextMenu = document.createElement("div");
          contextMenu.className = "file-tree-context-menu";

          contextMenu.innerHTML = `
            <div class="context-menu-rename-btn">
              <i class="fas fa-pen" style="margin-right: 8.75px;"></i>Rename
            </div>
            <div class="context-menu-delete-btn">
              <i class="fas fa-trash" style="margin-right: 10.5px;"></i>Delete
            </div>
          `;

          contextMenu.style.top = `${e.clientY}px`;
          contextMenu.style.left = `${e.clientX}px`;

          contextMenu.querySelector(".context-menu-rename-btn").addEventListener("click", () => {
            const oldFilePath = getFilePath(item);

            const span = newFolderTreeItem.querySelector("span");
            span.style.cursor = "text";
            span.contentEditable = true;
            span.focus();
            span.addEventListener("blur", () => {
              if (!span.textContent.trim()) return newFolderTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFolderTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFolderTreeItem)
                ]
              ]);

              newFolderTreeItem.click();
            });

            span.addEventListener("keydown", (e) => {
              if (e.key !== "Enter") return;

              if (!span.textContent.trim()) return newFolderTreeItem.remove();
              if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

              span.style.cursor = "pointer";
              span.contentEditable = false;
              newFolderTreeItem.dataset.filename = span.textContent.trim();
              socket.emit("newFileSystem", [
                "rename",
                [
                  oldFilePath,
                  getFilePath(newFolderTreeItem)
                ]
              ]);

              newFolderTreeItem.click();
            });
          });

          contextMenu.querySelector(".context-menu-delete-btn").addEventListener("click", () => {
            confirm("Delete File", `Are you sure you want to delete ${escapeHtml(newFolderTreeItem.dataset.filename || newFolderTreeItem.querySelector("span").textContent.trim())}?`, "dangerous").then(() => {
              item.remove();

              socket.emit("newFileSystem", [
                "delete",
                [
                getFilePath(newFolderTreeItem)
                ]
              ]);
            }).catch(() => {});
          });

          document.body.appendChild(contextMenu);

          window.addEventListener("click", () => {
            contextMenu.remove();
          });
        });

        newFolderTreeItem.click();
      });

      ((document.querySelector(".file-tree-item.active.active-file")) ? document.querySelector(".file-tree-item.active.active-file").parentElement : ((document.querySelector(".file-tree-item.active")) ? document.querySelector(".file-tree-item.active").nextElementSibling : document.querySelector(".file-tree"))).appendChild(newFolderTreeItem);
      ((document.querySelector(".file-tree-item.active.active-file")) ? document.querySelector(".file-tree-item.active.active-file").parentElement : ((document.querySelector(".file-tree-item.active")) ? document.querySelector(".file-tree-item.active").nextElementSibling : document.querySelector(".file-tree"))).appendChild(newFolderTreeContent);
      newFolderTreeItem.querySelector("span").focus();
    });
  });

  setupFileTreeListeners(editorView);
  getFileTreeItem(editorView, fileName).classList.add("active", "active-file");

  editor = CodeMirror.fromTextArea(editorView.querySelector("textarea"), {
    mode: "javascript",
    theme: "monokai",
    styleActiveLine: true,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    autoCloseTags: true
  });

  editor.on("change", (_, change) => {
    if (change.origin === "setValue") return;

    socket.emit("newFileContent", [
      getFilePath(editorView.querySelector(".file-tree .file-tree-item.active-file")),
      editor.getValue()
    ]);
  });

  socket.on("newFileSystem", (newFileSystem) => {
    const activeItem = getFilePath(editorView.querySelector(".file-tree-item.active")) || "";
    const activeFile = getFilePath(editorView.querySelector(".file-tree-item.active-file")) || "";
    const newFile = newFileSystem.filter((file) => !parseFileTree(editorView.querySelector(".file-tree")).includes(file))[0]?.slice(2) || "";

    editorView.querySelector(".file-tree").innerHTML = renderFileTree(generateFileTree(newFileSystem));

    (getFileTreeItem(editorView, activeItem) || getFileTreeItem(editorView, activeFile) || getFileTreeItem(editorView, newFile) || getFileTreeItem(editorView, ((dir) => {
      const files = dir.map((file) => file.substring(2));
      if (files.includes("index.js")) return "index.js";
      if (files.includes("package.json")) return "package.json";
      const firstJsFile = files.find((file) => file.endsWith(".js"));
      if (firstJsFile) return firstJsFile;
      const firstNonFolder = files.find((file) => file.split("/") === 1);
      if (firstNonFolder) return firstNonFolder;
      const firstFile = files[0];
      if (firstFile) return firstFile;
      return null;
    })(newFileSystem))).classList.add(...[
      ...[
        "active"
      ],
      ...(activeItem !== activeFile) ? [] : [
        "active-file"
      ]
    ]);

    setupFileTreeListeners(editorView);
  });

  socket.on("retrieveFileContent", ([newFileName, newFileContent]) => {
    getFileTreeItem(editorView, newFileName).classList.add("active", "active-file");

    editor.setValue(newFileContent);
    editor.clearHistory();
  });

  socket.on("newFileContent", ([newFileName, newFileContent]) => {
    if ((newFileName !== getFilePath(editorView.querySelector(".file-tree-item.active-file"))) || (newFileContent === editor.getValue())) return;

    editor.setValue(newFileContent);
    editor.clearHistory();
  });
});

socket.on("newLink", () => {
  socket.disconnect();
  window.location.href = "/";
});

socket.on("disconnect", () => {
  window.location.href = "/";
});

function setupFileTreeListeners(editorView) {
  const fileItems = editorView.querySelectorAll(".file-tree-item");

  fileItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (item.classList.contains("folder")) {
        fileItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        item.nextElementSibling.style.display = (item.nextElementSibling.style.display === "none") ? "block" : "none";
      } else {
        editorView.querySelectorAll(".file-tree-item").forEach((i) => i.classList.remove("active", "active-file"));
        item.classList.add("active", "active-file");

        socket.emit("retrieveFileContent", getFilePath(item));
      };
    });

    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      if (document.body.querySelector(".file-tree-context-menu")) document.body.querySelector(".file-tree-context-menu").remove();

      const contextMenu = document.createElement("div");
      contextMenu.className = "file-tree-context-menu";

      contextMenu.innerHTML = `
        <div class="context-menu-rename-btn">
          <i class="fas fa-pen" style="margin-right: 8.75px;"></i>Rename
        </div>
        <div class="context-menu-delete-btn">
          <i class="fas fa-trash" style="margin-right: 10.5px;"></i>Delete
        </div>
      `;

      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.left = `${e.clientX}px`;

      contextMenu.querySelector(".context-menu-rename-btn").addEventListener("click", () => {
        const oldFilePath = getFilePath(item);

        const span = item.querySelector("span");
        span.style.cursor = "text";
        span.contentEditable = true;
        span.focus();
        span.addEventListener("blur", () => {
          if (!span.textContent.trim()) return item.remove();
          if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

          span.style.cursor = "pointer";
          span.contentEditable = false;
          item.dataset.filename = span.textContent.trim();
          socket.emit("newFileSystem", [
            "rename",
            [
              oldFilePath,
              getFilePath(item)
            ]
          ]);

          item.click();
        });

        span.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;

          if (!span.textContent.trim()) return item.remove();
          if (editorView.querySelector(".editor-content-missing")) editorView.querySelector(".editor-content-missing").remove();

          span.style.cursor = "pointer";
          span.contentEditable = false;
          item.dataset.filename = span.textContent.trim();
          socket.emit("newFileSystem", [
            "rename",
            [
              oldFilePath,
              getFilePath(item)
            ]
          ]);

          item.click();
        });
      });

      contextMenu.querySelector(".context-menu-delete-btn").addEventListener("click", () => {
        confirm("Delete File", `Are you sure you want to delete ${escapeHtml(item.dataset.filename || item.querySelector("span").textContent.trim())}?`, "dangerous").then(() => {
          item.remove();

          socket.emit("newFileSystem", [
            "delete",
            [
              getFilePath(item)
            ]
          ]);
        }).catch(() => {});
      });

      document.body.appendChild(contextMenu);

      window.addEventListener("click", () => {
        contextMenu.remove();
      });
    });
  });
};

function generateFileTree(paths) {
  const result = [];

  for (const filePath of paths) {
    const parts = filePath.replace(/^\.\//, "").split("/");
    let currentLevel = result;

    parts.forEach((part, index) => {
      const existing = currentLevel.find((item) => item.name === part);

      if (index === parts.length - 1) {
        if (!existing) {
          currentLevel.push({
            name: part,
            type: "file"
          });
        };
      } else {
        if (!existing) {
          const newFolder = {
            name: part,
            type: "folder",
            files: []
          };
          currentLevel.push(newFolder);
          currentLevel = newFolder.files;
        } else {
          currentLevel = existing.files;
        };
      };
    });
  };

  return result;
};

function renderFileTree(files) {
  return files.map((file) => {
    if (file.type === "folder") {
      return `
        <div class="file-tree-item folder">
          <i class="fas fa-folder"></i>
          <span>${escapeHtml(file.name)}</span>
        </div>
        <div class="folder-content" style="display: none; padding-left: 1rem;">
          ${renderFileTree(file.files)}
        </div>
      `;
    } else {
      const icon = (file.name.endsWith(".json")) ? "fa-file" : "fa-file-code";
      return `
        <div class="file-tree-item" data-filename="${escapeHtml(file.name)}">
          <i class="fas ${icon}"></i>
          <span>${escapeHtml(file.name.substring(0, file.name.length))}</span>
        </div>
      `;
    };
  }).join("");
};

function getFileTreeItem(view, path = "") {
  let parts = path.split("/");
  let container = view.querySelector(".file-tree") || view.querySelector(".help-tree");

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    let foundItem = null;

    const items = Array.from(container.children).filter((el) => el.classList.contains("file-tree-item"));
    for (const item of items) {
      const span = item.querySelector("span");
      if (span && ((span.textContent.trim() === part) || (span.parentElement?.dataset?.filename?.trim() === part))) {
        foundItem = item;
        break;
      };
    };

    if (!foundItem) return null;

    if (i === parts.length - 1) {
      return foundItem;
    } else {
      const next = foundItem.nextElementSibling;
      if (!next || !next.classList.contains("folder-content")) {
        return null;
      };
      container = next;
    };
  };

  return null;
};

function getFilePath(fileItem) {
  let path = [];

  while (fileItem && !fileItem.classList.contains("file-tree")) {
    if (fileItem.classList.contains("file-tree-item")) {
      let span = fileItem.querySelector("span");
      if (span) {
        path.unshift(fileItem.dataset.filename || span.textContent.trim());
      };
    };

    if (fileItem.parentElement && fileItem.parentElement.classList.contains("folder-content")) {
      fileItem = fileItem.parentElement.previousElementSibling;
    } else {
      fileItem = fileItem.parentElement;
    };
  };

  return path.join("/");
};

function parseFileTree(fileTree) {
  const result = [];
  const stack = [{ node: fileTree, path: "." }];

  while (stack.length > 0) {
    const { node, path } = stack.pop();

    for (let i = 0; i < node.children.length; i++) {
      const el = node.children[i];

      if (el.classList.contains("file-tree-item") && el.classList.contains("folder")) {
        const folderName = el.querySelector("span").textContent.trim();
        const folderPath = `${path}/${folderName}`;

        result.push(folderPath);

        const next = el.nextElementSibling;
        if (next && next.classList.contains("folder-content")) {
          stack.push({ node: next, path: folderPath });
        };
      } else if (el.classList.contains("file-tree-item") && el.dataset.filename) {
        result.push(`${path}/${el.dataset.filename}`);
      };
    };
  };

  return result;
};

function showDownloadModal() {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>✨ Become a LocalBotify User! ✨</h2>
        <button class="close-btn"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <form id="upgradeForm">
          <div class="form-group" style="margin-bottom: 1rem;">
            <p style="margin-bottom: 0.5rem;">Looks like you're using the LocalBotify editor session of someone else. 👀</p>
            <p style="text-decoration: underline; color: #ffb100de;">Downloading is entirely free!</p>
          </div>
          <div class="form-actions" style="margin-top: 0;">
            <button type="submit" class="submit-btn">
              Get Started
            </button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  const closeModal = () => {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);

    const workspaceView = document.querySelector(".workspace-view");

    Array.from(workspaceView.querySelectorAll(".workspace-tabs button")).find((tab) => tab.querySelector("i").className === "fas fa-tools").classList.remove("active");
    Array.from(workspaceView.querySelectorAll(".workspace-tabs button")).find((tab) => tab.classList.contains("currentView")).classList.add("active");
  };

  modal.querySelector(".close-btn").addEventListener("click", closeModal);
  modal.querySelector(".cancel-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const form = modal.querySelector("#upgradeForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    closeModal();

    const link = document.createElement("a");
    link.href = `${window.location.origin}/#download`;
    link.target = "_blank";

    link.click();
  });
};

function showUpgradeModal() {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>✨ Become a LocalBotify Pro User! ✨</h2>
        <button class="close-btn"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body">
        <form id="upgradeForm">
          <div class="form-group" style="margin-bottom: 1rem;">
            <p style="margin-bottom: 0.5rem;">Looks like you tried to access a LocalBotify Pro feature. 👀</p>
            <p style="text-decoration: underline; color: #ffb100de;">Upgrading only costs 5$ / month!</p>
          </div>
          <div class="form-actions" style="margin-top: 0;">
            <button type="submit" class="submit-btn">
              Upgrade Now
            </button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  const closeModal = () => {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);

    const workspaceView = document.querySelector(".workspace-view");

    Array.from(workspaceView.querySelectorAll(".workspace-tabs button")).find((tab) => tab.querySelector("i").className === "fas fa-trophy").classList.remove("active");
    Array.from(workspaceView.querySelectorAll(".workspace-tabs button")).find((tab) => tab.classList.contains("currentView")).classList.add("active");
  };

  modal.querySelector(".close-btn").addEventListener("click", closeModal);
  modal.querySelector(".cancel-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  const form = modal.querySelector("#upgradeForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    closeModal();

    const link = document.createElement("a");
    link.href = `${window.location.origin}/#pricing`;
    link.target = "_blank";

    link.click();
  });
};

function confirm(title, message = "", mode, buttonText) {
  return new Promise((resolve, reject) => {
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${escapeHtml(title)}</h2>
          <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form id="botForm">
            <div class="form-group">
              ${message.split("\n").map((line) => `<p>${escapeHtml(line)}</p>`).join("\n")}
            </div>
            <div class="form-actions">
              <button type="submit" class="submit-btn${(mode === "dangerous") ? ` submit-report-btn" style="background-color: var(--discord-red);"` : `"`}>
                ${escapeHtml(buttonText || title)}
              </button>
              <button type="button" class="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add("show"), 10);

    const closeModal = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
      reject();
    };

    modal.querySelector(".close-btn").addEventListener("click", closeModal);
    modal.querySelector(".cancel-btn").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    const form = modal.querySelector("#botForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
      resolve();
    });
  });
};

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/"/g, "&#039;");
};