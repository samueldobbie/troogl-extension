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
    dashboardContainer.style.position = 'relative';
    dashboardContainer.style.width = '100%';
    dashboardContainer.style.height = '12.5vh';
    dashboardContainer.style.zIndex = 1000000000000;

    var dashboardBar = document.createElement('div');
    dashboardBar.style.display = 'flex';
    dashboardBar.style.position = 'fixed';
    dashboardBar.style.width = '100%';
    dashboardBar.style.height = '12.5vh';
    dashboardBar.style.padding = '0 5%';
    dashboardBar.style.alignContent = 'space-around';
    dashboardBar.style.backgroundColor = '#5555FF';
    dashboardBar.style.boxShadow = '0 0 5px #333';

    var perspectiveContainer = document.createElement('span');
    perspectiveContainer.style.flexGrow = 1;
    perspectiveContainer.style.padding = '1.5% 0';

    var perspectiveHeader = document.createElement('span');
    perspectiveHeader.innerText = 'Perspective';
    perspectiveHeader.style.color = 'white';
    perspectiveHeader.style.fontSize = '18px';
    perspectiveHeader.style.fontWeight = 'bold';

    var linebreak = document.createElement('br');

    var perspectiveDropdown = document.createElement('select');
    perspectiveDropdown.style.padding = '5px';
    perspectiveDropdown.style.borderRadius = '7.5px';
    perspectiveDropdown.style.fontSize = '16px';
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

    perspectiveContainer.appendChild(perspectiveHeader);
    perspectiveContainer.appendChild(linebreak);
    perspectiveContainer.appendChild(perspectiveDropdown);

    var sparklineContainer = document.createElement('span');
    sparklineContainer.style.flexGrow = 2;
    sparklineContainer.style.padding = '1.5% 0';

    var sparklineChart = document.createElement('span');
    sparklineChart.id = 'troogl-sparkline';

    sparklineContainer.appendChild(sparklineChart);

    // Inject dashboard into page
    dashboardBar.appendChild(perspectiveContainer);
    dashboardBar.appendChild(sparklineContainer);
    dashboardContainer.appendChild(dashboardBar);

    document.body.insertBefore(dashboardContainer, document.body.firstChild);
    //document.body.appendChild(dashboardContainer);
    
    // Populate sparkline with article sentiments
    /*
    $('#troogl-sparkline').sparkline([0, 0, -1, -1, -1, -1, 1, 1, 1, 0, 1, 1, -1, 0, 0, 1, 1], {
        type: 'tristate',
        height: '35',
        barWidth: 7.5,
        barSpacing: 2.5,
        zeroAxis: false
    });
    */

    $('#troogl-sparkline').sparkline([0, 0, -1, -1, -1, -1, 1, 1, 1, 0, 1, 1, -1, 0, 0, 1, 1], {
        type: 'line',
        width: '400',
        height: '50',
        lineColor: 'white',
        fillColor: 'rgba(0, 0, 0, 0)',
        lineWidth: 4,
        spotColor: '#333',
        minSpotColor: '#333',
        maxSpotColor: '#333',
        highlightSpotColor: '#333',
        highlightLineColor: '#333',
        spotRadius: 5
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
