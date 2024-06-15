import { errorPopup } from "./errorPopup.js";
import { linksManipulationDiv } from "./linksManipulationDiv.js";
import { reopenTabsDiv } from "./reopenTabsDiv.js";

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
