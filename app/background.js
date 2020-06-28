chrome.browserAction.onClicked.addListener(function(activeTab) {
    chrome.tabs.executeScript(null, {file: "content.js"});
});