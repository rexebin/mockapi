import { baseUrl } from '../server/server';
import { todoKey, todoSeeds } from '../entities';
import axios from 'axios';
import { requestErrorResponse } from '@mockapi/msw';

describe('Get Items Endpoint', function () {
  it('should get todos', async function () {
    const data = await axios.get(`${baseUrl}/${todoKey}`);
    expect(data.data).toMatchObject(todoSeeds);
  });

  it('should throw error on request', async function () {
    requestErrorResponse();

    try {
      await axios.get(`${baseUrl}/${todoKey}`);
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
