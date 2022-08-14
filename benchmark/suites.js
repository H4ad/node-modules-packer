const npmPrune = require('./npm-prune');
const lib = require('./node-modules-packer');

const pruneResults = [];
const pruneSkipRestoreResults = [];
const libResults = [];
const libMinifiedResults = [];

const runs = 5;

async function runSuites() {
  for (let i = 0; i < runs; i++) {
    const result = await npmPrune.runSuite();

    pruneResults.push(result);
  }

  for (let i = 0; i < runs; i++) {
    const result = await npmPrune.runSuite(true);

    pruneSkipRestoreResults.push(result);
  }

  for (let i = 0; i < runs; i++) {
    const result = await lib.runSuite();

    libResults.push(result);
  }

  for (let i = 0; i < runs; i++) {
    const result = await lib.runSuite(true);

    libMinifiedResults.push(result);
  }

  console.log('Npm Prune Results:');
  console.table(pruneResults);

  console.log('Npm Prune (skipping restore) Results:');
  console.table(pruneSkipRestoreResults);

  console.log('Node Modules Packer Results:');
  console.table(libResults);

  console.log('Node Modules Packer Results (minify):');
  console.table(libMinifiedResults);
}

runSuites();
