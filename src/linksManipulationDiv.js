import { createFlexRowDiv } from "./createFlexRowDiv.js";
import { isJSON } from "./isJSON.js";

/**
 * Function to create and return HTML Div element of the `link manipulation section`
 */
export function linksManipulationDiv() {
  /* Button to copy links of all tabs in window */
  const copyAllLinksBtn = document.createElement("button");
  copyAllLinksBtn.innerHTML = "All tabs in current window";
  copyAllLinksBtn.style.backgroundColor = "rgb(220, 220, 220)";
  copyAllLinksBtn.onclick = async function () {
    const tabs = await chrome.tabs.query({ currentWindow: true });

    const groups = {};
    for (const tab of tabs) {
      if (!groups[tab.groupId]) {
        // Only insert group name if it is in a group, no group have -1 groupID
        if (tab.groupId === -1) {
          groups[tab.groupId] = { tabs: [] };
        } else {
          const { title, color } = await chrome.tabGroups.get(tab.groupId);
          groups[tab.groupId] = { title, color, tabs: [] };
        }
      }

      groups[tab.groupId].tabs.push(tab.url);
    }
    await navigator.clipboard.writeText(JSON.stringify(groups));

    // @todo Might close the tabs too? Have a setting, set in options.html
    // Close the popup
    window.close();
  };

  /* Button to copy links of all tabs in window */
  const copySelectedLinksBtn = document.createElement("button");
  copySelectedLinksBtn.innerHTML = "Selected tabs only";
  copySelectedLinksBtn.style.backgroundColor = "rgb(253, 222, 227)";
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
    // Close the popup
    window.close();
  };

  /* Divider between copy links buttons and the reopen links section */
  const reopenDivider = document.createElement("h2");
  reopenDivider.innerHTML = "Re-Open links";
  reopenDivider.style.marginBottom = "0rem";
  reopenDivider.style.color = "grey";

  /* textarea for user to paste in their links */
  const reopenLinksInput = document.createElement("textarea");
  reopenLinksInput.id = "reopenLinksInput";
  reopenLinksInput.style.resize = "none";
  reopenLinksInput.style.width = "99%";
  reopenLinksInput.style.height = "4rem";

  /* Button to read the links in textarea and create a new window with it */
  const reopenLinksInNewWindowBtn = document.createElement("button");
  reopenLinksInNewWindowBtn.innerHTML = "In new window";
  reopenLinksInNewWindowBtn.style.backgroundColor = "rgb(253, 222, 227)";
  reopenLinksInNewWindowBtn.onclick = async function () {
    // Check if current window is incognito
    const { incognito } = await chrome.windows.getCurrent();

    // Refer to these
    // https://chrome.google.com/webstore/detail/tab-groups-extension/nplimhmoanghlebhdiboeellhgmgommi?hl=en
    // https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-get
    const inputValue = document.getElementById("reopenLinksInput").value;
    const json = isJSON(inputValue);

    if (json) {
      const urlsWithNoGroup = json["-1"]?.tabs;
      delete json["-1"];

      // Open in the same type of window as the current window
      const { id: windowId } = await chrome.windows.create({
        focused: true,
        type: "normal",
        incognito,
        // state: "maximized",
        url: urlsWithNoGroup,
      });

      for (const group of Object.values(json)) {
        const tabIds = await Promise.all(
          group.tabs.map((url) =>
            chrome.tabs.create({ windowId, url }).then(({ id }) => id)
          )
        );

        const newTabGroupID = await chrome.tabs.group({
          createProperties: { windowId },
          tabIds,
        });
        chrome.tabGroups.update(newTabGroupID, {
          title: group.title,
          color: group.color,
        });
      }
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
  reopenLinksInSameWindowBtn.style.backgroundColor = "rgb(220, 220, 220)";
  reopenLinksInSameWindowBtn.onclick = async function () {
    chrome.tabs.create({
      url: document.getElementById("reopenLinksInput").value.split("\n")[0],
    });
  };

  /* Div to group everything together to return as a single element */
  const div = document.createElement("div");
  div.innerHTML = `<h1 style="margin-bottom: 0em;">Manipulating tab URLs</h1>`;
  div.innerHTML += `<h2 style="margin-bottom: 0em; color: grey;">Copy links</h2>`;
  div.appendChild(createFlexRowDiv(copyAllLinksBtn, copySelectedLinksBtn));

  div.appendChild(reopenDivider);
  div.appendChild(reopenLinksInput);
  div.appendChild(
    createFlexRowDiv(reopenLinksInSameWindowBtn, reopenLinksInNewWindowBtn)
  );

  return div;
}
