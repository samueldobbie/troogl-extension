// Display user guide upon installation of plugin
chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({
        url: 'https://www.troogl.com/browser-extension/how-it-works/'
    });
});


chrome.browserAction.onClicked.addListener(function(activeTab) {
    // Get id of active tab
    var tabId = activeTab.id;
    var tabUrl = activeTab.url;

    // Ensure that url is a news article that hasn't already been analysed
    chrome.tabs.executeScript(tabId, {file: 'validate-url.js'}, function (result) {
        if (result[0]) {
            // Inject CSS
            chrome.tabs.insertCSS(tabId, {file: 'background.css'});

            // Inject overlay and loader
            chrome.tabs.executeScript(tabId, {file: 'loader.js'});

            // Construct API query
            var request = new XMLHttpRequest();
            // var apiUrl = 'http://samueldobbie.pythonanywhere.com/analyse/?url=';
            var apiUrl = 'http://127.0.0.1:8000/analyse/';
            var params = {'url': tabUrl};
            request.open('POST', apiUrl, true);

            // Pass API response data to content script
            request.onload = function() {
                if (request.responseText != 'None') {
                    chrome.tabs.executeScript(tabId, {code: 'var response = ' + JSON.stringify(request.responseText)}, function() {
                        chrome.tabs.executeScript(tabId, {file: 'content.js'});
                    });
                } else {
                    chrome.tabs.executeScript(tabId, {file: 'parse-failure.js'});
                }
            }

            // Send API query
            request.send(JSON.stringify(params));
        }
    });
});