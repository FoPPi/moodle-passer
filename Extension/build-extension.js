const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const firefoxGeckoId = "passer@example.com"; 
serverLink = "*://127.0.0.1/*";

function readBaseManifest() {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifestData = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(manifestData);
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
    modifiedManifest.permissions = ["storage",
    serverLink];

    modifiedManifest.background = {
      "scripts": ["./scripts/background.js"],
      "persistent": false
    };

    modifiedManifest.browser_specific_settings = {
      "gecko": {
        "id": firefoxGeckoId
      }
    }

    delete modifiedManifest.action;
  }

  return modifiedManifest;
}



function createManifest(browserName) {
  const baseManifest = readBaseManifest();
  const manifest = modifyManifestForBrowser(baseManifest, browserName);

  const baseDir = path.join(__dirname, 'build', browserName);
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const manifestPath = path.join(baseDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return { manifestPath, baseDir };
}


function copyDirectory(source, target, excludeFiles = []) {
  if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
  }
  const items = fs.readdirSync(source);
  for (const item of items) {
      if (excludeFiles.includes(item)) {
          continue; 
      }
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      if (fs.lstatSync(sourcePath).isDirectory()) {
          copyDirectory(sourcePath, targetPath, excludeFiles);
      } else {
          fs.copyFileSync(sourcePath, targetPath);
      }
  }
}

function createArchive(browserName) {
  const { manifestPath, baseDir } = createManifest(browserName);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const sourceDirs = {
    pages: './pages',
    styles: './styles',
    scripts: './scripts',
    icons: './icons'
  };

  const excludeFiles = [];
  if (manifest.manifest_version === 3) {
    excludeFiles.push('background.js'); // Exclude background.js for Chrome if manifest version 3
  }

  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }

  const outputPath = path.join(distPath, `${browserName}_v${manifest.version}.zip`);
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', function () {
    console.log(`${browserName} - Archive created successfully. Total bytes: ${archive.pointer()} | Kilobytes: ${(archive.pointer() / 1024).toFixed(0)}`);
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  // Copying directories to baseDir subject to exceptions
  for (const [dir, source] of Object.entries(sourceDirs)) {
    copyDirectory(path.join(__dirname, source), path.join(baseDir, dir), excludeFiles);
  }

  archive.file(manifestPath, { name: 'manifest.json' });
  archive.directory(baseDir, false); // Archive the contents of baseDir
  archive.finalize();
}

// Creating archives for Chrome and Firefox
createArchive('chrome');
createArchive('firefox');



