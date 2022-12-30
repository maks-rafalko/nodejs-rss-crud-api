import { User } from './userEntity';
import { IDataStorage } from '../../framework/IDataStorage';
import { InMemoryDatabase } from '../../framework/InMemoryDatabase';

class UserRepository {
    private dataStorage: IDataStorage<User>;

    constructor() {
        this.dataStorage = new InMemoryDatabase<User>();
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

const userRepository = new UserRepository();

export { userRepository };
