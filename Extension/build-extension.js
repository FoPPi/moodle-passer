const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const firefoxGeckoId = "passer@example.com";
const serverLink = "*://127.0.0.1/*";  // Ensure this is declared

function readBaseManifest() {
  const manifestPath = path.join(__dirname, 'manifest.json');
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function modifyManifestForBrowser(manifest, browserName) {
  const modifiedManifest = JSON.parse(JSON.stringify(manifest));

  if (browserName === 'chrome') {
    modifiedManifest.manifest_version = 3;
  } else if (browserName === 'firefox') {
    modifiedManifest.manifest_version = 2;
    modifiedManifest.browser_action = {
      "default_popup": "./pages/popup.html",
      "default_icon": {
        "16": "./icons/16.png",
        "32": "./icons/32.png",
        "48": "./icons/48.png",
        "128": "./icons/128.png"
      }
    };
    modifiedManifest.permissions = ["storage", serverLink];
    modifiedManifest.background = {
      "scripts": ["./scripts/background.js"],
      "persistent": false
    };
    modifiedManifest.browser_specific_settings = {
      "gecko": {
        "id": firefoxGeckoId
      }
    };
    delete modifiedManifest.action;
  }

  return modifiedManifest;
}

function copyDirectory(source, target, excludeFiles = []) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  const items = fs.readdirSync(source);
  items.forEach(item => {
    if (!excludeFiles.includes(item)) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      if (fs.lstatSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, targetPath, excludeFiles);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  });
}

function deleteDirectory(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach(file => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

function createArchive(buildDir, browserName, version) {
  const outputPath = path.join(__dirname, 'dist', `${browserName}_v${version}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', err => { throw err; });
  archive.pipe(output);
  archive.directory(buildDir, false);
  archive.finalize();

  output.on('close', () => {
    console.log(`Archive for ${browserName} created successfully. Total bytes: ${archive.pointer()}`);
  });
}

function buildForBrowser(browserName) {
  const buildDir = path.join(__dirname, 'build', browserName);
  deleteDirectory(buildDir);
  fs.mkdirSync(buildDir, { recursive: true });
  console.log(`Build directory for ${browserName} created.`);

  const manifest = modifyManifestForBrowser(readBaseManifest(), browserName);
  fs.writeFileSync(path.join(buildDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const excludeFiles = manifest.manifest_version === 3 ? ['background.js'] : []; // Exclude for Chrome if manifest version 3

  ['pages', 'styles', 'scripts', 'icons'].forEach(dir => {
    copyDirectory(path.join(__dirname, dir), path.join(buildDir, dir), excludeFiles);
  });

  createArchive(buildDir, browserName, manifest.version);
}

buildForBrowser('chrome');
buildForBrowser('firefox');
