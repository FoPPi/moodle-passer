# Documentation for `moodle-passer` Extension Builder

This documentation covers the `moodle-passer` extension builder script, which now utilizes Webpack to facilitate creating browser-specific extensions for both Chrome and Firefox. This setup streamlines the building, modifying, and packaging of the extension's manifest and resources.

## Installation

Before you can run the builder script, ensure Node.js and npm (Node Package Manager) are installed on your system. You can download and install Node.js from the [Node.js official website](https://nodejs.org/).

Once Node.js is installed, navigate to the root of your project directory in a terminal and install the necessary dependencies by running:

```shell
npm install
```

OR

```shell
npm ci
```

## File Structure

- `webpack.config.js`: Configuration file for Webpack.
- `src/`: Source directory containing the JavaScript, HTML, and CSS files.
  - `pages/`: HTML files for the extension.
  - `styles/`: CSS files.
  - `scripts/`: JavaScript files.
  - `icons/`: Directory containing image files used as icons.
- `dist/`: Directory where the Webpack outputs the build files for distribution.

## How to Use

To build the extension for development or production environments, use the following commands:

### Development Build

Builds the extension with development settings for both Chrome and Firefox:

```shell
npm run build:dev
```

### Production Build

Builds the extension with production settings optimized for distribution:

```shell
npm run build:prod
```

### Individual Builds

For specific browser and environment combinations, use one of the following:

```shell
npm run build:chrome:dev
npm run build:chrome:prod
npm run build:firefox:dev
npm run build:firefox:prod
```

## Core Functions

Webpack handles the following tasks:
- **Compiling and Bundling**: All scripts and styles are compiled and bundled.
- **Environment Specific Configurations**: Configurations differ based on development or production environments.
- **Automatic Manifest Adjustments**: Depending on the target browser, the manifest is automatically adjusted during the build process.
- **Optimization and Minification**: For production builds, files are optimized and minified for performance enhancements.

## Output

Upon successful completion, Webpack will output the built files to the `dist/` directory, organized by browser. Each build is logged in the terminal, showing the status and details of the process.

## Conclusion

The transition to Webpack not only enhances the build process with automation and optimizations but also simplifies the development workflow. This builder script is a powerful tool for quickly setting up and packaging web extensions tailored for Chrome and Firefox, making extension development more streamlined and efficient.
