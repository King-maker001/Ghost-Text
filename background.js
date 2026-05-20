// Initialize default snippets securely on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("snippets", (data) => {
      if (!data.snippets) {
        chrome.storage.local.set({
          snippets: {
            ";sysout": "System.out.println();",
            ";psvm": "public static void main(String[] args) {\n    \n}",
            ";fori": "for (int i = 0; i < array.length; i++) {\n    \n}"
          }
        });
      }
    });
  });
  
  // Relay fresh snippet updates to the active content script frames
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSnippets") {
      chrome.storage.local.get("snippets", (data) => {
        sendResponse({ snippets: data.snippets || {} });
      });
      return true; // Keep communication channel open for async execution
    }
  });