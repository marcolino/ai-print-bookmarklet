# ai-print-bookmarklet

This is a bookmarklet that allows <b>printing</b> an AI chat conversation.

To use it, you should just make a new bookmark in your preferred browser, give it a title (like "AI 🖨"), and use the full contents of `main.js` file as the url. The bookmark can be saved in the Bookmarks bar, for it to be easy to reach.

If you use Firefox, you can also just do `npm run install-to-firefox`, to install main.js file contents as the url of a bookmark named "AI 🖶" (you have to manually create that bookmark on your browser beforehand).

When bookmark is clicked when on a supported AI chat, a new window will be created, using only the conversation textual parts, and print command will be run.

Supported AI chats are:
 - Claude from Anthropic (claude.ai)
 - ChatGPT from OpenAI (chatgpt.com)
 - Perplexity from perplexity.ai (perplexity.ai)
 - DeepSeek from DeepSeek (chat.deepseek.com)

NOTE: Currently only Claude from Anthropic is tested; other repos support is work in progress.