/**
 * This file serves as a small application environmet to use during development.
 */
const pageBlocks = require('./index');

let options = {
  defaults: {
    page_title: "Page Title",
    default_author: "Example McExampleface",
    default_description: "A page.",
    default_tags: "example, tags",
    theme_color: "#000000"
  },
  root: __dirname,
  views: './view_roots/',
  blocks: './view_blocks/'
}

pageBlocks.init(options)
