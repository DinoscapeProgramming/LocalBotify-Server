window.addEventListener("message", ({ data }) => {
  puter.ai.chat(
    data, 
    {
      stream: true
    }
  ).then(async (response) => {
    for await (const part of response) {
      parent.postMessage(part?.text || "", "*");
    };

    parent.postMessage(null, "*");
  });
});