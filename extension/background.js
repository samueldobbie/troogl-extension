/* Display user guide upon installation of plugin */
chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({
        url: 'index.html'
    });
});


/* Analyse article upon plugin icon click */
chrome.browserAction.onClicked.addListener(function(activeTab) {
    // Get id and url of active tab
    var tabId = activeTab.id;
    var tabUrl = activeTab.url;

    // Ensure that url is a news article that hasn't already been analysed
    chrome.tabs.executeScript(tabId, {file: 'validate-url.js'}, function (result) {
        if (result[0]) {
            analyseArticle(tabId, tabUrl);   
        }
    });
});


function analyseArticle(tabId, tabUrl) {
    // Inject jQuery
    chrome.tabs.executeScript(tabId, {file: 'third-party/jquery-3.5.1.min.js'}, function () {
        chrome.tabs.executeScript(tabId, {file: 'third-party/jquery.sparkline.js'}, function () {
            chrome.tabs.executeScript(tabId, {file: 'third-party/jquery-ui.min.js'}, function () {
                // Inject CSS
                chrome.tabs.insertCSS(tabId, {file: 'background.css'});

                // Inject overlay and loader
                chrome.tabs.executeScript(tabId, {file: 'loader.js'});

                // Extract HTML from article
                chrome.tabs.executeScript(tabId, {file: 'extract-html.js'}, function (result) {
                    var tabHtml = result[0];

                    // Construct API query
                    var request = new XMLHttpRequest();
                    //var apiUrl = 'https://32pjz6f6ca.execute-api.eu-west-2.amazonaws.com/troogl';
                    var apiUrl = 'http://127.0.0.1:5000/';
                    var params = {
                        'url': tabUrl,
                        'html': tabHtml
                    };

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
                });
            });
        });
    });
}
