#!/usr/bin/env node
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const venvDir = path.join(projectRoot, '.venv');
const binDir = path.join(venvDir, process.platform === 'win32' ? 'Scripts' : 'bin');

if (!fs.existsSync(binDir)) {
  console.log(`Virtual environment not found at ${binDir}. Run "bun run server:install" first.`);
  process.exit(1);
}

const env = {
  ...process.env,
  PATH: `${binDir}${path.delimiter}${process.env.PATH || ''}`,
};

const pythonCommands = ['python', 'python3'];
const args = ['-m', 'uvicorn', 'app.main:app', ...process.argv.slice(2)];

const runPython = (index = 0) => {
  const command = pythonCommands[index];
  const child = spawn(command, args, { stdio: 'inherit', env });

  child.on('error', (error) => {
    if (error.code === 'ENOENT' && index + 1 < pythonCommands.length) {
      runPython(index + 1);
      return;
    }

    console.log(`Failed to run ${command}: ${error.message}`);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exit(1);
    }

    process.exit(typeof code === 'number' ? code : 1);
  });
};

runPython();
