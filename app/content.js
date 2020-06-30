function updateSentenceClasses(sentences, classes, isInitial) {
    
    enablePageEditing();

    if (isInitial) {
        insertSentenceContainers(sentences, classes);
    } else {
        updateSentenceContainers(sentences, classes);
    }

    disablePageEditing();
}


function insertSentenceContainers(sentences, classes) {
    for (var i = 0; i < sentences.length; i++) {
        // Find sentence within page
        window.find(sentences[i]);

        // Get selected sentence range
        var range = window.getSelection().getRangeAt(0);

        // Construct sentence container
        var container = document.createElement('span');

        // Add sentiment classes to container
        container.classList.add('troogl-sentence');
        container.classList.add(classes[i]);
        container.appendChild(range.extractContents());

        // Add popup to container
        container.addEventListener('click', function() {
            alert(2);
        });

        // Insert constructed sentence into article
        range.insertNode(container);

        // Return selection cursor to beginning of document
        window.getSelection().collapse(document.body, 0);
    }
}


function updateSentenceContainers(classes) {
    var trooglSentences = document.getElementsByClassName('troogl-sentences');

    for (var i = 0; i < trooglSentences.length; i++) {
        // Remove existing troogl class
        trooglSentences[i].classList.remove('troogl-negative');
        trooglSentences[i].classList.remove('troogl-neutral');
        trooglSentences[i].classList.remove('troogl-positive');

        // Add updated troogl class
        trooglSentences[i].classList.remove(classes[i]);
    }
}


function enablePageEditing() {
    // Enable editing of article
    document.designMode = 'on';

    // Get original scroll positioning within page
    pageXOffset = window.pageXOffset;
    pageYOffset = window.pageYOffset;
}


function disablePageEditing() {
    // Disable editing of article
    document.designMode = 'off';

    // Remove final sentence selection
    window.getSelection().collapse(document.body, 0);

    // Return page scroll to original positioning
    window.scrollTo(pageXOffset, pageYOffset);
}


function insertDashboard() {
    // Construct and add dashboard container
    var dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'troogl-dashboard-container';
    dashboardContainer.style.position = 'fixed';
    dashboardContainer.style.bottom = '0px';
    dashboardContainer.style.left = '0px';
    dashboardContainer.style.width = '100%';
    dashboardContainer.style.zIndex = 1000000;

    // Construct and add dashboard button
    var dashboardButton = document.createElement('div');
    dashboardButton.id = 'troogl-dashboard-button';
    dashboardButton.innerText = 'Troogl Dashboard +';
    dashboardButton.style.fontSize = '18px';
    dashboardButton.style.fontWeight = 'bold';
    dashboardButton.style.color = 'white';
    dashboardButton.style.backgroundColor = '#5555FF';
    dashboardButton.style.outline = 'none';
    dashboardButton.style.boxShadow = '0 0 3px #333';
    dashboardButton.style.border = 'none';
    dashboardButton.style.textAlign = 'center';
    dashboardButton.style.borderTopRightRadius = '100%';
    dashboardButton.style.borderTopLeftRadius = '100%';
    dashboardButton.style.transition = 'all 0.7s';
    dashboardButton.style.padding = '5px';
    dashboardButton.style.cursor = 'pointer';
    dashboardButton.style.zIndex = 1000000;

    // Construct and add dashboard content
    var dashboardContent = document.createElement('div');
    dashboardContent.id = 'troogl-dashboard-content';
    dashboardContent.style.backgroundColor = 'white';
    dashboardContent.style.height = '40vh';
    dashboardContent.style.maxHeight = '0px';
    dashboardContent.style.transition = 'max-height 0.7s';
    dashboardContent.style.zIndex = 1000000;

    // Add perspective dropdown to dashboard content    
    var perspectiveDropdown = document.createElement('select');
    for (var i = 0; i < 100; i++) {
        var perspectiveOption = document.createElement('option');
        perspectiveOption.innerText = i.toString();
        perspectiveDropdown.appendChild(perspectiveOption);
    }

    // Construct dashboard
    dashboardContent.appendChild(perspectiveDropdown);
    dashboardContainer.appendChild(dashboardButton);
    dashboardContainer.appendChild(dashboardContent);

    // Inject dashboard into article
    document.body.appendChild(dashboardContainer)

    // Enable dashboard to expand and collapse upon click
    document.getElementById('troogl-dashboard-button').addEventListener('click', function () {
        var content = this.nextElementSibling;
        if (content.style.maxHeight == '40vh'){
            content.style.maxHeight = '0px';        
            this.innerText = 'Troogl Dashboard +';
            this.style.borderTopRightRadius = '100%';
            this.style.borderTopLeftRadius = '100%';
        } else {
            content.style.maxHeight = '40vh';
            this.innerText = 'Troogl Dashboard -';
            this.style.borderTopRightRadius = '0px';
            this.style.borderTopLeftRadius = '0px';
        }
    });
}


var pageXOffset, pageYOffset;

// Parse response data
var response = JSON.parse(response);
var sentences = response['sentences'];
var sentenceClasses = response['general_sentiment_classes'];

updateSentenceClasses(sentences, sentenceClasses, true);
insertDashboard();