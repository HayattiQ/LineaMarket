/* eslint-disable dot-notation */
import axios from "axios";

const { createObjectCsvWriter } = require('csv-writer');
const csvfilepath = './message.csv'


async function main() {
  let cursor = await fetch("");
  while (cursor) {
    cursor = await fetch(cursor);
  }
}

async function fetch(cursor: string) {
  const csvWriter = createObjectCsvWriter({
    path: csvfilepath,
    header: [
      { id: 'token_address', title: "token_address" },
      { id: 'token_id', title: "token_id" },
      { id: 'amount', title: "amount" },
      { id: 'owner_of', title: "owner_of" },
    ],
    encoding: 'utf8',
    append: true, // append : no header if true
  });
  const options = {
    method: 'GET',
    url: 'https://deep-index.moralis.io/api/v2/nft/0xbdb33a64b8add9bd95cf41fb8489d6967dd31b3b/2/owners',
    params: {
      chain: 'polygon',
      format: 'decimal',
      "limit": 100,
      "cursor": cursor
    },
    headers: {
      'accept': 'application/json',
      "X-API-Key": process.env["MORALIS_KEY"] || ""
    }
  };

  const response = await axios.request(options);
  console.log(response.data.result);
  const records = response.data.result
    .map((r: any) => {
      return {
        "token_address": r.token_address,
        "token_id": r.token_id,
        "amount": r.amount,
        "owner_of": r.owner_of,
      }
    });
  await csvWriter.writeRecords(records);

  await wait(5000);
  return response.data.cursor;
}

main();

const wait = async (ms: number | undefined) => new Promise(resolve => setTimeout(resolve, ms));