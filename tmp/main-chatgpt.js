javascript: (function () {
  const humanName = 'Human';
  const titleTextPattern = `%s conversation on ${new Date().toLocaleString()}`;
  const timeoutBeforeClosePrintWindowMilliseconds = 100;

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
      messageSelector: '.text-base',
      timestampSelector: 'time',
      humanClass: '.whitespace-pre-wrap',
      assistantClass: '.prose',
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
      messageSelector: '[class*="message-container"]',
      contentSelector: '[class*="markdown"]',
      timestampSelector: '[class*="title_date"]',
      humanClass: '[class*="question"]',
      cleanSelectors: ['.copy-button', '.code-header', '.flex.items-center']
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
  const titleText = titleTextPattern.replace("%s", assistantName);

  /* Function to clean unwanted elements */
  function cleanElements(node, selectors) {
    selectors.forEach(selector => {
      node.querySelectorAll(selector).forEach(el => el.remove());
    });
    return node;
  }

  /* Function to extract conversation */
  function extractConversation() {
    const messageContainers = Array.from(document.querySelectorAll(config.messageSelector));
    
    const printDoc = document.createElement('html');
    const head = document.createElement('head');
    const style = document.createElement('style');
    
    /* Add print styles */
    style.textContent = `
      body { 
        font-family: Arial, sans-serif; 
        font-size: 16px; 
        margin: 20px; 
        line-height: 1.6;
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
        background-color: #f0f8ff;
        border-left: 4px solid #4a90e2;
      }
      .assistant {
        background-color: #f9f9f9;
        border-left: 4px solid #50b97d;
      }
      pre {
        background: #f8f8f8; 
        padding: 10px; 
        border-radius: 5px;
        font-size: 14px;
        white-space: pre-wrap;
      }
      code {
        background: #f3f3f3; 
        padding: 2px 4px; 
        border-radius: 3px;
      }
      @media print {
        @page { margin: 1.5cm; }
        body { font-size: 18px; }
      }
    `;
    head.appendChild(style);
    
    const body = document.createElement('body');
    
    /* Add header */
    const header = document.createElement('div');
    header.className = 'header';
    
    const title = document.createElement('h3');
    title.textContent = titleText;
    header.appendChild(title);
    body.appendChild(header);

    /* Extract and format messages */
    messageContainers.forEach(container => {
      let role, contentNode;

      if (container.querySelector(config.humanClass)) {
        role = humanName;
        contentNode = container.querySelector(config.humanClass);
      } else if (container.querySelector(config.assistantClass)) {
        role = assistantName;
        contentNode = container.querySelector(config.assistantClass);
      }

      if (!contentNode) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role === humanName ? 'human' : 'assistant'}`;

      /* Add label */
      const label = document.createElement('div');
      label.style.fontWeight = 'bold';
      label.style.marginBottom = '10px';
      label.textContent = `${role}:`;
      messageDiv.appendChild(label);

      /* Clone and clean content */
      const contentClone = contentNode.cloneNode(true);
      cleanElements(contentClone, config.cleanSelectors || []);
      messageDiv.appendChild(contentClone);
      
      body.appendChild(messageDiv);
    });

    printDoc.appendChild(head);
    printDoc.appendChild(body);
    return printDoc;
  }

  /* Main function to prepare and print */
  function prepareAndPrint() {
    try {
      const printDoc = extractConversation();
      if (!printDoc) {
        alert('No conversation found.');
        return;
      }

      /* Open new window for printing */
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Print pop-up window blocked. Please allow pop-ups and try again.');
        return;
      }

      printWindow.document.write(printDoc.outerHTML);
      printWindow.document.close();
      printWindow.document.title = titleText;

      setTimeout(() => {
        printWindow.print();

        /* Polling mechanism to detect when the print dialog closes */
        const timer = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(timer);
          } else {
            try {
              if (printWindow.document.hasFocus()) {
                clearInterval(timer);
                /*printWindow.close();*/
              }
            } catch (e) {
              clearInterval(timer);
              /*printWindow.close();*/
            }
          }
        }, timeoutBeforeClosePrintWindowMilliseconds);
      }, timeoutBeforeClosePrintWindowMilliseconds);
    } catch (err) {
      alert('Error while printing: ' + err.message);
    }
  }

  /* Execute printing */
  prepareAndPrint();
})();
