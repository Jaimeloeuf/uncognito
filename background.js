chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Uncognito installed");
  }
});

chrome.contextMenus.create({
  title: "Uncognito this tab",
  contexts: [chrome.contextMenus.ContextType.ALL],
  id: "context",
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (tab.incognito) {
    const tabUrl = tab.url || tab.pendingUrl;

    chrome.windows.create({
      // opens a normal active window
      focused: true,
      type: "normal",

      // Open in a normal window
      incognito: false,

      // tabId: tab.id,

      url: [tabUrl],
    });
  }
});
