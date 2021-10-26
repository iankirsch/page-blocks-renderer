// Type definitions for page-blocks
// Project: PageBlocks
// Definitions by: Ian Kirsch

// #region CONSTANTS
/**
 * Project root location constant.
 */
export const PROJECT_ROOT: string;
// #endregion


// #region FUNCTIONS
export interface InitConfig {
  defaults?: InitConfigDefaults;
  root: string;
  views?: string;
  blocks?: string;
}

export interface InitConfigDefaults {
  page_title: string;
  default_author: string;
  default_description: string;
  default_tags: string;
  theme_color: string;
}

/**
 * Initialises all global variables necessary for the operation of
 * this module & invokes the compile functions.
 *
 * @param config - PageBlocks Configuration
 */
export function init(config: InitConfig): void;

/**
 * Imports any module from a file path that is relative to the root of the project.
 * @param importPath - module Path from project root.
 */
export function importCompat(importPath: string): unknown;

/**
* Some elements need IDs for the client script to function correctly.
* This function can generate random IDs for an element, where necessary.
* @param length - Length of id to generate
*/
export function makeId(length: number): string;
// #endregion


// #region CLASSES
export interface PageConfig {
  title?: string;
  description?: string;
  tags?: string;
  editDate?: string;
  author?: string;
  themeColor?: string;
}

export interface PageContext {
  appName: string;
  pageTitle: string;
  tabTitle: string;
  description: string;
  tags: string;
  editDate: string;
  author: string;
  themeColor: string;
  account: string;
  version: string;
  head: unknown;
}

/**
 * Page class, that facilitates all stages of the page render process.
 *
 * @param pageRoot - Name of the root file to render into
 * @param pageBlock - Name of the block file to be rendered
 * @param req - Express Request object
 * @param res - Express Response object
 * @param config - Page configuration
 */
export declare class Page {
  constructor(pageRoot: string, pageBlock: string, req: unknown, res: unknown, config?: PageConfig);

  context: PageContext | unknown;

  /**
   * Renders page to HTML and sends it to client.
   * @param entry - Name of the entry function
   * @param outputToString - When set to true, the function returns the rendered block as
   *                         a string of HTML instead of sending it to the client.
   */
  render(entry?: string, outputToString?: boolean): Promise<void | string>;
}

/**
 * Block class, that renders a single pageBlock function, without any HTML head.
 * @param pageBlock - Name of the block file to be rendered
 * @param req - Express Request object
 * @param res - Express Response object
 * @param context - Context object to pass to runtime
 */
export declare class Block {
  constructor(pageBlock: string, req: unknown, res: unknown, context: unknown);

  /**
   * Renders block to HTML and sends it to client.
   * @param entry - Name of the entry function
   * @param outputToString - When set to true, the function returns the rendered block as
   *                         a string of HTML instead of sending it to the client.
   */
  render(entry?: string, outputToString?: boolean): Promise<void | string>;
}

/**
 * Component sub-class, that loads web page template components
 * and fills them using the variables given to it via the "objects" parameter.
 *
 * Note: This directory can be specified when intialising the module.
 *
 * @param componentName - Component file name
 */
export declare class HTMLComponent {
  constructor(componentName: string);

  body: string;
}

/**
 * Component sub-class, that loads web page template components
 * and fills them using the variables given to it via the "objects" parameter.
 *
 * Note: This directory can be specified when intialising the module.
 *
 * @param componentName - Component file name
 * @param objects - Object of inserts
 */
export declare class HTMLTemplateComponent extends HTMLComponent {
  constructor(componentName: string, objects: unknown);

  body: string;
}
// #endregion


