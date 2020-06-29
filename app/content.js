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

    // Construct sentence with sentiment classes
    var span = document.createElement('span');
    span.classList.add(generalSentimentClasses[i]);
    span.classList.add('troogl-sentence');
    span.appendChild(range.extractContents());

    // Add constructed sentence to article
    range.insertNode(span);
}

// Disable editing of article
document.designMode = 'off';

// Return page scroll to its original position
window.scrollTo(pageXOffset, pageYOffset);

// Remove final sentence selection
window.getSelection().collapse(document.body, 0);