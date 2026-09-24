export const THEME_STORAGE_KEY = "intentfield:theme:v1";

// Apply only the two supported values before first paint; never interpolate storage.
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;
