(function () {
  function extractChat() {
      const messages = [];
      document.querySelectorAll('.text-base').forEach(message => {
          const userText = message.querySelector('.whitespace-pre-wrap');
          const botText = message.querySelector('.prose');

          if (userText) {
              messages.push({ role: 'User', text: userText.innerText });
          } else if (botText) {
              messages.push({ role: 'ChatGPT', text: botText.innerText });
          }
      });

      return messages;
  }

  function formatForPrint(messages) {
      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write('<html><head><title>ChatGPT Conversation</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }');
      printWindow.document.write('.user { font-weight: bold; color: blue; }');
      printWindow.document.write('.chatgpt { font-weight: bold; color: green; }');
      printWindow.document.write('</style></head><body>');

      messages.forEach(({ role, text }) => {
          printWindow.document.write(`<p class="${role.toLowerCase()}">${role}: ${text}</p>`);
      });

      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
  }

  const chatMessages = extractChat();
  formatForPrint(chatMessages);
})();
