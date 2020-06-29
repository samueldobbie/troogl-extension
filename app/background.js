var apiUrl = 'http://127.0.0.1:8000';

chrome.browserAction.onClicked.addListener(function(activeTab) {
    // Get id and url of active tab
    var tabId = activeTab.id;
    var tabUrl = activeTab.url;
    
    // Inject core CSS
    chrome.tabs.insertCSS(tabId, {file: 'background.css'});

    // Construct url for api query
    var queryUrl = apiUrl + '/analyse/' + tabUrl;
    
	// Send API query
    var request = new XMLHttpRequest();
    request.open('GET', queryUrl, true);
    request.send();
	
    // To-do: Validate that the url is a valid news article
    
    request.onload = function() {
        // Pass api response data to the content script
        chrome.tabs.executeScript(tabId, {code: "var response = " + JSON.stringify(request.responseText)}, function() {
            chrome.tabs.executeScript(tabId, {file: 'content.js'});
        });
    }
});