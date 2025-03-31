javascript:(function(){
  /* Main Configuration */
  const platformConfig = {
    'chat.deepseek.com': {
      name: 'DeepSeek',
      messageContainer: 'div[class*="message-"]', /* Container for each message */
      contentSelector: 'div[class*="markdown"]', /* Actual message content */
      humanClass: 'div[class*="question"]', /* Human messages */
      timestampSelector: 'div[class*="title_date"]', /* Conversation timestamp */
      cleanSelectors: [ /* Elements to remove before printing */
        'button', 
        '.copy-button', 
        '.code-header',
        '[class*="footer"]',
        '[class*="actions"]'
      ]
    }
  };

  /* Detect current platform */
  const currentDomain = window.location.hostname;
  const platform = Object.keys(platformConfig).find(domain => currentDomain.includes(domain));
  
  /* Show error if platform not supported */
  if (!platform) {
    const supportedPlatforms = Object.keys(platformConfig).map(c => ' • ' + c).join('\n');
    alert(`Unsupported platform\nSupported sites:\n${supportedPlatforms}`);
    return;
  }

  const config = platformConfig[platform];
  const humanName = 'You';
  const assistantName = config.name;
  const titleText = `${assistantName} Conversation - ${new Date().toLocaleString()}`;

  /* Create status indicator */
  const status = document.createElement('div');
  status.style.cssText = `
    font-size: 16px;
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.7);
    color: yellow;
    padding: 10px;
    border-radius: 5px;
    z-index: 9999;
    max-width: 300px;
  `;
  status.textContent = `Preparing ${assistantName} conversation for printing...`;
  document.body.appendChild(status);

  /* Function to remove unwanted elements */
  function cleanElements(node, selectors) {
    selectors.forEach(selector => {
      node.querySelectorAll(selector).forEach(el => el.remove());
    });
    return node;
  }

  /* Function to extract conversation content */
  function extractConversation() {
    /* Find all message containers */
    const containers = Array.from(document.querySelectorAll(config.messageContainer));
    if (!containers.length) {
      status.textContent = 'No messages found. Trying alternative selectors...';
      /* Try fallback selectors */
      const fallbackContainers = Array.from(document.querySelectorAll('div[class*="message"]'));
      if (!fallbackContainers.length) {
        alert('No conversation found on this page.');
        return null;
      }
      return fallbackContainers;
    }

    /* Create print document structure */
    const printDoc = document.createElement('html');
    const head = document.createElement('head');
    const body = document.createElement('body');
    
    /* Add print styles */
    const style = document.createElement('style');
    style.textContent = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
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
        background: #f5f7fa;
        border-left: 4px solid #4a90e2;
      }
      .assistant {
        background: #f9f9f9;
        border-left: 4px solid #50b97d;
      }
      .sender {
        font-weight: bold;
        margin-bottom: 8px;
        color: #444;
      }
      pre, code {
        background: #f8f9fa;
        border: 1px solid #e1e4e8;
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
        font-family: monospace;
        font-size: 14px;
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
    
    /* Add header */
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `<h2>${titleText}</h2>`;
    body.appendChild(header);
    
    /* Process each message */
    containers.forEach(container => {
      const isHuman = container.matches(config.humanClass);
      const content = config.contentSelector 
        ? container.querySelector(config.contentSelector)
        : container;
      
      if (!content) return;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isHuman ? 'human' : 'assistant'}`;
      
      /* Add sender label */
      const sender = document.createElement('div');
      sender.className = 'sender';
      sender.textContent = isHuman ? humanName : assistantName;
      messageDiv.appendChild(sender);
      
      /* Clone and clean content */
      const contentClone = content.cloneNode(true);
      cleanElements(contentClone, config.cleanSelectors);
      messageDiv.appendChild(contentClone);
      
      body.appendChild(messageDiv);
    });
    
    /* Finalize document */
    printDoc.appendChild(head);
    printDoc.appendChild(body);
    return printDoc;
  }

  /* Main print function */
  function prepareAndPrint() {
    status.textContent = 'Extracting conversation...';
    
    try {
      const printDoc = extractConversation();
      if (!printDoc) {
        status.textContent = 'Failed to extract conversation';
        setTimeout(() => status.remove(), 3000);
        return;
      }
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        status.textContent = 'Please allow pop-ups to print';
        setTimeout(() => status.remove(), 3000);
        return;
      }
      
      printWindow.document.write(printDoc.outerHTML);
      printWindow.document.close();
      printWindow.document.title = titleText;
      
      setTimeout(() => {
        status.textContent = 'Opening print dialog...';
        printWindow.focus();
        printWindow.print();
        setTimeout(() => status.remove(), 2000);
      }, 500);
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      setTimeout(() => status.remove(), 3000);
      console.error('Print error:', err);
    }
  }
  
  /* Start the process */
  prepareAndPrint();
})();
