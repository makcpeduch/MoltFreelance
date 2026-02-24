const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Remove lock file if exists
const lockFile = path.join(__dirname, '.git', 'index.lock');
if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    console.log('Removed .git/index.lock');
}

try {
    console.log('=== Git Status ===');
    console.log(execSync('git status --short', { encoding: 'utf8', timeout: 10000 }));

    console.log('=== Git Add ===');
    execSync('git add src/middleware.ts', { encoding: 'utf8', timeout: 10000 });
    console.log('Added middleware.ts');

    console.log('=== Git Commit ===');
    const commitOut = execSync('git commit -m "fix: revert String.raw in middleware matcher"', { encoding: 'utf8', timeout: 10000 });
    console.log(commitOut);

    console.log('=== Git Push ===');
    const pushOut = execSync('git push', { encoding: 'utf8', timeout: 30000 });
    console.log(pushOut);

    console.log('=== DONE ===');
} catch (e) {
    console.error('Error:', e.message);
    if (e.stdout) console.log('STDOUT:', e.stdout);
    if (e.stderr) console.error('STDERR:', e.stderr);
}
