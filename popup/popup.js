document.addEventListener("DOMContentLoaded", () => {
    const shortcutInput = document.getElementById("shortcut");
    const expansionInput = document.getElementById("expansion");
    const saveBtn = document.getElementById("save-btn");
    const snippetList = document.getElementById("snippet-list");
  
    // Load and render existing snippets
    function loadSnippets() {
      chrome.storage.local.get("snippets", (data) => {
        const snippets = data.snippets || {};
        snippetList.innerHTML = "";
        
        for (const [shortcut, expansion] of Object.entries(snippets)) {
          const item = document.createElement("div");
          item.className = "snippet-item";
          
          item.innerHTML = `
            <div class="snippet-keys"><strong>${shortcut}</strong> &rarr; <span>${expansion.replace(/</g, "&lt;")}</span></div>
            <button class="delete-btn" data-key="${shortcut}">Delete</button>
          `;
          
          snippetList.appendChild(item);
        }
      });
    }
  
    // Save new configuration element
    saveBtn.addEventListener("click", () => {
      const shortcut = shortcutInput.value.trim();
      const expansion = expansionInput.value;
  
      if (!shortcut || !expansion) return;
  
      chrome.storage.local.get("snippets", (data) => {
        const snippets = data.snippets || {};
        snippets[shortcut] = expansion;
        
        chrome.storage.local.set({ snippets }, () => {
          shortcutInput.value = "";
          expansionInput.value = "";
          loadSnippets();
        });
      });
    });
  
    // Handle inline deletion actions
    snippetList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const keyToDelete = e.target.getAttribute("data-key");
        
        chrome.storage.local.get("snippets", (data) => {
          const snippets = data.snippets || {};
          delete snippets[keyToDelete];
          
          chrome.storage.local.set({ snippets }, () => {
            loadSnippets();
          });
        });
      }
    });
  
    loadSnippets();
  });