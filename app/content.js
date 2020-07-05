function prepareSentences(sentences) {

    enablePageEditing();

    for (var i = 0; i < sentences.length; i++) {
        // Find sentence within page
        window.find(sentences[i]);

        // Get selected sentence range
        var range = window.getSelection().getRangeAt(0);

        // Construct link container (for sentence anchors)
        var linkContainer = document.createElement('a');
        linkContainer.name = 'troogl-sentence-' + i;

        // Construct sentence container
        var sentenceContainer = document.createElement('span');

        // Add sentiment classes to container
        sentenceContainer.classList.add('troogl-sentence');
        sentenceContainer.appendChild(range.extractContents());

        // Add popup to sentence container
        sentenceContainer.addEventListener('click', function() {
            alert('Ability to vote and share coming soon!');
        });

        // Surround sentence with anchor link
        linkContainer.appendChild(sentenceContainer);

        // Insert constructed sentence into article
        range.insertNode(linkContainer);

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
        sentences[i].setAttribute('title', 'Neutral');
    }

    // Update sentences based on entity sentiments
    for (var i = 0; i < sentenceClasses.length; i++) {
        var sentenceIndex = sentenceClasses[i]['sentence_index'];
        var sentenceClassString = sentenceClasses[i]['sentence_class_string'];
        var sentenceClassValue = sentenceClasses[i]['sentence_class_value'];
        var sentenceClassTitle = sentenceClasses[i]['sentence_class_title'];

        // Remove existing sentiment class
        stripSentence(sentences[sentenceIndex]);

        // Update sentence values
        sentences[sentenceIndex].classList.add(sentenceClassString);
        sentences[sentenceIndex].setAttribute('troogl-class-value', sentenceClassValue);
        sentences[sentenceIndex].setAttribute('title', sentenceClassTitle);
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


function insertDashboard(sentenceClasses, summarySentences, readTime, readibilityLevel, positiveEntities, negativeEntities) {
    // Create and inject dashboard snippet bar
    injectPartialDashboard(sentenceClasses);

    // Create and inject full page dashboard
    injectCompleteDashboard(summarySentences, readTime, readibilityLevel, positiveEntities, negativeEntities);
    
    // Populate sparkline and piechart with article sentiments
    updateGraphs();

    // Add clickable events to both dashboards
    bindDashboardEvents();
}


function injectPartialDashboard(sentenceClasses) {
    var dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'troogl-partial-dashboard-container';
    dashboardContainer.style.position = 'relative';
    dashboardContainer.style.width = '100%';
    dashboardContainer.style.height = '12.5vh';
    dashboardContainer.style.zIndex = 2147483647;

    var dashboardBar = document.createElement('div');
    dashboardBar.style.position = 'fixed';
    dashboardBar.style.width = '100%';
    dashboardBar.style.height = '12.5vh';
    dashboardBar.style.display = 'flex';
    dashboardBar.style.flexWrap = 'nowrap';
    dashboardBar.style.alignItems = 'center';
    dashboardBar.style.backgroundColor = '#5555FF';
    dashboardBar.style.boxShadow = '0 0 5px #333';
    dashboardBar.style.padding = '0 2%';
    dashboardBar.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    // Construct dropdown for switching between perspectives
    var perspectiveContainer = document.createElement('span');
    perspectiveContainer.style.flexGrow = 1;

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

    perspectiveContainer.appendChild(perspectiveDropdown);

    // Construct graph container
    var graphContainer = document.createElement('span');
    graphContainer.style.flexGrow = 2;

    // Create sparkline container
    var sparklineChart = document.createElement('span');
    sparklineChart.id = 'troogl-sparkline';

    // Create piechart container
    var piechartChart = document.createElement('span');
    piechartChart.id = 'troogl-piechart';
    piechartChart.style.marginLeft = '0.5%';

    graphContainer.appendChild(sparklineChart);
    graphContainer.appendChild(piechartChart);

    var optionContainer = document.createElement('span');
    optionContainer.style.cursor = 'pointer';
    optionContainer.style.fontWeight = 'bold';
    optionContainer.style.fontSize = '13px';
    optionContainer.style.flexGrow = 1;

    var fullDashboardbutton = document.createElement('span');
    fullDashboardbutton.id = 'troogl-full-dashboard-button';
    fullDashboardbutton.innerText = 'View Full Dashboard ';
    fullDashboardbutton.style.color = 'white';

    var hideButton = document.createElement('span');
    hideButton.id = 'troogl-collapse-button';
    hideButton.innerText = ' Collapse';
    hideButton.style.color = '#2a2abd';

    optionContainer.appendChild(fullDashboardbutton);
    optionContainer.appendChild(hideButton);

    var expandButton = document.createElement('button');
    expandButton.id = 'troogl-expand-button';
    expandButton.innerText = 'Show Troogl Dashboard';
    expandButton.style.backgroundColor = '#5555FF';
    expandButton.style.cursor = 'pointer';
    expandButton.style.color = 'white';
    expandButton.style.borderBottomLeftRadius = '5px';
    expandButton.style.borderBottomRightRadius = '5px';
    expandButton.style.top = 0;
    expandButton.style.right = 0;
    expandButton.style.padding = '5px';
    expandButton.style.marginRight = '5%';
    expandButton.style.outline = 'none';
    expandButton.style.display = 'none';
    expandButton.style.position = 'fixed';
    expandButton.style.border = 'none';
    expandButton.style.fontFamily = 'Tahoma, Geneva, sans-serif';
    expandButton.style.zIndex = 2147483647;

    // Populate dashboard bar
    dashboardBar.appendChild(perspectiveContainer);
    dashboardBar.appendChild(graphContainer);
    dashboardBar.appendChild(optionContainer);
    dashboardContainer.appendChild(dashboardBar);

    // Inject dashboard into page
    document.body.prepend(expandButton);
    document.body.prepend(dashboardContainer);
}


function injectCompleteDashboard(summarySentences, readTime, readibilityLevel, positiveEntities, negativeEntities) {
    var fullDashboardContainer = document.createElement('div');
    fullDashboardContainer.id = 'troogl-full-dashboard-container';
    fullDashboardContainer.style.position = 'fixed';
    fullDashboardContainer.style.width = '100%';
    fullDashboardContainer.style.height = '100%';
    fullDashboardContainer.style.overflow = 'scroll';
    fullDashboardContainer.style.backgroundColor = '#f1f1f1';
    fullDashboardContainer.style.display = 'none';
    fullDashboardContainer.style.padding = '3% 15%';
    fullDashboardContainer.style.zIndex = 2147483647;

    var returnToArticleButton = document.createElement('span');
    returnToArticleButton.id = 'troogl-return-to-article-button';
    returnToArticleButton.innerText = 'Return to article';
    returnToArticleButton.style.cursor = 'pointer';
    returnToArticleButton.style.display = 'block';

    /*
    var readTimeContainer = document.createElement('p');
    readTimeContainer.style.margin = '2%';

    var readTimeHeader = document.createElement('p');
    readTimeHeader.innerText = 'Read Time';
    readTimeHeader.style.color  = '#5555FF';
    readTimeHeader.style.fontWeight = 'bold';
    
    var readTimeContent = document.createElement('p');
    readTimeContent.innerText = readTime['minutes'] + ' min ' + readTime['seconds'] + ' secs';
    readTimeContent.style.margin = '2%';

    readTimeContainer.appendChild(readTimeHeader);
    readTimeContainer.appendChild(readTimeContent);

    var readibilityLevelContainer = document.createElement('p');
    readibilityLevelContainer.style.margin = '2%';

    var readibilityHeader = document.createElement('p');
    readibilityHeader.innerText = 'Readibility';
    readibilityHeader.style.color  = '#5555FF';
    readibilityHeader.style.fontWeight = 'bold';

    var readibilityLevelContent = document.createElement('p');
    readibilityLevelContent.innerText = readibilityLevel;
    readibilityLevelContent.style.margin = '2%';

    readibilityLevelContainer.appendChild(readibilityHeader);
    readibilityLevelContainer.appendChild(readibilityLevelContent);
    */

    var summaryContainer = document.createElement('span');
    summaryContainer.style.margin = '2%';

    var summaryHeader = document.createElement('span');
    summaryHeader.innerText = 'TL;DR';
    summaryHeader.style.color  = '#5555FF';
    summaryHeader.style.fontWeight = 'bold';
    summaryHeader.style.display = 'block';

    var summaryContent = document.createElement('ul');
    for (var i = 0; i < summarySentences.length; i++) {
        var summaryBulletPoint = document.createElement('li');
        summaryBulletPoint.innerText = summarySentences[i];
        summaryBulletPoint.style.display = 'list-item';
        summaryBulletPoint.style.listStyleType = 'circle';
        summaryBulletPoint.style.maxWidth = '50vw';
        summaryBulletPoint.style.margin = '2%';
        summaryContent.appendChild(summaryBulletPoint);
    }

    summaryContainer.appendChild(summaryHeader);
    summaryContainer.appendChild(summaryContent);

    var positiveTowardsContainer = document.createElement('span');
    positiveTowardsContainer.style.margin = '2%';

    var positiveTowardsHeader = document.createElement('span');
    positiveTowardsHeader.innerText = 'Positive Towards';
    positiveTowardsHeader.style.color  = '#5555FF';
    positiveTowardsHeader.style.fontWeight = 'bold';
    positiveTowardsHeader.style.display = 'block';

    var positiveTowardsContent = document.createElement('span');
    positiveTowardsContent.style.margin = '2%';
    positiveTowardsContent.style.maxWidth = '50vw';
    positiveTowardsContent.style.display = 'block';

    for (var key in positiveEntities) {
        var positiveEntity = document.createElement('span');
        positiveEntity.innerText = key;
        positiveEntity.style.fontWeight = 'bold';
        positiveEntity.style.padding = '5px';
        positiveEntity.style.borderRadius = '5px';
        positiveEntity.style.display = 'inline-block';
        positiveEntity.style.margin = '3px 5px';
        positiveEntity.style.color = '#333';

        if (positiveEntities[key]['type'] == 'PERSON') {
            positiveEntity.style.backgroundColor = '#fffbb5';
        } else if (positiveEntities[key]['type'] == 'ORGANIZATION') {
            positiveEntity.style.backgroundColor = '#ceffb5';
        } else if (positiveEntities[key]['type'] == 'OTHER') {
            positiveEntity.style.backgroundColor = '#ffefcf';
        } else if (positiveEntities[key]['type'] == 'EVENT') {
            positiveEntity.style.backgroundColor = '#dab5ff';
        } else if (positiveEntities[key]['type'] == 'LOCATION') {
            positiveEntity.style.backgroundColor = '#ffb5c3';
        } else if (positiveEntities[key]['type'] == 'WORK_OF_ART') {
            positiveEntity.style.backgroundColor = '#fcccfb';
        } else if (positiveEntities[key]['type'] == 'CONSUMER_GOOD') {
            positiveEntity.style.backgroundColor = '#c2d1ff';
        }

        positiveTowardsContent.appendChild(positiveEntity);
    }

    positiveTowardsContainer.appendChild(positiveTowardsHeader);
    positiveTowardsContainer.appendChild(positiveTowardsContent);

    var negativeTowardsContainer = document.createElement('span');
    negativeTowardsContainer.style.margin = '2%';

    var negativeTowardsHeader = document.createElement('span');
    negativeTowardsHeader.innerText = 'Negative Towards';
    negativeTowardsHeader.style.color  = '#5555FF';
    negativeTowardsHeader.style.fontWeight = 'bold';
    negativeTowardsHeader.style.display = 'block';

    var negativeTowardsContent = document.createElement('span');
    negativeTowardsContent.style.margin = '2%';
    negativeTowardsContent.style.maxWidth = '50vw';
    negativeTowardsContent.style.display = 'block';

    for (var key in negativeEntities) {
        var negativeEntity = document.createElement('span');
        negativeEntity.innerText = key;
        negativeEntity.style.fontWeight = 'bold';
        negativeEntity.style.display = 'inline-block';
        negativeEntity.style.padding = '5px';
        negativeEntity.style.borderRadius = '5px';
        negativeEntity.style.margin = '3px 5px';
        negativeEntity.style.color = '#333';

        if (negativeEntities[key]['type'] == 'PERSON') {
            negativeEntity.style.backgroundColor = '#fffbb5';
        } else if (negativeEntities[key]['type'] == 'ORGANIZATION') {
            negativeEntity.style.backgroundColor = '#ceffb5';
        } else if (negativeEntities[key]['type'] == 'OTHER') {
            negativeEntity.style.backgroundColor = '#ffefcf';
        } else if (negativeEntities[key]['type'] == 'EVENT') {
            negativeEntity.style.backgroundColor = '#dab5ff';
        } else if (negativeEntities[key]['type'] == 'LOCATION') {
            negativeEntity.style.backgroundColor = '#ffb5c3';
        } else if (negativeEntities[key]['type'] == 'WORK_OF_ART') {
            negativeEntity.style.backgroundColor = '#fcccfb';
        } else if (negativeEntities[key]['type'] == 'CONSUMER_GOOD') {
            negativeEntity.style.backgroundColor = '#c2d1ff';
        }

        negativeTowardsContent.appendChild(negativeEntity);
    }

    negativeTowardsContainer.appendChild(negativeTowardsHeader);
    negativeTowardsContainer.appendChild(negativeTowardsContent);

    fullDashboardContainer.appendChild(returnToArticleButton);
    // fullDashboardContainer.appendChild(readTimeContainer);
    // fullDashboardContainer.appendChild(readibilityLevelContainer);
    fullDashboardContainer.appendChild(summaryContainer);
    fullDashboardContainer.appendChild(positiveTowardsContainer);
    fullDashboardContainer.appendChild(negativeTowardsContainer);

    document.body.prepend(fullDashboardContainer);
}



function bindDashboardEvents() {
    // Enable opening of full dashboard
    $('#troogl-full-dashboard-button').click(function () {
        $('#troogl-partial-dashboard-container').fadeOut();
        $('#troogl-full-dashboard-container').fadeIn();
    });

    // Enable exiting from full dashboard
    $('#troogl-return-to-article-button').click(function () {
        $('#troogl-full-dashboard-container').fadeOut();
        $('#troogl-partial-dashboard-container').fadeIn();
    });

    // Enable collapsing of dashboard bar
    $('#troogl-collapse-button').click(function () {
        $('#troogl-partial-dashboard-container').fadeOut();
        $('#troogl-expand-button').fadeIn();
    });

    // Enable expansion of dashboard bar
    $('#troogl-expand-button').click(function () {
        $('#troogl-expand-button').fadeOut();
        $('#troogl-partial-dashboard-container').fadeIn();
    });
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
    }).on('sparklineClick', function(event) {
        var sparkline = event.sparklines[0];
        var sentenceIndex = sparkline.getCurrentRegionFields()['offset'];
        location.replace('#troogl-sentence-' + sentenceIndex);
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
var positiveEntities = response['positive_entities'];
var negativeEntities = response['negative_entities'];
var summarySentences = response['summary_sentences'];
var readTime = response['read_time'];
var readibilityLevel = response['readability_level'];

// Display data within article
prepareSentences(sentences);
updateSentenceClasses(sentenceClasses[response['default_entity_name']]);
insertDashboard(sentenceClasses, summarySentences, readTime, readibilityLevel, positiveEntities, negativeEntities);

// Remove overlay and loader
document.body.removeChild(document.getElementById('troogl-loader'));
