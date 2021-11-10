/**
 *  PageBlocks JSX COMPILE HELPER
 *
 *  This file handles compilation of jsx files to NodeJS CommonJS files.
 *
 *  © 2021 Ian Kirsch - All rights reserved. - https://iankirs.ch
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const Log = require('../common/log');

let ROOT_DIRECTORY;
let BLOCKS_DIRECTORY;

/**
 * Initialise all global variables
 */
function _initGlobalVariables() {
  ROOT_DIRECTORY = process.env.PAGE_BLOCKS_ROOT;
  BLOCKS_DIRECTORY = process.env.PAGE_BLOCKS_BLOCKS;
}

/*
  CSS IMPORT FUNCTIONS
*/

const cssImportRegex = /^\s*import ['"](.*\.css)['"];/gm; // Matches any css import statement.
const nonCSSImportRegex = /^\s*import.*['"](.*)(?<!\.css)['"];/gm; // Matches any non-css import statement.

/**
 * When passed an import statement and the path of the file containing this stament,
 * this function will check the statement to see if it resolves to a valid jsx file.
 * If this is the case, it returns the statement. Otherwise, it is discarded.
 *
 * @param {String} importStatement
 * @param {String} currentFilePath
 */
function _isValidJSXImport(importStatement, currentFilePath) {
  const importPath = path.resolve(path.dirname(currentFilePath), importStatement.replace(nonCSSImportRegex, '$1'));
  if (fs.existsSync(`${importPath}.jsx`)) {return importStatement;}
}

/**
 * Returns HTML link tags for all css import staments of a file's contents.
 *
 * @param {String} jsxFileContents
 */
function _importCSSFromFile(jsxFileContents) {
  const matches = jsxFileContents.match(cssImportRegex);
  const cssLinks =
    matches
      ? matches.map(match => { return `<link rel="stylesheet" type="text/css" href="${match.replace(cssImportRegex, '$1')}" media="screen" />`; })
      : '';
  return cssLinks;
}

/**
 * Recursively builds an array of link tags for a jsx file's css import statements
 * and the css import statments of all its dependencies as well as their dependencies etc...
 *
 * Basically, this will find all necessary css imports for any jsx file.
 *
 * @param {String} filePath
 */
function _generateCSSArray(filePath) {
  const fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
  const allImports = fileContents.match(nonCSSImportRegex);
  const jsxImports =
    allImports
      ? allImports.filter(importStatement => _isValidJSXImport(importStatement, filePath))
      : [];

  let cssArray = _importCSSFromFile(fileContents);

  for (const i in jsxImports) {
    const importPath = path.resolve(path.dirname(filePath), jsxImports[i].replace(nonCSSImportRegex, '$1'));
    cssArray = [...cssArray, ..._generateCSSArray(`${importPath}.jsx`)];
  }

  return cssArray;
}

/**
 * Takes a jsx file's path and contents. Returns the file's contents with
 * all css import statements removed and replaced with the _cssImports()
 * function, which is called by the Page renderer and added to the head as
 * link tags.
 *
 * @param {String} filePath
 * @param {String} fileContents
 */
function importCSS(filePath, fileContents) {
  const cssArray = _generateCSSArray(filePath);

  const importFunctionString =
    `export function _cssImports () {
     return [
       ${cssArray}
     ]
   }`;

  fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
  fileContents += importFunctionString;
  fileContents = fileContents.replace(cssImportRegex, '');

  return fileContents;
}


/*
  COMPILER FUNCTIONS
*/

/**
 * Compiles a .jsx file to CommonJS files referencing the jsx-runtime.
 * @param {String} relativePath
 */
function compileJSX(relativePath, fullPath = undefined) {
  const filePath = fullPath || path.join(ROOT_DIRECTORY, `${BLOCKS_DIRECTORY}${relativePath}`);
  const fileName = relativePath.slice(0, -4);

  if (!fs.existsSync(filePath)) {
    Log.Error(`Cannot compile ${filePath}. File not found.`);
    return;
  }
  Log.Progress(`Compiling block "${fileName}".`);

  // Create any necessary output folders and subfolders if they don't already exist
  let outputFolder = relativePath.split('/');
  outputFolder.pop();
  outputFolder = outputFolder.join('/');
  if (!fs.existsSync(path.join(__dirname, `../compiled/${outputFolder}`)))
  {fs.mkdirSync(path.join(__dirname, `../compiled/${outputFolder}`));}

  // Tell Babel to compile JSX to commonJS and to import the runtime from the correct path.
  const babelOptions = {
    'plugins': [
      '@babel/plugin-transform-modules-commonjs',
      [
        '@babel/plugin-transform-react-jsx',
        {
          'runtime': 'automatic',
          'importSource': path.join(__dirname, '../runtime')
        }
      ]
    ]
  };

  // Read the uncompiled JSX file and translate any css import statements.
  let fileContents = fs.readFileSync(filePath, { encoding: 'utf8' });
  fileContents = importCSS(filePath, fileContents);

  // Run compiler and write compiled code to file.
  const compiledCode = babel.transformSync(fileContents, babelOptions);
  fs.writeFileSync(path.join(__dirname, `../compiled/${fileName}.js`), compiledCode.code, { encoding: 'utf8' });

  // Deletes any cached content of the compiled block.
  delete require.cache[require.resolve(`../compiled/${fileName}.js`)];

  // Returns file path of compiled file for direct import, if necessary.
  return (path.join(__dirname, `../compiled/${fileName}.js`));
}

/**
 * Recursively traverse the blocks directory folder to compile
 * all jsx files contained in it and its sub-directories.
 *
 * @param {String} subFolder
 */
function compileAllFromFolder(subFolder = undefined) {
  _initGlobalVariables();
  const toBeCompiledFolder =
    subFolder
      ? path.join(ROOT_DIRECTORY, BLOCKS_DIRECTORY, subFolder)
      : path.join(ROOT_DIRECTORY, BLOCKS_DIRECTORY);

  fs.readdirSync(toBeCompiledFolder).forEach(file => {
    const relativePath =
      subFolder
        ? `${subFolder}/${file}`
        : file;

    if (file.slice(-4) === '.jsx') {
      compileJSX(relativePath);
    } else if (fs.statSync(path.join(toBeCompiledFolder, file)).isDirectory()) {
      compileAllFromFolder(relativePath);
    }
  });
}

/**
 * Removes the compiled directory and invokes the compile functions for full recompilation.
 */
function compileAll() {
  _initGlobalVariables();
  const compilationFolder = path.join(__dirname, '../compiled/');

  if (fs.existsSync(compilationFolder))
  {fs.rmSync(compilationFolder, { recursive: true });}

  fs.mkdirSync(compilationFolder);

  compileAllFromFolder();
}

_initGlobalVariables();

module.exports.compileJSX = compileJSX;
module.exports.compileAll = compileAll;