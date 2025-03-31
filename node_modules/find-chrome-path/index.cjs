const os = require("os");
const fs = require("fs").promises;
const path = require("path");

const getPath = async (browser, win32) => {
  let browserPath = "";
  switch (os.platform()) {
    case "win32":
      {
        // Windows
        const prefixes = [
          process.env.LOCALAPPDATA,
          process.env.PROGRAMFILES,
          process.env["PROGRAMFILES(X86)"],
          process.env.APPDATA,
        ];

        for (const prefix of prefixes) {
          if (prefix) {
            const pathToTry = path.join(
              prefix,
              browser,
              "Application",
              `${win32}.exe`
            );
            try {
              await fs.access(pathToTry);
              browserPath = pathToTry;
              break;
            } catch (error) {}
          }
        }
      }
      break;

    case "darwin":
      {
        // Mac
        const pathsToTry = [
          path.join(
            "/Applications",
            `${browser}.app`,
            "Contents",
            "MacOS",
            browser
          ),
          path.join(
            os.homedir(),
            "Applications",
            `${browser}.app`,
            "Contents",
            "MacOS",
            browser
          ),
          path.join(
            os.homedir(),
            "Applications",
            `${browser}.app`,
            "Contents",
            "MacOS",
            `${browser}_bin`
          ),
        ];

        for (const path of pathsToTry) {
          try {
            await fs.access(path);
            browserPath = path;
            break;
          } catch (error) {}
        }
      }
      break;

    case "linux":
      {
        // Linux
        const pathsToTry = [
          path.join("/usr", "bin", browser),
          path.join("/usr", "local", "bin", browser),
          path.join(os.homedir(), ".local", "bin", browser),
        ];

        for (const path of pathsToTry) {
          try {
            await fs.access(path);
            browserPath = path;
            break;
          } catch (error) {}
        }
      }
      break;

    default:
      throw new Error(`Unsupported platform: ${os.platform()}`);
  }
  return browserPath;
};

async function findBrowserPath() {
  let output = {};
  const browserList = [
    {
      name: "chrome",
      linux: "google-chrome",
      darwin: "Google Chrome",
      win32: "Google\\Chrome",
    },
    {
      name: "brave",
      linux: "brave-browser",
      darwin: "Brave Browser",
      win32: "BraveSoftware\\Brave-Browser",
    },
    {
      name: "firefox",
      linux: "firefox",
      darwin: "Firefox",
      win32: "Mozilla Firefox",
    },
  ];

  for (const [index, browser] of browserList.entries()) {
    const platform = browser[os.platform()];
    const path = await getPath(platform, browser.name);
    output[browser.name] = path;
  }
  return output;
}

module.exports = findBrowserPath;
