// seed.js
import pkg from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { Readable } from 'stream';
import 'dotenv/config';

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports', 'Toys', 'Grocery', 'Beauty'];
const TOTAL = 200_000;

function randomProduct(i) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const price = (Math.random() * 5000 + 10).toFixed(2);
  const name = `${category} Item ${i}`;
  // COPY's text format: tab-separated values, newline-terminated rows
  return `${name}\t${category}\t${price}\n`;
}

async function seed() {
  console.time('seed');
  const client = await pool.connect();

  const stream = client.query(copyFrom(
    `COPY products (name, category, price) FROM STDIN WITH (FORMAT text)`
  ));

  // Generate rows as a readable stream instead of building one giant string in memory
  let i = 0;
  const rowGenerator = new Readable({
    read() {
      if (i >= TOTAL) {
        this.push(null); // signals end of stream
        return;
      }
      // Push a chunk of rows at a time, not one row per read() call
      let chunk = '';
      const chunkEnd = Math.min(i + 1000, TOTAL);
      for (; i < chunkEnd; i++) {
        chunk += randomProduct(i);
      }
      this.push(chunk);
    }
  });

  await new Promise((resolve, reject) => {
    rowGenerator.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  client.release();
  console.timeEnd('seed');
  await pool.end();
}

seed();