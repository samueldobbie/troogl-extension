var apiUrl = 'http://127.0.0.1:8000';

chrome.browserAction.onClicked.addListener(function(activeTab) {
    // Get id and url of active tab
    var tabId = activeTab.id;
    var tabUrl = activeTab.url;

    // Ensure that url is a news article and that it hasn't already been analysed
    chrome.tabs.executeScript(tabId, {file: 'validate-url.js'}, function (result) {
        if (result[0]) {
            // Inject CSS
            chrome.tabs.insertCSS(tabId, {file: 'background.css'});

            // Construct URL for API query
            var queryUrl = apiUrl + '/analyse/' + tabUrl;
            
            // Send API query
            var request = new XMLHttpRequest();
            request.open('GET', queryUrl, true);
            request.send();
            
            request.onload = function() {
                // Pass API response data to the content script
                chrome.tabs.executeScript(tabId, {code: 'var response = ' + JSON.stringify(request.responseText)}, function() {
                    chrome.tabs.executeScript(tabId, {file: 'content.js'});
                });
            }
        }
    });
});