const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { generateMetaDescription } = require('./generateMetaDescription');

const argv = parseCommandLineArguments();
const inputFile = argv.input;
let outputFile = argv.output || argv.o;

const fsPromises = fs.promises;

async function processPosts() {
  outputFile = await checkOutputFile(outputFile, argv.overwrite);
  const csvWriter = createCsvWriter(outputFile);

  const records = await readInputFile(inputFile);
  await csvWriter.writeRecords(records);
  console.log(`Meta descriptions saved to ${outputFile}`);
}

function parseCommandLineArguments() {
  return yargs(hideBin(process.argv))
    .usage('Usage: $0 -i [input file] -o [output file]')
    .option('i', {
      alias: 'input',
      demandOption: true,
      describe: 'Input CSV file',
      type: 'string',
    })
    .option('o', {
      alias: 'output',
      default: 'metadescriptions.csv',
      describe: 'Output CSV file',
      type: 'string',
    })
    .option('overwrite', {
      describe: 'Overwrite the existing output file if it exists',
      type: 'boolean',
    })
    .argv;
}

async function checkOutputFile(outputFile, overwrite) {
  try {
    await fsPromises.access(outputFile, fs.constants.F_OK);

    if (overwrite) {
      console.log(`Output file ${outputFile} will be overwritten.`);
      return outputFile;
    } else {
      let counter = 1;
      let newOutputFile;

      do {
        newOutputFile = path.join(
          path.dirname(outputFile),
          path.basename(outputFile, path.extname(outputFile)) + `-${counter}` + path.extname(outputFile)
        );
        counter++;
      } while (await fileExists(newOutputFile));

      console.log(`Output file ${outputFile} already exists. Using ${newOutputFile} instead.`);
      return newOutputFile;
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Output file ${outputFile} does not exist.`);
      return outputFile;
    } else {
      throw err;
    }
  }
}

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
}

function createCsvWriter(outputFile) {
  return createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'permalink', title: 'URL' },
      { id: 'title', title: 'Title' },
      { id: 'metaDescription', title: 'Meta Description' }
    ]
  });
}

async function readInputFile(inputFile) {
  const records = [];
  const readStream = fs.createReadStream(path.resolve(inputFile)).pipe(csvParser());
  const processingPromises = [];

  return new Promise((resolve, reject) => {
    let index = 0;
    readStream.on('data', (row) => {
      processingPromises.push(processData(row, records, index));
      index++;
    });

    readStream.on('end', async () => {
      try {
        await Promise.all(processingPromises);
        resolve(records);
      } catch (err) {
        reject(err);
      }
    });

    readStream.on('error', (err) => {
      reject(err);
    });
  });
}

async function processData(row, records, index) {
  try {
    const { Id, Title, Content, Categories, Tags, Permalink } = row;
    console.log(`Processing post: ${Title}`);
    const metaDescription = await generateMetaDescription(Title, Content, Categories, Tags);
    records[index] = { permalink: Permalink, title: Title, metaDescription };
    records.push({ id: Id, permalink: Permalink, title: Title, metaDescription });
  } catch (err) {
    throw new Error(`Error processing ${row.Title}: ${err}`);
  }
}

processPosts();
