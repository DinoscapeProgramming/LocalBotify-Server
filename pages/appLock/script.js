window.addEventListener("message", ({ data: { type, id } }) => {
  if (type === "create") {
    navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(),
        rp: {
          name: "LocalBotify"
        },
        user: {
          id: new Uint8Array(1),
          name: "LocalBotify",
          displayName: ""
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7
          },
          {
            type: "public-key",
            alg: -8
          },
          {
            type: "public-key",
            alg: -257
          }
        ]
      }
    }).then(({ rawId }) => {
      opener.postMessage({
        type,
        id: btoa(String.fromCharCode(...new Uint8Array(rawId)))
      }, "*");
    }).catch(() => {
      opener.postMessage({
        type: "error"
      }, "*");
    });
  } else if (type === "verify") {
    navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(),
        allowCredentials: [
          {
            type: "public-key",
            id
          }
        ]
      }
    }).then(() => {
      opener.postMessage({
        type
      }, "*");
    }).catch(() => {
      opener.postMessage({
        type: "error"
      }, "*");
    });
  };
});

if (window.opener) {
  opener.postMessage({
    type: "ready"
  }, "*");
};