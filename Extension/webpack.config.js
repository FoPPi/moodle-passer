const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const archiver = require('archiver');
const webpack = require('webpack');


function createArchive(browserDir) {
  const archiveDir = path.resolve(__dirname, 'dist', 'prod');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const output = fs.createWriteStream(path.resolve(archiveDir, `${process.env.BROWSER || 'chrome'}.zip`));
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', function () {
    console.log(`Archive created: ${archive.pointer()} total bytes`);
  });
  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory(browserDir, false);
  archive.finalize();
}

class ArchivePlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapPromise('ArchivePlugin', compilation => {
      // Perform archiving only if NODE_ENV is set to 'production'
      if (process.env.NODE_ENV !== 'production') {
        return Promise.resolve();
      }

      const browserDir = path.resolve(__dirname, 'dist', process.env.BROWSER || 'chrome');
      return new Promise((resolve, reject) => {
        createArchive(browserDir);
        resolve();
      });
    });
  }
}

// const SERVER_LINK = "http://127.0.0.1:8000";
// const API_KEY="key_here"

const baseManifestPath = path.resolve(__dirname, 'src', 'base-manifest.json');
const baseManifest = JSON.parse(fs.readFileSync(baseManifestPath, 'utf8'));

function modifyManifest(browser) {
  const manifest = { ...baseManifest };
  if (browser === 'firefox') {
    manifest['manifest_version'] = 2;
    manifest['applications'] = {
      "gecko": {
        "id": "moodle-passer@example.com"
      }
    };
    manifest['background'] = { "scripts": ["./scripts/background.js"] };
    manifest['browser_action'] = { "default_popup": "./pages/popup.html" };
    manifest['permissions'] = [...manifest.permissions, `${SERVER_LINK}/*`];
  } else {
    manifest['manifest_version'] = 3;
    manifest['action'] = { "default_popup": "./pages/popup.html" };
    manifest['background'] = { "service_worker": "./scripts/background.js" };
    manifest['host_permissions'] = [`${SERVER_LINK}/*`];
  }
  return JSON.stringify(manifest, null, 2);
}

const browserDir = path.resolve(__dirname, 'dist', process.env.BROWSER || 'chrome');
if (!fs.existsSync(browserDir)) {
  fs.mkdirSync(browserDir, { recursive: true });
}

const manifest = modifyManifest(process.env.BROWSER || 'chrome');
const manifestPath = path.resolve(browserDir, 'manifest.json');
fs.writeFileSync(manifestPath, manifest);


module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'source-map',
  entry: {
    background: './src/scripts/background.js',
    popup: './src/scripts/popup.js',
    main: './src/scripts/main.js'
  },
  output: {
    path: path.resolve(browserDir, 'scripts'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.SERVER_LINK': JSON.stringify(SERVER_LINK),
      'process.env.API_KEY': JSON.stringify(API_KEY)
  }),
    new CopyPlugin({
      patterns: [
        { from: 'src/icons', to: path.resolve(browserDir, 'icons') },
        { from: 'src/pages', to: path.resolve(browserDir, 'pages') },
        { from: 'src/styles', to: path.resolve(browserDir, 'styles') },
        { from: manifestPath, to: path.resolve(browserDir, 'manifest.json') }
      ]
    }),
    new ArchivePlugin()
  ],
};



