/**
 * Script to install a JavaScript bookmarklet (in a file, by default 'main.js)
 * to a Firefox bookmark, which should exist
 * (by default bookmark title should be 'AI 🖶').
 */

const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Config
const OLD_BOOKMARK_TITLE = 'AI 🖶';
const NEW_BOOKMARK_CONTENTS_FILE = './main.js';

// Detect Firefox profile path (supports both Snap and traditional)
function getFirefoxProfilePath() {
  const possiblePaths = [
    // Traditional Linux path
    path.join(os.homedir(), '.mozilla', 'firefox'),
    // Snap Linux path
    path.join(os.homedir(), 'snap', 'firefox', 'common', '.mozilla', 'firefox'),
    // Windows path
    path.join(os.homedir(), 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles'),
    // macOS path
    path.join(os.homedir(), 'Library', 'Application Support', 'Firefox', 'Profiles')
  ];

  // Find the first existing Firefox profile directory
  for (const basePath of possiblePaths) {
    if (fs.existsSync(basePath)) {
      // Look for profile folders (default-release or default)
      const profiles = fs.readdirSync(basePath).filter(folder => 
        folder.endsWith('.default-release') || folder.endsWith('.default')
      );

      for (const profile of profiles) {
        const dbPath = path.join(basePath, profile, 'places.sqlite');
        if (fs.existsSync(dbPath)) {
          // Firefox profile found
          return dbPath;
        }
      }
    }
  }

  throw new Error('Could not find Firefox profile in any standard location!');
}

// Kill Firefox (cross-platform)
function killFirefox() {
  try {
    if (process.platform === 'win32') {
      exec('taskkill /IM firefox.exe /F');
    } else {
      exec('( pkill -f firefox || killall firefox ) >/dev/null 2>&1');
    }
  } catch (err) {
    console.error('Error killing Firefox:', err);
  }
}

// Restart Firefox (cross-platform)
async function restartFirefox() {
  try {
    if (process.platform === 'win32') {
      await exec('start firefox');
    } else if (fs.existsSync('/snap/bin/firefox')) {
      await exec('snap run firefox');
    } else {
      await exec('firefox');
    }
  } catch (err) {
    console.error('Error restarting Firefox:', err);
  }
}

// Main function
(async () => {
  try {
    // Close Firefox
    killFirefox();

    // Get Firefox profile path
    const dbPath = getFirefoxProfilePath();

    // Get new bookmark contents
    const bookmarkContents = fs.readFileSync(NEW_BOOKMARK_CONTENTS_FILE, { encoding: 'utf8', flag: 'r' });

    // Update bookmark
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) throw err;

      // Verify bookmark title exists
      db.get(
        `SELECT id FROM moz_bookmarks WHERE title = ?`, 
        [OLD_BOOKMARK_TITLE],
        (err, row) => {
          if (err) throw err;
          if (!row) throw new Error(`Bookmark "${OLD_BOOKMARK_TITLE}" not found!`);

          // Update bookmark URL
          db.run(
            `UPDATE moz_places SET url = ? WHERE id IN (
              SELECT fk FROM moz_bookmarks WHERE title = ?
            )`,
            [bookmarkContents, OLD_BOOKMARK_TITLE],
            async (err) => {
              if (err) throw err;
              console.info(`Bookmark "${OLD_BOOKMARK_TITLE}" updated.`);
              db.close();
              
              // Step 4: Restart Firefox
              await restartFirefox();
              process.exit(0);
            }
          );
        }
      );
    });
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
