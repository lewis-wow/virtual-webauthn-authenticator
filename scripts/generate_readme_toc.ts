import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

  // Find all headings level 1, 2, and 3
  const headingRegex = /^(#|##|###)\s+(.+)$/gm;
  let match;
  const tocLines = ['## Table of Contents', ''];

  while ((match = headingRegex.exec(readmeContent)) !== null) {
    const levelString = match[1]; // '#', '##', or '###'
    const title = match[2];

    const level = levelString.length; // 1, 2, or 3
    
    // We don't skip the TOC itself, to match VS Code extensions
    
    const anchor = generateAnchor(title);
    // h1 gets 0 indent, h2 gets 2 spaces, h3 gets 4 spaces
    const indent = '  '.repeat(level - 1);
    tocLines.push(`${indent}- [${title}](#${anchor})`);
  }

  const newTocContent = `<!-- TOC_START -->\n\n${tocLines.join('\n')}\n\n<!-- TOC_END -->\n\n`;

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
  
  // Format the file with Prettier to ensure consistent formatting
  try {
    execSync(`npx prettier --write ${README_PATH}`);
  } catch (err) {
    console.error('Failed to format README.md with Prettier:', err);
  }

  console.log('README.md Table of Contents updated and formatted successfully.');
}

run();
