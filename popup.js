// Check if extension have access to incognito windows/tabs
chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
  if (isAllowed) {
    // document.body.appendChild();
  } else {
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

    document.body.appendChild(noAccessError);
    document.body.appendChild(buttonToExtensionsPage);
  }
});

const reopenWindowBtn = document.getElementById("reopen-window");

// When the button is clicked, inject setPageBackgroundColor into current page
reopenWindowBtn.onclick = async function () {
  // Get current window to check if it is a incognito window
  const { id, incognito } = await chrome.windows.getCurrent();

  // Only reopen the tabs in new window if the current window is a incognito window
  if (incognito) {
    const tabs = await chrome.tabs.query({
      // Instead of currentWindow, windowId can be used too, but this just simplifies the API use
      currentWindow: true,
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

    // Close the entire incognito window and all tabs in it once the new window is created
    await chrome.windows.remove(id);
  }
};
