# PageBlocks Module
PageBlocks enables the use of JSX Component Rendering in Express, without React!


# Setup
Before using in router classes, this module needs to be initialised.  
Execute the following code in your ExpressJS main app.js:

```javascript 
const pageBlocks = require("page-blocks");  
let options = {  
  defaults: {  
    page_title: "Page Title",  
    default_author: "Example McExampleface",  
    default_description: "A page.",  
    default_tags: "example, tags",  
    theme_color: "#000000"
  },  
  root: __dirname,  
  views: './view_roots/', (optional)  
  blocks: './view_blocks/' (optional)  
}  
pageBlocks.init(options);
```