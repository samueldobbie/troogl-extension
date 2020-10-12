function prepareSentences(sentences) {
    enablePageEditing();
    window.getSelection().collapse(document.body, 0);

    for (let i = 0; i < sentences.length; i++) {
        if (window.find(sentences[i])) {
            // Get sentence range
            let range = window.getSelection().getRangeAt(0);

            // Construct anchor tag
            let anchorTag = document.createElement('a');
            anchorTag.id = 'troogl-sentence-' + i;

            // Construct sentence container
            let sentenceContainer = document.createElement('span');
            sentenceContainer.appendChild(anchorTag);
            sentenceContainer.setAttribute('troogl-sentence-index', i);
            sentenceContainer.classList.add('troogl-sentence');
            sentenceContainer.appendChild(range.extractContents());

            // Insert constructed sentence into article
            range.insertNode(sentenceContainer);
        }
    }
    disablePageEditing();
    window.scrollTo(0, 0);
}

function updateSentenceClasses(updatedClasses) {
    enablePageEditing();

    // Revert sentences to default state (neutral class)
    let sentences = document.getElementsByClassName('troogl-sentence');
    for (let i = 0; i < sentences.length; i++) {
        removeExistingClass(sentences[i]);
        setDefaultClass(sentences[i]);
    }

    // Update sentence classes based on entity sentiments
    for (let i = 0; i < updatedClasses.length; i++) {
        let index = updatedClasses[i]['sentence_index'];
        let anchor = document.getElementById('troogl-sentence-' + index);

        // Update sentence class
        if (anchor) {
            let sentence = anchor.parentElement;
            removeExistingClass(sentence);
            sentence.classList.add(updatedClasses[i]['sentence_class_string']);
            sentence.setAttribute('troogl-class-value', updatedClasses[i]['sentence_class_value']);
            sentence.setAttribute('title', updatedClasses[i]['sentence_class_title']);
        }
    }
    disablePageEditing();
}


function removeExistingClass(sentence) {
    sentence.classList.remove('troogl-negative');
    sentence.classList.remove('troogl-neutral');
    sentence.classList.remove('troogl-positive');
}


function setDefaultClass(sentence) {
    sentence.classList.add('troogl-neutral');
    sentence.setAttribute('troogl-class-value', 0);
    sentence.setAttribute('title', 'Neutral');
}


function enablePageEditing() {
    document.designMode = 'on';
}


function disablePageEditing() {
    document.designMode = 'off';
    window.getSelection().collapse(document.body, 0);
}


function insertDashboard(article) {
    // Inject visual elements and bind events
    addPartialDashboard(article['sentence_sentiment_classes']);
    addCompleteDashboard(article);
    addSentencePopup();
    bindDashboardEvents();

    // Populate graphs
    updateGraphs();
}


function addPartialDashboard(sentenceClasses) {
    let dashboardContainer = $('<div/>', {
        'id': 'troogl-partial-dashboard-container',
        'css': {
            'position': 'relative',
            'width': '100%',
            'height': '12.5vh'
        }
    });

    let dashboard = $('<div/>', {
        'id': 'troogl-partial-dashboard-bar',
        'css': {
            'position': 'fixed',
            'width': '100%',
            'top': '0',
            'left': '0',
            'height': '12.5vh',
            'display': 'flex',
            'flex-wrap': 'nowrap',
            'align-items': 'center',
            'background-color': 'rgb(83, 51, 237)',
            'box-shadow': '0 0 5px #333',
            'padding': '0 2%',
            'font-family': 'Tahoma, Geneva, sans-serif',
            'z-index': 10000
        }
    });

    let dragContainer = $('<span/>', {
        'id': 'troogl-draggable-container',
        'css': {
            'flex-grow': 0.33,
            'margin-right': '1%',
            'margin-bottom': '12px'
        }
    });

    let dragButton = $('<span/>', {
        'id': 'troogl-draggable-button',
        'html': '. .<br>. .<br>. .',
        'css': {
            'font-size': '25px',
            'font-weight': 'bold',
            'color': '#2a2abd',
            'cursor': 'grab',
            'line-height': '15px',
            'font-weight': 'bold',
            'user-select': 'none'
        }
    });

    dragContainer.append(dragButton);

    // Construct dropdown for switching between perspectives
    let perspectiveContainer = $('<span/>', {
        'css': {
            'flex-grow': 1
        }
    });

    let perspectiveDropdown = $('<select/>', {
        'css': {
            'padding': '5px',
            'border-radius': '7.5px',
            'font-size': '16px',
            'outline': 'none',
            'cursor': 'pointer',
            'display': 'inline-block'
        }
    });

    // Populate perspective dropdown
    for (const key in sentenceClasses) {
        let perspectiveOption = $('<option/>', {'text': key});
        perspectiveDropdown.append(perspectiveOption);
    }

    // Update sentence classes upon changing perspective
    perspectiveDropdown.on('change', function () {
        updateSentenceClasses(sentenceClasses[perspectiveDropdown.value]);
        updateGraphs();
    });

    let perspectiveTooltipContainer = $('<div/>', {
        'class': 'troogl-tooltip',
        'html': '&#x1F6C8;'
    });

    let perspectiveTooltip = $('<span/>', {
        'class': 'troogl-tooltip-text',
        'text': 'See the article sentiment from different perspectives'
    });

    perspectiveTooltipContainer.append(perspectiveTooltip);

    perspectiveContainer.append([
        perspectiveDropdown,
        perspectiveTooltipContainer
    ]);

    // Construct graph container
    let graphContainer = $('<span/>', {
        'id': 'troogl-graph-container',
        'css': {
            'flex-grow': 2
        }
    });

    // Create sparkline container
    let sparklineChart = $('<span/>', {
        'id': 'troogl-sparkline',
    });

    // Create piechart container
    let piechartChart = $('<span/>', {
        'id': 'troogl-piechart',
        'css': {
            'margin-left': '0.5%'
        }
    });

    graphContainer.append([
        sparklineChart,
        piechartChart
    ]);

    let optionContainer = $('<span/>', {
        'id': 'troogl-option-container',
        'css': {
            'cursor': 'pointer',
            'font-size': '16px',
            'flex-grow': 1
        }
    });

    let fullDashboardbutton = $('<span/>', {
        'id': 'troogl-full-dashboard-button',
        'text': 'Full Dashboard',
        'css': {
            'background-color': '#2a2abd',
            'color': 'white',
            'padding': '5px',
            'border-radius': '5px'
        }
    });

    let hideButton = $('<span/>', {
        'id': 'troogl-collapse-button',
        'text': 'Hide',
        'css': {
            'background-color': '#2a2abd',
            'color': 'white',
            'padding': '5px',
            'border-radius': '5px',
            'margin-left': '1%'
        }
    });

    optionContainer.append([
        fullDashboardbutton,
        hideButton
    ]);

    let expandButton = $('<button/>', {
        'id': 'troogl-expand-button',
        'text': 'Show Dashboard',
        'css': {
            'background-color': 'rgb(83, 51, 237)',
            'cursor': 'pointer',
            'color': 'white',
            'border-radius': '0px 0px 5px 5px',
            'top': '0',
            'right': '0',
            'padding': '5px',
            'margin-right': '5%',
            'outline': 'none',
            'display': 'none',
            'font-size': '16px',
            'position': 'fixed',
            'border': 'none',
            'font-family': 'Tahoma, Geneva, sans-serif',
            'box-shadow': '0 0 2px #333',
            'z-index': 2147483647,
        }
    });

    // Populate dashboard
    dashboard.append([
        dragContainer,
        perspectiveContainer,
        graphContainer,
        optionContainer
    ]);

    dashboardContainer.append(dashboard);

    $('body').append([
        expandButton,
        dashboardContainer
    ]);

    // Enable dragging of dashboard
    $('#troogl-partial-dashboard-bar').draggable({
        handle: '#troogl-draggable-button',
        containment: 'window',
        cursor: 'grabbing',
        axis: 'y',
        scroll: false
    });
}


function addCompleteDashboard(article) {
    const summarySentences = article['summary_sentences'];
    const readTime = article['read_time'];
    const readibilityLevel = article['readability_level'];
    const subjectivity = article['subjectivity'];
    const positiveTowards = article['positive_towards'];
    const negativeTowards = article['negative_towards'];

    // Container for all dashboard items
    let dashboard = $('<div/>', {
        'id': 'troogl-full-dashboard-container',
        'css': {
            'position': 'fixed',
            'width': '100vw',
            'height': '100vh',
            'display': 'none',
            'z-index': 2147483647
        }
    });

    // Overlay that can be clicked to exit complete dashboard
    let overlay = $('<div/>', {
        'id': 'troogl-full-dashboard-overlay',
        'css': {
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'width': '100vw',
            'height': '100vh',
            'background-color': 'black',
            'opacity': 0.7
        }
    });

    // Button to exit dashboard
    let closeButton = $('<a/>', {
        'class': 'troogl-exit-button'
    });

    // Container for content-related dashboard items
    let content = $('<div/>', {
        'css': {
            'position': 'absolute',
            'display': 'flex',
            'flex-wrap': 'wrap',
            'width': '80vw',
            'max-height': '95vh',
            'overflow-y': 'auto',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'border-radius': '5px',
            'background-color': '#f1f1f1',
            'font-size': '16px',
            'font-family': 'Tahoma, Geneva, sans-serif'
        }
    });

    // Construct dashboard
    content.append([
        getReadTimeContainer(readTime),
        getReadibilityContainer(readibilityLevel),
        getSubjectivityContainer(subjectivity),
        getSummaryContainer(summarySentences),
        getEntitySentimentContainer('Negative', negativeTowards),
        getEntitySentimentContainer('Positive', positiveTowards),
        getNewline(),
        getFeedbackContainer(),
        getLogoContainer()
    ]);

    // Inject dashboard into page
    dashboard.append([
        overlay,
        closeButton,
        content
    ]);

    $('body').prepend(dashboard);
}


function getReadTimeContainer(readTime) {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '1',
            'margin': '2.5% 0.5% 0.5% 2.5%',
            'backgroundColor': 'white',
            'borderRadius': '5px',
            'padding': '1%',
            'boxShadow': '0 0 2px #333'
        }
    });

    let header = $('<span/>', {
        'text': 'Read Time',
        'css': {
            'color': 'rgb(83, 51, 237)',
            'fontWeight': 'bold',
            'marginBottom': '0.5%',
            'display': 'block'
        }
    });

    let tooltipContainer = $('<div/>', {
        'class': 'troogl-tooltip',
        'html': '&#x1F6C8;'
    });

    let tooltip = $('<span/>', {
        'class': 'troogl-tooltip-text',
        'text': 'Estimates the time required to read the article'
    });

    let content = $('<span/>', {
        'text': readTime['minutes'] + ' min ' + readTime['seconds'] + ' secs'
    });

    tooltipContainer.append(tooltip);
    header.append(tooltipContainer);
    
    container.append([
        header,
        content
    ]);

    return container;
}


function getReadibilityContainer(readibilityLevel) {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '1',
            'margin': '2.5% 0.5% 0.5% 0.5%',
            'backgroundColor': 'white',
            'borderRadius': '5px',
            'padding': '1%',
            'boxShadow': '0 0 2px #333'
        }
    });

    let header = $('<span/>', {
        'text': 'Readibility',
        'css': {
            'color': 'rgb(83, 51, 237)',
            'fontWeight': 'bold',
            'marginBottom': '0.5%',
            'display': 'block'
        }
    });

    let tooltipContainer = $('<div/>', {
        'class': 'troogl-tooltip',
        'html': '&#x1F6C8;'
    });

    let tooltip = $('<span/>', {
        'class': 'troogl-tooltip-text',
        'text': 'Gauges the understandibility of the article using the Automated Readibility Index'
    });

    let content = $('<span/>', {
        'text': readibilityLevel
    });

    tooltipContainer.append(tooltip);
    header.append(tooltipContainer);
    
    container.append([
        header,
        content
    ]);

    return container;
}


function getSubjectivityContainer(subjectivity) {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '1',
            'margin': '2.5% 2.5% 0.5% 0.5%',
            'backgroundColor': 'white',
            'borderRadius': '5px',
            'padding': '1%',
            'boxShadow': '0 0 2px #333'
        }
    });

    let header = $('<span/>', {
        'text': 'Subjectivity',
        'css': {
            'color': 'rgb(83, 51, 237)',
            'fontWeight': 'bold',
            'marginBottom': '0.5%',
            'display': 'block'
        }
    });

    let tooltipContainer = $('<div/>', {
        'class': 'troogl-tooltip',
        'html': '&#x1F6C8;'
    });

    let tooltip = $('<span/>', {
        'class': 'troogl-tooltip-text',
        'text': 'Gauges how objective or opinionated the article is (does not correspond with factuality)'
    });

    let content = $('<span/>', {
        'text': subjectivity
    });

    tooltipContainer.append(tooltip);
    header.append(tooltipContainer);
    
    container.append([
        header,
        content
    ]);

    return container;
}


function getSummaryContainer(summarySentences) {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '2',
            'margin': '0.5% 2.5% 0.5% 2.5%',
            'backgroundColor': 'white',
            'borderRadius': '5px',
            'padding': '1%',
            'boxShadow': '0 0 2px #333'
        }
    });

    let header = $('<span/>', {
        'text': 'TL;DR',
        'css': {
            'color': 'rgb(83, 51, 237)',
            'fontWeight': 'bold',
            'marginBottom': '0.5%',
            'display': 'block'
        }
    });

    let tooltipContainer = $('<div/>', {
        'class': 'troogl-tooltip',
        'html': '&#x1F6C8;'
    });

    let tooltip = $('<span/>', {
        'class': 'troogl-tooltip-text',
        'text': 'Summarizes the article with the three most relevant sentences'
    });

    let content = $('<ul/>', {
        'css': {
            'list-style-type': 'disc',
            'margin': '1% 5%'
        }
    });

    for (let i = 0; i < summarySentences.length; i++) {
        let bullet = $('<li/>', {
            'text': summarySentences[i]
        });

        if (i != summarySentences.length - 1) {
            bullet.css('margin-bottom', '1.5%');
        }

        content.append(bullet);
    }

    tooltipContainer.append(tooltip);
    header.append(tooltipContainer);
    
    container.append([
        header,
        content
    ]);

    return container;
}


function getEntitySentimentContainer(type, entitySentiments) {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '1',
            'max-width': '45%',
            'background-color': 'white',
            'border-radius': '5px',
            'padding': '1%',
            'boxShadow': '0 0 2px #333'
        }
    });

    if (type == 'Negative') {
        container.css('margin', '0.5% 0.5% 0.5% 2.5%');
    } else {
        container.css('margin', '0.5% 2.5% 0.5% 0.5%');
    }

    let header = $('<span/>', {
        'text': type + ' Towards',
        'css': {
            'color': 'rgb(83, 51, 237)',
            'fontWeight': 'bold',
            'marginBottom': '0.5%',
            'display': 'block'
        }
    });

    let tooltipContainer = $('<div/>', {
        'class': 'troogl-tooltip',
        'html': '&#x1F6C8;'
    });

    let tooltip = $('<span/>', {
        'class': 'troogl-tooltip-text',
        'text': 'Highlights people and organizations that are mentioned in a ' + type + ' manner'
    });

    let content = $('<span/>');

    if (Object.keys(entitySentiments).length == 0) {
        content.text('Not clearly ' + type + ' towards any person / organization.');
    }

    for (const key in entitySentiments) {
        let entityColour = getEntityColour(
            entitySentiments[key]['type']
        );

        let entity = $('<span/>', {
            'text': key,
            'css': {
                'fontWeight': 'bold',
                'padding': '5px',
                'borderRadius': '5px',
                'display': 'inline-block',
                'margin': '3px 5px',
                'color': '#333',
                'background-color': entityColour
            }
        });

        content.append(entity);
    }

    tooltipContainer.append(tooltip);
    header.append(tooltipContainer);
    
    container.append([
        header,
        content
    ]);

    return container;
}


function getEntityColour(type) {
    let colourMappings = {
        'PERSON': '#fffbb5',
        'ORGANIZATION': '#ceffb5',
        'OTHER': '#ffefcf',
        'EVENT': '#dab5ff',
        'LOCATION': '#ffb5c3',
        'WORK_OF_ART': '#fcccfb',
        'CONSUMER_GOOD': '#c2d1ff'
    }
    return colourMappings[type];
}


function getNewline() {
    return $('<div/>', {
        'css': {
            'flex-basis': '100%',
            'height': '0'
        }
    });
}


function getFeedbackContainer() {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '1',
            'margin': '0.5% 0.5% 2.5% 2.5%',
            'font-size': '13px',
            'border-radius': '5px',
            'padding': '1%',
        }
    });

    let content = $('<span/>', {
        'html': 'Help us improve! <a href="https://form.jotformeu.com/201655282823354" target="_blank" style="color: rgb(83, 51, 237);">Share your feedback.</a>'
    });

    container.append(content);

    return container;
}


function getLogoContainer() {
    let container = $('<div/>', {
        'css': {
            'flexGrow': '1',
            'margin': '0.5% 2.5% 2.5% 0.5%',
            'font-size': '13px',
            'border-radius': '5px',
            'padding': '1%',
            'text-align': 'right'
        }
    });

    let content = $('<span/>', {
        'html': 'Powered by <a href="https://samueldobbie.github.io/troogl/" target="_blank" style="color: rgb(83, 51, 237);">Troogl (alpha)</a> - Version 0.0.2'
    });

    container.append(content);

    return container;
}


function addSentencePopup() {
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
const article = JSON.parse(response);
const defaultEntity = article['default_entity_name'];

// Display data within article
prepareSentences(article['sentences']);
updateSentenceClasses(article['sentence_sentiment_classes'][defaultEntity]);
insertDashboard(article);

// Remove loader overlay
document.body.removeChild(document.getElementById('troogl-loader'));
