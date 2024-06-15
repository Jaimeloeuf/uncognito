// Error popup UI
export function errorPopup() {
  const noAccessError = document.createElement("h2");
  noAccessError.innerHTML =
    "Please enable incognito access to use extension in extension's settings page";
  noAccessError.style.color = "rgb(255, 90, 90)";

  const buttonToExtensionsPage = document.createElement("button");
  buttonToExtensionsPage.innerHTML = "Extension's settings";
  buttonToExtensionsPage.style.backgroundColor = "rgb(253, 222, 227);";
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
