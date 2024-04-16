// Function to create and return HTML Div element of the `link reopening section`
function reopenTabsDiv(incognito) {
  /* Button for re-opening entire incognito window */
  const reopenWindowBtn = document.createElement("button");
  reopenWindowBtn.innerHTML = "Current window";
  reopenWindowBtn.style = "background-color: rgb(220, 220, 220)";
  reopenWindowBtn.onclick = async function () {
    // Get current window to check if it is a incognito window
    const { id } = await chrome.windows.getCurrent();

    // Only reopen the tabs in new window if the current window is a incognito window
    if (incognito) {
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
  reopenSelectedBtn.innerHTML = "Selected tabs only";
  reopenSelectedBtn.style = "background-color: rgb(253, 222, 227)";
  reopenSelectedBtn.onclick = async function () {
    // Only reopen the tabs in new window if the current window is a incognito window
    if (incognito) {
      const tabs = await chrome.tabs.query({
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

  const buttonDiv = document.createElement("div");
  buttonDiv.style.display = "flex";
  buttonDiv.style.flexDirection = "row";
  buttonDiv.style.justifyContent = "space-between";
  buttonDiv.style.gap = "1rem";
  buttonDiv.appendChild(reopenWindowBtn);
  buttonDiv.appendChild(reopenSelectedBtn);

  /* Div to group everything together to return as a single element */
  const div = document.createElement("div");
  div.innerHTML = `<h1 style="margin-bottom: 0em;">Re-Open tabs in ${
    incognito ? "normal" : "incognito"
  } window</h1>`;
  div.appendChild(buttonDiv);
  // div.innerHTML += `<hr />`;
  // Must use insert Adjacent HTML instead of just doing a string concat because,
  // https://stackoverflow.com/questions/5113105/manipulating-innerhtml-removes-the-event-handler-of-a-child-element
  div.insertAdjacentHTML("beforeend", "<hr />");

  return div;
}

const isJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return false;
  }
};

// Function to create and return HTML Div element of the `link manipulation section`
function linksManipulationDiv() {
  /* Button to copy links of all tabs in window */
  const copyAllLinksBtn = document.createElement("button");
  copyAllLinksBtn.innerHTML = "<b>All tabs</b> in current window";
  copyAllLinksBtn.style = "background-color: rgb(220, 220, 220)";
  copyAllLinksBtn.onclick = async function () {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // Extract out only the URLs of the tab(s) array
    const tabURLs = tabs.map((tab) => tab.url);

    await navigator.clipboard.writeText(tabURLs.join("\n"));

    // @todo Might close the tabs too? Have a setting, set in options.html
    // @todo Close the popup
  };

  /* Button to copy links of all tabs in window */
  const copySelectedLinksBtn = document.createElement("button");
  copySelectedLinksBtn.innerHTML = "<b>Selected</b> tabs only";
  copySelectedLinksBtn.style = "background-color: rgb(253, 222, 227)";
  copySelectedLinksBtn.onclick = async function () {
    const tabs = await chrome.tabs.query({
      currentWindow: true,

      // Only get the tabs that are selected by user
      highlighted: true,
    });

    // Extract out only the URLs of the tab(s) array
    const tabURLs = tabs.map((tab) => tab.url);

    await navigator.clipboard.writeText(tabURLs.join("\n"));

    // @todo Might close the tabs too? Have a setting, set in options.html
    // @todo Close the popup
  };

  /* Divider between copy links buttons and the reopen links section */
  const reopenDivider = document.createElement("h2");
  reopenDivider.innerHTML = "Open links";
  reopenDivider.style = "margin-bottom: 0em; color: grey;";

  /* textarea for user to paste in their links */
  const reopenLinksInput = document.createElement("textarea");
  reopenLinksInput.id = "reopenLinksInput";

  /* Button to read the links in textarea and create a new window with it */
  const reopenLinksBtn = document.createElement("button");
  reopenLinksBtn.innerHTML = "Re-open links";
  reopenLinksBtn.style = "background-color: rgb(253, 222, 227)";
  reopenLinksBtn.onclick = async function () {
    // Check if current window is incognito
    const { incognito } = await chrome.windows.getCurrent();

    // Refer to these
    // https://chrome.google.com/webstore/detail/tab-groups-extension/nplimhmoanghlebhdiboeellhgmgommi?hl=en
    // https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-get

    const inputValue = document.getElementById("reopenLinksInput").value;
    const json = isJSON(inputValue);

    if (json) {
      // Opens a normal active window
      const { id: windowId } = await createWindow({
        focused: true,
        type: "normal",
        // state: "maximized",

        // Open in the same type of window as the current window
        incognito,
      });

      console.log("windowId", windowId);

      const noGroup = json["-1"];
      delete json["-1"];

      for (const groupID in json) {
        const group = json[groupID];

        const tabIds = await Promise.all(
          group.tabs.map((url) =>
            chrome.tabs.create({ windowId, url }).then(({ id }) => id)
          )
        );

        const new_groupID = await chrome.tabs.group({ tabIds });

        chrome.tabGroups.update(new_groupID, {
          collapsed: group.name.collapsed,
          color: group.name.color,
          title: group.name.title,
        });
      }

      noGroup.tabs.map((url) => chrome.tabs.create({ windowId, url }));
    } else {
      // Opens a normal active window
      chrome.windows.create({
        focused: true,
        type: "normal",
        // state: "maximized",

        // Open in the same type of window as the current window
        incognito,

        // URLs of the tab(s) should be seperated by newlines
        url: inputValue.split("\n"),
      });
    }
  };

  /* Button to read the links in textarea and create a new window with it */
  const reopenLinksInSameWindowBtn = document.createElement("button");
  reopenLinksInSameWindowBtn.innerHTML = "In same window";
  reopenLinksInSameWindowBtn.style = "background-color: rgb(220, 220, 220)";
  reopenLinksInSameWindowBtn.onclick = async function () {
    chrome.tabs.create({
      url: document.getElementById("reopenLinksInput").value.split("\n")[0],
    });
  };

  /* Div to group everything together to return as a single element */
  const div = document.createElement("div");
  div.innerHTML = `<h1 style="margin-bottom: 0em;">Manipulating tab URLs</h1>`;
  div.innerHTML += `<h2 style="margin-bottom: 0em; color: grey;">Copy links</h2>`;
  div.appendChild(copyAllLinksBtn);
  div.appendChild(copySelectedLinksBtn);

  div.appendChild(reopenDivider);
  div.appendChild(reopenLinksInput);
  div.appendChild(reopenLinksBtn);
  div.appendChild(reopenLinksInSameWindowBtn);

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
  if (!isAllowed) {
    document.body.appendChild(errorPopup());
    return;
  }

  // Get current window's incognito status
  const { incognito } = await chrome.windows.getCurrent();
  document.body.appendChild(reopenTabsDiv(incognito));
  document.body.appendChild(linksManipulationDiv());
});
