window.addEventListener("message", ({ data: { name, description, stats, invite, features } }) => {
  puter.fs.readdir("./").then(async (items) => {
    try {
      await new Promise((resolve, reject) => {
        if (items.includes("landing-page")) resolve();

        puter.fs.mkdir("landing-page").then(() => {
          resolve();
        });
      });

      await puter.fs.writeFile("landing-page/index.html", `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(name)}</title>
    <link rel="stylesheet" href="/pages/bots/style.css" />
  </head>
  <body>
    <div id="root">
      <div class="min-h-screen bg-[#1a1b1e]">
        <header class="relative overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"
          ></div>
          <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-bot w-16 h-16 mx-auto mb-6 text-purple-500"
            >
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <h1 class="text-5xl font-bold text-white mb-6">${escape(name)}</h1>
            <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">${escape(description)}</p>
            <a
              href="${escape(invite)}"
              class="inline-flex items-center px-6 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
            >Add to Discord<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-chevron-right ml-2 w-5 h-5"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            </a>
          </div>
        </header>
        <section class="py-16 bg-[#2a2b2e]">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-users w-8 h-8 mx-auto mb-4 text-purple-500"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3 class="text-3xl font-bold text-white mb-2">${escape(((users) => {
                  if (users >= 1_000_000_000) return (users / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B+";
                  if (users >= 1_000_000) return (users / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
                  if (users >= 1_000) return (users / 1_000).toFixed(1).replace(/\.0$/, "") + "K+";
                  return users.toString();
                })(stats[0]))}</h3>
                <p class="text-gray-400">Active Users</p>
              </div>
              <div class="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-message-square w-8 h-8 mx-auto mb-4 text-purple-500"
                >
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  ></path>
                </svg>
                <h3 class="text-3xl font-bold text-white mb-2">${escape(((messages) => {
                  if (messages >= 1_000_000_000) return (messages / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B+";
                  if (messages >= 1_000_000) return (messages / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
                  if (messages >= 1_000) return (messages / 1_000).toFixed(1).replace(/\.0$/, "") + "K+";
                  return messages.toString();
                })(stats[1]))}</h3>
                <p class="text-gray-400">Messages Processed</p>
              </div>
              <div class="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-shield w-8 h-8 mx-auto mb-4 text-purple-500"
                >
                  <path
                    d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
                  ></path>
                </svg>
                <h3 class="text-3xl font-bold text-white mb-2">${escape(((servers) => {
                  if (servers >= 1_000_000_000) return (servers / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B+";
                  if (servers >= 1_000_000) return (servers / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M+";
                  if (servers >= 1_000) return (servers / 1_000).toFixed(1).replace(/\.0$/, "") + "K+";
                  return servers.toString();
                })(stats[2]))}</h3>
                <p class="text-gray-400">Servers Served</p>
              </div>
            </div>
          </div>
        </section>
        <section class="py-20">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-white text-center mb-16">
              Powerful Features
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${features.reduce((accumulator, current, index) => {
                if ((index % 3) === 0) {
                  accumulator.push([current]);
                } else {
                  accumulator[acc.length - 1].push(current);
                };
                return accumulator;
              }, []).forEach(([featureIcon, featureName, featureDescription]) => `
                <div
                  class="bg-[#2a2b2e] rounded-lg p-6 hover:bg-[#3a3b3e] transition-colors"
                >
                  <div class="text-purple-500 mb-4">
                    <i class="fas fa-${escape(featureIcon)}" style="font-size: 1.5rem;">
                  </div>
                  <h3 class="text-xl font-semibold text-white mb-2">${escape(featureName)}</h3>
                  <p class="text-gray-400">${escape(featureDescription)}</p>
                </div>
              `)}
            </div>
          </div>
        </section>
        <section class="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-white mb-6">
              Ready to enhance your Discord server?
            </h2>
            <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of servers already using DiscoMaster Bot to create
              engaging communities.
            </p>
            <div class="flex justify-center gap-4">
              <a
                href="${escape(invite)}"
                class="px-6 py-3 rounded-full bg-white text-purple-600 font-semibold hover:bg-gray-100 transition-colors"
              >Add to Discord</a>
              <a
                href="#"
                class="px-6 py-3 rounded-full bg-transparent border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
              >View Documentation</a>
            </div>
          </div>
        </section>
        <footer class="py-8 bg-[#1a1b1e]">
          <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400"
          >
            <p>© ${escape(new Date().getFullYear().toString())} ${escape(name)}. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  </body>
</html>`);
      await puter.fs.writeFile("landing-page/style.css", `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}

*, ::before, ::after {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: #e5e7eb;
}

::before, ::after {
  --tw-content: "";
}

html, :host {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-feature-settings: normal;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
}

body {
  margin: 0;
  line-height: inherit;
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline dotted;
}

h1, h2, h3, h4, h5, h6 {
  font-size: inherit;
  font-weight: inherit;
}

a {
  color: inherit;
  text-decoration: inherit;
}

b, strong {
  font-weight: bolder;
}

code, kbd, samp, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-feature-settings: normal;
  font-variation-settings: normal;
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub, sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

table {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}

button, input, optgroup, select, textarea {
  font-family: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}

button, select {
  text-transform: none;
}

button, input:where([type="button"]), input:where([type="reset"]), input:where([type="submit"]) {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}

:-moz-focusring {
  outline: auto;
}

:-moz-ui-invalid {
  box-shadow: none;
}

progress {
  vertical-align: baseline;
}

::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
  height: auto;
}

[type="search"] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}

summary {
  display: list-item;
}

blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol, ul, menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

dialog {
  padding: 0;
}

textarea {
  resize: vertical;
}

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  color: #9ca3af;
}

input::placeholder, textarea::placeholder {
  opacity: 1;
  color: #9ca3af;
}

button, [role="button"] {
  cursor: pointer;
}

:disabled {
  cursor: default;
}

img, svg, video, canvas, audio, iframe, embed, object {
  display: block;
  vertical-align: middle;
}

img, video {
  max-width: 100%;
  height: auto;
}

[hidden] {
  display: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-16 {
  margin-bottom: 4rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.grid {
  display: grid;
}

.h-16 {
  height: 4rem;
}

.h-5 {
  height: 1.25rem;
}

.h-6 {
  height: 1.5rem;
}

.h-8 {
  height: 2rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-16 {
  width: 4rem;
}

.w-5 {
  width: 1.25rem;
}

.w-6 {
  width: 1.5rem;
}

.w-8 {
  width: 2rem;
}

.max-w-2xl {
  max-width: 42rem;
}

.max-w-7xl {
  max-width: 80rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

.overflow-hidden {
  overflow: hidden;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.border-2 {
  border-width: 2px;
}

.border-white {
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity));
}

.bg-\[\#1a1b1e\] {
  --tw-bg-opacity: 1;
  background-color: rgb(26 27 30 / var(--tw-bg-opacity));
}

.bg-\[\#2a2b2e\] {
  --tw-bg-opacity: 1;
  background-color: rgb(42 43 46 / var(--tw-bg-opacity));
}

.bg-purple-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(147 51 234 / var(--tw-bg-opacity));
}

.bg-transparent {
  background-color: transparent;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple-600 {
  --tw-gradient-from: #9333ea var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(147 51 234 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-purple-600\/20 {
  --tw-gradient-from: rgb(147 51 234 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(147 51 234 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-blue-600 {
  --tw-gradient-to: #2563eb var(--tw-gradient-to-position);
}

.to-blue-600\/20 {
  --tw-gradient-to: rgb(37 99 235 / 0.2) var(--tw-gradient-to-position);
}

.p-6 {
  padding: 1.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-16 {
  padding-top: 4rem;
  padding-bottom: 4rem;
}

.py-20 {
  padding-top: 5rem;
  padding-bottom: 5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-16 {
  padding-bottom: 4rem;
}

.pt-20 {
  padding-top: 5rem;
}

.text-center {
  text-align: center;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-300 {
  --tw-text-opacity: 1;
  color: rgb(209 213 219 / var(--tw-text-opacity));
}

.text-gray-400 {
  --tw-text-opacity: 1;
  color: rgb(156 163 175 / var(--tw-text-opacity));
}

.text-purple-500 {
  --tw-text-opacity: 1;
  color: rgb(168 85 247 / var(--tw-text-opacity));
}

.text-purple-600 {
  --tw-text-opacity: 1;
  color: rgb(147 51 234 / var(--tw-text-opacity));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.text-white\/90 {
  color: rgb(255 255 255 / 0.9);
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #1a1b1e;
}

.hover\:bg-\[\#3a3b3e\]:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(58 59 62 / var(--tw-bg-opacity));
}

.hover\:bg-gray-100:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity));
}

.hover\:bg-purple-700:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(126 34 206 / var(--tw-bg-opacity));
}

.hover\:bg-white\/10:hover {
  background-color: rgb(255 255 255 / 0.1);
}

@media (min-width: 640px) {
  .sm\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .lg\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}`);

      await puter.hosting.create(data.subdomain, "landing-page");

      parent.postMessage({
        err: null,
        success: true
      }, "*");
    } catch (err) {
      parent.postMessage({
        err,
        success: false
      }, "*");
    };
  });
});

function escape(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/"/g, "&#039;");
};