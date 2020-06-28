var apiUrl = 'http://127.0.0.1:8000';

chrome.browserAction.onClicked.addListener(function(activeTab) {
    // Get id and url of active tab
    var tabId = activeTab.id;
    var tabUrl = activeTab.url;
    
    // Construct url for api query
    var queryUrl = apiUrl + '/query/' + tabUrl + '/';
    
	// Send API query
    var request = new XMLHttpRequest();
    request.open('GET', queryUrl, true);
    request.send();
	
	// To-do: Validate that the url is a valid news article
});