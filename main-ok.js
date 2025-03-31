javascript: (function () {
  /* Configuration for different AI platforms */
  const platformConfig = {
    'claude.ai': {
      name: 'Claude',
      messageSelector: '[class*="message"], [role="dialog"], .message',
      timestampSelector: '[class*="timestamp"], time, [datetime]',
      humanClass: 'human-message, .user-message, [class*="human"], [class*="user"]',
      cleanSelectors: ['button', '.copy-btn']
    },
    'chatgpt.com': {
      name: 'ChatGPT',
      messageSelector: '[class*="message"], .group',
      timestampSelector: '[class*="time"], time, [datetime]',
      humanClass: '[class*="user"]',
      cleanSelectors: ['button', '.copy-code-button']
    },
    'www.perplexity.ai': {
      name: 'Perplexity',
      messageSelector: 'div[data-testid="assistant-message"]',
      timestampSelector: 'div[data-testid="thread-timestamp"]',
      humanClass: 'div[data-testid="user-message"]',
      cleanSelectors: ['button', '.copy-button']
    },
    'chat.deepseek.com': {
      name: 'DeepSeek',
      messageContainer: '[class*="message-container"]', /* The container for each message */
      contentSelector: '[class*="markdown"]', /* The actual message content */
      timestampSelector: '[class*="title_date"]',
      humanClass: '[class*="question"]', /* Only matches human questions */
      cleanSelectors: ['.copy-button', '.code-header', '.flex.items-center'] /* Elements to remove */
    }
  };

  /* Detect current platform */
  const currentDomain = window.location.hostname;
  const platform = Object.keys(platformConfig).find(domain => currentDomain.includes(domain));
  
  if (!platform) {
    const supportedPlatforms = Object.keys(platformConfig).map(c => ' • ' + c).join('\n');
    alert(`Unsupported platform; currently supported platforms are: ${supportedPlatforms}`);
    return;
  }

  const config = platformConfig[platform];
  const humanName = 'Human';
  const assistantName = config.name;
  const titleText = `${assistantName} conversation on ${new Date().toLocaleString()}`;

  /* Create a status indicator */
  const status = document.createElement('div');
  status.style.fontSize = '16px';
  status.style.fontFamily = 'Courier new, monospace';
  status.style.position = 'fixed';
  status.style.top = '10px';
  status.style.right = '10px';
  status.style.background = 'rgba(0,0,0,0.7)';
  status.style.color = 'yellow';
  status.style.padding = '10px';
  status.style.borderRadius = '5px';
  status.style.zIndex = '9999';
  status.textContent = `Preparing to print ${assistantName} conversation...`;
  document.body.appendChild(status);

  /* Function to clean unwanted elements */
  function cleanElements(node, selectors) {
    selectors.forEach(selector => {
      node.querySelectorAll(selector).forEach(el => el.remove());
    });
    return node;
  }

  /* Function to get a clean, printable version of the conversation */
  function extractConversation() {
    /* Find all message containers */
    const messageContainers = Array.from(document.querySelectorAll(config.messageContainer || config.messageSelector));
    
    /* Create a new document for printing */
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
      .timestamp {
        color: #666;
        font-size: 14px;
        margin-top: 5px;
      }
      .message {
        margin-bottom: 25px;
        padding: 15px;
        border-radius: 8px;
        page-break-inside: avoid;
        position: relative;
      }
      .message-timestamp {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 12px;
        color: #666;
      }
      .human {
        background-color: #f5f7fa;
        border-left: 4px solid #4a90e2;
      }
      .assistant {
        background-color: #f9f9f9;
        border-left: 4px solid #50b97d;
      }
      pre, code {
        white-space: pre-wrap;
        background-color: #f8f9fa;
        border: 1px solid #e1e4e8;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 14px;
      }
      pre {
        margin: 15px 0;
      }
      @media print {
        @page {
          margin: 1.5cm;
        }
        body {
          font-size: 14px;
        }
      }
    `;
    head.appendChild(style);
    const body = document.createElement('body');
    
    /* Add header with current date/time */
    const header = document.createElement('div');
    header.className = 'header';
    
    const title = document.createElement('h3');
    title.textContent = titleText;
    header.appendChild(title);
    
    body.appendChild(header);
    
    /* Try to find timestamps in the original messages */
    const timestampElements = document.querySelectorAll(config.timestampSelector);
    const messageTimestamps = Array.from(timestampElements).map(el => el.textContent || el.getAttribute('datetime') || '');
    
    /* Process each message container */
    messageContainers.forEach((container, index) => {
      const isHuman = container.matches(config.humanClass);
      
      /* Find the actual content within the container */
      const content = config.contentSelector 
        ? container.querySelector(config.contentSelector)
        : container;
      
      if (!content) return; /* Skip if no content found */

      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isHuman ? 'human' : 'assistant'}`;
      
      /* Add a label */
      const label = document.createElement('div');
      label.style.fontWeight = 'bold';
      label.style.marginBottom = '10px';
      label.textContent = (isHuman ? humanName : assistantName) + ':';
      messageDiv.appendChild(label);
      
      /* Clone the content */
      const contentClone = content.cloneNode(true);
      
      /* Clean unwanted elements */
      cleanElements(contentClone, config.cleanSelectors || ['button', '[role="button"]']);
      
      /* Add the cleaned content */
      messageDiv.appendChild(contentClone);
      body.appendChild(messageDiv);
    });
    
    /* Add a link element for the favicon */
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTI0IDQ0QzM1LjA0NTcgNDQgNDQgMzUuMDQ1NyA0NCAyNEM0NCAxMi45NTQzIDM1LjA0NTcgNCAyNCA0QzEyLjk1NDMgNCA0IDEyLjk1NDMgNCAyNEM0IDM1LjA0NTcgMTIuOTU0MyA0NCAyNCA0NFoiIGZpbGw9IiMxNjQxNzYiLz48cGF0aCBkPSJNMzIgMjQuNUMyOSAyOS41IDI0IDMyIDI0IDMyQzI0IDMyIDE5IDI5LjUgMTYgMjQuNUMxMyAxOS41IDE2IDEzIDI0IDEzQzMyIDEzIDM1IDE5LjUgMzIgMjQuNVoiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
    favicon.type = 'image/svg+xml';
    head.appendChild(favicon);
    
    printDoc.appendChild(head);
    printDoc.appendChild(body);
    return printDoc;
  }

  /* Main function to prepare and print */
  function prepareAndPrint() {
    status.textContent = 'Extracting conversation...';
    
    try {
      /* Create the print document */
      const printDoc = extractConversation();
      
      if (!printDoc) {
        status.textContent = 'No conversation found.';
        return;
      }
      
      /* Open a new window with just the content we want to print */
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        status.textContent = 'Error: Pop-up blocked. Please allow pop-ups and try again.';
        setTimeout(() => status.remove(), 3000);
        return;
      }
      
      printWindow.document.write(printDoc.outerHTML);
      printWindow.document.close();
      
      /* Set the title for the new window */
      printWindow.document.title = titleText;
      
      /* Wait a moment to ensure the document is ready */
      setTimeout(() => {
        status.textContent = 'Printing...';
        printWindow.focus();
        printWindow.print();
        status.textContent = 'Print dialog opened!';
        setTimeout(() => status.remove(), 2000);
      }, 500);
    } catch (err) {
      status.textContent = 'Error: ' + err.message;
      setTimeout(() => status.remove(), 3000);
    }
  }
  
  /* Execute preparation and printing */
  prepareAndPrint();
})();
