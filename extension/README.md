# Australian Public Holidays - Chrome Extension

This is a small Chrome extension (Manifest V3) that fetches Australian public holiday data from data.gov.au and displays it in a popup with filters for Year and Jurisdiction.

## Included files
- manifest.json
- popup.html
- popup.css
- popup.js
- README.md

## Install locally (Developer mode)
1. Save the files in a folder (e.g. `aus-holidays-extension`).
2. Open Chrome and go to `chrome://extensions`.
3. Enable "Developer mode" (top-right).
4. Click "Load unpacked" and select the folder.
5. The extension action icon will appear in the toolbar. Click it to open the popup.


## Notes
- The extension uses `host_permissions` for `https://data.gov.au/*` so it can fetch the dataset.
- Date fields may be missing — the UI shows `N/A` for missing/invalid dates or information.
- If you want to persist data or cache, consider adding an IndexedDB or chrome.storage usage.
