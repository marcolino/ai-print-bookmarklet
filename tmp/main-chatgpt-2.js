javascript: (function () {
  const humanName = 'Human';
  const titleTextPattern = `%s conversation on ${new Date().toLocaleString()}`;
  const timeoutBeforeClosePrintWindowMilliseconds = 100;

  /* Configuration for different AI platforms */
  const platformConfig = {
    'claude.ai': {
      name: 'Claude',
      messageSelector: '[class*="message"]',
      humanClass: '[class*="human"], [class*="user"]',
      assistantClass: '[class*="assistant"], [class*="bot"], [class*="ai"]',
      cleanSelectors: ['button', '.copy-btn']
    },
    'chatgpt.com': {
      name: 'ChatGPT',
      messageSelector: '.text-base', /* General messages */
      humanClass: '.text-base:has(.whitespace-pre-wrap)', /* Human messages */
      assistantClass: '.text-base:has(.prose)', /* Assistant messages */
      cleanSelectors: ['button', '.copy-code-button']
    },
    'www.perplexity.ai': {
      name: 'Perplexity',
      messageSelector: 'div[data-testid="assistant-message"], div[data-testid="user-message"]',
      humanClass: 'div[data-testid="user-message"]',
      assistantClass: 'div[data-testid="assistant-message"]',
      cleanSelectors: ['button', '.copy-button']
    },
    'chat.deepseek.com': {
      name: 'DeepSeek',
      messageSelector: '[class*="message-container"]',
      contentSelector: '[class*="markdown"]',
      humanClass: '[class*="question"]',
      assistantClass: '[class*="answer"]',
      cleanSelectors: ['.copy-button', '.code-header']
    }
  };

  /* Detect platform */
  const currentDomain = window.location.hostname;
  const platform = Object.keys(platformConfig).find(domain => currentDomain.includes(domain));

  if (!platform) {
    alert(`Unsupported platform. Supported platforms: ${Object.keys(platformConfig).join(', ')}`);
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

    if (messageContainers.length === 0) {
      alert('No messages found. Try again after the chat has loaded.');
      return null;
    }

    const printDoc = document.createElement('html');
    const head = document.createElement('head');
    const style = document.createElement('style');

    /* Print styles */
    style.textContent = `
      body { font-family: Arial, sans-serif; font-size: 16px; margin: 20px; color: #333; }
      .header { text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
      .message { margin-bottom: 25px; padding: 15px; border-radius: 8px; page-break-inside: avoid; }
      .human { background-color: #f0f8ff; border-left: 4px solid #4a90e2; }
      .assistant { background-color: #f9f9f9; border-left: 4px solid #50b97d; }
      pre { background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 14px; white-space: pre-wrap; }
      code { background: #f3f3f3; padding: 2px 4px; border-radius: 3px; }
      @media print { @page { margin: 1.5cm; } body { font-size: 14px; } }
    `;
    head.appendChild(style);

    const body = document.createElement('body');

    /* Header */
    const header = document.createElement('div');
    header.className = 'header';

    const title = document.createElement('h3');
    title.textContent = titleText;
    header.appendChild(title);
    body.appendChild(header);

    /* Extract and format messages */
    messageContainers.forEach(container => {
      let role = null;
      let contentNode = null;

      if (container.matches(config.humanClass)) {
        role = humanName;
        contentNode = container;
      } else if (container.matches(config.assistantClass)) {
        role = assistantName;
        contentNode = container;
      }

      if (!role || !contentNode) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role === humanName ? 'human' : 'assistant'}`;

      /* Label */
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

  /* Prepare and print */
  function prepareAndPrint() {
    try {
      const printDoc = extractConversation();
      if (!printDoc) return;

      /* Open new window for printing */
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Print pop-up window blocked. Please allow pop-ups.');
        return;
      }

      printWindow.document.write(printDoc.outerHTML);
      printWindow.document.close();
      printWindow.document.title = titleText;

      setTimeout(() => {
        printWindow.print();

        /* Detect when print dialog is closed */
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

  /* Execute */
  prepareAndPrint();
})();
