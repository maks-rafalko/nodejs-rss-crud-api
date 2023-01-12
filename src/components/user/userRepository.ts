import cluster from 'node:cluster';
import { User } from './userEntity';
import { IDataStorage } from '../../framework/data-storage/IDataStorage';
import { InMemoryDatabase } from '../../framework/data-storage/InMemoryDatabase';
import { MasterProcessDatabase } from '../../framework/data-storage/MasterProcessDatabase';
import { UpdateUserDto } from './userDto';

class UserRepository {
    private dataStorage: IDataStorage<User>;

    constructor(dataStorage: IDataStorage<User>) {
        this.dataStorage = dataStorage;
    }

    public async findAll(): Promise<User[]> {
        return await this.dataStorage.getAll();
    }

    public async findById(id: string): Promise<User | undefined> {
        return await this.dataStorage.get('id', id);
    }

    public async create(user: User | Record<keyof User, any>): Promise<User> {
        const userEntity = user instanceof User
            ? user
            : User.fromRawObject(user);

        await this.dataStorage.add(userEntity);

        return userEntity;
    }

    public async update(id: string, userDto: UpdateUserDto): Promise<User> {
        return await this.dataStorage.update('id', id, new User(userDto.username, userDto.age, userDto.hobbies, id));
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

export { userRepository, UserRepository };
