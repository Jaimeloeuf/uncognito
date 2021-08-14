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
  if (tab.incognito) {
    const tabUrl = tab.url || tab.pendingUrl;

    // Await for window to be created before closing the incognito tab
    await chrome.windows.create({
      // opens a normal active window
      focused: true,
      type: "normal",

      // Open in a normal window
      incognito: false,

      // tabId: tab.id,

      url: [tabUrl],
    });

    await chrome.tabs.remove(tab.id);
  }
});
