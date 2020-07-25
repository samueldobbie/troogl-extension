function prepareSentences(sentences) {

    enablePageEditing();

    // Return selection cursor to beginning of document
    window.getSelection().collapse(document.body, 0);

    for (var i = 0; i < sentences.length; i++) {
        // Find sentence within page
        if (window.find(sentences[i])) {
            // Get selected sentence range
            var range = window.getSelection().getRangeAt(0);

            // Construct sentence container
            var sentenceContainer = document.createElement('span');

            // Construct sentence anchor tag
            var anchorTag = document.createElement('a');
            anchorTag.id = 'troogl-sentence-' + i;

            // Add anchor tag to sentece
            sentenceContainer.appendChild(anchorTag);

            // Set index of sentence container
            sentenceContainer.setAttribute('troogl-sentence-index', i);

            // Add sentiment classes to container
            sentenceContainer.classList.add('troogl-sentence');
            sentenceContainer.appendChild(range.extractContents());

            // Insert constructed sentence into article
            range.insertNode(sentenceContainer);
        }
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
        var sentenceAnchor = document.getElementById('troogl-sentence-' + sentenceIndex);
        if (sentenceAnchor) {
            var sentence = sentenceAnchor.parentElement;
            var sentenceClassString = sentenceClasses[i]['sentence_class_string'];
            var sentenceClassValue = sentenceClasses[i]['sentence_class_value'];
            var sentenceClassTitle = sentenceClasses[i]['sentence_class_title'];
    
            // Remove existing sentiment class
            stripSentence(sentence);
    
            // Update sentence values
            sentence.classList.add(sentenceClassString);
            sentence.setAttribute('troogl-class-value', sentenceClassValue);
            sentence.setAttribute('title', sentenceClassTitle);
        }
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


function insertDashboard(sentenceClasses, summarySentences, readTime, readibilityLevel, subjectivity, positiveTowards, negativeTowards) {
    // Create and inject dashboard snippet bar
    injectPartialDashboard(sentenceClasses);

    // Create and inject full page dashboard
    injectCompleteDashboard(summarySentences, readTime, readibilityLevel, subjectivity, positiveTowards, negativeTowards);
    
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

    var dashboardBar = document.createElement('div');
    dashboardBar.id = 'troogl-partial-dashboard-bar';
    dashboardBar.style.position = 'fixed';
    dashboardBar.style.width = '100%';
    dashboardBar.style.top = '0';
    dashboardBar.style.left = '0';
    dashboardBar.style.height = '12.5vh';
    dashboardBar.style.display = 'flex';
    dashboardBar.style.flexWrap = 'nowrap';
    dashboardBar.style.alignItems = 'center';
    // #5555FF    rgb(83, 51, 237)
    dashboardBar.style.backgroundColor = 'rgb(83, 51, 237)';
    dashboardBar.style.boxShadow = '0 0 5px #333';
    dashboardBar.style.padding = '0 2%';
    dashboardBar.style.fontFamily = 'Tahoma, Geneva, sans-serif';
    dashboardBar.style.zIndex = 10000;

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
    dragButton.style.userSelect = 'none';

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
    perspectiveDropdown.style.display = 'inline-block';

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
    expandButton.innerText = 'Show Dashboard';
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
    expandButton.style.boxShadow = '0 0 2px #333';
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


function injectCompleteDashboard(summarySentences, readTime, readibilityLevel, subjectivity, positiveTowards, negativeTowards) {
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
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'black';
    overlay.style.opacity = 0.7;

    dashboardContainer.appendChild(overlay);
    
    // Button to exit dashboard
    var closeButton = document.createElement('a');
    closeButton.classList.add('troogl-exit-button');

    dashboardContainer.appendChild(closeButton);

    // Container for content-related dashboard items
    var contentContainer = document.createElement('div');
    contentContainer.style.position = 'absolute';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexWrap = 'wrap';
    contentContainer.style.width = '80vw';
    contentContainer.style.maxHeight = '95vh';
    contentContainer.style.overflowY = 'auto';
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
    
    // Container for negative entities
    var negativeTowardsContainer = document.createElement('div');
    negativeTowardsContainer.style.flexGrow = '1';
    negativeTowardsContainer.style.maxWidth = '45%';
    negativeTowardsContainer.style.margin = '0.5% 0.5% 0.5% 2.5%';
    negativeTowardsContainer.style.backgroundColor = 'white';
    negativeTowardsContainer.style.borderRadius = '5px';
    negativeTowardsContainer.style.padding = '1%';
    negativeTowardsContainer.style.boxShadow = '0 0 2px #333';

    var negativeTowardsHeader = document.createElement('span');
    negativeTowardsHeader.innerText = 'Negative Towards';
    negativeTowardsHeader.style.color = 'rgb(83, 51, 237)';
    negativeTowardsHeader.style.fontWeight = 'bold';
    negativeTowardsHeader.style.marginBottom = '0.5%';
    negativeTowardsHeader.style.display = 'block';

    var negativeTowardsTooltipContainer = document.createElement('div');
    negativeTowardsTooltipContainer.classList.add('troogl-tooltip');
    negativeTowardsTooltipContainer.innerHTML = '&#x1F6C8;';

    var negativeTowardsTooltip = document.createElement('span');
    negativeTowardsTooltip.classList.add('troogl-tooltip-text');
    negativeTowardsTooltip.innerText = 'Highlights people and organizations that are mentioned in a negative manner';

    var negativeTowardsContent = document.createElement('span');

    if (Object.keys(negativeTowards).length == 0) {
        negativeTowardsContent.innerText = 'Not clearly negative towards any person / organization.';
    }

    for (var key in negativeTowards) {
        var negativeEntity = document.createElement('span');
        negativeEntity.innerText = key;
        negativeEntity.style.fontWeight = 'bold';
        negativeEntity.style.padding = '5px';
        negativeEntity.style.borderRadius = '5px';
        negativeEntity.style.display = 'inline-block';
        negativeEntity.style.margin = '3px 5px';
        negativeEntity.style.color = '#333';

        if (negativeTowards[key]['type'] == 'PERSON') {
            negativeEntity.style.backgroundColor = '#fffbb5';
        } else if (negativeTowards[key]['type'] == 'ORGANIZATION') {
            negativeEntity.style.backgroundColor = '#ceffb5';
        } else if (negativeTowards[key]['type'] == 'OTHER') {
            negativeEntity.style.backgroundColor = '#ffefcf';
        } else if (negativeTowards[key]['type'] == 'EVENT') {
            negativeEntity.style.backgroundColor = '#dab5ff';
        } else if (negativeTowards[key]['type'] == 'LOCATION') {
            negativeEntity.style.backgroundColor = '#ffb5c3';
        } else if (negativeTowards[key]['type'] == 'WORK_OF_ART') {
            negativeEntity.style.backgroundColor = '#fcccfb';
        } else if (negativeTowards[key]['type'] == 'CONSUMER_GOOD') {
            negativeEntity.style.backgroundColor = '#c2d1ff';
        }
        negativeTowardsContent.appendChild(negativeEntity);
    }
    negativeTowardsTooltipContainer.appendChild(negativeTowardsTooltip);
    negativeTowardsHeader.appendChild(negativeTowardsTooltipContainer);
    negativeTowardsContainer.appendChild(negativeTowardsHeader);
    negativeTowardsContainer.appendChild(negativeTowardsContent);
    contentContainer.appendChild(negativeTowardsContainer);

    // Container for positive entities
    var positiveTowardsContainer = document.createElement('div');
    positiveTowardsContainer.style.flexGrow = '1';
    positiveTowardsContainer.style.maxWidth = '45%';
    positiveTowardsContainer.style.margin = '0.5% 2.5% 0.5% 0.5%';
    positiveTowardsContainer.style.backgroundColor = 'white';
    positiveTowardsContainer.style.borderRadius = '5px';
    positiveTowardsContainer.style.padding = '1%';
    positiveTowardsContainer.style.boxShadow = '0 0 2px #333';

    var positiveTowardsHeader = document.createElement('span');
    positiveTowardsHeader.innerText = 'Positive Towards';
    positiveTowardsHeader.style.color = 'rgb(83, 51, 237)';
    positiveTowardsHeader.style.fontWeight = 'bold';
    positiveTowardsHeader.style.marginBottom = '0.5%';
    positiveTowardsHeader.style.display = 'block';

    var positiveTowardsTooltipContainer = document.createElement('div');
    positiveTowardsTooltipContainer.classList.add('troogl-tooltip');
    positiveTowardsTooltipContainer.innerHTML = '&#x1F6C8;';

    var positiveTowardsTooltip = document.createElement('span');
    positiveTowardsTooltip.classList.add('troogl-tooltip-text');
    positiveTowardsTooltip.innerText = 'Highlights people and organizations that are mentioned in a positive manner';

    var positiveTowardsContent = document.createElement('span');

    if (Object.keys(positiveTowards).length == 0) {
        positiveTowardsContent.innerText = 'Not clearly positive towards any person / organization.';
    }

    for (var key in positiveTowards) {
        var positiveEntity = document.createElement('span');
        positiveEntity.innerText = key;
        positiveEntity.style.fontWeight = 'bold';
        positiveEntity.style.padding = '5px';
        positiveEntity.style.borderRadius = '5px';
        positiveEntity.style.display = 'inline-block';
        positiveEntity.style.margin = '3px 5px';
        positiveEntity.style.color = '#333';

        if (positiveTowards[key]['type'] == 'PERSON') {
            positiveEntity.style.backgroundColor = '#fffbb5';
        } else if (positiveTowards[key]['type'] == 'ORGANIZATION') {
            positiveEntity.style.backgroundColor = '#ceffb5';
        } else if (positiveTowards[key]['type'] == 'OTHER') {
            positiveEntity.style.backgroundColor = '#ffefcf';
        } else if (positiveTowards[key]['type'] == 'EVENT') {
            positiveEntity.style.backgroundColor = '#dab5ff';
        } else if (positiveTowards[key]['type'] == 'LOCATION') {
            positiveEntity.style.backgroundColor = '#ffb5c3';
        } else if (positiveTowards[key]['type'] == 'WORK_OF_ART') {
            positiveEntity.style.backgroundColor = '#fcccfb';
        } else if (positiveTowards[key]['type'] == 'CONSUMER_GOOD') {
            positiveEntity.style.backgroundColor = '#c2d1ff';
        }
        positiveTowardsContent.appendChild(positiveEntity);
    }
    positiveTowardsTooltipContainer.appendChild(positiveTowardsTooltip);
    positiveTowardsHeader.appendChild(positiveTowardsTooltipContainer);
    positiveTowardsContainer.appendChild(positiveTowardsHeader);
    positiveTowardsContainer.appendChild(positiveTowardsContent);
    contentContainer.appendChild(positiveTowardsContainer);

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
    logoContent.innerHTML = 'Powered by <a href="https://samueldobbie.github.io/troogl/" target="_blank" style="color: rgb(83, 51, 237);">Troogl (alpha)</a> - Version 0.0.1';

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
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'black';
    overlay.style.opacity = 0.7;

    popupContainer.appendChild(overlay);

    // Button to exit sentence popup
    var closeButton = document.createElement('a');
    closeButton.classList.add('troogl-exit-button');

    popupContainer.appendChild(closeButton);

    // Container for sentence popup-related items
    var contentContainer = document.createElement('div');
    contentContainer.style.position = 'absolute';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexWrap = 'wrap';
    contentContainer.style.width = '60vw';
    contentContainer.style.height = 'auto';
    contentContainer.style.maxHeight = '95vh';
    contentContainer.style.top = '50%';
    contentContainer.style.left = '50%';
    contentContainer.style.transform = 'translate(-50%, -50%)';
    contentContainer.style.borderRadius = '5px';
    contentContainer.style.backgroundColor = '#f1f1f1';
    contentContainer.style.fontSize = '16px';
    contentContainer.style.fontFamily = 'Tahoma, Geneva, sans-serif';

    var sentenceContainer = document.createElement('div');
    sentenceContainer.style.flexGrow = '2';
    sentenceContainer.style.margin = '2.5% 2.5% 0.5% 2.5%';
    sentenceContainer.style.fontSize = '18px';
    sentenceContainer.style.borderRadius = '5px';
    sentenceContainer.style.padding = '1%';
    sentenceContainer.style.backgroundColor = 'white';
    sentenceContainer.style.boxShadow = '0 0 2px #333';

    var sentenceHeader = document.createElement('span');
    sentenceHeader.innerText = 'Sentence';
    sentenceHeader.style.color = 'rgb(83, 51, 237)';
    sentenceHeader.style.fontWeight = 'bold';
    sentenceHeader.style.marginBottom = '0.5%';
    sentenceHeader.style.display = 'block';

    var sentenceTooltipContainer = document.createElement('div');
    sentenceTooltipContainer.classList.add('troogl-tooltip');
    sentenceTooltipContainer.innerHTML = '&#x1F6C8;';

    var sentenceTooltip = document.createElement('span');
    sentenceTooltip.classList.add('troogl-tooltip-text');
    sentenceTooltip.innerText = 'The selected sentence within the article with its sentiment class';

    sentenceTooltipContainer.appendChild(sentenceTooltip);
    sentenceHeader.appendChild(sentenceTooltipContainer);

    // Container that gets populated upon sentence selection
    var sentenceContent = document.createElement('p');
    sentenceContent.id = 'troogl-sentence-content-item';
    sentenceContent.style.padding = '5px';

    sentenceContainer.appendChild(sentenceHeader);
    sentenceContainer.appendChild(sentenceContent);
    contentContainer.appendChild(sentenceContainer);

    // Break line
    var newline = document.createElement('div');
    newline.style.flexBasis = '100%';
    newline.style.height = 0;
    
    contentContainer.appendChild(newline);

    // Container for sentence options
    var optionContainer = document.createElement('div');
    optionContainer.style.flexGrow = '1';
    optionContainer.style.margin = '0.5% 2.5% 2.5% 2.5%';
    optionContainer.style.fontSize = '18px';
    optionContainer.style.borderRadius = '5px';
    optionContainer.style.padding = '1%';
    optionContainer.style.backgroundColor = 'white';
    optionContainer.style.boxShadow = '0 0 2px #333';

    var optionHeader = document.createElement('span');
    optionHeader.innerText = 'Options';
    optionHeader.style.color = 'rgb(83, 51, 237)';
    optionHeader.style.fontWeight = 'bold';
    optionHeader.style.marginBottom = '0.5%';
    optionHeader.style.display = 'block';

    var optionTooltipContainer = document.createElement('div');
    optionTooltipContainer.classList.add('troogl-tooltip');
    optionTooltipContainer.innerHTML = '&#x1F6C8;';

    var optionTooltip = document.createElement('span');
    optionTooltip.classList.add('troogl-tooltip-text');
    optionTooltip.innerText = 'Provide your input or share with friends!';

    optionTooltipContainer.appendChild(optionTooltip);
    optionHeader.appendChild(optionTooltipContainer);

    var voteOption = document.createElement('button');
    voteOption.id = 'troogl-vote-button';
    voteOption.innerHTML = 'Vote<span style="margin-left: 8px; font-size:9px;">Coming Soon</span>';
    voteOption.style.color = 'white';
    voteOption.style.backgroundColor = '#dedede';
    voteOption.style.padding = '5px';
    voteOption.style.borderRadius = '5px';
    voteOption.style.margin = '0.5%';
    voteOption.style.border = 'none';
    voteOption.style.color = '#333';
    voteOption.style.outline = 'none';
    voteOption.style.boxShadow = '0 0 1px #3E3E3E';
    voteOption.style.cursor = 'pointer';

    var shareOption = document.createElement('button');
    shareOption.id = 'troogl-share-button';
    shareOption.innerHTML = 'Share<span style="margin-left: 8px; font-size:9px;">Coming Soon</span>';
    shareOption.style.color = 'white';
    shareOption.style.backgroundColor = '#dedede';
    shareOption.style.padding = '5px';
    shareOption.style.borderRadius = '5px';
    shareOption.style.margin = '0.5%';
    shareOption.style.border = 'none';
    shareOption.style.color = '#333';
    shareOption.style.outline = 'none';
    shareOption.style.boxShadow = '0 0 1px #3E3E3E';
    shareOption.style.cursor = 'pointer';

    optionContainer.appendChild(optionHeader)
    optionContainer.appendChild(voteOption);
    optionContainer.appendChild(shareOption);
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

    // Enable exiting from full dashboard via overlay
    $('#troogl-full-dashboard-overlay').click(function () {
        $('#troogl-full-dashboard-container').fadeOut();
    });

    // Enable exiting from full dashboard via exit button
    $('.troogl-exit-button').click(function () {
        $('#troogl-full-dashboard-container').fadeOut();
        $('#troogl-sentence-popup-container').fadeOut();
    });

    // Enable opening of sentence popup
    $('.troogl-sentence').click(function () {
        $('#troogl-sentence-content-item').text(this.innerText);
        $('#troogl-sentence-content-item').removeClass();
        $('#troogl-sentence-content-item').addClass(this.classList[1]);
        $('#troogl-sentence-popup-container').fadeIn();
    });

    // Enable exiting from sentence popup
    $('#troogl-sentence-popup-overlay').click(function () {
        $('#troogl-sentence-popup-container').fadeOut();
    });

    // Display coming soon message for voting
    $('#troogl-vote-button').click(function () {
        alert('The ability to provide your own perspective on all metrics, to help improve the results, will be added soon!');
    });

    // Display coming soon message for sharing
    $('#troogl-share-button').click(function () {
        alert('The ability to share metrics and trends will be added soon!');
    });
}


var sparklineIndexMappings = {};
function updateGraphs() {
    var sentences = document.getElementsByClassName('troogl-sentence');

    var sparklineValues = [];
    var piechartValues = [0, 0, 0];
    for (var i = 0; i < sentences.length; i++) {
        var sentenceValue = sentences[i].getAttribute('troogl-class-value');
        sparklineValues.push(sentenceValue);

        // Define mappings from original to actual sentence index (for missed sentences)
        sparklineIndexMappings[i] = sentences[i].getAttribute('troogl-sentence-index');

        if (sentenceValue == -1) {
            piechartValues[0]++;
        } else if (sentenceValue == 0) {
            piechartValues[1]++;
        } else if (sentenceValue == 1) {
            piechartValues[2]++;
        }
    }

    var colors = {
        'negative': '#FF4444',
        'neutral': '#999999',
        'positive': '#66FF66'
    };

    populateSparkLine(sparklineValues, colors);
    populatePiechart(piechartValues, colors);
}


function populateSparkLine(sparklineValues, colors) {
    $('#troogl-sparkline').sparkline(sparklineValues, {
        type: 'line',
        width: '35vw',
        height: '8vh',
        lineColor: '#f1f1f1',
        highlightSpotColor: '#17176A',
        highlightLineColor: '#17176A',
        lineWidth: 4,
        spotRadius: 4,
        chartRangeMin: -1,
        chartRangeMax: 1,
        valueSpots: {
            '-1': colors['negative'],
            '0': colors['neutral'],
            '1': colors['positive']
        },
        disableTooltips: true,
        fillColor: null,
        spotColor: null,
        minSpotColor: null,
        maxSpotColor: null
    }).bind('sparklineRegionChange', function(ev) {
        // Jump to the sentence that is being hovered over in the line graph
        setTimeout(function() {
            var sparkline = ev.sparklines[0];
            var sentenceIndex = sparklineIndexMappings[sparkline.getCurrentRegionFields()['offset']];
            if (sentenceIndex == 0) {
                window.scrollTo(0, 0);
            } else if (sentenceIndex != null) {
                document.getElementById('troogl-sentence-' + sentenceIndex).scrollIntoView(true);
            }
        }, 150);
    });

    var sparklineCanvas = document.getElementById('troogl-sparkline').childNodes[0];
    sparklineCanvas.style.backgroundColor = '#2a2abd';
    sparklineCanvas.style.padding = '5px';
    sparklineCanvas.style.borderRadius = '5px';
}


function populatePiechart(piechartValues, colors) {
    $('#troogl-piechart').sparkline(piechartValues, {
        type: 'pie',
        width: '8vh',
        height: '8vh',
        sliceColors: [colors['negative'], colors['neutral'], colors['positive']],
        tooltipFormatter: function (sparkline, options, fields) {
            var openTag = '<span style="font-size: 18px; padding: 10px; border-radius: 5px; z-index: 2147483647;">';
            if (fields['color'] == '#FF4444') {
                return openTag + fields['value'] + ' negative sentences</span>';
            } else if (fields['color'] == '#999999') {
                return openTag + fields['value'] + ' neutral sentences</span>';
            } else if (fields['color'] == '#66FF66') {
                return openTag + fields['value'] + ' positive sentences</span>';
            }
        }
    });
    
    /*
    .bind('sparklineClick', function(ev) {
        var selectedSliceColor = ev.sparklines[0].getCurrentRegionFields()['color'];
        if (selectedSliceColor == colors['negative']) {
            alert('Negative');
        } else if (selectedSliceColor == colors['neutral']) {
            alert('Neutral');
        } else if (selectedSliceColor == colors['positive']) {
            alert('Positive');
        }
    });*/

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
var positiveTowards = response['positive_towards'];
var negativeTowards = response['negative_towards'];
var summarySentences = response['summary_sentences'];
var readTime = response['read_time'];
var readibilityLevel = response['readability_level'];
var subjectivity = response['subjectivity'];

// Display data within article
prepareSentences(sentences);
updateSentenceClasses(sentenceClasses[response['default_entity_name']]);
insertDashboard(sentenceClasses, summarySentences, readTime, readibilityLevel, subjectivity, positiveTowards, negativeTowards);

// Remove overlay and loader
document.body.removeChild(document.getElementById('troogl-loader'));
