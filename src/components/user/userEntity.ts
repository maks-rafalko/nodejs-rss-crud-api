import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto, UpdateUserDto } from './userDto';

class User {
    public readonly id: string;

    public username: string;

    public age: number;

    public hobbies: string[];

    constructor(username: string, age: number, hobbies: string[], id: string = uuidv4()) {
        this.id = id;
        this.username = username;
        this.age = age;
        this.hobbies = hobbies;
    }

    public getId(): string {
        return this.id;
    }

    public getUsername(): string {
        return this.username;
    }

    public getAge(): number {
        return this.age;
    }

    public getHobbies(): string[] {
        return this.hobbies;
    }

    public updateFromDto(dto: UpdateUserDto): void {
        this.username = dto.username;
        this.age = dto.age;
        this.hobbies = dto.hobbies;
    }

    public static fromDto(dto: CreateUserDto): User {
        return new User(dto.username, dto.age, dto.hobbies);
    }

    public static fromRawObject(rawObject: Record<keyof User, any>): User {
        return new User(rawObject.username, rawObject.age, rawObject.hobbies, rawObject.id);
    }
}

export { User };
