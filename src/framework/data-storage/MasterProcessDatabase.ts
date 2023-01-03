import process from 'node:process';
import cluster from 'node:cluster';
import { IDataStorage } from './IDataStorage';
import { assertNonNullish } from '../../asserts';
import { User } from '../../components/user/userEntity';

class MasterProcessDatabase implements IDataStorage<User> {
    public async get(key: keyof User, value: any): Promise<User | undefined> {
        const rawUserObject = await this.sendCommandToMasterProcess('findById', { [key]: value });

        if (!rawUserObject) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(User.fromRawObject(rawUserObject));
    }

    public async add(item: User): Promise<void> {
        await this.sendCommandToMasterProcess('create', { item });
    }

    public async remove(key: keyof User, value: any): Promise<void> {
        await this.sendCommandToMasterProcess('delete', { [key]: value });
    }

    public async clear(): Promise<void> {
        return this.sendCommandToMasterProcess('clearAll');
    }

    public async getAll(): Promise<User[]> {
        return this.sendCommandToMasterProcess('findAll');
    }

    private async sendCommandToMasterProcess(cmd: string, parameters: object = {}): Promise<any> {
        assertNonNullish(process.send, '`process.send` must not be nullish.');

        return new Promise((resolve, reject) => {
            process.send!({ cmd, parameters });

            cluster.worker!.once('message', (msg) => {
                if (msg.cmd === cmd) {
                    resolve(msg.data);
                } else {
                    reject(msg);
                }
            });
        });
    }
}

export { MasterProcessDatabase };
