javascript: (function () {
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
      messageSelector: '[class*="message"], .group',
      timestampSelector: '[class*="time"], time, [datetime]',
      humanClass: '[class*="user"]'
    },
    'www.perplexity.ai': {
      name: 'Perplexity',
      messageSelector: '[class*="textMain"], [role="dialog"], .message',
      timestampSelector: '[class*="timestamp"], time, [datetime]',
      humanClass: '[class*="user"]'
    },
    'chat.deepseek.com': {
      name: 'DeepSeek',
      messageSelector: '[class*="answer"], [class*="markdown"]',
      timestampSelector: '[class*="title_date"]',
      humanClass: '[class*="question"], [class*="markdown"]'
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
  /*alert(`Platform: ${platform}`);*/

  const config = platformConfig[platform];
  const humanName = 'Human';
  const assistantName = config.name;
  const titleText = `${assistantName} conversation on ${new Date().toLocaleString()}`;

  /* Create a status indicator */
  const status = document.createElement('div');
  status.style.position = 'fixed';
  status.style.top = '10px';
  status.style.right = '10px';
  status.style.background = 'rgba(0,0,0,0.7)';
  status.style.color = 'white';
  status.style.padding = '10px';
  status.style.borderRadius = '5px';
  status.style.zIndex = '9999';
  status.textContent = `Preparing to print ${assistantName} conversation...`;
  document.body.appendChild(status);

  /* Function to get a clean, printable version of the conversation */
  function extractConversation() {
    /* Find all message elements */
    const messages = Array.from(document.querySelectorAll(config.messageSelector));
    
    /* Create a new document for printing */
    const printDoc = document.createElement('html');
    const head = document.createElement('head');
    const style = document.createElement('style');
    
    /* Add print styles */
    style.textContent = `
      body { 
        font-family: Courier New, serif;
        font-size: 16px;
        margin: 20px; 
        line-height: 1.5;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      .timestamp {
        color: #666;
        font-size: 14px;
        margin-top: 5px;
      }
      .message {
        margin-bottom: 20px;
        padding: 15px;
        border-radius: 5px;
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
        background-color: #f0f0f0;
        border-left: 4px solid #007bff;
      }
      .assistant {
        background-color: #f9f9f9;
        border-left: 4px solid #28a745;
      }
      pre, code {
        white-space: pre-wrap;
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
      }
      @media print {
        @page {
          margin: 1cm;
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
    
    /* Process each message */
    messages.forEach((msg, index) => {
      const humanClasses = config.humanClass.split(',');
      const isHuman = humanClasses.some(cls => {
        const trimmed = cls.trim();
        if (trimmed.startsWith('.')) {
          return msg.classList.contains(trimmed.slice(1));
        } else if (trimmed.startsWith('[')) {
          return msg.matches(trimmed);
        }
        return false;
      });
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${isHuman ? 'human' : 'assistant'}`;
      
      /* Add a label */
      const label = document.createElement('div');
      label.style.fontWeight = 'bold';
      label.style.marginBottom = '8px';
      label.textContent = (isHuman ? humanName : assistantName) + ':';
      messageDiv.appendChild(label);
      
      /* Add timestamp if available */
      if (messageTimestamps[index]) {
        const msgTime = document.createElement('div');
        msgTime.className = 'message-timestamp';
        msgTime.textContent = messageTimestamps[index];
        messageDiv.appendChild(msgTime);
      }
      
      /* Clone the content */
      const content = msg.cloneNode(true);
      
      /* Remove any buttons, inputs, etc */
      Array.from(content.querySelectorAll('button, input, textarea, [role="button"]')).forEach(el => el.remove());
      
      /* Add the cleaned content */
      messageDiv.innerHTML += content.innerHTML;
      body.appendChild(messageDiv);
    });
    
    if (!messages.length) {
      alert(`No conversation found on this page.`);
      return;
    }

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