import * as fs from 'fs';
import * as path from 'path';

const README_PATH = path.join(process.cwd(), 'README.md');

function generateAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function run() {
  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');

  // Find all headings level 2 and 3
  const headingRegex = /^(##|###)\s+(.+)$/gm;
  let match;
  const tocLines = ['## Table of Contents', ''];

  while ((match = headingRegex.exec(readmeContent)) !== null) {
    const level = match[1]; // '##' or '###'
    const title = match[2];

    // Skip the TOC itself
    if (title === 'Table of Contents') continue;

    const anchor = generateAnchor(title);
    const indent = level === '###' ? '  ' : '';
    tocLines.push(`${indent}- [${title}](#${anchor})`);
  }

  const newTocContent = `<!-- TOC_START -->\n${tocLines.join('\n')}\n<!-- TOC_END -->\n\n`;

  // Replace existing TOC or insert before "## About This Project"
  const tocRegionRegex = /<!-- TOC_START -->[\s\S]*<!-- TOC_END -->\n\n/;

  let updatedContent = readmeContent;
  if (tocRegionRegex.test(readmeContent)) {
    updatedContent = readmeContent.replace(tocRegionRegex, newTocContent);
  } else {
    const insertionPoint = '## About This Project';
    if (!readmeContent.includes(insertionPoint)) {
      console.error(`Could not find insertion point: "${insertionPoint}"`);
      process.exit(1);
    }
    updatedContent = readmeContent.replace(
      insertionPoint,
      `${newTocContent}${insertionPoint}`,
    );
  }

  fs.writeFileSync(README_PATH, updatedContent, 'utf-8');
  console.log('README.md Table of Contents updated successfully.');
}

run();
