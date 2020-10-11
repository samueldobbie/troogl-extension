// Display user guide upon installation of plugin
chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({
        url: 'index.html'
    });
});


// Analyse article upon plugin icon click
chrome.browserAction.onClicked.addListener(function(activeTab) {
    const tabId = activeTab.id;

    // Validate article selection
    chrome.tabs.executeScript(tabId, {file: 'validate-article.js'}, function (result) {
        if (result[0]) {
            // Inject jQuery
            chrome.tabs.executeScript(tabId, {file: 'third-party/jquery-3.5.1.min.js'}, function () {
                chrome.tabs.executeScript(tabId, {file: 'third-party/jquery.sparkline.js'}, function () {
                    chrome.tabs.executeScript(tabId, {file: 'third-party/jquery-ui.min.js'}, function () {
                        analyseArticle(tabId);
                    });
                });
            });
        } else {
            alert('The article is invalid or has already been analysed.');
        }
    });
});


function analyseArticle(tabId) {
    // Inject CSS and loader overlay
    chrome.tabs.insertCSS(tabId, {file: 'background.css'});
    chrome.tabs.executeScript(tabId, {file: 'loader.js'});

    // Extract article HTML
    chrome.tabs.executeScript(tabId, {file: 'extract-html.js'}, function (result) {
        // Construct query
        const request = new XMLHttpRequest();
        const queryUrl = 'http://127.0.0.1:5000/v1/api/analyse';
        const queryData = JSON.stringify({'html': result[0]});

        request.open('POST', queryUrl, true);

        // Inject results into article page
        request.onload = function() {
            const responseText = request.responseText;

            if (responseText == 'None') {
                chrome.tabs.executeScript(tabId, {file: 'parse-failure.js'});
            } else {
                const responseCode = 'var response = ' + JSON.stringify(responseText);
                chrome.tabs.executeScript(tabId, {code: responseCode}, function() {
                    chrome.tabs.executeScript(tabId, {file: 'content.js'});
                });
            }
        }

        request.send(queryData);
    });
}
