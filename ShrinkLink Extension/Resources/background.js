browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugger;
  console.log("Received request: ", request);
  const { action, data } = request;

  switch (action) {
    case "CHECK_IF_SHORTENED":
      sendResponse({
        shortURL: localStorage.getItem(request.data),
      });
      break;
    case "SAVE_SHORTENED_URL":
      const encodedUrl = btoa(data.originalURL);
      localStorage.setItem(encodedUrl, data.shortenedURL);
      break;

    default:
      console.log("Incorrect Action Specified...");
  }
});
