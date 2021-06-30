# Using this template

This is my template repository to use when creating new packages. The top section of this readme is for how to use it to start a new package, and should be removed as part of the setup process.

## Setup

You will need to install [Node.js](https://nodejs.org/en/) before using this template.

1. Click "[Use this template](https://github.com/cipscis/base-package/generate)" to create a new repository based on this one.
2. Update the `package.json` file to reflect your new package's details.
3. Update the paths to assets in `index.html` to use your new package's name. See [GitHub Pages](#github-pages) for more info.
	1. You can do a global find/replace for `base-package` and `Base Package`.
	2. If you're not me, you'll also want to do a global find/replace for `cipscis` and replace it with your own GitHub username, and be sure to also update the `author` property in the `package.json`.
4. Create a `.env` file. See [.env](#env-1) for more information.
5. Run `npm install`.
6. Update this `README.md` file and the `CHANGELOG.md` file.

Now you're ready to work on code in this package.

## Usage

Using the files specified in `package.json`, you can create a package to be installed with npm.

In the `docs` folder, which can be deployed to GitHub Pages but is not included when your package is installed, you can document your package. Here, the package files outside the `docs` folders can be included in the bundle by using root-relative paths such as `import foo from '/main.js';`

Once you have an initial version of your package ready to push, you will want to update the `version` attribute of your `package.json` file to `"1.0.0"`. See [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for more information on version numbers.

You should also update the `CHANGELOG.md` file to describe your changes. This is particularly important after your initial 1.0.0 version.

Then, you can tag that commit with `1.0.0` and run `npm install github:cipscis/base-package#semver:1.x` to install the package in other projects.

## Structure

### Frontend assets

By default, your package consists of a single file. This is called `main.js`, but you can change it. If you do, make sure you update the [`browser`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#browser) property in your `package.json` file. If your package doesn't need to be run in a browser, you should change this property to [`main`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main).

Additional files can be included in your package by adding them to the [`files`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#files) array in your `package.json` file.

Assets such as CSS and JavaScript are contained in `/docs/assets`. In here, the contents of the `scss` folder are used to compile CSS files into the `css` folder.

The `/docs/assets/js` folder contains a `src` folder and a `dist` folder. The JavaScript files inside the `src` folder are bundled into the `dist` folder. By default, Webpack is configured to look for a single entry point at `/docs/assets/js/src/main.js`.

### Backend assets

The Node.js server run using [Express](https://expressjs.com/) has its files inside the `/server` directory. By default, this just runs a static http server that serves files in the `/docs` directory, but it can be extended to add additional functionality.

This server only runs locally, so any additional functionality will not be available on GitHub Pages.

## Configuration

### package.json

By default, the `package.json` file is configured to set the project to be of type `module`. This means NodeJS will use ES module syntax as opposed to the default CommonJS syntax, allowing the use of `import` and `export` keywords.

For more information on the differences, see [Differences between ES modules and CommonJS](https://nodejs.org/api/esm.html#esm_differences_between_es_modules_and_commonjs)

### gulpfile.js

This file tells [Gulp](https://gulpjs.com/) which files to watch and where to output compiled assets. Some configuration for JavaScript bundling is duplicated between here and [`webpack.config.js`](#webpackconfigjs)

### webpack.config.js

This file configures [Webpack](https://webpack.js.org/), telling it which entry points to use and where to output its bundled assets. Some configuration is duplicated between here and [`gulpfile.js`](#gulpfilejs)

### .env

See [.env](#env-1) for information on setting up a `.env` file.

## Testing

This project comes with a small example test suite built using [Jasmine](https://jasmine.github.io/), which can be found in `/spec`. You'll want to remove this example before you commit your package's code, and replace it with your own tests.

## GitHub Pages

This project is set up to use a GitHub Action every time new code is pushed to the `main` branch. This GitHub Action runs the `build` task, then runs any test suites, then if the tests passed it deploys the contents of the `docs` directory by committing them to a `gh-pages` branch. This `gh-pages` branch should be configured in GitHub to be published to GitHub Pages.

When publishing a project using [GitHub Pages](https://pages.github.com/), the project usually appears at a URL with a path, such as `https://cipscis.github.io/base-package`. This means using root relative URLs such as `/assets/css/main.css` would work locally, but would break when the project is published on GitHub Pages.

To fix this, the local Node.js server looks for a `PROJECT_NAME` variable in your [`.env`](#env-1) file. If it finds one, it sets up redirects so URLs starting with `/${PROJECT_NAME}` can be used as though they were root relative, so they will find your assets.

By default, the `index.html` file is configured to be published to GitHub Pages under the project name `base-package`. When you use it as a base for your own project, you will need to update these URLs.

---

**Delete everything above here when creating a new package**

---

# base-package

![Build and deploy status badge](https://github.com/cipscis/base-package/actions/workflows/build-and-deploy.yml/badge.svg)

## Install

Run `npm install github:cipscis/base-package#semver:1.x`

## Usage

See [Base Package documentation](https://cipscis.github.io/base-package/)

## Development

You will need to install [Node.js](https://nodejs.org/en/) before working on this package.

1. Clone the repository using `git clone https://github.com/cipscis/base-package.git`.
2. Run `npm install` to install development dependencies.
3. Create a [`.env`](#env) file.
4. Run `npm start` to run the local server and watch CSS and JS files for changes.

This project creates five npm tasks:

* `npm run server` runs a Node.js server on the port specified in the [`.env`](#env) file, using [Express](https://expressjs.com/).

* `npm run build` compiles CSS files using [gulp-sass](https://www.npmjs.com/package/gulp-sass) and bundles JavaScript using [Webpack](https://webpack.js.org/).

* `npm run watch` first runs the `build` task, then watches the relevant directories and reruns the `build` task if it sees any changes.

* `npm start` runs both the `server` and `watch` tasks simultaneously.

* `npm test` task runs any configured test suites using [Jasmine](https://jasmine.github.io/).

Usually, you will just want to run `npm start`.

### .env

The `.env` file contains the following environment variables:

* `PROJECT_NAME` `(string)`

If present, used by [Express](https://expressjs.com/) to set up redirects for emulating [GitHub Pages](#github-pages).

* `MODE` `(string 'development' | 'production')`

Used by Webpack to determine what optimisations to use and how to generate sourcemaps.

* `PORT` `(int)`

Used by [Express](https://expressjs.com/) to determine which port to use when running a local Node.js server.

An example `.env` file you can use for development is:

```
PROJECT_NAME = "base-package"
MODE = "development"
PORT = "8080"
```

This file is intended to differ from environment to environment, so it is ignored by Git.

## Dependencies

None.

## Dev Dependencies

### Development

These dependencies are used when working on the project locally.

* [Node.js](https://nodejs.org/en/): Runtime environment

* [npm](https://www.npmjs.com/): Package manager

* [Gulp](https://gulpjs.com/): Task runner

* [Jasmine](https://jasmine.github.io/): Testing framework

* [sass](https://www.npmjs.com/package/sass): Compiling CSS from [Sass](https://sass-lang.com/)

* [gulp-sass](https://www.npmjs.com/package/gulp-sass): Using the `sass` compiler with Gulp

* [Webpack](https://webpack.js.org/): For JavaScript dependency management, used with Gulp

* [Express](https://expressjs.com/): Running a Node.js server, accessed at `http://localhost:<PORT>`

* [Concurrently](https://www.npmjs.com/package/concurrently): Running server and development build tasks concurrently

* [dotenv](https://www.npmjs.com/package/dotenv): Reading environment variables from [`.env`](#env) file

### Deploy

These dependencies are used for deploying the project to GitHub Pages.

* [checkout](https://github.com/marketplace/actions/checkout): Used to check out the repository to a workspace so it can be built

* [Deploy to GitHub Pages](https://github.com/marketplace/actions/deploy-to-github-pages): Used to deploy the project to GitHub pages once it has been built
