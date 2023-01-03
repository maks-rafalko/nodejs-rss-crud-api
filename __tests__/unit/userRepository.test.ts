import { User } from '../../src/components/user/userEntity';
import { InMemoryDatabase } from '../../src/framework/data-storage/InMemoryDatabase';
import { UserRepository } from '../../src/components/user/userRepository';

describe('UserRepository', () => {
    describe('with InMemoryDatabase', () => {
        it('updates the user', async () => {
            const userRepository = new UserRepository(new InMemoryDatabase<User>());
            await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const user2 = await userRepository.create(new User('Nick', 13, ['programming']));

            const updatedUser = await userRepository.update(user2.id, {
                username: 'Updated Username',
                age: 14,
                hobbies: ['programming', 'reading'],
            });

            expect(updatedUser.username).toBe('Updated Username');
            const allUsers = await userRepository.findAll();
            expect(allUsers.length).toBe(2);
            expect(allUsers[1]!.username).toBe('Updated Username');
        });
    });
});
