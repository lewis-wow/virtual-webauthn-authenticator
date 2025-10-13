import overrideUrl from './override.js?url';

const script = document.createElement('script');
script.src = chrome.runtime.getURL(overrideUrl);
script.dataset.apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
