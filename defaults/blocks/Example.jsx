/**
 *  EXAMPLE BLOCK FOR USE WITH PAGEBLOCKS
 * 
 *  All files in the blocks folder behave according to all jsx standards 
 *  and are compiled to HTML when you render them in your router. It is 
 *  also possible to import any other blocks from any other file in the 
 *  block folder.
 * 
 *  Note however, that all imports (even those of node modules) must adhere 
 *  to the esm (*) import standard, not the csm standard Node uses by default.
 * 
 *  (*) - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
 * 
 * 
 *  Note also, that all html properties need to be named and capitalised 
 *  using their standard specification, not according to React Specification.
 *  This means that 
 *    <div class="example"></div>
 *  is NOT changed to
 *    <div className="example"></div>
 * 
 *  © 2021 Ian Kirsch - All rights reserved. - https://iankirs.ch
 */
 
function List({ items }) {
  return (
    <ul>
      {items.map((item, i) => (
        <ListItem id={i}>
          <Anchor value={item} />
        </ListItem>
      ))}
    </ul>
  );
}

function ListItem({ children, id }) {
  return <li id={id}>{children}</li>;
}

function Anchor({ value }) {
  return <a href="#">{value}</a>;
}

function Page() {
  return (
    <div>
      I am a page!
      <List items={[1, 2, 3, 4, 5]} />
    </div>
  );
}

export default Page;
