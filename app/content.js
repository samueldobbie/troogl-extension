function prepareSentences(sentences) {

    enablePageEditing();

    for (var i = 0; i < sentences.length; i++) {
        // Find sentence within page
        window.find(sentences[i]);

        // Get selected sentence range
        var range = window.getSelection().getRangeAt(0);

        // Construct sentence container
        var sentenceContainer = document.createElement('span');

        // Construct sentence anchor tag
        var anchorTag = document.createElement('a');
        anchorTag.id = 'troogl-sentence-' + i;

        // Add anchor tag to sentece
        sentenceContainer.appendChild(anchorTag);

        // Add sentiment classes to container
        sentenceContainer.classList.add('troogl-sentence');
        sentenceContainer.appendChild(range.extractContents());

        // Insert constructed sentence into article
        range.insertNode(sentenceContainer);

        // Return selection cursor to beginning of document
        // window.getSelection().collapse(document.body, 0);
    }

    disablePageEditing();

    // Move to top of article
    window.scrollTo(0, 0);
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
}


function disablePageEditing() {
    // Disable editing of article
    document.designMode = 'off';

    // Remove final sentence selection
    window.getSelection().collapse(document.body, 0);
}


function insertDashboard(sentenceClasses, summarySentences, readTime, readibilityLevel, subjectivity, positiveEntities, negativeEntities) {
    // Create and inject dashboard snippet bar
    injectPartialDashboard(sentenceClasses);

    // Create and inject full page dashboard
    injectCompleteDashboard(summarySentences, readTime, readibilityLevel, subjectivity, positiveEntities, negativeEntities);
    
    // Create and inject sentence popup
    injectSentencePopup();

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
    dashboardContainer.style.zIndex = 2147483646;

    var dashboardBar = document.createElement('div');
    dashboardBar.id = 'troogl-partial-dashboard-bar';
    dashboardBar.style.position = 'fixed';
    dashboardBar.style.width = '100%';
    dashboardBar.style.height = '12.5vh';
    dashboardBar.style.display = 'flex';
    dashboardBar.style.flexWrap = 'nowrap';
    dashboardBar.style.alignItems = 'center';
    // #5555FF    rgb(83, 51, 237)
    dashboardBar.style.backgroundColor = 'rgb(83, 51, 237)';
    dashboardBar.style.boxShadow = '0 0 5px #333';
    dashboardBar.style.padding = '0 2%';
    dashboardBar.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    var dragButtonContainer = document.createElement('span');
    dragButtonContainer.id = 'troogl-draggable-container';
    dragButtonContainer.style.flexGrow = 0.33;
    dragButtonContainer.style.marginRight = '1%';
    dragButtonContainer.style.marginBottom = '12px';

    var dragButton = document.createElement('span');
    dragButton.id = 'troogl-draggable-button';
    dragButton.innerText = '. .\n. .\n. .';
    dragButton.style.fontSize = '25px';
    dragButton.style.fontWeight = 'bold';
    dragButton.style.color = '#2a2abd';
    dragButton.style.cursor = 'grab';
    dragButton.style.lineHeight = '15px';
    dragButton.style.fontWeight = 'bold';

    dragButtonContainer.appendChild(dragButton)
    dashboardBar.appendChild(dragButtonContainer);

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

    var perspectiveTooltipContainer = document.createElement('div');
    perspectiveTooltipContainer.classList.add('troogl-tooltip');
    perspectiveTooltipContainer.innerHTML = '&#x1F6C8;';

    var perspectiveTooltip = document.createElement('span');
    perspectiveTooltip.classList.add('troogl-tooltip-text');
    perspectiveTooltip.innerText = 'See the article sentiment from different perspectives';

    perspectiveTooltipContainer.appendChild(perspectiveTooltip);

    perspectiveContainer.appendChild(perspectiveDropdown);
    perspectiveContainer.appendChild(perspectiveTooltipContainer);

    // Construct graph container
    var graphContainer = document.createElement('span');
    graphContainer.id = 'troogl-graph-container';
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
    optionContainer.id = 'troogl-option-container';
    optionContainer.style.cursor = 'pointer';
    optionContainer.style.fontSize = '16px';
    optionContainer.style.flexGrow = 1;

    var fullDashboardbutton = document.createElement('span');
    fullDashboardbutton.id = 'troogl-full-dashboard-button';
    fullDashboardbutton.innerText = 'Full Dashboard';
    fullDashboardbutton.style.backgroundColor = '#2a2abd';
    fullDashboardbutton.style.color = 'white';
    fullDashboardbutton.style.padding = '5px';
    fullDashboardbutton.style.borderRadius = '5px';

    var hideButton = document.createElement('span');
    hideButton.id = 'troogl-collapse-button';
    hideButton.innerText = 'Hide';
    hideButton.style.color = 'white';
    hideButton.style.backgroundColor = '#2a2abd';
    hideButton.style.padding = '5px';
    hideButton.style.borderRadius = '5px';
    hideButton.style.marginLeft = '1%';

    optionContainer.appendChild(fullDashboardbutton);
    optionContainer.appendChild(hideButton);

    var expandButton = document.createElement('button');
    expandButton.id = 'troogl-expand-button';
    expandButton.innerText = 'Show Troogl Dashboard';
    expandButton.style.backgroundColor = 'rgb(83, 51, 237)';
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
    expandButton.style.fontSize = '16px';
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

    $('#troogl-partial-dashboard-bar').draggable({
        handle: '#troogl-draggable-button',
        containment: 'window',
        cursor: 'grabbing',
        axis: 'y',
        scroll: false
    });
}


function injectCompleteDashboard(summarySentences, readTime, readibilityLevel, subjectivity, positiveEntities, negativeEntities) {
    // Container for all dashboard items
    var dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'troogl-full-dashboard-container';
    dashboardContainer.style.position = 'fixed';
    dashboardContainer.style.width = '100vw';
    dashboardContainer.style.height = '100vh';
    dashboardContainer.style.display = 'none';
    dashboardContainer.style.zIndex = 2147483647;

    // Overlay that can be clicked to exit complete dashboard
    var overlay = document.createElement('div');
    overlay.id = 'troogl-full-dashboard-overlay';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'black';
    overlay.style.opacity = 0.55;

    dashboardContainer.appendChild(overlay);

    // Container for content-related dashboard items
    var contentContainer = document.createElement('div');
    contentContainer.style.position = 'absolute';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexWrap = 'wrap';
    contentContainer.style.width = '80vw';
    contentContainer.style.top = '50%';
    contentContainer.style.left = '50%';
    contentContainer.style.transform = 'translate(-50%, -50%)';
    contentContainer.style.borderRadius = '5px';
    contentContainer.style.backgroundColor = '#f1f1f1';
    contentContainer.style.fontSize = '16px';
    contentContainer.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    // Container for read time item
    var readTimeContainer = document.createElement('div');
    readTimeContainer.style.flexGrow = '1';
    readTimeContainer.style.margin = '2.5% 0.5% 0.5% 2.5%';
    readTimeContainer.style.backgroundColor = 'white';
    readTimeContainer.style.borderRadius = '5px';
    readTimeContainer.style.padding = '1%';
    readTimeContainer.style.boxShadow = '0 0 2px #333';

    var readTimeHeader = document.createElement('span');
    readTimeHeader.innerText = 'Read Time';
    readTimeHeader.style.color = 'rgb(83, 51, 237)';
    readTimeHeader.style.fontWeight = 'bold';
    readTimeHeader.style.marginBottom = '0.5%';
    readTimeHeader.style.display = 'block';

    var readTimeTooltipContainer = document.createElement('div');
    readTimeTooltipContainer.classList.add('troogl-tooltip');
    readTimeTooltipContainer.innerHTML = '&#x1F6C8;';

    var readTimeTooltip = document.createElement('span');
    readTimeTooltip.classList.add('troogl-tooltip-text');
    readTimeTooltip.innerText = 'Estimates the time required to read the article';

    var readTimeContent = document.createElement('span');
    readTimeContent.innerText = readTime['minutes'] + ' min ' + readTime['seconds'] + ' secs';

    readTimeTooltipContainer.appendChild(readTimeTooltip);
    readTimeHeader.appendChild(readTimeTooltipContainer);
    readTimeContainer.appendChild(readTimeHeader);
    readTimeContainer.appendChild(readTimeContent);
    contentContainer.appendChild(readTimeContainer);

    // Container for readibility item
    var readibilityContainer = document.createElement('div');
    readibilityContainer.style.flexGrow = '1';
    readibilityContainer.style.margin = '2.5% 0.5% 0.5% 0.5%';
    readibilityContainer.style.backgroundColor = 'white';
    readibilityContainer.style.borderRadius = '5px';
    readibilityContainer.style.padding = '1%';
    readibilityContainer.style.boxShadow = '0 0 2px #333';

    var readibilityHeader = document.createElement('span');
    readibilityHeader.innerText = 'Readibility';
    readibilityHeader.style.color = 'rgb(83, 51, 237)';
    readibilityHeader.style.fontWeight = 'bold';
    readibilityHeader.style.marginBottom = '0.5%';
    readibilityHeader.style.display = 'block';

    var readibilityTooltipContainer = document.createElement('div');
    readibilityTooltipContainer.classList.add('troogl-tooltip');
    readibilityTooltipContainer.innerHTML = '&#x1F6C8;';

    var readibilityTooltip = document.createElement('span');
    readibilityTooltip.classList.add('troogl-tooltip-text');
    readibilityTooltip.innerText = 'Gauges the understandibility of the article using the Automated Readibility Index';

    var readibilityContent = document.createElement('span');
    readibilityContent.innerText = readibilityLevel;

    readibilityTooltipContainer.appendChild(readibilityTooltip);
    readibilityHeader.appendChild(readibilityTooltipContainer);
    readibilityContainer.appendChild(readibilityHeader);
    readibilityContainer.appendChild(readibilityContent);
    contentContainer.appendChild(readibilityContainer);

    // Container for subjectivity item
    var subjectivityContainer = document.createElement('div');
    subjectivityContainer.style.flexGrow = '1';
    subjectivityContainer.style.margin = '2.5% 2.5% 0.5% 0.5%';
    subjectivityContainer.style.backgroundColor = 'white';
    subjectivityContainer.style.borderRadius = '5px';
    subjectivityContainer.style.padding = '1%';
    subjectivityContainer.style.boxShadow = '0 0 2px #333';

    var subjectivityHeader = document.createElement('span');
    subjectivityHeader.innerText = 'Subjectivity';
    subjectivityHeader.style.color = 'rgb(83, 51, 237)';
    subjectivityHeader.style.fontWeight = 'bold';
    subjectivityHeader.style.marginBottom = '0.5%';
    subjectivityHeader.style.display = 'block';

    var subjectivityTooltipContainer = document.createElement('div');
    subjectivityTooltipContainer.classList.add('troogl-tooltip');
    subjectivityTooltipContainer.innerHTML = '&#x1F6C8;';

    var subjectivityTooltip = document.createElement('span');
    subjectivityTooltip.classList.add('troogl-tooltip-text');
    subjectivityTooltip.innerText = 'Gauges how objective or opinionated the article is (does not correspond with factuality)';

    var subjectivityContent = document.createElement('span');
    subjectivityContent.innerText = subjectivity;

    subjectivityTooltipContainer.appendChild(subjectivityTooltip);
    subjectivityHeader.appendChild(subjectivityTooltipContainer);
    subjectivityContainer.appendChild(subjectivityHeader);
    subjectivityContainer.appendChild(subjectivityContent);
    contentContainer.appendChild(subjectivityContainer);

    // Container for summary item
    var summaryContainer = document.createElement('div');
    summaryContainer.style.flexGrow = '2';
    summaryContainer.style.margin = '0.5% 2.5% 0.5% 2.5%';
    summaryContainer.style.backgroundColor = 'white';
    summaryContainer.style.borderRadius = '5px';
    summaryContainer.style.padding = '1%';
    summaryContainer.style.boxShadow = '0 0 2px #333';

    var summaryHeader = document.createElement('span');
    summaryHeader.innerText = 'TL;DR';
    summaryHeader.style.color = 'rgb(83, 51, 237)';
    summaryHeader.style.fontWeight = 'bold';
    summaryHeader.style.marginBottom = '0.5%';
    summaryHeader.style.display = 'block';

    var summaryTooltipContainer = document.createElement('div');
    summaryTooltipContainer.classList.add('troogl-tooltip');
    summaryTooltipContainer.innerHTML = '&#x1F6C8;';

    var summaryTooltip = document.createElement('span');
    summaryTooltip.classList.add('troogl-tooltip-text');
    summaryTooltip.innerText = 'Summarizes the article with the three most relevant sentences';

    var summaryContent = document.createElement('ul');
    summaryContent.style.listStyleType = 'disc';
    summaryContent.style.margin = '1% 5%';
    for (var i = 0; i < summarySentences.length; i++) {
        var summaryBulletPoint = document.createElement('li');
        summaryBulletPoint.innerText = summarySentences[i];
        if (i != (summarySentences.length - 1)) {
            summaryBulletPoint.style.marginBottom = '1.5%';
        }
        summaryContent.appendChild(summaryBulletPoint);
    }
    summaryTooltipContainer.appendChild(summaryTooltip);
    summaryHeader.appendChild(summaryTooltipContainer);
    summaryContainer.appendChild(summaryHeader);
    summaryContainer.appendChild(summaryContent);
    contentContainer.appendChild(summaryContainer);

    // Container for positive entities
    var positiveEntitiesContainer = document.createElement('div');
    positiveEntitiesContainer.style.flexGrow = '1';
    positiveEntitiesContainer.style.maxWidth = '45%';
    positiveEntitiesContainer.style.margin = '0.5% 0.5% 0.5% 2.5%';
    positiveEntitiesContainer.style.backgroundColor = 'white';
    positiveEntitiesContainer.style.borderRadius = '5px';
    positiveEntitiesContainer.style.padding = '1%';
    positiveEntitiesContainer.style.boxShadow = '0 0 2px #333';

    var positiveEntitiesHeader = document.createElement('span');
    positiveEntitiesHeader.innerText = 'Positive Towards';
    positiveEntitiesHeader.style.color = 'rgb(83, 51, 237)';
    positiveEntitiesHeader.style.fontWeight = 'bold';
    positiveEntitiesHeader.style.marginBottom = '0.5%';
    positiveEntitiesHeader.style.display = 'block';

    var positiveEntitiesTooltipContainer = document.createElement('div');
    positiveEntitiesTooltipContainer.classList.add('troogl-tooltip');
    positiveEntitiesTooltipContainer.innerHTML = '&#x1F6C8;';

    var positiveEntitiesTooltip = document.createElement('span');
    positiveEntitiesTooltip.classList.add('troogl-tooltip-text');
    positiveEntitiesTooltip.innerText = 'Highlights people and organizations that are mentioned in a positive manner';

    var positiveEntitiesContent = document.createElement('span');

    if (Object.keys(positiveEntities).length == 0) {
        positiveEntitiesContent.innerText = 'Not clearly positive towards any person / organization.';
    }

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
        positiveEntitiesContent.appendChild(positiveEntity);
    }
    positiveEntitiesTooltipContainer.appendChild(positiveEntitiesTooltip);
    positiveEntitiesHeader.appendChild(positiveEntitiesTooltipContainer);
    positiveEntitiesContainer.appendChild(positiveEntitiesHeader);
    positiveEntitiesContainer.appendChild(positiveEntitiesContent);
    contentContainer.appendChild(positiveEntitiesContainer);

    // Container for negative entities
    var negativeEntitiesContainer = document.createElement('div');
    negativeEntitiesContainer.style.flexGrow = '1';
    negativeEntitiesContainer.style.maxWidth = '45%';
    negativeEntitiesContainer.style.margin = '0.5% 2.5% 0.5% 0.5%';
    negativeEntitiesContainer.style.backgroundColor = 'white';
    negativeEntitiesContainer.style.borderRadius = '5px';
    negativeEntitiesContainer.style.padding = '1%';
    negativeEntitiesContainer.style.boxShadow = '0 0 2px #333';

    var negativeEntitiesHeader = document.createElement('span');
    negativeEntitiesHeader.innerText = 'Negative Towards';
    negativeEntitiesHeader.style.color = 'rgb(83, 51, 237)';
    negativeEntitiesHeader.style.fontWeight = 'bold';
    negativeEntitiesHeader.style.marginBottom = '0.5%';
    negativeEntitiesHeader.style.display = 'block';

    var negativeEntitiesTooltipContainer = document.createElement('div');
    negativeEntitiesTooltipContainer.classList.add('troogl-tooltip');
    negativeEntitiesTooltipContainer.innerHTML = '&#x1F6C8;';

    var negativeEntitiesTooltip = document.createElement('span');
    negativeEntitiesTooltip.classList.add('troogl-tooltip-text');
    negativeEntitiesTooltip.innerText = 'Highlights people and organizations that are mentioned in a negative manner';

    var negativeEntitiesContent = document.createElement('span');

    if (Object.keys(negativeEntities).length == 0) {
        negativeEntitiesContent.innerText = 'Not clearly negative towards any person / organization.';
    }

    for (var key in negativeEntities) {
        var negativeEntity = document.createElement('span');
        negativeEntity.innerText = key;
        negativeEntity.style.fontWeight = 'bold';
        negativeEntity.style.padding = '5px';
        negativeEntity.style.borderRadius = '5px';
        negativeEntity.style.display = 'inline-block';
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
        negativeEntitiesContent.appendChild(negativeEntity);
    }
    negativeEntitiesTooltipContainer.appendChild(negativeEntitiesTooltip);
    negativeEntitiesHeader.appendChild(negativeEntitiesTooltipContainer);
    negativeEntitiesContainer.appendChild(negativeEntitiesHeader);
    negativeEntitiesContainer.appendChild(negativeEntitiesContent);
    contentContainer.appendChild(negativeEntitiesContainer);

    // Newline item
    var newline = document.createElement('div');
    newline.style.flexBasis = '100%';
    newline.style.height = 0;
    
    contentContainer.appendChild(newline);

    // Container for feedback item
    var feedbackContainer = document.createElement('div');
    feedbackContainer.style.flexGrow = '1';
    feedbackContainer.style.margin = '0.5% 0.5% 2.5% 2.5%';
    feedbackContainer.style.fontSize = '13px';
    feedbackContainer.style.borderRadius = '5px';
    feedbackContainer.style.padding = '1%';

    var feedbackContent = document.createElement('span');
    feedbackContent.innerHTML = 'Help us improve! <a href="https://form.jotformeu.com/201655282823354" target="_blank" style="color: rgb(83, 51, 237);">Share your feedback.</a>';

    feedbackContainer.appendChild(feedbackContent);
    contentContainer.appendChild(feedbackContainer);

    // Container for logo item
    var logoContainer = document.createElement('div');
    logoContainer.style.flexGrow = '1';
    logoContainer.style.margin = '0.5% 2.5% 2.5% 0.5%';
    logoContainer.style.fontSize = '13px';
    logoContainer.style.textAlign = 'right';
    logoContainer.style.borderRadius = '5px';
    logoContainer.style.padding = '1%';

    var logoContent = document.createElement('span');
    logoContent.innerHTML = 'Powered by <a href="https://www.troogl.com" target="_blank" style="color: rgb(83, 51, 237);">Troogl (beta)</a>';

    logoContainer.appendChild(logoContent);
    contentContainer.appendChild(logoContainer);

    // Inject dashboard into page
    dashboardContainer.appendChild(contentContainer);
    document.body.prepend(dashboardContainer);
}


function injectSentencePopup() {
    // Container for all popup items
    var popupContainer = document.createElement('div');
    popupContainer.id = 'troogl-sentence-popup-container';
    popupContainer.style.position = 'fixed';
    popupContainer.style.width = '100vw';
    popupContainer.style.height = '100vh';
    popupContainer.style.display = 'none';
    popupContainer.style.zIndex = 2147483647;

    // Overlay that can be clicked to exit sentence popup
    var overlay = document.createElement('div');
    overlay.id = 'troogl-sentence-popup-overlay';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'black';
    overlay.style.opacity = 0.55;

    popupContainer.appendChild(overlay);

    // Container for sentence popup-related items
    var contentContainer = document.createElement('div');
    contentContainer.style.position = 'absolute';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexWrap = 'wrap';
    contentContainer.style.width = '60vw';
    contentContainer.style.top = '50%';
    contentContainer.style.left = '50%';
    contentContainer.style.transform = 'translate(-50%, -50%)';
    contentContainer.style.borderRadius = '5px';
    contentContainer.style.backgroundColor = '#f1f1f1';
    contentContainer.style.fontSize = '16px';
    contentContainer.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    // Container for sentence item
    var sentenceContainer = document.createElement('div');
    sentenceContainer.style.flexGrow = '1';
    sentenceContainer.style.fontSize = '18px';
    sentenceContainer.style.borderRadius = '5px';
    sentenceContainer.style.padding = '1%';

    var sentenceContent = document.createElement('span');
    sentenceContent.id = 'troogl-sentence-content-item';

    sentenceContainer.appendChild(sentenceContent);
    contentContainer.appendChild(sentenceContainer);

    // Newline item
    var newline = document.createElement('div');
    newline.style.flexBasis = '100%';
    newline.style.height = 0;
    
    contentContainer.appendChild(newline);

    // Container for coming soon item
    var optionContainer = document.createElement('div');
    optionContainer.style.flexGrow = '1';
    optionContainer.style.padding = '1%';

    var voteButton = document.createElement('button');
    voteButton.innerText = 'Vote (coming soon)';
    voteButton.style.color = '#333';
    voteButton.style.backgroundColor = '#ccc';
    voteButton.style.padding = '5px';
    voteButton.style.borderRadius = '5px';
    voteButton.style.margin = '0.5%';

    var shareButton = document.createElement('button');
    shareButton.innerText = 'Share (coming soon)';
    shareButton.style.color = '#333';
    shareButton.style.backgroundColor = '#ccc';
    shareButton.style.padding = '5px';
    shareButton.style.borderRadius = '5px';
    shareButton.style.margin = '0.5%';

    optionContainer.appendChild(voteButton);
    optionContainer.appendChild(shareButton);
    contentContainer.appendChild(optionContainer);

    // Inject sentence container into page
    popupContainer.appendChild(contentContainer);
    document.body.prepend(popupContainer);
}



function bindDashboardEvents() {
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

    // Enable opening of full dashboard
    $('#troogl-full-dashboard-button').click(function () {
        $('#troogl-full-dashboard-container').fadeIn();
    });

    // Enable exiting from full dashboard
    $('#troogl-full-dashboard-overlay').click(function () {
        $('#troogl-full-dashboard-container').fadeOut();
    });

    // Enable opening of sentence popup
    $('.troogl-sentence').click(function () {
        $('#troogl-sentence-content-item').text(this.innerText);
        $('#troogl-sentence-popup-container').fadeIn();
    });

    // Enable exiting from sentence popup
    $('#troogl-sentence-popup-overlay').click(function () {
        $('#troogl-sentence-popup-container').fadeOut();
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
            piechartValues[0]++;
        } else if (sentenceValue == 0) {
            piechartValues[1]++;
        } else if (sentenceValue == 1) {
            piechartValues[2]++;
        }
    }

    populateSparkLine(sparklineValues);
    populatePiechart(piechartValues);
}


function populateSparkLine(sparklineValues) {
    $('#troogl-sparkline').sparkline(sparklineValues, {
        type: 'line',
        width: '30vw',
        height: '8vh',
        lineColor: '#e5e5e5',
        highlightSpotColor: '#66FF66',
        highlightLineColor: 'rgb(83, 51, 237)',
        lineWidth: 4,
        spotRadius: 5,
        chartRangeMin: -1,
        chartRangeMax: 1,
        disableTooltips: true,
        fillColor: null,
        spotColor: null,
        minSpotColor: null,
        maxSpotColor: null
    }).bind('sparklineRegionChange', function(ev) {
        // Jump to the sentence that is being hovered over in the line graph
        setTimeout(function() {
            var sparkline = ev.sparklines[0];
            var sentenceIndex = sparkline.getCurrentRegionFields()['offset'];
            if (sentenceIndex != null) {
                document.getElementById('troogl-sentence-' + sentenceIndex).scrollIntoView(true);
            }
        }, 150);
    });

    var sparklineCanvas = document.getElementById('troogl-sparkline').childNodes[0];
    sparklineCanvas.style.backgroundColor = '#2a2abd';
    sparklineCanvas.style.padding = '5px';
    sparklineCanvas.style.borderRadius = '5px';
}


function populatePiechart(piechartValues) {
    $('#troogl-piechart').sparkline(piechartValues, {
        type: 'pie',
        width: '8vh',
        height: '8vh',
        sliceColors: ['#FF4444','#999999', '#66FF66'],
        disableTooltips: true,
        disableHighlight: true
    });

    var piechartCanvas = document.getElementById('troogl-piechart').childNodes[0];
    piechartCanvas.style.backgroundColor = '#2a2abd';
    piechartCanvas.style.padding = '5px';
    piechartCanvas.style.borderRadius = '5px';
}


$(window).resize(function() {
    // Hide partial bar elements for certain screensizes
    if (window.matchMedia('(max-width: 500px)').matches) {
        document.getElementById('troogl-graph-container').style.display = 'none';
        document.getElementById('troogl-option-container').style.display = 'none';
        document.getElementById('troogl-draggable-container').style.display = 'none';
    } else if (window.matchMedia('(max-width: 750px)').matches) {
        document.getElementById('troogl-graph-container').style.display = '';
        document.getElementById('troogl-option-container').style.display = 'none';
        document.getElementById('troogl-draggable-container').style.display = 'none';
    } else if (window.matchMedia('(max-width: 900px)').matches) {
        document.getElementById('troogl-graph-container').style.display = '';
        document.getElementById('troogl-option-container').style.display = '';
        document.getElementById('troogl-draggable-container').style.display = 'none';
    } else {
        document.getElementById('troogl-graph-container').style.display = '';
        document.getElementById('troogl-option-container').style.display = '';
        document.getElementById('troogl-draggable-container').style.display = '';
    }

    // Resize graphs
    updateGraphs();
});

// Parse response data
var response = JSON.parse(response);
var sentences = response['sentences'];
var sentenceClasses = response['sentence_sentiment_classes'];
var positiveEntities = response['positive_entities'];
var negativeEntities = response['negative_entities'];
var summarySentences = response['summary_sentences'];
var readTime = response['read_time'];
var readibilityLevel = response['readability_level'];
var subjectivity = response['subjectivity'];

// Display data within article
prepareSentences(sentences);
updateSentenceClasses(sentenceClasses[response['default_entity_name']]);
insertDashboard(sentenceClasses, summarySentences, readTime, readibilityLevel, subjectivity, positiveEntities, negativeEntities);

// Remove overlay and loader
document.body.removeChild(document.getElementById('troogl-loader'));
