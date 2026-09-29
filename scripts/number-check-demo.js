#!/usr/bin/env node
// Runs the workflow's own "Number Check" Code node on a research brief + draft, outside n8n.
// Handy when you extend the unit regex for another language.
//
// Usage: node scripts/number-check-demo.js [path/to/sample.json]
// Sample format: { "brief": "...research brief text...", "draft": "...article HTML..." }
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wf = JSON.parse(fs.readFileSync(path.join(root, 'workflows', 'grounded-blog-writer.json'), 'utf8'));
const code = wf.nodes.find(n => n.name === 'Number Check').parameters.jsCode;
const samplePath = process.argv[2] || path.join(root, 'examples', 'number-check-sample.json');
const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));

// Minimal stand-ins for the n8n globals the node uses.
const $ = name => ({ first: () => ({ json: name === 'Extract Brief' ? { brief: sample.brief } : {} }) });
const out = new Function('$', '$json', code)($, { text: sample.draft });

const flagged = out[0].json.unsourced_numbers;
console.log(flagged.length
  ? 'Numbers NOT backed by the brief (the editor must remove or rephrase them):\n  - ' + flagged.join('\n  - ')
  : 'All numeric claims appear in the brief.');
