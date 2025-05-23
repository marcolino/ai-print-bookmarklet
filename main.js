javascript: (function () {
  /* Setup global variables */
  const humanName = 'Human';
  const titleTextPattern = `%s conversation on %s`;
  const timeoutBeforeClosePrintWindowMilliseconds = 100;

  /* Configuration for different AI platforms */
  const platformConfig = {
    'claude.ai': {
      name: 'Claude',
      messageSelector: '[class*="message"], [role="dialog"], .message',
      humanClass: 'human-message, .user-message, [class*="human"], [class*="user"]',
      /*timestampSelector: '[class*="timestamp"], time, [datetime]',*/
      /*cleanSelectors: ['button', '.copy-btn']*/
    },
    'chatgpt.com': {
      name: 'ChatGPT',
      messageSelector: '.text-base',
      humanClass: '.text-base:has(.whitespace-pre-wrap)',
      assistantClass: '.text-base:has(.prose)',
      /*timestampSelector: '[class*="timestamp"], time, [datetime]',*/
      /*cleanSelectors: ['button', '.copy-code-button']*/
    },
    /*
     'www.perplexity.ai': {
      name: 'Perplexity',
      messageSelector: 'div[data-testid="thread-container"]',
      humanClass: 'div[data-testid="user-message"]',
      assistantClass: 'div[data-testid="ai-message"]',
      /*timestampSelector: '[class*="timestamp"]',* /
      /*cleanSelectors: ['button', '.copy-button']* /
      },
    */
    /*
    'chat.deepseek.com': {
      name: 'DeepSeek',
      messageSelector: '[class*="fbb737a4"]',
      humanClass: '[class*="_9663006"]',
      assistantClass: '[class*="ds-markdown.ds-markdown--block"]',
      /*timestampSelector: '[class*="title_date"]',* /
      /*cleanSelectors: ['.copy-button', '.code-header', '.flex.items-center'],* /
    }
    */
  };

  /* Detect current platform */
  const currentDomain = window.location.hostname;
  const platform = Object.keys(platformConfig).find(domain => currentDomain.includes(domain));
  
  if (!platform) {
    const supportedPlatforms = Object.keys(platformConfig).map(c => ' • ' + c).join('\n');
    alert(`Unsupported site; currently supported sites are:\n${supportedPlatforms}`);
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

  /* Function to get a clean, printable version of the conversation */
  function extractConversation() {
    /* Find all message containers */
    const messageContainers = Array.from(document.querySelectorAll(config.messageSelector));
    
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
        margin-top: 10px;
        background-color: #f5f7fa;
        border-left: 4px solid #4a90e2;
      }
      .assistant {
        margin-top: 10px;
        background-color: #f9f9f9;
        border-left: 4px solid #50b97d;
      }
      /* Fixed code block styling */
      pre {
        white-space: pre-wrap;
        background-color: #f8f9fa;
        border: 1px solid #e1e4e8;
        padding: 12px;
        border-radius: 6px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 14px;
        line-height: 1.4;
        max-width: 100%;
        overflow-wrap: break-word;
         word-wrap: break-word;
        display: block;
        margin: 15px 0;
        page-break-inside: avoid;
      }
      code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 14px;
        background-color: rgba(0,0,0,0.05);
        padding: 2px 4px;
        border-radius: 3px;
      }
      /* Make sure code inside pre doesn't get double-styled */
      pre code {
        background-color: transparent;
        padding: -4px;
        border-radius: 0;
      }
      @media print {
        @page {
          margin: 1.5cm;
        }
        body {
          font-size: 20px;
          line-height: 2;
        }
        pre, code {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        /* Avoid printing math formulas twice */
        .katex .katex-html {
          display: none !important;
        }
      }
    `;
    head.appendChild(style);
    const body = document.createElement('body');
    
    /* Try to find timestamp in the original messages */
    const timestampElements = document.querySelectorAll(config.timestampSelector);
    const messageTimestamp = Array.from(timestampElements).map(el => el.textContent || el.getAttribute('datetime') || '')[0];
    titleText = titleTextPattern.replace("%s", assistantName).replace("%s", messageTimestamp ?? new Date().toLocaleString());

    /* Add header with current date/time */
    const header = document.createElement('div');
    header.className = 'header';
    
    const title = document.createElement('h3');
    title.textContent = titleText;
    header.appendChild(title);
    
    body.appendChild(header);

    /* Process each message container */
    let contentCloneLast = null;
    messageContainers.forEach((container, index) => {
      /*console.log("CONTAINER:", container);*/
      const isHuman = container.matches(config.humanClass);
      const isAssistant = config.assistantClass ? container.matches(config.assistantClass) : true;
      
      if (!isHuman && !isAssistant) { /* Skip if not human or assistant */
        return;
      }
      
      /* Find the actual content within the container */
      const content = config.contentSelector 
        ? container.querySelector(config.contentSelector)
        : container;
      
      if (!content) { /* Skip if no content found */
        return;
      }

      /* Create a message div */
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
      
      /* Skip duplicated content (this can happen on ChatGPT) */
      if (contentClone?.textContent === contentCloneLast?.textContent) {
        return;
      }

      /* Add the cleaned content */
      messageDiv.appendChild(contentClone);
      body.appendChild(messageDiv);

      contentCloneLast = contentClone;
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
    try {
      /* Create the print document */
      const printDoc = extractConversation();
      
      if (!printDoc) {
        alert('No conversation found.');
        return;
      }
      
      /* Open a new window with just the content we want to print */
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Print pop-up window blocked. Please allow pop-ups and try again.');
        return;
      }
      
      printWindow.document.write(printDoc.outerHTML);
      printWindow.document.close();
      
      /* Set the title for the new window */
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
              /* Attempt to detect if the print dialog has closed */
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
