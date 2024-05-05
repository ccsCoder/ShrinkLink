const API_KEY = "o1VHxSXSnpSVhpb8hBzsvMfBudI8Ef8yLuMWOkXQYrpX9";
const ENDPOINT = "https://shrtlnk.dev/api/v2/link";

/**
 * returns a promise which resolves to 'shortened url' if the string was already shortened. Rejects otherwise.
 */
const isAlreadyShortened = (url) => {
  return new Promise((resolve, reject) => {
    browser.runtime.sendMessage(
      {
        action: "CHECK_IF_SHORTENED",
        data: btoa(url),
      },
      (response) => {
        if (Object.hasOwnProperty(response, "shortURL")) {
          resolve(response.shortURL);
        } else {
          resolve(null);
        }
      },
    );
  });
};

const saveShortenedURL = (url, shortenedURL) => {
  browser.runtime.sendMessage({
    action: "SAVE_SHORTENED_URL",
    data: {
      originalURL: url,
      shortenedURL,
    },
  });
};

const writeClipboardText = () => {
  const clipText = new ClipboardItem({
    "text/plain": new Blob([document.querySelector("#longURL").value], {
      type: "text/plain",
    }),
  });
  navigator.clipboard.write([clipText]).then(() => {
    setStatus("Copied");
    document.querySelector("#shrink").setAttribute("disabled");
  });
};

const setStatus = (text) => {
  const button = document.querySelector("#shrink");
  button.textContent = text;
};

function onComplete(shrtlnk) {
  document.querySelector("#longURL").value = shrtlnk;
  // copy the text to clipboard
  // writeClipboardText(shrtlnk);
}

const shorten = async (longUrl) => {
  try {
    // check if already shortened...
    const shortURL = await isAlreadyShortened(longUrl);
    if (shortURL !== null) {
      // we have the shortened URL !
      onComplete(shortURL);
      return;
    }
    // otherwise make the API Call and proceed to save it.
    const { shrtlnk } = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: longUrl,
      }),
    }).then((response) => {
      return response.json();
    });
    onComplete(shrtlnk);
    // also save the shortened thingy
    saveShortenedURL(longUrl, shrtlnk);
  } catch (error) {
    setStatus(error.message);
    console.log(error);
  }
};

const init = async () => {
  // get the current url and populate the input.
  const tabInfo = await browser.tabs.getCurrent();
  document.querySelector("#longURL").value = tabInfo.url;

  // attach click listener.
  document.querySelector("#shrink").addEventListener("click", async (e) => {
    e.preventDefault();
    if (document.querySelector("#shrink").textContent === "Copy Shrunk URL") {
      writeClipboardText();
      return;
    }
    // set status to working...
    setStatus("Shrinking ...");
    // call the shorten api
    await shorten(tabInfo.url);
    setStatus("Copy Shrunk URL");
  });
};

// BEGIN !
init();
