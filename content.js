let snippets = {};
let inputBuffer = "";
const BUFFER_MAX_SIZE = 30;

// Fetch snippets from background storage layer
function updateSnippets() {
  chrome.runtime.sendMessage({ action: "getSnippets" }, (response) => {
    if (response && response.snippets) {
      snippets = response.snippets;
    }
  });
}
updateSnippets();

// Listen for updates from the UI management popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.snippets) {
    snippets = changes.snippets.newValue || {};
  }
});

// Capture keystrokes early to run intercept evaluation before page event loops consume them
document.addEventListener("keydown", (event) => {
  const key = event.key;

  // SAFETY CHECK: Handle platforms like Tekstac that send undefined or abnormal key events
  if (!key) return;

  if (key === "Backspace") {
    inputBuffer = inputBuffer.slice(0, -1);
    return;
  }
  
  if (key.length > 1) return; // Skip non-character modifier actions like Shift, Control, Alt

  inputBuffer += key;
  if (inputBuffer.length > BUFFER_MAX_SIZE) {
    inputBuffer = inputBuffer.substring(inputBuffer.length - BUFFER_MAX_SIZE);
  }

  // Evaluate matching constraints
  for (const [shortcut, expansion] of Object.entries(snippets)) {
    if (inputBuffer.endsWith(shortcut)) {
      event.preventDefault();
      expandText(shortcut, expansion);
      inputBuffer = ""; 
      break;
    }
  }
}, true);

function expandText(shortcut, expansion) {
  const activeEl = document.activeElement;
  if (!activeEl) return;

  // Handle traditional text inputs and textareas
  if (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;
    const currentText = activeEl.value;

    const newText = currentText.slice(0, start - shortcut.length) + expansion + currentText.slice(end);
    activeEl.value = newText;
    
    const newCursorPos = start - shortcut.length + expansion.length;
    activeEl.setSelectionRange(newCursorPos, newCursorPos);
    activeEl.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  // Handle advanced UI code contexts safely using synthetic document actions
  try {
    for (let i = 0; i < shortcut.length; i++) {
      document.execCommand("delete", false, null);
    }
    document.execCommand("insertText", false, expansion);
  } catch (err) {
    console.error("DOM expansion command failure context:", err);
  }
}