
const fs = require('fs');
const path = require('path');

const FOLDER_TO_BACKUP = './src';
const OUTPUT_FILE = './backup.json';
const EXCLUDED_EXTENSIONS = ['.DS_Store', '.next', '.node_modules'];
const INCLUDED_EXTENSIONS = ['.ts', '.tsx', '.css', '.json', '.js', '.yaml', '.md'];

const backupData = {};

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_EXTENSIONS.some(ext => fullPath.includes(ext))) {
        traverseDirectory(fullPath);
      }
    } else {
      if (INCLUDED_EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
        const relativePath = path.relative(process.cwd(), fullPath);
        console.log(`Backing up: ${relativePath}`);
        backupData[relativePath] = fs.readFileSync(fullPath, 'utf8');
      }
    }
  }
}

// Also include root-level config files
const rootFiles = fs.readdirSync('.');
for (const file of rootFiles) {
    const fullPath = path.join('.', file);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory() && INCLUDED_EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
         const relativePath = path.relative(process.cwd(), fullPath);
         console.log(`Backing up: ${relativePath}`);
         backupData[relativePath] = fs.readFileSync(fullPath, 'utf8');
    }
}


console.log(`Starting backup of project structure...`);
traverseDirectory(FOLDER_TO_BACKUP);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(backupData, null, 2));

console.log(`\n✅ Backup complete! All code saved to ${OUTPUT_FILE}`);
console.log('You can now open this file, copy its contents, and save it locally.');
