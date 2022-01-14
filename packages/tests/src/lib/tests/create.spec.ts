import { baseUrl, repositoryFactory } from '../server/server';
import { Todo, todoKey, todoSeeds } from '../entities';
import axios from 'axios';
import { requestErrorResponse } from '@mockapi/msw';

describe('Create Item', function () {
  const repository = repositoryFactory<Todo>(todoKey);
  it('should add new todo', async function () {
    const { data: existingTodos } = repository.getItems();
    expect(existingTodos).toMatchObject(todoSeeds);

    await axios.post(`${baseUrl}/${todoKey}`, {
      id: '4',
      title: 'Todo 4',
      completed: false,
    });

    const { data: newTodos } = repository.getItems();
    expect(newTodos).toMatchObject([
      ...todoSeeds,
      {
        completed: false,
        id: '4',
        title: 'Todo 4',
      },
    ]);

    requestErrorResponse();

    try {
      await axios.post(`${baseUrl}/${todoKey}`, {
        id: '4',
        title: 'Todo 4',
        completed: false,
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data).toMatchInlineSnapshot(`
        Object {
          "detail": "Something Went Wrong on The Server",
        }
      `);
    }
  });

  it('should throw error on request', async function () {
    requestErrorResponse();

    try {
      await axios.post(`${baseUrl}/${todoKey}`, {
        id: '4',
        title: 'Todo 4',
        completed: false,
      });
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response.data).toMatchInlineSnapshot(`
        Object {
          "detail": "Something Went Wrong on The Server",
        }
      `);
    }
  });
});
