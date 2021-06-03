/**
 *  PageBlocks JSX RUNTIME 
 * 
 *  This file handles all jsx function calls from compiled jsx files and
 *  returns valid HTML. 
 * 
 *  Adapted from Rodrigo Pombo's "Build your own React" 
 *  Licensed under MIT (https://pomb.us/build-your-own-react/)
 * 
 *  © 2021 Ian Kirsch - All rights reserved. - https://iankirs.ch
 */

const fs = require('fs');
const { JSDOM } = require("jsdom");
const path = require('path');
const { compileJSX } = require('./compile-helper');

// This is needed for correctly importing the csm-compiled jsx files.
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; };

/**
 * Returns a valid element object to be used by the render function.
 * 
 * @param {*} type 
 * @param {*} config 
 */
function jsx(type, config) {
  if (typeof type === "function") {
    try {
      // The current element type is another function, meaning that it cannot be resolved to an HTML element & must be executed again.
      return type(config);
    } catch(err) {
      if (err.name === "TypeError" && err.message.includes("new")) {
        let block = new type(config);
        return block.render();
      }
    }
  };

  const { children = [], ...props } = config;
  const childrenProps = [].concat(children);

  return {
    type,
    props: {
      ...props,
      children: childrenProps.map((child) =>
        typeof child == "object" ? child : createTextElement(child)
      )
    }
  };
}

/**
 * Asnychronously returns a valid element object to be used by the render function.
 * 
 * @param {*} type 
 * @param {*} config 
 */
async function jsxAsync(type, config) {
  if (typeof type === "function") {
    try {
      // The current element type is another function, meaning that it cannot be resolved to an HTML element & must be executed again.
      return type(config);
    } catch(err) {
      if (err.name === "TypeError" && err.message.includes("new")) {
        let block = new type(config);
        return block.render();
      }
    }
  };

  const { children = [], ...props } = config;
  const childrenProps = [].concat(children);

  return {
    type,
    props: {
      ...props,
      children: childrenProps.map((child) =>
        typeof child == "object" ? child : createTextElement(child)
      )
    }
  };
}

/**
 * Returns a special element object which is interpreted by the render function 
 * to create a new HTML text node, instead of an element.
 * 
 * @param {String} text 
 */
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}

/**
 * Recursively renders all elements from their element objects, to output valid HTML.
 * 
 * @param {*} element 
 * @param {*} container 
 */
function render(element, container) {
  // Create the required element in the virtual DOM.
  // If the element has the special type of "TEXT_ELEMENT", a TextNode is created instead.
  const dom =
    element.type === "TEXT_ELEMENT"
      ? container.ownerDocument.createTextNode("")
      : container.ownerDocument.createElement(element.type);

  if (Array.isArray(element)) {
    // If the element passed to the function is an array of elements, render each element individually.
    element.forEach((arrayElement) => {
      render(arrayElement, container);
    });
    return;
  }

  // Set the element's HTML properties.
  const isProperty = (key) => key !== "children";
  Object.keys(element.props)
    .filter(isProperty)
    .forEach(function (name) {
        if (name.substr(0, 2) == "on" || name == "class" || name.substr(0, 5) == "data-" || name == "contenteditable" || name == "for") {
          // on(click/touch/hover) attributes need to be set using the setAttribute function. 
          if (!!element.props[name])
            dom.setAttribute(name, element.props[name])
        } else {
          dom[name] = element.props[name];
        }
    });

  // Render all children of the element.
  element.props.children.forEach((child) => render(child, dom));

  // Append the newly created element to its parent.
  container.appendChild(dom);
}

/**
 * Renders a jsx file to valid HTML by preparing a DOM and invoking the render function.
 * Any variables passed through the "context" object will be accessible in the rendered jsx.
 * 
 * @param {*} block 
 * @param {*} context 
 */
async function invokeRender(block, entry = 'default', context = {}) {
  // Imports the requested block file & checks that it has already been compiled, compiles it if necessary.
  const blockImport =
    fs.existsSync(path.join(__dirname, `../compiled/${block}.js`))
      ? _interopRequireDefault(require(path.join(__dirname, `../compiled/${block}.js`)))
      : _interopRequireDefault(require(compileJSX(block)));

  // Create a new virtual DOM, only used for rendering the module. 
  const dom = new JSDOM(`<!DOCTYPE html><body><div id='root'></div><div id='links'></div></body>`);
  const { document } = dom.window;
  const rootElement = document.getElementById("root");
  const linkElement = document.getElementById("links");

  // Call the render function and return the generated HTML.
  if (blockImport[entry].constructor.name == "AsyncFunction") {
    render(await jsxAsync(blockImport[entry], { context }), rootElement);
  } else {
    render(jsx(blockImport[entry], { context }), rootElement);
  }

  if (!!blockImport._cssImports) render(jsx(blockImport._cssImports), linkElement);

  return {
    head: linkElement.innerHTML,
    body: rootElement.innerHTML
  };
}


// Export jsx and render functions.
module.exports.jsx = jsx;
module.exports.jsxs = jsx;
module.exports.render = render;
module.exports.invokeRender = invokeRender;

// Alternative function syntax that works for some reason?
// (0, render)((0, jsx)(blockImport.default, { context }), rootElement);