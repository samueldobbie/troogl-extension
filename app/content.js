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
        stripSentence(sentences[i]);

        // Set default sentence values
        sentences[i].classList.add('troogl-neutral');
        sentences[i].setAttribute('troogl-class-value', 0);
    }

    // Update sentences based on entity sentiments
    for (var i = 0; i < sentenceClasses.length; i++) {
        var sentenceIndex = sentenceClasses[i]['sentence_index'];
        var sentenceClassString = sentenceClasses[i]['sentence_class_string'];
        var sentenceClassValue = sentenceClasses[i]['sentence_class_value'];

        // Remove existing sentiment class
        stripSentence(sentences[sentenceIndex]);

        // Update sentence values
        sentences[sentenceIndex].classList.add(sentenceClassString);
        sentences[sentenceIndex].setAttribute('troogl-class-value', sentenceClassValue);
    }

    disablePageEditing();
}


function stripSentence(sentence) {
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
    dashboardBar.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    var perspectiveContainer = document.createElement('span');
    perspectiveContainer.style.flexGrow = 1;
    perspectiveContainer.style.padding = '1.5% 0';

    var perspectiveHeader = document.createElement('span');
    perspectiveHeader.innerText = 'PERSPECTIVE';
    perspectiveHeader.style.color = 'white';
    perspectiveHeader.style.fontSize = '12px';
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
        updateSparkLine();
    });

    perspectiveContainer.appendChild(perspectiveHeader);
    perspectiveContainer.appendChild(linebreak);
    perspectiveContainer.appendChild(perspectiveDropdown);

    var sparklineContainer = document.createElement('span');
    sparklineContainer.style.flexGrow = 1;
    sparklineContainer.style.padding = '1.5% 0';

    var sparklineChart = document.createElement('span');
    sparklineChart.id = 'troogl-sparkline';

    sparklineContainer.appendChild(sparklineChart);

    // Inject dashboard into page
    dashboardBar.appendChild(perspectiveContainer);
    dashboardBar.appendChild(sparklineContainer);
    dashboardContainer.appendChild(dashboardBar);
    document.body.insertBefore(dashboardContainer, document.body.firstChild);
    
    // Populate sparkline with article sentiments
    updateSparkLine();
}

function updateSparkLine() {
    var sentences = document.getElementsByClassName('troogl-sentence');

    var sparklineValues = [];
    for (var i = 0; i < sentences.length; i++) {
        sparklineValues.push(sentences[i].getAttribute('troogl-class-value'));
    }

    /*
    $('#troogl-sparkline').sparkline(sparklineValues, {
        type: 'line',
        width: '400',
        height: '50',
        lineColor: 'white',
        fillColor: 'rgba(0, 0, 0, 0)',
        lineWidth: 4,
        spotRadius: 4,
        spotColor: '#f1f1f1',
        minSpotColor: '#f1f1f1',
        maxSpotColor: '#f1f1f1',
        highlightSpotColor: '#333',
        highlightLineColor: '#333'
    });
    */

    $('#troogl-sparkline').sparkline(sparklineValues, {
        type: 'tristate',
        height: '50',
        barWidth: 10
    });

    var sparklineCanvas = document.getElementById('troogl-sparkline').childNodes[0];
    sparklineCanvas.style.backgroundColor = '#2a2abd';
    sparklineCanvas.style.padding = '5px';
    sparklineCanvas.style.borderRadius = '5px';
}

var pageXOffset, pageYOffset;

// Parse response data
var response = JSON.parse(response);
var sentences = response['sentences'];
var sentenceClasses = response['sentence_sentiment_classes'];

prepareSentences(sentences);
updateSentenceClasses(sentenceClasses[response['default_entity_name']]);
insertDashboard(sentenceClasses);
