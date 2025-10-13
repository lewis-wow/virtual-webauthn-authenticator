const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/content/override.ts');
script.onload = function () {
  this.remove(); // Optional: clean up the script tag from the DOM after it has run
};
(document.head || document.documentElement).appendChild(script);
