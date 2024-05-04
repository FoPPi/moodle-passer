# Documentation for `moodle-passer` Extension Builder

This documentation covers the `moodle-passer` extension builder script which facilitates creating browser-specific extensions for both Chrome and Firefox. The script is capable of generating, modifying, and packaging the extension's manifest and resources into a zipped archive.

## Installation

Before you can run the builder script, make sure Node.js and npm (Node Package Manager) are installed on your system. You can download and install Node.js from [Node.js official website](https://nodejs.org/).

Once Node.js is installed, navigate to the root of your project directory in a terminal and install the necessary dependencies by running:

```shell
npm install
```

OR

```shell
npm ci
```

## File Structure

- `build-extension.js`: Main script file for building the extension.
- `manifest.json`: Base manifest file which is modified based on the target browser.
- `pages/`: Directory containing HTML files for the extension.
- `styles/`: Directory containing CSS files.
- `scripts/`: Directory containing JavaScript files.
- `icons/`: Directory containing image files used as icons.

## How to Use

To start the build process, use the following command in the terminal:

```shell
npm start
```

This command triggers the build script which will perform the following actions:

### Step-by-Step Operations

1. **Read the Base Manifest**:
   - Reads the initial configuration from `manifest.json`.

2. **Modify Manifest for Specific Browser**:
   - Adjusts the manifest file according to browser-specific requirements.
   - For Chrome: Sets `manifest_version` to 3.
   - For Firefox: Uses `manifest_version` 2, adjusts icons, permissions, background scripts, and sets specific settings for Firefox.

3. **Create Browser-Specific Manifest**:
   - Saves the modified manifest in a new directory under `build/{browserName}/`.

4. **Copy Necessary Directories**:
   - Copies pages, scripts, styles, and icons to the build directory, excluding certain files if necessary (e.g., `background.js` for Chrome when using manifest version 3).

5. **Create Archive**:
   - Compresses the build directory into a `.zip` file suitable for distribution.
   - The archive is saved under `dist/` with the naming format `{browserName}_v{version}.zip`.

### Core Functions

- `readBaseManifest()`: Parses the base manifest from a JSON file.
- `modifyManifestForBrowser(manifest, browserName)`: Adapts the manifest according to the needs of different browsers.
- `deleteDirectory(directoryPath)`: Clears specified directories recursively to ensure clean builds.
- `copyDirectory(source, target, excludeFiles)`: Copies directories and files, applying exclusions.
- `createArchive(buildDir, browserName, version)`: Compresses and packages the build directory into a zip file.
- `buildForBrowser(browserName)`: Manages the complete build process for each browser.

## Error Handling

The script includes basic error handling which will log errors to the console if any part of the file reading, writing, or archiving process fails.

## Output

Upon successful completion, the script will output logs indicating the success of the operation, along with the size of the created archive.

## Conclusion

This builder script is a convenient tool for quickly setting up and packaging web extensions tailored for both Chrome and Firefox. It automates the tedious processes of manifest modification and file organization, making extension development more efficient.