import process from 'node:process';
import cluster from 'node:cluster';
import { IDataStorage } from './IDataStorage';
import { User } from '../../components/user/userEntity';
import { UserRepository } from '../../components/user/userRepository';

class MasterProcessDatabase implements IDataStorage<User> {
    public async get(_: keyof User, value: any): Promise<User | undefined> {
        const rawUserObject = await this.sendCommandToMasterProcess('findById', [value]);

        if (!rawUserObject) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(User.fromRawObject(rawUserObject));
    }

    public async add(item: User): Promise<void> {
        await this.sendCommandToMasterProcess('create', [item]);
    }

    public async update(_: keyof User, value: any, item: User): Promise<User> {
        return this.sendCommandToMasterProcess('update', [value, item]);
    }

    public async remove(_: keyof User, value: any): Promise<void> {
        await this.sendCommandToMasterProcess('delete', [value]);
    }

    public async clear(): Promise<void> {
        return this.sendCommandToMasterProcess('clearAll');
    }

    public async getAll(): Promise<User[]> {
        return this.sendCommandToMasterProcess('findAll');
    }

    private async sendCommandToMasterProcess(method: keyof UserRepository, parameters: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            process.send!({ method, parameters });

            cluster.worker!.once('message', (msg) => {
                if (msg.method === method) {
                    resolve(msg.data);
                } else {
                    reject(msg);
                }
            });
        });
    }
}

export { MasterProcessDatabase };
