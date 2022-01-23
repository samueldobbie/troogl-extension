import TabChangeInfo = chrome.tabs.TabChangeInfo
import Tab = chrome.tabs.Tab

const handleInstall = () => {
  chrome.tabs.create({ url: "welcome.html" })
}

const handleUpdated = (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => {
  const tabUrl = tab.url
  
  if (changeInfo.status === "complete" && tabUrl) {
    const originUrl = new URL(tabUrl).hostname
    
    chrome.storage.sync.get("autoRun", (item) => {
      const autoRunEnabled = item.autoRun == undefined || item.autoRun == true

      if (autoRunEnabled) {
        chrome.storage.sync.get("disabledUrls", (item) => {
          const disabledUrls = item.disabledUrls || []
          const isOriginEnabled = !disabledUrls.includes(originUrl)
    
          if (isOriginEnabled) {
            chrome.tabs.sendMessage(tabId, {
              topic: "TabUpdated",
              payload: { url: tabUrl },
            })
          }
        })
      }
    })

  }
}

// chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onUpdated.addListener(handleUpdated)
