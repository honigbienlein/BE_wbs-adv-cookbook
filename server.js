/* import * as pg from 'pg'

const { Pool } = pg

const pool = new Pool({
    user: 'psuer',
    host: 'localhost',
    database: 'pdb',
    password: 'myPassword123!',
    port: 5432,
}); */

import express from "express";
import data from "./data.json" assert {type: "json"};

const app = express();
const port = 8000;

app.get('/', (req, res) => {
    res.send('Wenn du schlau bist und die richtige Route wählst, bekommst du ein json zurück.')
})

app.get('/data', (req, res) => {
    res.json(data)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});