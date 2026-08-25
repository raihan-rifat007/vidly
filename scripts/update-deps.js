const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");

const DEPENDENCIES = ["axios", "fs-extra"];

async function getLatestVersion(pkg) {
  try {
    const url = `https://registry.npmjs.org/${pkg}/latest`;
    const response = await axios.get(url);
    return response.data.version;
  } catch (error) {
    console.error(`Failed to fetch version for ${pkg}:`, error.message);
    return null;
  }
}

async function updatePackageJson() {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = await fs.readJson(pkgPath);
  let updated = false;

  console.log("Checking for dependency updates...");

  for (const dep of DEPENDENCIES) {
    const latestVersion = await getLatestVersion(dep);
    if (!latestVersion) continue;

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
  }

  if (updated) {
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
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
