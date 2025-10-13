const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content/override.js');
(document.head || document.documentElement).appendChild(script);
