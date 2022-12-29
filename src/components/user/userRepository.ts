import { User } from './userEntity';

class UserRepository {
    private users: User[] = [];

    public findAll(): User[] {
        return this.users;
    }

    public findById(id: string): User | undefined {
        return this.users.find((user) => user.getId() === id);
    }

    public create(user: User): User {
        this.users.push(user);

        return user;
    }

    public delete(id: string): void {
        this.users = this.users.filter((user) => user.getId() !== id);
    }

    public clearAll(): void {
        this.users = [];
    }
}

const userRepository = new UserRepository();

export { userRepository };
