const archiver = require('archiver');
const { prepareEnvironment, runCommand, getOutputStream, getNodeModulesDir, getOutputSize, getFormattedEndTime } = require('./utils');

function cleanDependencies() {
  runCommand('npm prune --production --loglevel error');
}

function restoreDependencies() {
  runCommand('npm ci');
}

async function zipDependencies() {
  const zip = archiver('zip', {
    zlib: { level: 9 },
  });
  const outputStream = getOutputStream('prune.zip');

  zip.directory(
    getNodeModulesDir(),
    'node_modules',
  );

  await new Promise((resolve, reject) => {
    zip
      .on('error', err => reject(err))
      .pipe(outputStream);

    outputStream.on('close', () => resolve());
    zip.finalize();
  });
}

async function runSuite(skipRestore) {
  prepareEnvironment();

  const suitName = skipRestore ? 'NpmPrune (skip restore)' : 'NpmPrune';

  console.log('Running NpmPrune Suite.');
  const time = new Date();
  console.time(suitName);

  cleanDependencies();
  await zipDependencies();

  if (!skipRestore)
    restoreDependencies();

  console.timeEnd(suitName);
  console.log(`Finished running ${suitName} Suite.`);

  const endTime = new Date() - time;
  const outputSize = getOutputSize('prune.zip');

  console.log(`OutputSize: ${outputSize}`);

  return {
    endTime: getFormattedEndTime(endTime),
    outputSize,
  };
}

module.exports = {
  runSuite,
};
