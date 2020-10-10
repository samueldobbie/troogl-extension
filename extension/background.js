// Display user guide upon installation of plugin
chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({
        url: 'index.html'
    });
});


// Analyse article upon plugin icon click
chrome.browserAction.onClicked.addListener(function(activeTab) {
    const id = activeTab.id;

    // Validate article selection
    chrome.tabs.executeScript(id, {file: 'validate-article.js'}, function (result) {
        if (result[0]) {
            // Inject jQuery
            chrome.tabs.executeScript(id, {file: 'third-party/jquery-3.5.1.min.js'}, function () {
                chrome.tabs.executeScript(id, {file: 'third-party/jquery.sparkline.js'}, function () {
                    chrome.tabs.executeScript(id, {file: 'third-party/jquery-ui.min.js'}, function () {
                        analyseArticle(id);
                    });
                });
            });
        }
    });
});


function analyseArticle(tabId) {
    // Inject CSS and loader overlay
    chrome.tabs.insertCSS(tabId, {file: 'background.css'});
    chrome.tabs.executeScript(tabId, {file: 'loader.js'});

    // Extract article HTML
    chrome.tabs.executeScript(tabId, {file: 'extract-html.js'}, function (result) {
        // Construct API query
        var request = new XMLHttpRequest();
        var apiUrl = 'http://127.0.0.1:5000/v1/api/analyse';
        var params = JSON.stringify({'html': result[0]});

        request.open('POST', apiUrl, true);

        // Pass response data to content script
        request.onload = function() {
            var responseText = request.responseText;
            if (responseText == 'None') {
                chrome.tabs.executeScript(tabId, {file: 'parse-failure.js'});
            } else {
                var responseCode = 'var response = ' + JSON.stringify(responseText);
                chrome.tabs.executeScript(tabId, {code: responseCode}, function() {
                    chrome.tabs.executeScript(tabId, {file: 'content.js'});
                });
            }
        }

        // Send query
        request.send(params);
    });
}
