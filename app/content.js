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

    // Add class to each sentence
    var sentenceElement = window.getSelection().baseNode.parentElement;
    sentenceElement.classList.add(generalSentimentClasses[i]);
    sentenceElement.classList.add('troogl-sentence');
}

// Disable editing of article
document.designMode = 'off';

// Return page scroll to its original position
window.scrollTo(pageXOffset, pageYOffset);

// Remove final sentence selection
window.getSelection().collapse(document.body, 0);