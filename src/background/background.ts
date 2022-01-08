const handleActionClick = () => {
  console.log(1)
  alert(2)
}

chrome.browserAction.onClicked.addListener(handleActionClick)

export {}
