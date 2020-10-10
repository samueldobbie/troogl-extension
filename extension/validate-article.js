function validate() {
    // Check whether article has already been analysed
    if (document.getElementsByClassName('troogl-sentence').length > 0) {
        return false;
    }
    return true;
}

validate();
