// Check if extension have access to incognito windows/tabs
chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
  // Get error element and add error message to it if incognito access is not given to extension
  if (!isAllowed)
    document.getElementById("no-incognito-access-error").innerHTML =
      "Please enable incognito access to use extension. <a href='chrome://extensions'>chrome://extensions</a>";

  // Make a button that is clickable to use chrome.tabs to open a new tab to chrome://extensions instead of the link
});

const btn = document.getElementById("reopen");

// When the button is clicked, inject setPageBackgroundColor into current page
btn.addEventListener("click", async () => {
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
});
