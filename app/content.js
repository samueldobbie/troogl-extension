function prepareSentences(sentences) {

    enablePageEditing();

    for (var i = 0; i < sentences.length; i++) {
        // Find sentence within page
        window.find(sentences[i]);

        // Get selected sentence range
        var range = window.getSelection().getRangeAt(0);

        // Construct sentence container
        var container = document.createElement('span');

        // Add sentiment classes to container
        container.classList.add('troogl-sentence');
        container.appendChild(range.extractContents());

        // Add popup to sentence container
        container.addEventListener('click', function() {
            alert(2);
        });

        // Insert constructed sentence into article
        range.insertNode(container);

        // Return selection cursor to beginning of document
        window.getSelection().collapse(document.body, 0);
    }

    disablePageEditing();
}


function updateSentenceClasses(sentenceClasses) {

    enablePageEditing();

    var sentences = document.getElementsByClassName('troogl-sentence');

    // Return sentences to default state
    for (var i = 0; i < sentences.length; i++) {
        
        // Remove existing sentiment class
        stripSentimentClass(sentences[i]);

        // Add default sentiment class
        sentences[i].classList.add('troogl-neutral');
    }

    // Update sentences based on entity sentiments
    for (var i = 0; i < sentenceClasses.length; i++) {
        var sentenceIndex = sentenceClasses[i]['sentence_index'];
        var sentenceClass = sentenceClasses[i]['sentence_class'];

        // Remove existing sentiment class
        stripSentimentClass(sentences[sentenceIndex]);

        // Add updated sentiment class 
        sentences[sentenceIndex].classList.add(sentenceClass);
    }

    disablePageEditing();
}


function stripSentimentClass(sentence) {
    sentence.classList.remove('troogl-negative');
    sentence.classList.remove('troogl-neutral');
    sentence.classList.remove('troogl-positive');
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


function insertDashboard(sentenceClasses) {
    var dashboardContainer = document.createElement('div');
    dashboardContainer.style.position = 'fixed';
    dashboardContainer.style.bottom = '0';
    dashboardContainer.style.left = '0';
    dashboardContainer.style.width = '100%';
    dashboardContainer.style.borderBottom = '1vh solid #333';
    dashboardContainer.style.height = '7vh';
    dashboardContainer.style.lineHeight = '8vh';
    dashboardContainer.style.zIndex = 1000000;

    var dashboardBar = document.createElement('div');
    dashboardBar.id = 'troogl-dashboard-bar';
    dashboardBar.style.backgroundColor = '#5555FF';
    dashboardBar.style.borderTopLeftRadius = '4px';
    dashboardBar.style.borderTopRightRadius = '4px';
    dashboardBar.style.width = '100%';
    dashboardBar.style.margin = '0 auto';
    dashboardBar.style.zIndex = 1000000;

    // Add perspective dropdown to dashboard content    
    var perspectiveDropdown = document.createElement('select');
    perspectiveDropdown.style.padding = '5px';
    perspectiveDropdown.style.borderRadius = '7.5px';
    perspectiveDropdown.style.fontSize = '16px';
    perspectiveDropdown.style.marginLeft = '2%';
    perspectiveDropdown.style.outline = 'none';
    perspectiveDropdown.style.cursor = 'pointer';

    // Populate perspective dropdown
    for (var key in sentenceClasses) {
        perspectiveOption = document.createElement('option');
        perspectiveOption.innerText = key;
        perspectiveDropdown.appendChild(perspectiveOption);
    }

    // Update sentence classes upon changing perspective
    perspectiveDropdown.addEventListener('change', function () {
        updateSentenceClasses(sentenceClasses[perspectiveDropdown.value]);
    });

    var sparklineChart = document.createElement('span');
    sparklineChart.id = 'troogl-sparkline';
    sparklineChart.style.zIndex = 1000000000000000;

    // Inject dashboard into page
    dashboardBar.appendChild(perspectiveDropdown);
    dashboardBar.appendChild(sparklineChart);
    dashboardContainer.appendChild(dashboardBar);
    document.body.appendChild(dashboardContainer);
    
    $('#troogl-sparkline').sparkline([0, 0, -1, -1, -1, -1, 1, 1, 1, 0, 1, 1, -1, 0, 0, 1, 1], {
        type: 'bar',
        height: '40',
        barWidth: 5,
        barSpacing: 2,
        barColor: '#00d800',
        negBarColor: '#ff0000',
        zeroColor: '#000000'
    });
}

var pageXOffset, pageYOffset;

// Parse response data
var response = JSON.parse(response);
var sentences = response['sentences'];
var sentenceClasses = response['sentence_sentiment_classes'];

prepareSentences(sentences);
updateSentenceClasses(sentenceClasses[response['default_entity_name']]);
insertDashboard(sentenceClasses);
