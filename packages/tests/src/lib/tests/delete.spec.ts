import axios from 'axios';
import { Todo, todoKey, todoSeeds } from '../entities';
import { requestErrorResponse } from '@mockapi/msw';
import { baseUrl, repositoryFactory } from '../server/server';

describe('Delete Item Endpoint', function () {
  const repository = repositoryFactory<Todo>(todoKey);

  it('should delete todo by id, throw 404 if not found and throw error on request', async function () {
    const { data: existingTodos } = repository.getItems();
    expect(existingTodos).toMatchObject(todoSeeds);

    await axios.delete(`${baseUrl}/${todoKey}/2`);

    const { data: newTodos } = repository.getItems();
    expect(newTodos).toMatchObject([
      {
        id: '1',
        title: 'Todo 1',
        completed: false,
      },
      {
        id: '3',
        title: 'Todo 3',
        completed: false,
      },
    ]);
  });

  it('should throw 404 if item not found', async function () {
    try {
      await axios.delete(`${baseUrl}/${todoKey}/4`);
    } catch (e: any) {
      expect(e.response.status).toBe(404);
      expect(e.response.data).toMatchInlineSnapshot(`
        Object {
          "detail": "No Todo of id 4 found",
        }
      `);
    }
  });

  it('should throw error on request', async function () {
    requestErrorResponse();

    try {
      await axios.get(`${baseUrl}/${todoKey}/1`);
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
