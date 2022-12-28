import { User } from './userEntity';

class UserRepository {
    private users: User[] = [];

    public findAll(): User[] {
        return this.users;
    }

    public findById(id: string): User | undefined {
        return this.users.find((user) => user.getId() === id);
    }

    public create(user: User): void {
        this.users.push(user);
    }

    public delete(id: string): void {
        this.users = this.users.filter((user) => user.getId() !== id);
    }
}

const userRepository = new UserRepository();

export { userRepository };
