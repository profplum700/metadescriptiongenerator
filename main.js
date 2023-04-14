const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { generateMetaDescription } = require('./generateMetaDescription');

const argv = yargs(hideBin(process.argv))
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
  .argv;

const inputFile = argv.input;
const outputFile = argv.output;

const fsPromises = fs.promises;

async function processPosts() {
  try {
    await fsPromises.access(outputFile, fs.constants.F_OK);
    console.log(`Output file ${outputFile} already exists. Checking if it's locked...`);
    try {
      const fileHandle = await fsPromises.open(outputFile, 'r+', fs.constants.O_EXCL);
      console.log('The output file is not locked.');
      await fileHandle.close();
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EACCES') {
        throw new Error(`The output file ${outputFile} is locked or in use.`);
      } else {
        throw err;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    console.log(`Output file ${outputFile} does not exist.`);
  }
  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: 'title', title: 'Title' },
      { id: 'metaDescription', title: 'Meta Description' },
    ],
  });

  const records = [];

  const processData = (row) => {
    return new Promise(async (resolve, reject) => {
      try {
        const title = row.Title;
        const content = row.Content;
        const categories = row.Categories;
        const tags = row.Tags;
        console.log(`Processing post: ${title}`);
        const metaDescription = await generateMetaDescription(title, content, categories, tags);
        records.push({ title, metaDescription });
        resolve();
      } catch (err) {
        reject(`Error processing ${row.Title}: ${err}`);
      }
    });
  };

  const readStream = fs.createReadStream(path.resolve(inputFile)).pipe(csvParser());

  const promises = [];
  readStream.on('data', (row) => {
    promises.push(processData(row));
  });

  readStream.on('end', async () => {
    try {
      await Promise.all(promises);
      await csvWriter.writeRecords(records);
      console.log(`Meta descriptions saved to ${outputFile}`);
    } catch (err) {
      console.error('Error writing output file:', err);
    }
  });
}

processPosts();