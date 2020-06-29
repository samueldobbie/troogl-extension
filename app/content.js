// Parse response data
var response = JSON.parse(response);

// Core article data
var headline = response['headline'];
var body = response['body'];
var sentences = response['sentences'];
var generalSentimentClasses = response['general_sentiment_classes'];

// Get scroll positioning within page
var pageXOffset = window.pageXOffset;
var pageYOffset = window.pageYOffset;

// Enable editing of article
document.designMode = 'on';

// Update article sentences using general sentiments
for (var i = 0; i < sentences.length; i++) {
    // Find sentence within page
    window.find(sentences[i]);

    // Get selected sentence range
    var range = window.getSelection().getRangeAt(0);

    // Construct sentence container
    var container = document.createElement('span');

    // Add sentiment classes to container
    container.classList.add(generalSentimentClasses[i]);
    container.classList.add('troogl-sentence');
    container.appendChild(range.extractContents());

    // Add popup to container (to-do: placeholder for now)
    container.addEventListener('click', function() {
        alert(2);
    });

    // Add constructed sentence to article
    range.insertNode(container);
}

// Disable editing of article
document.designMode = 'off';

// Return page scroll to its original position
window.scrollTo(pageXOffset, pageYOffset);

// Remove final sentence selection
window.getSelection().collapse(document.body, 0);