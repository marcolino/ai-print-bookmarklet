# AI print bookmarklet

This is a bookmarklet (JavaScript code tought to be put in the URL field of a browser's bookmark) that allows <i>printing</i> (to PDF, to paper, ...) an AI chat conversation.

To use it, you should just make a new bookmark in your preferred browser, give it a title (like "AI 🖨"), and use the full contents of `main.js` file as the url. To make it easily accessible, save the bookmark in the Bookmarks bar.

If you use Firefox, you can also just do `npm run install-to-firefox`, to install main.js file contents as the url of a bookmark named "AI 🖶" (you have to manually create that bookmark on your browser beforehand).

When bookmark is clicked when on a supported AI chat, a new window will be created, using only the conversation textual parts, and print command will be run on the window; then new window will be closed after print window is closed.

Supported AI chats are:
 - Claude from Anthropic (claude.ai)
 - ChatGPT from OpenAI (chatgpt.com)

Future support will include: Perplexity from perplexity.ai (perplexity.ai), DeepSeek from DeepSeek (chat.deepseek.com) and more...
