const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../public/ccssss.css');
let css = fs.readFileSync(file, 'utf8');
const rules = [
  // Normalize common named colors
  { from: /\bwhite\b/g, to: '#FFFFFFFF' },
  { from: /\bBlack\b/g, to: '#000000FF' },
  { from: /\bblack\b/g, to: '#000000FF' },
  // Short hex -> 8-digit
  { from: /#fff\b/gi, to: '#FFFFFFFF' },
  { from: /#000\b/gi, to: '#000000FF' },
  { from: /#333\b/gi, to: '#333333FF' },
  { from: /#444\b/gi, to: '#444444FF' },
  { from: /#666\b/gi, to: '#666666FF' },
  { from: /#ccc\b/gi, to: '#CCCCCCFF' },
  { from: /#f4f4f4\b/gi, to: '#F4F4F4FF' },
  { from: /#ffffff\b/gi, to: '#FFFFFFFF' },
  { from: /#000000\b/gi, to: '#000000FF' },
  { from: /#ffffffdd\b/gi, to: '#FFFFFFDD' },
  // replace occurrences like rgb(...) with rgba where alpha missing? skip those
];

rules.forEach(r => { css = css.replace(r.from, r.to); });

// Also handle -webkit-text-stroke: 1px black; cases to 1px #000000FF
css = css.replace(/-webkit-text-stroke:\s*1px\s*black/gi, '-webkit-text-stroke: 1px #000000FF');

fs.writeFileSync(file, css, 'utf8');
console.log('Normalized colors in', file);
