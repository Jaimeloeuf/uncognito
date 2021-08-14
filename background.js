chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Uncognito installed");
  }
});

chrome.contextMenus.create({
  title: "Open this (incognito) tab in a normal window",
  contexts: [chrome.contextMenus.ContextType.ALL],
  id: "context",
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  const { id, incognito } = tab;

  if (incognito) {
    // Await for window to be created before closing the incognito tab
    await chrome.windows.create({
      // Opens a normal active window
      focused: true,
      type: "normal",

      // Open in a normal window
      incognito: false,

      // Have to use URL instead of tab IDs because tabs can only be moved between windows of the same profile
      // i.e incognito tabs can only be moved to another incognito window
      // The tab URL is either the tab current URL or if none, then use the pending URL
      url: tab.url || tab.pendingUrl,
    });

    // Close incognito tab once tab is opened new window
    await chrome.tabs.remove(id);
  }
});
