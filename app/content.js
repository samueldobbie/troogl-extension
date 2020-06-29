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

var pageXOffset, pageYOffset;

// Parse response data
var response = JSON.parse(response);
var sentences = response['sentences'];
var sentenceClasses = response['general_sentiment_classes'];

updateSentenceClasses(sentences, sentenceClasses, true);