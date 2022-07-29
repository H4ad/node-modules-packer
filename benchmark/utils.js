const { join } = require('path');
const { execSync } = require('child_process');
const { createWriteStream, statSync } = require('fs');

function getSuiteDir() {
  return join(__dirname, 'suite');
}

function getNodeModulesDir() {
  return join(getSuiteDir(), 'node_modules');
}

function getOutputStream(outputFileName) {
  return createWriteStream(join(__dirname, outputFileName));
}

function getOutputSize(outputFileName) {
  return `${(statSync(outputFileName).size / (1024 * 1024)).toFixed(2)} MB`;
}

function getFormattedEndTime(time) {
  return `${(time / 1000).toFixed(2)}s`;
}

function runCommand(command) {
  execSync(command, { cwd: getSuiteDir() });
}

function prepareEnvironment() {
  console.log('Installing fresh dependencies.');
  runCommand('npm ci --loglevel error');
  console.log('Dependencies installed.');
}

module.exports = {
  getSuiteDir,
  getNodeModulesDir,
  getOutputStream,
  getOutputSize,
  runCommand,
  prepareEnvironment,
  getFormattedEndTime,
};
