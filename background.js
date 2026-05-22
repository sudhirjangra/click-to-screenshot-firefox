function formatDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

function getUrlPrefix(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    return hostname.substring(0, 10).replace(/[^a-zA-Z0-9-]/g, '_');
  } catch {
    return 'screenshot';
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureAndSave') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({
          success: false,
          error: 'No active tab found'
        });
        return;
      }

      const activeTab = tabs[0];
      chrome.tabs.captureVisibleTab(activeTab.windowId, { format: 'png' }, (imageData) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message
          });
          return;
        }

        try {
          const urlPrefix = getUrlPrefix(activeTab.url);
          const today = formatDate();
          const timestamp = Date.now();
          const filename = `VIF_screenshots/${request.country}/${today}/${request.attribute}/${urlPrefix}_${timestamp}.png`;

          const base64Image = imageData.split(',')[1];
          const binaryString = atob(base64Image);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/png' });
          const objectUrl = URL.createObjectURL(blob);

          chrome.downloads.download({
            url: objectUrl,
            filename: filename,
            saveAs: false
          }, (downloadId) => {
            if (chrome.runtime.lastError) {
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message
              });
            } else {
              sendResponse({ success: true });
              setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            }
          });
        } catch (error) {
          sendResponse({
            success: false,
            error: error.message
          });
        }
      });
    });

    return true;
  }
});
