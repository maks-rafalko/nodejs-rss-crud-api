import * as http from 'node:http';
import * as dotenv from 'dotenv';
import { someFunc } from './router';

dotenv.config();

// todo add dev/prod error handling
// todo add typescript config

http
    .createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });

        console.log(req.url);

        someFunc();

        res.end('Hello World');
    })
    .listen(process.env['PUBLISHING_PORT']);