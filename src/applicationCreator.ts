import { cpus } from 'node:os';
import cluster from 'node:cluster';
import process from 'node:process';
import http from 'node:http';
import url from 'node:url';
import { userRouter } from './userRouter';
import { Application } from './Application';
import { userRepository } from './components/user/userRepository';
import { User } from './components/user/userEntity';
import { assertNonNullish } from './asserts';

const createApplication = (): Application => {
    const app = new Application();

    app.addRouter(userRouter);

    return app;
};

const createMultiNodeApplication = (startPort: number): void => {
    const cpuCount = cpus().length;

    let requestIteration = 0;

    if (cluster.isPrimary) {
        console.log(`Primary ${process.pid} is running`);

        for (let cpuIndex = 0; cpuIndex < cpuCount; cpuIndex += 1) {
            cluster.fork();
        }

        cluster.on('exit', () => {
            cluster.fork();
        });

        for (const id in cluster.workers) {
            const worker = cluster.workers[id]!;

            worker.on('message', async (msg) => {
                console.log(`Caught on master. Message from worker #${id}: ${JSON.stringify(msg)}, as raw object: ${msg}`);

                if (msg.cmd === 'findById') {
                    const user = await userRepository.findById(msg.parameters.id);

                    worker.send({ cmd: msg.cmd, data: user });
                } else if (msg.cmd === 'create') {
                    const user = await userRepository.create(User.fromRawObject(msg.parameters.item));

                    worker.send({ cmd: msg.cmd, data: user });
                } else if (msg.cmd === 'findAll') {
                    const users = await userRepository.findAll();

                    worker.send({ cmd: msg.cmd, data: users });
                } else if (msg.cmd === 'delete') {
                    await userRepository.delete(msg.parameters.id);

                    worker.send({ cmd: msg.cmd, data: {} });
                } else {
                    worker.send({ cmd: 'from master' });
                }
            });
        }

        http.createServer((balancerRequest, balancerResponse) => {
            requestIteration = requestIteration === cpuCount ? 1 : requestIteration + 1;
            const nextPortForLoadBalanceRequest = startPort + requestIteration;

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
    } else {
        createApplication().listen(startPort + cluster.worker!.id);

        console.log(`Worker ${process.pid} started`);
    }
};

export { createApplication, createMultiNodeApplication };
