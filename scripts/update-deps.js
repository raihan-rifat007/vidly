const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const DEPENDENCIES = ["axios", "fs-extra"];

function fetchLatestVersion(pkg) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${pkg}/latest`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.version);
        } catch {
          reject(new Error(`Failed to parse response for ${pkg}`));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function updatePackageJson() {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  let updated = false;

  console.log("Checking for dependency updates...");

  for (const dep of DEPENDENCIES) {
    try {
      const latestVersion = await fetchLatestVersion(dep);
      const currentVersion = pkg.dependencies?.[dep];
      if (currentVersion && currentVersion.replace(/^[\^~]/, "") !== latestVersion) {
        console.log(`Updating ${dep}: ${currentVersion} → ${latestVersion}`);
        if (pkg.dependencies) {
          pkg.dependencies[dep] = `^${latestVersion}`;
        }
        updated = true;
      } else {
        console.log(`${dep} is up to date (${latestVersion})`);
      }
    } catch (error) {
      console.error(`Failed to fetch version for ${dep}:`, error.message);
    }
  }

  if (updated) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("package.json updated!");

    try {
      execSync("npm install", { stdio: "inherit" });
      console.log("Dependencies installed!");
    } catch (error) {
      console.error("npm install failed:", error.message);
    }
  } else {
    console.log("All dependencies are up to date!");
  }
}

updatePackageJson();
