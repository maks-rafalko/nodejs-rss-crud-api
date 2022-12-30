import cluster from 'node:cluster';
import { cpus } from 'node:os';
import process from 'node:process';
import http from 'node:http';
import url from 'node:url';
import { createApplication } from './Application';
import { assertNonNullish } from './asserts';

const cpuCount = cpus().length;

// TODO parse from .env
// todo gitignore .env, add .env.example
// todo move users var out from repository
// todo magic strings - get rid of them
// todo add test for syntax error
// todo add test and send just "invalid_data"
const startPort = 4000;
let requestIteration = 0;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died, restarting...`);

        cluster.fork();
    });

    cluster.on('listening', (worker, address) => {
        console.log(
            `A worker (ID=${worker.id}) is now connected to ${address.address ?? ''}:${address.port}`,
        );
    });

    http.createServer((balancerRequest, balancerResponse) => {
        requestIteration = requestIteration === cpuCount ? 1 : requestIteration + 1;
        const nextPortForLoadBalanceRequest = startPort + requestIteration;

        assertNonNullish(balancerRequest.url, 'URL must not be nullish.');

        const options = {
            ...url.parse(balancerRequest.url),
            port: nextPortForLoadBalanceRequest,
            headers: balancerRequest.headers,
            method: balancerRequest.method,
            // options.agent = false; todo ???????
        };

        balancerRequest.pipe(
            http.request(options, (response) => {
                balancerResponse.writeHead(response.statusCode!, response.headers);
                response.pipe(balancerResponse);
            }),
        );
    }).listen(startPort);
} else {
    createApplication().listen(startPort + cluster.worker!.id);

    console.log(`Worker ${process.pid} started`);
}
