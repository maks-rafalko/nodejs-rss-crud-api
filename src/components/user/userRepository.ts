import cluster from 'node:cluster';
import { User } from './userEntity';
import { IDataStorage } from '../../framework/data-storage/IDataStorage';
import { InMemoryDatabase } from '../../framework/data-storage/InMemoryDatabase';
import { MasterProcessDatabase } from '../../framework/data-storage/MasterProcessDatabase';

class UserRepository {
    private dataStorage: IDataStorage<User>;

    constructor(dataStorage: IDataStorage<User>) {
        this.dataStorage = dataStorage;
    }

    public async findAll(): Promise<User[]> {
        return this.dataStorage.getAll();
    }

    public async findById(id: string): Promise<User | undefined> {
        return this.dataStorage.get('id', id);
    }

    public async create(user: User): Promise<User> {
        await this.dataStorage.add(user);

        return user;
    }

    public async delete(id: string): Promise<void> {
        await this.dataStorage.remove('id', id);
    }

    public async clearAll(): Promise<void> {
        await this.dataStorage.clear();
    }
}

const dataStorage = cluster.isWorker ? new MasterProcessDatabase() : new InMemoryDatabase<User>();

const userRepository = new UserRepository(dataStorage);

export { userRepository };
