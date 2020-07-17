// Display user guide upon installation of plugin
if (!window.localStorage.getItem('hasSeenIntroduction')) {
    window.localStorage.setItem('hasSeenIntroduction', true);
    chrome.tabs.create({
        url: 'https://www.troogl.com/browser-extension/how-it-works/'
    });
}

//var apiUrl = 'http://samueldobbie.pythonanywhere.com/analyse/?url=';
var apiUrl = 'http://127.0.0.1:8000/analyse/?url=';

chrome.browserAction.onClicked.addListener(function(activeTab) {
    // Get id and url of active tab
    var tabId = activeTab.id;
    var tabUrl = activeTab.url;

    // Ensure that url is a news article that hasn't already been analysed
    chrome.tabs.executeScript(tabId, {file: 'validate-url.js'}, function (result) {
        if (result[0]) {
            // Inject CSS
            chrome.tabs.insertCSS(tabId, {file: 'background.css'});

            // Inject overlay and loader
            chrome.tabs.executeScript(tabId, {file: 'loader.js'});

            // Construct URL for API query
            var queryUrl = apiUrl + encodeURIComponent(tabUrl);

            // Construct API query
            var request = new XMLHttpRequest();
            request.open('GET', queryUrl, true);

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
            request.send();
        }
    });
});