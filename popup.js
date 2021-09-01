// Normal popup UI when current window is NOT a incognito window
function mountNotIncognitoPopup() {
  const notIncognitoWindowNotice = document.createElement("h2");
  notIncognitoWindowNotice.innerHTML =
    "Uncognito extension only works in incognito mode. The current window is <b>NOT</b> in incognito mode.";
  notIncognitoWindowNotice.style = "color: rgb(255, 84, 84)";

  document.body.appendChild(notIncognitoWindowNotice);
}

// Function to create and return HTML Div element of the `link reopening section`
function reopenIncognitoTabsDiv() {
  /* Button for re-opening entire incognito window */
  const reopenWindowBtn = document.createElement("button");
  reopenWindowBtn.innerHTML = "<b>All tabs</b> in current window";
  reopenWindowBtn.style = "background-color: rgb(220, 220, 220)";
  reopenWindowBtn.onclick = async function () {
    // Get current window to check if it is a incognito window
    const { id, incognito } = await chrome.windows.getCurrent();

    // Only reopen the tabs in new window if the current window is a incognito window
    if (incognito) {
      // Instead of currentWindow, windowId can be used too, but this just simplifies the readability of the API usage
      const tabs = await chrome.tabs.query({ currentWindow: true });

      // Extract out only the URLs of the tab(s) array
      const tabURLs = tabs.map((tab) => tab.url);

      // Await for new window to be created first before closing the incognito window
      await chrome.windows.create({
        // Opens a normal active window
        focused: true,
        type: "normal",

        // Open in a normal window
        incognito: false,

        // Have to use URL instead of tab IDs because tabs can only be moved between windows of the same profile
        // i.e incognito tabs can only be moved to another incognito window
        url: tabURLs,
      });

      // Close the entire incognito window and all tabs in it once the new window is created
      await chrome.windows.remove(id);
    }
  };

  /* Button for re-opening selected tabs only */
  const reopenSelectedBtn = document.createElement("button");
  reopenSelectedBtn.innerHTML = "<b>Selected</b> tabs only";
  reopenSelectedBtn.style = "background-color: rgb(253, 222, 227)";
  reopenSelectedBtn.onclick = async function () {
    // Get current window to check if it is a incognito window
    const { incognito } = await chrome.windows.getCurrent();

    // Only reopen the tabs in new window if the current window is a incognito window
    if (incognito) {
      const tabs = await chrome.tabs.query({
        // Instead of currentWindow, windowId can be used too, but this just simplifies the readability of the API usage
        currentWindow: true,

        // Only get the tabs that are selected by user
        highlighted: true,
      });

      // Extract out only the URLs of the tab(s) array
      const tabURLs = tabs.map((tab) => tab.url);

      // Await for new window to be created first before closing the incognito window
      await chrome.windows.create({
        // Opens a normal active window
        focused: true,
        type: "normal",

        // Open in a normal window
        incognito: false,

        // Have to use URL instead of tab IDs because tabs can only be moved between windows of the same profile
        // i.e incognito tabs can only be moved to another incognito window
        url: tabURLs,
      });

      // Only close the selected tabs once the new window is created
      await chrome.tabs.remove(tabs.map((tab) => tab.id));
    }
  };

  /* Div to group the buttons for reopening tabs */
  const div = document.createElement("div");
  div.innerHTML = `<h1 style="margin-bottom: 0em;">Re-Open tabs in normal window</h1>`;
  div.appendChild(reopenWindowBtn);
  div.appendChild(reopenSelectedBtn);
  div.innerHTML += `<hr />`;

  return div;
}

// Function to create and return HTML Div element of the `link manipulation section`
function linksManipulationDiv() {
  /* Button to copy links of all tabs in window */
  const copyAllLinksBtn = document.createElement("button");
  copyAllLinksBtn.innerHTML =
    "Copy all links <b>selected tabs only</b> in normal window";
  copyAllLinksBtn.style = "background-color: rgb(253, 222, 227)";
  copyAllLinksBtn.onclick = async function () {
    const tabs = await chrome.tabs.query({
      // Instead of currentWindow, windowId can be used too, but this just simplifies the readability of the API usage
      currentWindow: true,

      // Only get the tabs that are selected by user
      // highlighted: true,
    });

    // Extract out only the URLs of the tab(s) array
    const tabURLs = tabs.map((tab) => tab.url);

    await navigator.clipboard.writeText(tabURLs.join("\n"));

    // @todo Close the popup
  };

  /* textarea for user to paste in their links */
  const reopenLinksInput = document.createElement("textarea");
  reopenLinksInput.id = "reopenLinksInput";

  /* Button to read the links in textarea and create a new window with it */
  const reopenLinksBtn = document.createElement("button");
  reopenLinksBtn.innerHTML = "Re-open links";
  reopenLinksBtn.style = "background-color: rgb(253, 222, 227)";
  reopenLinksBtn.onclick = function () {
    // Create new window
    chrome.windows.create({
      // Opens a normal active window
      focused: true,
      type: "normal",

      // Open in a normal window
      incognito: false,

      // URLs of the tab(s) should be seperated by newlines
      url: document.getElementById("reopenLinksInput").value.split("\n"),
    });
  };

  /* Div to group the buttons for tab links */
  const div = document.createElement("div");
  div.innerHTML = `<h1 style="margin-bottom: 0em;">Manipulating tab URLs</h1>`;
  div.appendChild(copyAllLinksBtn);
  div.appendChild(reopenLinksInput);
  div.appendChild(reopenLinksBtn);

  return div;
}

// Error popup UI
function errorPopup() {
  const noAccessError = document.createElement("h2");
  noAccessError.innerHTML =
    "Please enable incognito access to use extension in extension's settings page";
  noAccessError.style = "color: rgb(255, 90, 90)";

  const buttonToExtensionsPage = document.createElement("button");
  buttonToExtensionsPage.innerHTML = "Extension's settings";
  buttonToExtensionsPage.style = "background-color: rgb(253, 222, 227);";
  buttonToExtensionsPage.onclick = function () {
    chrome.tabs.create({
      // Create tab and focus on it
      active: true,

      // From chrome extension root URL to chrome extension settings page
      // chrome-extension://aeghlmlmidbengggkhfocdkdhejpmfjh/
      // chrome://extensions/?id=aeghlmlmidbengggkhfocdkdhejpmfjh
      url:
        "chrome://extensions/?id=" +
        chrome.runtime
          .getURL("")
          .replace("chrome-extension://", "")
          .replace("/", ""),
    });
  };

  /* Div to group everything together to return as a single element */
  const div = document.createElement("div");
  div.appendChild(noAccessError);
  div.appendChild(buttonToExtensionsPage);

  return div;
}

// Check if extension have access to incognito windows/tabs and mount a specific popup UI
chrome.extension.isAllowedIncognitoAccess(async (isAllowed) => {
  if (isAllowed) {
    // Get current window to check if it is a incognito window
    const { incognito } = await chrome.windows.getCurrent();

    document.body.appendChild(reopenIncognitoTabsDiv());
    document.body.appendChild(linksManipulationDiv());
  } else {
    document.body.appendChild(errorPopup());
  }
});
