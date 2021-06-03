/*
  MODULE IMPORTS
*/
const fs = require('fs-extra');
const path = require("path");
const _jsxRuntime = require('./runtime/jsx-runtime');

/*
  DEFAULT VALUES & GLOBAL VARIABLES
*/

let ROOT_DIRECTORY;
let BLOCKS_DIRECTORY;
let VIEWS_DIRECTORY;

function _initGlobalVariables() {
  ROOT_DIRECTORY = process.env.PAGE_BLOCKS_ROOT;
  BLOCKS_DIRECTORY = process.env.PAGE_BLOCKS_BLOCKS;
  VIEWS_DIRECTORY = process.env.PAGE_BLOCKS_VIEWS;
}

/*
  DYNAMIC COMPONENT (SINGLE BLOCK)
*/
class Block {
  /**
   * Block class, that render´s a single pageBlock function, without any HTML head.
   * @param {string} pageBlock - name of the block file to be rendered.
   * @param {object} req
   * @param {object} res 
   */
  constructor(pageBlock, req, res, context = {}) {
    if (!ROOT_DIRECTORY) _initGlobalVariables(); // Initialise global variables, if it has not yet happened.
    this.pageBlock = pageBlock;
    this.req = req;
    this.res = res;
    this.context = context;
  }

  /**
   * Renders the requested pageBlock function to the client
   * @param {string} entry 
   */
  render(entry) {
    // Render the requested JSX Block to HTML
    _jsxRuntime.invokeRender(this.pageBlock, entry, this.context)
      .then((renderedJSX) => {
        // Send final HTML to client.
        this.res.type('html').send(renderedJSX.body);
      })
      .catch((err) => {
        let debug = false;
        if (fs.existsSync(path.join(ROOT_DIRECTORY, '/config.json')))
          debug = require(path.join(ROOT_DIRECTORY, '/config.json')).DEBUG;

        this.res.render('error', { error: err, debug: debug });
      })
  }
}

/*
  STATIC HTML COMPONENTS
*/

class HTMLComponent {
  /**
   * Component class, that loads web page components which are located in the static directory inside of the blocks directory.
   * 
   * Hint: This directory can be specified when intialising the module.
   * 
   * @param {string} componentName 
   */

  constructor(componentName) {
    this.componentName = componentName;
  }

  get content() {
    /**
     * Returns html component content from the _component folder
     */
    return fs.readFileSync(path.resolve(process.env.PAGE_BLOCKS_ROOT, `${process.env.PAGE_BLOCKS_BLOCKS}static/${this.componentName}.html`));
  }

  get body() {
    return this.content.toString();
  }
}

class HTMLTemplateComponent extends HTMLComponent {
  /**
   * Component sub-class, that loads web page template components 
   * and fills them using the variables given to it via the "objects" parameter.
   * 
   * Hint: This directory can be specified when intialising the module.
   * 
   * @param {string} componentName 
   * @param {object} objects
   */

  constructor(componentName, objects) {
    super(componentName);
    this.objects = objects;
  }

  get content() {
    /**
     * Template function, which takes a template string and fills it inaccording to the following pattern:
     * template input: '${a}, ${b}'
     * objects input: {a: 'one', b: 'two'}
     * returns: 'one, two'
     */
    return String(super.content).replace(/\${([^}]*)}/g, (r, k) => this.objects[k]);
  }

  get body() {
    return this.content.toString();
  }
}


module.exports.Block = Block;
module.exports.HTMLComponent = HTMLComponent;
module.exports.HTMLTemplateComponent = HTMLTemplateComponent;