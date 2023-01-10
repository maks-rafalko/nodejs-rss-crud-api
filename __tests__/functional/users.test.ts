import supertest from 'supertest';
import { constants as httpConstants } from 'node:http2';
import { validate as validateUuid, v4 as uuidv4 } from 'uuid';
import { CreateUserDto, UpdateUserDto } from '../../src/components/user/userDto';
import { userRepository } from '../../src/components/user/userRepository';
import { User } from '../../src/components/user/userEntity';
import { EXCEPTION_MESSAGE_INVALID_JSON } from '../../src/framework/exceptionHandler';
import { createSingleNodeApplication } from '../../src/framework/singleNodeApplicationCreator';
import { omit } from '../../src/framework/extended-functions-api/omit';

const app = createSingleNodeApplication();
const request = supertest(app.createServer('http://localhost'));

beforeEach(() => {
    // each test should start with an empty repository
    // to avoid test-cases dependencies
    userRepository.clearAll();
});

describe('Users Model', () => {
    describe('Multi-step scenarios', () => {
        it('Scenario 1: create, update, get, delete a user', async () => {
            // action
            const response1 = await request.get('/api/users');

            expect(response1.body).toHaveLength(0);

            // action
            const createUserDto: CreateUserDto = {
                username: 'John',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response2 = await request.post('/api/users').send(createUserDto);

            expect(response2.status).toBe(httpConstants.HTTP_STATUS_CREATED);
            const createdUserId = response2.body.id;

            // action
            const response3 = await request.get(`/api/users/${createdUserId}`);
            expect(response3.body.username).toBe('John');

            // action
            const updateUserDto: UpdateUserDto = {
                username: 'John Doe',
                age: 13,
                hobbies: ['programming'],
            };

            const response4 = await request.put(`/api/users/${createdUserId}`).send(updateUserDto);

            expect(response4.body).toEqual({
                id: createdUserId,
                username: 'John Doe',
                age: 13,
                hobbies: ['programming'],
            });

            // action
            await request.delete(`/api/users/${createdUserId}`);

            // action
            const response5 = await request.get(`/api/users/${createdUserId}`);
            expect(response5.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND);
        });

        it('Scenario 2: id of removed users are not reused', async () => {
            // action
            const createUserDto1: CreateUserDto = {
                username: 'John 1',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response1 = await request.post('/api/users').send(createUserDto1);
            const createdUser1Id = response1.body.id;

            // action
            const createUserDto2: CreateUserDto = {
                username: 'John 2',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response2 = await request.post('/api/users').send(createUserDto2);
            const createdUser2Id = response2.body.id;

            // action
            await request.delete(`/api/users/${createdUser1Id}`);
            await request.delete(`/api/users/${createdUser1Id}`);

            // action
            const createUserDto3: CreateUserDto = {
                username: 'John 3',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response3 = await request.post('/api/users').send(createUserDto3);
            const createdUser3Id = response3.body.id;

            expect(createdUser3Id).not.toBe(createdUser1Id);
            expect(createdUser3Id).not.toBe(createdUser2Id);
        });

        it('Scenario 3: updating deleted user leads to 404', async () => {
            // action
            const createUserDto1: CreateUserDto = {
                username: 'John 1',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response1 = await request.post('/api/users').send(createUserDto1);
            const createdUserId = response1.body.id;

            // action
            await request.delete(`/api/users/${createdUserId}`);

            // action
            const updateUserDto: UpdateUserDto = {
                username: 'John 1 Edited',
                age: 13,
                hobbies: ['programming'],
            };

            const response2 = await request.put(`/api/users/${createdUserId}`).send(updateUserDto);

            expect(response2.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND);
        });

        it('Scenario 4: incorrect usage of HTTP verbs is not allowed', async () => {
            // action - trying to create user
            const createUserDto1: CreateUserDto = {
                username: 'John 1',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };
            const response1 = await request.post('/api/users/123').send(createUserDto1);
            expect(response1.status).toBe(httpConstants.HTTP_STATUS_METHOD_NOT_ALLOWED);

            // action - trying to update a user
            const response2 = await request.put('/api/users').send(createUserDto1);
            expect(response2.status).toBe(httpConstants.HTTP_STATUS_METHOD_NOT_ALLOWED);

            // action - trying to delete a user
            const response3 = await request.delete('/api/users');
            expect(response3.status).toBe(httpConstants.HTTP_STATUS_METHOD_NOT_ALLOWED);
        });
    });

    describe('POST /users', () => {
        it('creates a new user', async () => {
            const createUserDto: CreateUserDto = {
                username: 'John',
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_CREATED);
            expect(validateUuid(response.body.id)).toBeTruthy();

            const userWithoutId = omit(response.body, 'id');

            expect(userWithoutId).toEqual(createUserDto);

            const allUsers = await userRepository.findAll();
            expect(allUsers.length).toEqual(1);
        });

        it('returns 400 when username is missing', async () => {
            const createUserDto = {
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            const allUsers = await userRepository.findAll();
            expect(allUsers.length).toEqual(0);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'username',
                        message: 'Property username is required.',
                    },
                ],
            });
        });

        it('returns 400 when age is missing', async () => {
            const createUserDto = {
                username: 'Test',
                hobbies: ['hiking', 'reading'],
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'age',
                        message: 'Property age is required.',
                    },
                ],
            });
        });

        it('returns 400 when hobbies is missing', async () => {
            const createUserDto = {
                username: 'Test',
                age: 1,
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'hobbies',
                        message: 'Property hobbies is required.',
                    },
                ],
            });
        });

        it('returns 400 when hobbies contains not all string values', async () => {
            const createUserDto = {
                username: 'Test',
                age: 1,
                hobbies: ['hiking', 1],
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'hobbies[1]',
                        message: 'Property hobbies[1] must be of type string.',
                    },
                ],
            });
        });

        it('returns 400 when hobbies is null', async () => {
            const createUserDto = {
                username: 'Test',
                age: 1,
                hobbies: null,
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'hobbies',
                        message: 'Property hobbies is required.',
                    },
                ],
            });
        });

        it('returns 400 when request has extra properties', async () => {
            const createUserDto = {
                username: 'Test',
                age: 1,
                hobbies: [],
                extra1: 'extra1',
                extra2: [],
                extra3: {},
            };

            const response = await request.post('/api/users').send(createUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: '__root__',
                        message: 'Model has extra keys: extra1, extra2, extra3.',
                    },
                ],
            });
        });

        it('returns 400 when request has invalid json', async () => {
            const response = await request.post('/api/users').send('invalid json');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({ message: EXCEPTION_MESSAGE_INVALID_JSON });
        });
    });

    describe('GET /users', () => {
        it('returns 0 users at the start of the application', async () => {
            const response = await request.get('/api/users');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);
            expect(response.body).toHaveLength(0);
        });

        it('returns existing users from the database', async () => {
            await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            await userRepository.create(new User('Nick', 13, ['programming']));

            const response = await request.get('/api/users');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);
            expect(response.body).toHaveLength(2);
        });

        it('returns existing users with search query', async () => {
            await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            await userRepository.create(new User('Nick', 13, ['programming']));

            const response = await request.get('/api/users?search=John');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);
            expect(response.body).toHaveLength(2);
        });

        it('returns existing users with leading slash', async () => {
            await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            await userRepository.create(new User('Nick', 13, ['programming']));

            const response = await request.get('/api/users/');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);
            expect(response.body).toHaveLength(2);
        });
    });

    describe('GET /users/:id', () => {
        it('returns 404 when user does not exist', async () => {
            const response = await request.get(`/api/users/${uuidv4()}`);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND);
        });

        it('returns existing user from the database', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));

            const response = await request.get(`/api/users/${user.getId()}`);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);
            expect(response.body).toEqual(user);
        });

        it('returns existing user from the database with trailing slash', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));

            const response = await request.get(`/api/users/${user.getId()}/`);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);
            expect(response.body).toEqual(user);
        });
    });

    describe('PUT /users/:id', () => {
        it('updates existing user', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));

            const updateUserDto: UpdateUserDto = {
                username: 'Nick',
                age: 13,
                hobbies: ['programming'],
            };

            const response = await request.put(`/api/users/${user.getId()}`).send(updateUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_OK);

            const userWithoutId = omit(response.body, 'id');

            expect(userWithoutId).toEqual(updateUserDto);
            expect(user.getId()).toEqual(response.body.id);
        });

        it('returns 404 when user does not exist', async () => {
            const response = await request.put(`/api/users/${uuidv4()}`);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND);
        });

        it('returns 400 when id is not a valid uuid', async () => {
            const response = await request.put('/api/users/invalid-uuid');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                message: 'Invalid UUID.',
            });
        });

        it('returns 400 when username is missing', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const updateUserDto = {
                age: 20,
                hobbies: ['hiking', 'reading'],
            };

            const response = await request.put(`/api/users/${user.getId()}`).send(updateUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'username',
                        message: 'Property username is required.',
                    },
                ],
            });
        });

        it('returns 400 when age is missing', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const updateUserDto = {
                username: 'Test',
                hobbies: ['hiking', 'reading'],
            };

            const response = await request.put(`/api/users/${user.getId()}`).send(updateUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'age',
                        message: 'Property age is required.',
                    },
                ],
            });
        });

        it('returns 400 when hobbies is missing', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const updateUserDto = {
                username: 'Test',
                age: 1,
            };

            const response = await request.put(`/api/users/${user.getId()}`).send(updateUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'hobbies',
                        message: 'Property hobbies is required.',
                    },
                ],
            });
        });

        it('returns 400 when hobbies contains not all string values', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const updateUserDto = {
                username: 'Test',
                age: 1,
                hobbies: ['hiking', 1],
            };

            const response = await request.put(`/api/users/${user.getId()}`).send(updateUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'hobbies[1]',
                        message: 'Property hobbies[1] must be of type string.',
                    },
                ],
            });
        });

        it('returns 400 when hobbies is null', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const updateUserDto = {
                username: 'Test',
                age: 1,
                hobbies: null,
            };

            const response = await request.put(`/api/users/${user.getId()}`).send(updateUserDto);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                violations: [
                    {
                        property: 'hobbies',
                        message: 'Property hobbies is required.',
                    },
                ],
            });
        });
    });

    describe('DELETE /users/:id', () => {
        it('deletes an existing user', async () => {
            const user = await userRepository.create(new User('John', 20, ['hiking', 'reading']));
            const allUsers = await userRepository.findAll();
            expect(allUsers.length).toEqual(1);

            const response = await request.delete(`/api/users/${user.getId()}`);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_NO_CONTENT);
            const allUsersAfterChanges = await userRepository.findAll();
            expect(allUsersAfterChanges.length).toEqual(0);
        });

        it('returns 404 when user does not exist', async () => {
            const response = await request.delete(`/api/users/${uuidv4()}`);

            expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND);
            expect(response.body).toEqual({
                message: 'User not found.',
            });
        });

        it('returns 400 when id is not a valid uuid', async () => {
            const response = await request.delete('/api/users/invalid-uuid');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_BAD_REQUEST);
            expect(response.body).toEqual({
                message: 'Invalid UUID.',
            });
        });
    });

    describe('GET /non-existing-route', () => {
        it('returns 404', async () => {
            const response = await request.get('/api/non-existing-route');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_NOT_FOUND);
        });
    });

    describe('Not allowed method for existing route', () => {
        it('returns 405', async () => {
            const response = await request.put('/api/users');

            expect(response.status).toBe(httpConstants.HTTP_STATUS_METHOD_NOT_ALLOWED);
        });
    });
});
