// Check if extension have access to incognito windows/tabs
chrome.extension.isAllowedIncognitoAccess((isAllowed) => {
  // Get error element and add error message to it if incognito access is not given to extension
  if (!isAllowed)
    document.getElementById("no-incognito-access-error").innerHTML =
      "Please enable incognito access to use extension. <a href='chrome://extensions'>chrome://extensions</a>";

  // Make a button that is clickable to use chrome.tabs to open a new tab to chrome://extensions instead of the link
});
