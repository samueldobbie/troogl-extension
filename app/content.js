// Parse response data
var response = JSON.parse(response);

// Core article data
var headline = response['headline'];
var body = response['body'];
var sentences = response['sentences'];

console.log(headline);
console.log(body);
console.log(sentences);