/**
 * This file serves as a small application environmet to use during development.
 */
import pageBlocks, { InitConfig, Page, Block } from './index';

let options: InitConfig = {
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

pageBlocks.init(options);

const testPage: Page = new Page('blank', 'Example', {}, {});
const testBlock: Block = new Block('Example', {}, {}, {});

(async () => {
  console.log(await testPage.render('default', true));
  console.log(await testBlock.render('default', true));
})();