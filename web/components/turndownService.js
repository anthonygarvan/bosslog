const TurndownService = require('turndown');

const turndownService = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

turndownService.addRule('inputs', {
  filter: 'input',
  replacement: (content, node) => {
    return node.value;
  }
})

module.exports = turndownService;
