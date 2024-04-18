chrome.runtime.onInstalled.addListener((installationObject) => {
  if (installationObject.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("Uncognito installed");
  }
});

chrome.contextMenus.create({
  id: "context-menu",
  title: "Toggle and re-open this tab as a normal/incognito tab",
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  // Await for window to be created before closing the incognito tab
  await chrome.windows.create({
    focused: true,
    type: "normal",
    incognito: !tab.incognito,

    // Have to use URL instead of tab IDs because tabs can only be moved
    // between windows of the same profile i.e incognito tabs can only be
    // moved to another incognito window. The tab URL is either the tab's
    // current URL or if none, then use the pending URL
    url: tab.url || tab.pendingUrl,
  });

  // Close incognito tab once tab is opened new window
  await chrome.tabs.remove(tab.id);
});
