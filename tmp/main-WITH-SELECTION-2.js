javascript: (function () {
  /* Setup global variables */
  const humanName = 'Human';
  const titleTextPattern = `%s conversation on %s}`;
  const timeoutBeforeClosePrintWindowMilliseconds = 100;

  /* Configuration for different AI platforms */
  const platformConfig = {
    'claude.ai': {
      name: 'Claude',
      messageSelector: '[class*="message"], [role="dialog"], .message',
      timestampSelector: '[class*="timestamp"], time, [datetime]',
      humanClass: 'human-message, .user-message, [class*="human"], [class*="user"]'
    },
    'chatgpt.com': {
      name: 'ChatGPT',
      messageSelector: '.text-base',
      timestampSelector: '[class*="timestamp"], time, [datetime]',
      humanClass: '.text-base:has(.whitespace-pre-wrap)',
      assistantClass: '.text-base:has(.prose)'
    }
  };

  /* Detect current platform */
  const currentDomain = window.location.hostname;
  const platform = Object.keys(platformConfig).find(domain => currentDomain.includes(domain));
  
  if (!platform) {
    const supportedPlatforms = Object.keys(platformConfig).map(c => ' • ' + c).join('\n');
    alert(`Unsupported platform; currently supported platforms are:\n${supportedPlatforms}`);
    return;
  }

  const config = platformConfig[platform];
  const assistantName = config.name;
  let titleText;

  /* Function to clean unwanted elements */
  function cleanElements(node, selectors) {
    selectors.forEach(selector => {
      node.querySelectorAll(selector).forEach(el => el.remove());
    });
    return node;
  }

  /* Function to get all selected messages */
  function getSelectedMessages() {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '' || selection.rangeCount === 0) return null;
    
    /* Get all message containers in the document */
    const allMessages = Array.from(document.querySelectorAll(config.messageSelector));
    const selectedMessages = new Set();
    
    /* Check each range in the selection */
    for (let i = 0; i < selection.rangeCount; i++) {
      const range = selection.getRangeAt(i);
      
      /* Find the start and end containers */
      let startNode = range.startContainer;
      while (startNode && !startNode.matches?.(config.messageSelector)) {
        startNode = startNode.parentElement;
      }
      
      let endNode = range.endContainer;
      while (endNode && !endNode.matches?.(config.messageSelector)) {
        endNode = endNode.parentElement;
      }
      
      /* If we found message containers, add them and all in between */
      if (startNode && endNode) {
        const startIndex = allMessages.indexOf(startNode);
        const endIndex = allMessages.indexOf(endNode);
        
        if (startIndex >= 0 && endIndex >= 0) {
          const minIndex = Math.min(startIndex, endIndex);
          const maxIndex = Math.max(startIndex, endIndex);
          
          for (let j = minIndex; j <= maxIndex; j++) {
            selectedMessages.add(allMessages[j]);
          }
        }
      }
    }
    
    return selectedMessages.size > 0 ? Array.from(selectedMessages) : null;
  }

  /* Function to create print document */
  function createPrintDocument(contentNodes) {
    const printDoc = document.createElement('html');
    const head = document.createElement('head');
    const style = document.createElement('style');
    
    /* Add print styles */
    style.textContent = `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 24px;
        margin: 20px; 
        line-height: 1.8;
        color: #333;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      .message {
        margin-bottom: 25px;
        padding: 15px;
        border-radius: 8px;
        page-break-inside: avoid;
      }
      .human {
        background-color: #f5f7fa;
        border-left: 4px solid #4a90e2;
      }
      .assistant {
        background-color: #f9f9f9;
        border-left: 4px solid #50b97d;
      }
      pre {
        white-space: pre-wrap;
        background-color: #f8f9fa;
        border: 1px solid #e1e4e8;
        padding: 12px;
        border-radius: 6px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 14px;
      }
      @media print {
        @page {
          margin: 1.5cm;
        }
        body {
          font-size: 16px;
        }
      }
    `;
    head.appendChild(style);
    const body = document.createElement('body');
    
    /* Add header */
    const header = document.createElement('div');
    header.className = 'header';
    const title = document.createElement('h3');
    
    /* Try to find timestamp in the original messages */
    const timestampElements = document.querySelectorAll(config.timestampSelector);
    const messageTimestamp = Array.from(timestampElements).map(el => el.textContent || el.getAttribute('datetime') || '')[0];
    titleText = titleTextPattern.replace("%s", assistantName).replace("%s", messageTimestamp ?? new Date().toLocaleString());
    
    title.textContent = titleText;
    header.appendChild(title);
    body.appendChild(header);

    /* Add the content nodes */
    contentNodes.forEach(node => body.appendChild(node));
    
    /* Add favicon */
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTI0IDQ0QzM1LjA0NTcgNDQgNDQgMzUuMDQ1NyA0NCAyNEM0NCAxMi45NTQzIDM1LjA0NTcgNCAyNCA0QzEyLjk1NDMgNCA0IDEyLjk1NDMgNCAyNEM0IDM1LjA0NTcgMTIuOTU0MyA0NCAyNCA0NFoiIGZpbGw9IiMxNjQxNzYiLz48cGF0aCBkPSJNMzIgMjQuNUMyOSAyOS41IDI0IDMyIDI0IDMyQzI0IDMyIDE5IDI5LjUgMTYgMjQuNUMxMyAxOS41IDE2IDEzIDI0IDEzQzMyIDEzIDM1IDE5LjUgMzIgMjQuNVoiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
    head.appendChild(favicon);
    
    printDoc.appendChild(head);
    printDoc.appendChild(body);
    return printDoc;
  }

  /* Function to prepare content for printing */
  function prepareContent() {
    /* First check for selected messages */
    const selectedMessages = getSelectedMessages();
    if (selectedMessages) {
      const contentNodes = [];
      
      selectedMessages.forEach(message => {
        const isHuman = message.matches(config.humanClass);
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isHuman ? 'human' : 'assistant'}`;
        
        const label = document.createElement('div');
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '10px';
        label.textContent = (isHuman ? humanName : assistantName) + ':';
        messageDiv.appendChild(label);
        
        const content = config.contentSelector 
          ? message.querySelector(config.contentSelector)
          : message;
        
        if (content) {
          const contentClone = content.cloneNode(true);
          cleanElements(contentClone, config.cleanSelectors || ['button', '[role="button"]']);
          messageDiv.appendChild(contentClone);
          contentNodes.push(messageDiv);
        }
      });
      
      return contentNodes;
    }
    
    /* Fall back to full conversation */
    const messageContainers = Array.from(document.querySelectorAll(config.messageSelector));
    const contentNodes = [];
    let contentCloneLast = null;
    
    messageContainers.forEach(container => {
      const isHuman = container.matches(config.humanClass);
      const isAssistant = config.assistantClass ? container.matches(config.assistantClass) : true;
      
      if (!isHuman && !isAssistant) return;
      
      const content = config.contentSelector 
        ? container.querySelector(config.contentSelector)
        : container;
      
      if (!content) return;
      
      const contentClone = content.cloneNode(true);
      cleanElements(contentClone, config.cleanSelectors || ['button', '[role="button"]']);
      
      if (contentClone?.textContent === contentCloneLast?.textContent) return;
      if (!contentClone?.textContent.trim()) return;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isHuman ? 'human' : 'assistant'}`;
      
      const label = document.createElement('div');
      label.style.fontWeight = 'bold';
      label.style.marginBottom = '10px';
      label.textContent = (isHuman ? humanName : assistantName) + ':';
      messageDiv.appendChild(label);
      
      messageDiv.appendChild(contentClone);
      contentNodes.push(messageDiv);
      contentCloneLast = contentClone;
    });
    
    return contentNodes;
  }

  /* Main function to prepare and print */
  function prepareAndPrint() {
    try {
      const contentNodes = prepareContent();
      
      if (!contentNodes || contentNodes.length === 0) {
        alert('No content found to print.');
        return;
      }
      
      const printDoc = createPrintDocument(contentNodes);
      
      /* Open a new window with just the content we want to print */
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Print pop-up window blocked. Please allow pop-ups and try again.');
        return;
      }
      
      printWindow.document.write(printDoc.outerHTML);
      printWindow.document.close();
      printWindow.document.title = titleText;
      
      /* Wait a moment before printing */
      setTimeout(() => {
        printWindow.print();

        /* Polling mechanism to check when print dialog is closed */
        const timer = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(timer);
          } else {
            try {
              if (printWindow.document.hasFocus()) {
                  clearInterval(timer);
                  printWindow.close();
              }
            } catch (e) {
              clearInterval(timer);
              printWindow.close();
            }
          }
        }, timeoutBeforeClosePrintWindowMilliseconds);
      }, timeoutBeforeClosePrintWindowMilliseconds);
    } catch (err) {
      alert('Error while printing: ' + err.message);
    }
  }
  
  /* Execute preparation and printing */
  prepareAndPrint();
})();
