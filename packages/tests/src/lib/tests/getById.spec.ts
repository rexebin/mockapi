import axios from 'axios';
import { baseUrl } from '../server/server';
import { todoKey } from '../entities';

describe('Get Item By Id Endpoint', function () {
  it('should get todo by id', async function () {
    const data = await axios.get(`${baseUrl}/${todoKey}/1`);
    expect(data.data).toMatchInlineSnapshot(`
      Object {
        "completed": false,
        "id": "1",
        "title": "Todo 1",
      }
    `);
  });

  it('should throw 404 if not found', async function () {
    const data = await axios.get(`${baseUrl}/${todoKey}/1`);
    expect(data.data).toMatchInlineSnapshot(`
      Object {
        "completed": false,
        "id": "1",
        "title": "Todo 1",
      }
    `);

    try {
      await axios.get(`${baseUrl}/${todoKey}/4`);
    } catch (e: any) {
      expect(e.response.status).toBe(404);
      expect(e.response.data).toMatchInlineSnapshot(`
        Object {
          "detail": "No Todo found with id 4",
        }
      `);
    }
  });
});
