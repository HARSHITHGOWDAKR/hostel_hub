import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

const dir = process.cwd();

async function main() {
  console.log('Initializing git repository in', dir);
  await git.init({ fs, dir, defaultBranch: 'main' });

  // Recursive file finder ignoring node_modules, dist, .git
  function getFiles(baseDir, currentDir = '') {
    const fullPath = path.join(baseDir, currentDir);
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    let files = [];

    for (const entry of entries) {
      const relPath = path.join(currentDir, entry.name).replace(/\\/g, '/');
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === '.gemini') {
        continue;
      }
      if (entry.isDirectory()) {
        files = files.concat(getFiles(baseDir, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const allFiles = getFiles(dir);
  console.log(`Adding ${allFiles.length} files...`);

  for (const filepath of allFiles) {
    await git.add({ fs, dir, filepath });
  }

  const sha = await git.commit({
    fs,
    dir,
    message: 'Initial commit: Campus Hostel Delivery Platform with Phone OTP Auth, Real-Time Firestore, and Maps',
    author: {
      name: 'Thejas Gowda',
      email: 'thejas2008@users.noreply.github.com'
    }
  });

  console.log('Committed successfully with SHA:', sha);
}

main().catch(console.error);
