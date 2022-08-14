const { prepareEnvironment, getSuiteDir, getOutputSize, getFormattedEndTime } = require('./utils');
const Run = require('@h4ad/node-modules-packer/lib/commands/run').default;

async function zipDependencies(withMinification) {
  await Run.headless({
    dir: getSuiteDir(),
    outputFile: 'lib.zip',
    outputPath: __dirname,
    minify: withMinification,
  });
}

async function runSuite(withMinification) {
  prepareEnvironment();

  console.log('Running NodeModulesPacker Suite.');
  const time = new Date();
  console.time('NodeModulesPacker');

  await zipDependencies(withMinification);

  console.timeEnd('NodeModulesPacker');
  console.log('Finished running NodeModulesPacker Suite.');

  const endTime = new Date() - time;
  const outputSize = getOutputSize('lib.zip');

  console.log(`OutputSize: ${outputSize}`);

  return {
    endTime: getFormattedEndTime(endTime),
    outputSize,
  };
}

module.exports = {
  runSuite,
};
