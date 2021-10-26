/**
 *  PageBlocks Module
 *
 *  This is an internal module for rendering jsx files at runtime.
 *
 *  Before using in router classes, this module needs to be initialised.
 *  Execute the following code in your ExpressJS main app.js:
 *
 *  let options = {
 *     defaults: {
 *        page_title: "Page Title",
 *        default_author: "Example McExampleface",
 *        default_description: "A page.",
 *        default_tags: "example, tags",
 *        theme_color: "#000000"
 *     },
 *     root: __dirname,
 *     views: './view_roots/', (optional)
 *     blocks: './view_blocks/' (optional)
 *  }
 *  pageBlocks.init(options)
 *
 *
 *  © 2021 Ian Kirsch - All rights reserved. - https://iankirs.ch
 */

const fs = require('fs');
const path = require('path');

const { Page } = require('./Page');
const { Block, HTMLComponent, HTMLTemplateComponent } = require('./Component');
const Log = require('./common/log');

const compileHelper = require('./runtime/compile-helper');

/*
  DEFINE DEFAULT OPTIONS
*/
const defaultDirectories = {
  root: __dirname,
  blocks: './blocks/',
  views: './views/'
};

/* eslint-disable camelcase */
const defaultMetaValues = {
  page_title: 'A Website',
  default_author: 'An Author',
  default_description: 'Welcome to this website.',
  default_tags: 'website, tags',
  theme_color: '#000000'
};
/* eslint-enable camelcase */

/**
 * Initialises all global variables necessary for the operation of
 * this module & invokes the compile functions.
 *
 * @param {Object} config
 */
function init(config = {}) {
  Object.keys(defaultDirectories).forEach((key) => {
    const pathVariable = 'PAGE_BLOCKS_' + key.toUpperCase();
    if (!!config[key] && config[key] !== defaultDirectories[key]) {
      process.env[pathVariable] = config[key];
    } else {
      process.env[pathVariable] = defaultDirectories[key];
    }

    const absolutePath = path.join(config['root'], config[key]);
    const defaultsPath = path.join(__dirname, './defaults/');
    const directoriesMissing = !fs.existsSync(absolutePath) && key !== 'root';

    if (directoriesMissing) {
      fs.mkdirSync(absolutePath);
      fs.readdirSync(path.join(defaultsPath, key)).forEach(file => {
        if (file == 'static') {
          fs.mkdirSync(path.join(absolutePath, '/static/'));
          fs.readdirSync(path.join(defaultsPath, key + '/static/')).forEach(file => {
            fs.copyFileSync(path.join(defaultsPath, key + '/static/' + file), path.join(absolutePath, '/static/' + file));
          });
        } else {
          fs.copyFileSync(path.join(defaultsPath, key + '/' + file), path.join(absolutePath, file));
        }
      });
    }
  });

  if (config.defaults) {
    Object.keys(defaultMetaValues).forEach((key) => {
      const pathVariable = key.toUpperCase();
      if (!!config.defaults[key] && config.defaults[key] !== defaultMetaValues[key]) {
        process.env[pathVariable] = config.defaults[key];
      } else {
        process.env[pathVariable] = defaultMetaValues[key];
      }
    });
  } else {
    Object.keys(defaultMetaValues).forEach((key) => {
      const pathVariable = key.toUpperCase();
      process.env[pathVariable] = defaultMetaValues[key];
    });
  }

  Log.Info('Performing a full compile. Please wait until this is finished before navigating to any pages.');
  compileHelper.compileAll();
  Log.Success('Fully Initialised.\n');

  // Watch block file changes and recompile as necessary.
  require('node-watch')(path.resolve(config.root, config.blocks), { recursive: true }, (evt, file) => {
    if (file.slice(-4) !== '.jsx') {return;}
    Log.Info('Changes detected. Recompiling');
    compileHelper.compileAll();
    Log.Success('Compilation complete.\n');
  });
}

module.exports.init = init;
module.exports.PROJECT_ROOT = process.env.PAGE_BLOCKS_ROOT;

/**
 * Imports any module from a file path that is relative to the root of the project.
 * @param {String} importPath - module Path from project root.
 */
module.exports.importCompat = (importPath) => {
  return require(path.join(process.env.PAGE_BLOCKS_ROOT, importPath));
};

module.exports.Page = Page;
module.exports.Block = Block;
module.exports.HTMLComponent = HTMLComponent;
module.exports.HTMLTemplateComponent = HTMLTemplateComponent;

/**
* Some elements need IDs for the client script to function correctly.
* This function can generate random IDs for an element, where necessary.
* @param {*} length
*/
module.exports.makeId = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

