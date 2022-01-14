import { baseUrl, repositoryFactory } from '../server/server';
import { Todo, todoKey, todoSeeds } from '../entities';
import { requestErrorResponse } from '@mockapi/msw';
import axios from 'axios';

describe('Edit Item Endpoint', function () {
  const repository = repositoryFactory<Todo>(todoKey);
  it('should edit todo', async function () {
    const { data: existingTodos } = repository.getItems();
    expect(existingTodos).toMatchObject(todoSeeds);

    await axios.put(`${baseUrl}/${todoKey}/1`, {
      id: '1',
      title: 'Todo 1 (edited)',
      completed: false,
    });

    const { data: editedTodos } = repository.getItems();
    expect(editedTodos).toMatchObject([
      {
        id: '1',
        title: 'Todo 1 (edited)',
        completed: false,
      },
      {
        id: '2',
        title: 'Todo 2',
        completed: false,
      },
      {
        id: '3',
        title: 'Todo 3',
        completed: false,
      },
    ]);
  });

  it('should show error if item not found', async function () {
    try {
      await axios.put(`${baseUrl}/${todoKey}/4`, {
        id: '4',
        title: 'Todo 4 (edited)',
        completed: false,
      });
    } catch (e: any) {
      expect(e.response.status).toBe(404);
      expect(e.response.data).toMatchInlineSnapshot(`
        Object {
          "detail": "No Todo of id 4 found",
        }
      `);
    }
  });

  it('should show error on request', async function () {
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
