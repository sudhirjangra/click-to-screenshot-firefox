const NETWORK_PATH = 'S:\\VIF_screenshots';

function formatDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

function getDateFolder() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function generateFilename(country, attribute) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${country}_${attribute}_${timestamp}.png`;
}

function addMetadataOverlay(dataUrl, pageUrl, country, attribute) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height + 100;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, img.height, canvas.width, 100);

      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('URL: ' + pageUrl, 15, img.height + 25);

      ctx.font = '12px Arial';
      const timestamp = getTimestamp();
      const dateStr = new Date().toLocaleDateString();
      ctx.fillText(`Country: ${country} | Attribute: ${attribute} | Date: ${dateStr} | Time: ${timestamp}`, 15, img.height + 50);

      ctx.drawImage(img, 0, 0);

      const overlayUrl = canvas.toDataURL('image/png');
      resolve(overlayUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function tryNetworkPath(dataUrl, country, attribute) {
  return new Promise((resolve) => {
    try {
      if (!chrome.runtime.connectNative) {
        resolve(null);
        return;
      }

      const port = chrome.runtime.connectNative('com.kantar.screenshot_saver');

      port.onMessage.addListener((response) => {
        port.disconnect();
        resolve(response.success ? response : null);
      });

      port.onDisconnect.addListener(() => {
        resolve(null);
      });

      const dateFolder = getDateFolder();
      const filename = generateFilename(country, attribute);
      const targetPath = `${NETWORK_PATH}\\${country}\\${attribute}\\${dateFolder}\\${filename}`;

      port.postMessage({
        action: 'saveScreenshot',
        dataUrl: dataUrl,
        targetPath: targetPath
      });

      setTimeout(() => {
        try {
          port.disconnect();
          resolve(null);
        } catch (e) {}
      }, 5000);
    } catch (e) {
      resolve(null);
    }
  });
}

function fallbackToDownloads(dataUrl, country, attribute) {
  return new Promise((resolve) => {
    const today = formatDate();
    const filename = `VIF_screenshots/${country}/${attribute}/${today}/${generateFilename(country, attribute)}`;

    const base64Image = dataUrl.split(',')[1];
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
        resolve({ success: false, error: chrome.runtime.lastError.message });
      } else {
        resolve({ success: true, path: filename, downloadId: downloadId, source: 'downloads' });
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureAndSave') {
    const { country, attribute } = request;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ success: false, error: 'No active tab found' });
        return;
      }

      const activeTab = tabs[0];
      const pageUrl = activeTab.url;

      chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, async (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }

        const enhancedDataUrl = await addMetadataOverlay(dataUrl, pageUrl, country, attribute);

        let result = await tryNetworkPath(enhancedDataUrl, country, attribute);

        if (!result) {
          result = await fallbackToDownloads(enhancedDataUrl, country, attribute);
        }

        sendResponse(result);
      });
    });

    return true;
  }
});
