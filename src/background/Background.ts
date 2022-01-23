import TabChangeInfo = chrome.tabs.TabChangeInfo
import Tab = chrome.tabs.Tab

const wildCards = [ "https://www.bbc.co.uk/news/*" ]

const handleInstall = () => {
  chrome.tabs.create({ url: "welcome.html" })
}

const handleUpdated = (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => {
  const tabUrl = tab.url

  if (changeInfo.status === "complete" && tabUrl) {
    // const hasMatch = wildCards.some(wildCard => tabUrl.match(wildCard))

    // if (hasMatch) {
    chrome.tabs.sendMessage(tabId, {
      topic: "TabUpdated",
      payload: { url: tabUrl },
    })
    // }
  }
}

// chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onUpdated.addListener(handleUpdated)
