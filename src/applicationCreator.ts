import { cpus } from 'node:os';
import cluster from 'node:cluster';
import process from 'node:process';
import http from 'node:http';
import url from 'node:url';
import { userRouter } from './userRouter';
import { Application } from './Application';
import { userRepository } from './components/user/userRepository';
import { assertNonNullish } from './asserts';
import * as logger from './framework/logger';

const cpuCount = cpus().length;
let requestIteration = 0;

const getNextPortByRoundRobin = (startPort: number): number => {
    requestIteration = requestIteration === cpuCount ? 1 : requestIteration + 1;

    return startPort + requestIteration;
};

const createApplication = (): Application => {
    const app = new Application();

    app.addRouter(userRouter);

    return app;
};

const enableMasterDatabaseCommunicationWithWorkers = (): void => {
    for (const id in cluster.workers) {
        const worker = cluster.workers[id]!;

        worker.on('message', async (msg) => {
            // @ts-ignore
            if (typeof userRepository[msg.method] === 'function') {
                const parameters = msg.parameters ?? [];
                // @ts-ignore
                const result = await userRepository[msg.method](...parameters);

                worker.send({ method: msg.method, data: result });
            }
        });
    }
};

const createProxyLoadBalancerServer = (startPort: number): void => {
    http.createServer((balancerRequest, balancerResponse) => {
        const nextPortForLoadBalanceRequest = getNextPortByRoundRobin(startPort);

        logger.debug(`Proxying request to port ${nextPortForLoadBalanceRequest}`);

        assertNonNullish(balancerRequest.url, 'URL must not be nullish.');

        const options = {
            ...url.parse(balancerRequest.url),
            port: nextPortForLoadBalanceRequest,
            headers: balancerRequest.headers,
            method: balancerRequest.method,
        };

        balancerRequest.pipe(
            http.request(options, (response) => {
                balancerResponse.writeHead(response.statusCode!, response.headers);
                response.pipe(balancerResponse);
            }),
        );
    }).listen(startPort);
};

const createMultiNodeApplication = (startPort: number): void => {
    if (cluster.isPrimary) {
        logger.debug(`Primary ${process.pid} is running on port ${startPort}. Waiting for workers to start...`);

        for (let cpuIndex = 0; cpuIndex < cpuCount; cpuIndex += 1) {
            cluster.fork();
        }

        cluster.on('exit', () => {
            cluster.fork();
        });

        enableMasterDatabaseCommunicationWithWorkers();

        createProxyLoadBalancerServer(startPort);
    } else {
        const workerPort = startPort + cluster.worker!.id;
        createApplication().listen(workerPort);

        logger.debug(`Worker ${process.pid} started on port ${workerPort}.`);
    }
};

export { createApplication, createMultiNodeApplication };
