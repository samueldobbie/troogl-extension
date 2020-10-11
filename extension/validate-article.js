function validate() {
    // Check whether the article has already been analysed
    if (document.getElementsByClassName('troogl-sentence').length > 0) {
        return false;
    }
    return true;
}

validate();
