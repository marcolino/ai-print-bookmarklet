javascript:(function() { 
  try {
    const platformConfig = [
      {
        platform: 'chatgpt',
        selector: 'main > .flex-1 > .h-full .flex',
        removeSelectors: ['button']
      },
      {
        platform: 'perplexity',
        selector: 'div[class*="Message__Content"]', /* Perplexity message container */
        removeSelectors: ['button', 'nav', 'footer'] /* Additional elements to remove */
      }
    ];

    const a = document.createElement('a');
    let dom;
    
    /* Detect platform and select appropriate DOM structure */
    if (document.querySelector(platformConfig[0].selector)) {
      dom = document.querySelector(platformConfig[0].selector).cloneNode(true);
    } else if (document.querySelector(platformConfig[1].selector)) {
      dom = document.querySelector(platformConfig[1].selector).cloneNode(true);
    } else {
      throw new Error('No supported chat platform detected');
    }

    const template = document.createElement('template');
    template.innerHTML = dom.innerHTML;
    
    /* Remove unwanted elements */
    platformConfig.find(config => 
      document.querySelector(config.selector)
    ).removeSelectors.forEach(selector => {
      template.content.querySelectorAll(selector).forEach(node => node.remove());
    });

    a.href = URL.createObjectURL(new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document.title}</title>
        <style>
          body { 
            padding: 20px;
            font-family: sans-serif;
            line-height: 1.6;
          }
          .message { 
            margin-bottom: 2em;
            border-left: 3px solid #ccc;
            padding-left: 1em;
          }
        </style>
      </head>
      <body>${template.innerHTML}</body>
      </html>
    `], {type: 'text/html'}));

    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch(e) {
    alert(`Export Error: ${e.message}`);
  }
})();
