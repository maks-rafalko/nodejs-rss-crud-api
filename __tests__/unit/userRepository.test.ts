import { User } from '../../src/components/user/userEntity';
import { InMemoryDatabase } from '../../src/framework/data-storage/InMemoryDatabase';
import { UserRepository } from '../../src/components/user/userRepository';

describe('UserRepository', () => {
    describe('with InMemoryDatabase', () => {
        it('updates the user when valid data provided', async () => {
            const userRepository = new UserRepository(new InMemoryDatabase<User>());
            const user = await userRepository.create(new User('Nick', 13, ['programming']));

            const updatedUser = await userRepository.update(user.id, {
                username: 'Updated Username',
                age: 14,
                hobbies: ['programming', 'reading'],
            });

            // check response has updated values
            expect(updatedUser.username).toBe('Updated Username');
            // check DB has updated values
            const allUsers = await userRepository.findAll();
            expect(allUsers[0]!.username).toBe('Updated Username');
        });
    });
});
