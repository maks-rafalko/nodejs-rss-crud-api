import process from 'node:process';
import cluster from 'node:cluster';
import { IDataStorage } from './IDataStorage';
import { User } from '../../components/user/userEntity';

class MasterProcessDatabase implements IDataStorage<User> {
    public async get(_: keyof User, value: any): Promise<User | undefined> {
        const rawUserObject = await this.sendCommandToMasterProcess('findById', [value]);

        if (!rawUserObject) {
            return await Promise.resolve(undefined);
        }

        return await Promise.resolve(User.fromRawObject(rawUserObject));
    }

    public async add(item: User): Promise<void> {
        await this.sendCommandToMasterProcess('create', [item]);
    }

    public async update(_: keyof User, value: any, item: User): Promise<User> {
        return await this.sendCommandToMasterProcess('update', [value, item]);
    }

    public async remove(_: keyof User, value: any): Promise<void> {
        await this.sendCommandToMasterProcess('delete', [value]);
    }

    public async clear(): Promise<void> {
        return await this.sendCommandToMasterProcess('clearAll');
    }

    public async getAll(): Promise<User[]> {
        return await this.sendCommandToMasterProcess('findAll');
    }

    private async sendCommandToMasterProcess(method: string, parameters: any[] = []): Promise<any> {
        return await new Promise((resolve, reject) => {
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
