function validate() {
    if (document.getElementsByClassName('troogl-sentence').length > 0) {
        return false;
    } else {
        return true;
    }
}

validate();