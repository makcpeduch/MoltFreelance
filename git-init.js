const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const lockFile = path.join(process.cwd(), '.git', 'index.lock');
if (fs.existsSync(lockFile)) {
    console.log('Removing .git/index.lock');
    fs.unlinkSync(lockFile);
}

try {
    console.log('Configuring git...');
    execSync('git config user.name "MoltFreelance"');
    execSync('git config user.email "bot@example.com"');

    console.log('Running git add .');
    const addOut = execSync('git add -A').toString();
    console.log(addOut);

    console.log('Running git commit');
    const commitOut = execSync('git commit -m "initial commit"').toString();
    console.log(commitOut);
    console.log('Done!');
} catch (e) {
    if (e.stdout) console.log('STDOUT:', e.stdout.toString());
    if (e.stderr) console.error('STDERR:', e.stderr.toString());
    console.error('Error:', e.message);
}
