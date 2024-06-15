import { createFlexRowDiv } from "./createFlexRowDiv.js";

// Function to create and return HTML Div element of the `link reopening section`
export function reopenTabsDiv(incognito) {
  /* Button for re-opening entire incognito window */
  const reopenWindowBtn = document.createElement("button");
  reopenWindowBtn.innerHTML = "Current window";
  reopenWindowBtn.style.backgroundColor = "rgb(220, 220, 220)";
  reopenWindowBtn.onclick = async function () {
    // Get current window to check if it is a incognito window
    const { id } = await chrome.windows.getCurrent();

    const tabs = await chrome.tabs.query({ currentWindow: true });

    // Extract out only the URLs of the tab(s) array
    const tabURLs = tabs.map((tab) => tab.url);

    // Await for new window to be created first before closing the incognito window
    await chrome.windows.create({
      // Opens a normal active window
      focused: true,
      type: "normal",
      incognito: !incognito,

      // Have to use URL instead of tab IDs because tabs can only be moved between windows of the same profile
      // i.e incognito tabs can only be moved to another incognito window
      url: tabURLs,
    });

    // Close the entire incognito window and all tabs in it once the new window is created
    await chrome.windows.remove(id);
  };

  /* Button for re-opening selected tabs only */
  const reopenSelectedBtn = document.createElement("button");
  reopenSelectedBtn.innerHTML = "Selected tabs only";
  reopenSelectedBtn.style.backgroundColor = "rgb(253, 222, 227)";
  reopenSelectedBtn.onclick = async function () {
    // Only get the tabs that are selected by user
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      highlighted: true,
    });

    // Extract out only the URLs of the tab(s) array
    const tabURLs = tabs.map((tab) => tab.url);

    // Await for new window to be created first before the original tabs
    await chrome.windows.create({
      focused: true,
      type: "normal",
      incognito: !incognito,

      // Have to use URL instead of tab IDs because tabs can only be moved between windows of the same profile
      // i.e incognito tabs can only be moved to another incognito window
      url: tabURLs,
    });

    // Only close the selected tabs once the new window is created
    await chrome.tabs.remove(tabs.map((tab) => tab.id));
  };

  /* Div to group everything together to return as a single element */
  const div = document.createElement("div");
  div.innerHTML = `<h1 style="margin-bottom: 0em;">Re-Open tabs in ${
    incognito ? "normal" : "incognito"
  } window</h1>`;
  div.appendChild(createFlexRowDiv(reopenWindowBtn, reopenSelectedBtn));
  // div.innerHTML += `<hr />`;
  // Must use insert Adjacent HTML instead of just doing a string concat because,
  // https://stackoverflow.com/questions/5113105/manipulating-innerhtml-removes-the-event-handler-of-a-child-element
  div.insertAdjacentHTML("beforeend", "<hr />");

  return div;
}
