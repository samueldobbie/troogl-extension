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
    dashboardContainer.id = 'troogl-dashboard-container';
    dashboardContainer.style.position = 'relative';
    dashboardContainer.style.width = '100%';
    dashboardContainer.style.height = '12.5vh';
    dashboardContainer.style.zIndex = 1000000000000;

    var dashboardBar = document.createElement('div');
    dashboardBar.style.position = 'fixed';
    dashboardBar.style.width = '100%';
    dashboardBar.style.height = '12.5vh';
    dashboardBar.style.display = 'flex';
    dashboardBar.style.flexWrap = 'nowrap';
    dashboardBar.style.alignItems = 'center'; 
    dashboardBar.style.justifyContent = 'center';
    dashboardBar.style.backgroundColor = '#5555FF';
    dashboardBar.style.boxShadow = '0 0 5px #333';
    dashboardBar.style.padding = '0 5%';
    dashboardBar.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    var perspectiveContainer = document.createElement('span');
    perspectiveContainer.style.flexGrow = 1;

    var perspectiveHeader = document.createElement('span');
    perspectiveHeader.innerText = 'PERSPECTIVE';
    perspectiveHeader.style.color = 'white';
    perspectiveHeader.style.fontSize = '12px';
    perspectiveHeader.style.fontWeight = 'bold';
    perspectiveHeader.style.marginLeft = '0.5%';

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
        updateGraphs();
    });

    perspectiveContainer.appendChild(perspectiveHeader);
    perspectiveContainer.appendChild(linebreak);
    perspectiveContainer.appendChild(perspectiveDropdown);

    var graphContainer = document.createElement('span');
    graphContainer.style.flexGrow = 2;

    // Sparkline
    var sparklineChart = document.createElement('span');
    sparklineChart.id = 'troogl-sparkline';

    // Piechart
    var piechartChart = document.createElement('span');
    piechartChart.id = 'troogl-piechart';
    piechartChart.style.marginLeft = '0.5%';

    graphContainer.appendChild(sparklineChart);
    graphContainer.appendChild(piechartChart);

    var hideButton = document.createElement('span');
    hideButton.id = 'troogl-collapse-button';
    hideButton.innerText = 'Collapse';
    hideButton.style.color = '#2a2abd';
    hideButton.style.cursor = 'pointer';
    hideButton.style.textDecoration = 'underline';
    hideButton.style.flexGrow = 1;

    // Inject dashboard into page
    dashboardBar.appendChild(perspectiveContainer);
    dashboardBar.appendChild(graphContainer);
    dashboardBar.appendChild(hideButton);
    dashboardContainer.appendChild(dashboardBar);
    document.body.insertBefore(dashboardContainer, document.body.firstChild);
    
    // Populate sparkline and piechart with article sentiments
    updateGraphs();
}


function updateGraphs() {
    var sentences = document.getElementsByClassName('troogl-sentence');

    var sparklineValues = [];
    var piechartValues = [0, 0, 0];
    for (var i = 0; i < sentences.length; i++) {
        var sentenceValue = sentences[i].getAttribute('troogl-class-value');
        sparklineValues.push(sentenceValue);

        if (sentenceValue == -1) {
            piechartValues[0] = piechartValues[0] + 1;
        } else if (sentenceValue == 0) {
            piechartValues[1] = piechartValues[1] + 1;
        } else if (sentenceValue == 1) {
            piechartValues[2] = piechartValues[2] + 1;
        }
    }

    populateSparkLine(sparklineValues);
    populatePiechart(piechartValues);
}


function populateSparkLine(sparklineValues) {
    $('#troogl-sparkline').sparkline(sparklineValues, {
        type: 'tristate',
        height: '4vw',
        barWidth: 8
    });

    var sparklineCanvas = document.getElementById('troogl-sparkline').childNodes[0];
    sparklineCanvas.style.backgroundColor = '#2a2abd';
    sparklineCanvas.style.padding = '5px';
    sparklineCanvas.style.borderRadius = '5px';
}


function populatePiechart(piechartValues) {
    $("#troogl-piechart").sparkline(piechartValues, {
        type: 'pie',
        width: '4vw',
        height: '4vw',
        sliceColors: ['#FF4444','#999999', '#66FF66']
    });

    var piechartCanvas = document.getElementById('troogl-piechart').childNodes[0];
    piechartCanvas.style.backgroundColor = '#2a2abd';
    piechartCanvas.style.padding = '5px';
    piechartCanvas.style.borderRadius = '5px';
}

var pageXOffset, pageYOffset;

// Parse response data
var response = JSON.parse(response);
var sentences = response['sentences'];
var sentenceClasses = response['sentence_sentiment_classes'];

prepareSentences(sentences);
updateSentenceClasses(sentenceClasses[response['default_entity_name']]);
insertDashboard(sentenceClasses);
