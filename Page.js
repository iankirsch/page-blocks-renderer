/*
  MODULE IMPORTS
*/

const fs = require('fs-extra');
const path = require('path');

const { HTMLTemplateComponent } = require('./Component');
const _jsxRuntime = require('./runtime/jsx-runtime');

/*
  DEFAULT VALUES & GLOBAL VARIABLES
*/

let ROOT_DIRECTORY;
let VIEWS_DIRECTORY;
let PAGE_TITLE;
let DEFAULT_AUTHOR;
let DEFAULT_DESCRIPTION;
let DEFAULT_TAGS;
let THEME_COLOR;

function _initGlobalVariables() {
  ROOT_DIRECTORY = process.env.PAGE_BLOCKS_ROOT;
  VIEWS_DIRECTORY = process.env.PAGE_BLOCKS_VIEWS;
  PAGE_TITLE = process.env.PAGE_TITLE;
  DEFAULT_AUTHOR = process.env.DEFAULT_AUTHOR;
  DEFAULT_DESCRIPTION = process.env.DEFAULT_DESCRIPTION;
  DEFAULT_TAGS = process.env.DEFAULT_TAGS;
  THEME_COLOR = process.env.THEME_COLOR;
}

/*
  PAGE CLASSES
*/

/**
 * Page class, that facilitates all stages of the page render process.
 *
 * @param {string} pageRoot - Name of the root file to render into
 * @param {string} pageBlock - Name of the block file to be rendered
 * @param {*} req - Express Request object
 * @param {*} res - Express Response object
 * @param {*} config - Page configuration
 */
class Page {

  constructor(pageRoot, pageBlock, req, res, config = {}) {
    if (!PAGE_TITLE) { _initGlobalVariables(); } // Initialise global variables, if it has not yet happened.
    this.req = req;
    this.res = res;
    this.pageRoot = pageRoot;
    this.pageBlock = pageBlock;
    this.config = {
      title: config.title || 'No title given',
      description: config.description || DEFAULT_DESCRIPTION,
      tags: config.tags || DEFAULT_TAGS,
      editDate: config.editDate || '',
      author: config.author || DEFAULT_AUTHOR,
      themeColor: config.themeColor || THEME_COLOR
    };
  }

  get account() {
    /**
     * Returns the login or account button in the top bar of the page.
     */
    if (this.req.user) {
      return this.req.user;
    } else {
      return false;
    }
  }

  get context() {
    /**
     * Returns the "context" object, that contains all static page parts passed over to the view.
     */
    const tempContext = {
      appName: PAGE_TITLE,
      pageTitle: this.config.title,
      tabTitle: this.config.title + ' | ' + PAGE_TITLE,
      description: this.config.description,
      tags: this.config.tags,
      editDate: this.config.editDate,
      author: this.config.author,
      themeColor: this.config.themeColor,
      account: this.account,
      version: require(path.join(ROOT_DIRECTORY, './package.json')).version
    };
    if (this.config.title === 'PAGE_ROOT') {
      tempContext.pageTitle = 'Welcome';
      tempContext.tabTitle = PAGE_TITLE;
    }

    // Load all necessary static HTML components
    const headComponent = new HTMLTemplateComponent('head', tempContext);

    // Pass components back to router to be rendered
    tempContext.head = headComponent.body;

    return tempContext;
  }

  /**
   * Renders the current page using the router passed to it.
   * @param {string} entry
   */
  render(entry = 'default', outputToString = false) {
    // Render the requested JSX Block to HTML
    return new Promise((resolve, reject) => {
      _jsxRuntime.invokeRender(this.pageBlock, entry, this.context)
        .then((renderedJSX) => {
          // Add any additional head children from the rendered Block to the head attribute.
          const context = this.context;
          context.head = context.head.replace(/<\/head>/g, renderedJSX.head + '\n</head>');

          // Render the final page, including all attributes and Blocks.
          if (!outputToString) {
            this.res.render(
              path.join(ROOT_DIRECTORY, VIEWS_DIRECTORY + this.pageRoot),
              {
                context: context,
                pageBlock: {
                  root: renderedJSX.body
                }
              }
            );
            resolve();
          } else {
            resolve(renderedJSX.body);
          }
        }).catch((err) => {
          let debug = false;
          if (fs.existsSync(path.join(ROOT_DIRECTORY, '/config.json'))) { debug = require(path.join(ROOT_DIRECTORY, '/config.json')).DEBUG; }

          if (!outputToString) {
            this.res.render('error', { error: err, debug: debug });
          } else {
            reject(err.message);
          }
        });
    });
  }

}

module.exports.Page = Page;