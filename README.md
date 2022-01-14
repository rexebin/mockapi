# MockAPI

## The problem

Inspired by Kent C Dodds's blog post [Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch), I started to
use [Mock Service Worker](https://mswjs.io/) to mock an API server both for unit testing with `jest` and for the
Browser.

However, just like developing a real API server, writing every endpoint is tedious, and it can get messy very quickly.

`@mockapi/msw` is born to solve this problem. With `@mockapi/msw`, you can mock a whole set of standard CRUD endpoints for any entity without any code. All you have to do is configure your base URL and wire it up with `msw`.

## Endpoints Provided

1. **GET**: `baseUrl/entity`, get all entities
2. **GET**: `baseUrl/entity/:id`, get an entity by id
3. **POST**: `baseUrl/entity`, create an entity
4. **PUT**: `baseUrl/entity/:id`, update an entity
5. **DELETE**: `baseUrl/entity/:id`, delete an entity

You can override the above endpoints by providing handlers with identical signatures.

You can extend the endpoints by wiring up your endpoints.

## Setup

### Install `@mockapi/msw`

```bash
yarn add --dev @mockapi/msw
```

or

```bash
npm install --dev @mockapi/msw
```

### Configure `@mockapi/msw`

1. Create a typescript file with the following content:

```typescript
// server.ts
import {configMockApi} from '@mockapi/msw';

export const baseUrl = 'http://localhost:5000'; // change to your own base url

export const {handlerFactory, repositoryFactory, clearAllData} = configMockApi({
  baseUrl: baseUrl,
});
```

- `handlerFactory` is the function to generate and wire up all the endpoints.
- `repositoryFactory` is the function to access mocked data in your custom endpoints and tests.
- `configMockApi` takes a `store` of type `Store<T extends BaseEntity>` as an argument to configure what storage the mocked data will be stored. By default, it uses `localStorage`. You can also use [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) or [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store the data.

 ```typescript
// Store.ts
export type Store<T extends BaseEntity> = {
  setItem: (key: string, value: T[]) => void;
  getItem: (key: string) => T[] | null;
  clearAll: () => void;
};

// BaseEntity.ts
export interface BaseEntity extends Record<string, unknown> {
  id: string | number;
}
```

2. Create your mock entity:

```typescript
// hero.ts
import {repositoryFactory} from '../server/server';

export type Hero = {
  id: string;
  name: string;
};

export const heroKey = 'Hero';

export const heroSeeds: Hero[] = [
  {
    id: '1',
    name: 'Iron Man',
  },
  {
    id: '2',
    name: 'Spider Man',
  },
  {
    id: '3',
    name: 'Ant Man',
  },
];

export function seedHeroes() {
  const repository = repositoryFactory<Hero>(heroKey);
  repository.seed(heroSeeds);
}


```

3. Optional: extend endpoints and override provided endpoints. You can skip this step if you don't need to extend or override the endpoints.

The `handlerFactory` takes a second parameter of type `RestHandler[]`, which will take precedence over the provided endpoints.

```typescript
// heroHandler.ts
import {getDefaultGetItemsResponse} from '@mockapi/msw';

import {Hero, heroKey} from './hero';
import {rest} from 'msw';
import {baseUrl, repositoryFactory} from '../server/server';

export const heroHandlers = [
  // override:  GET: `baseUrl/hero`
  rest.get(`${baseUrl}/${heroKey}`, (req, res, ctx) => {
    // getDefaultGetItemsResponse is a utility function to get items from the store and return a Result<T[]> containing either an error response or all the items in store.
    const defaultHttpResponse = getDefaultGetItemsResponse<Hero>(
      heroKey,
      repositoryFactory<Hero>(heroKey)
    )(res, ctx);
    if (defaultHttpResponse.response) {
      return defaultHttpResponse.response;
    }

    const search = req.url.searchParams.get('search');
    const result = defaultHttpResponse.data.filter((hero) =>
      search ? hero.name.toLowerCase().includes(search?.toLowerCase()) : true
    );

    return res(ctx.status(200), ctx.json(result));
  }),

  // new endpoint:  GET: `baseUrl/hero/getByName/:name`
  rest.get(`${baseUrl}/${heroKey}/getByName/:name`, (req, res, ctx) => {
    const defaultHttpResponse = getDefaultGetItemsResponse<Hero>(
      heroKey,
      repositoryFactory<Hero>(heroKey)
    )(res, ctx);
    if (defaultHttpResponse.response) {
      return defaultHttpResponse.response;
    }

    const {name} = req.params;

    const result = defaultHttpResponse.data.find((hero) => hero.name === name);

    return res(ctx.status(200), ctx.json(result));
  }),
];


```

4. Wire up with Mock Service Work for `jest`. For browser integration, read the msw doc [here](https://mswjs.io/docs/getting-started/integrate/browser).

```typescript
//starup.ts
import {setupServer} from 'msw/node';
import {
  heroHandlers,
  heroKey,
  seedHeroes
} from '../entity';
import {clearAllData, handlerFactory} from './server';

const handlers = [
  ...handlerFactory(heroKey, heroHandlers),
  // other endpoints, for example:
  //...handlerFactory(todoKey),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());

beforeEach(() => {
  seedHeroes();
  // other data seeding, for example:
  //seedTodos();
});

afterEach(() => {
  clearAllData();
  server.resetHandlers();
});

afterAll(() => server.close());

```

4. Wire up with `jest`

```typescript
//jest.setup.ts
import './src/lib/server/startup';

```

```javascript
//jest.config.js
module.exports = {
  //other configurations
  //...
  setupFilesAfterEnv: ['./jest.setup.ts']
};
```

## Usage

If set up correctly, you can use the mock data in your tests like the below example. For more examples, please check out `/packages/tests`.

```typescript
// getAll.spec.ts
import {baseUrl} from '../server/server';
import {todoKey, todoSeeds} from '../entities';
import axios from 'axios';
import {requestErrorResponse} from '@mockapi/msw';

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

```

### Error Response

You can use the provided `requestErrorResponse` function to tell the mocked endpoint to return an error response blindly. To make `requestErrorResponse` work for your endpoints, you need to add the following code to your endpoint before any other code:

```typescript
rest.get(`${baseUrl}/your-endpoint`, (req, res, ctx) => {
  const errorResponse = getErrorResponse(res, ctx);
  if (errorResponse) {
    return {response: errorResponse, data: []};
  }
  // do your stuff
});
```

For your information, the code for `getErrorResponse` is as below. You can implement your own if you want.

```typescript
// getErrorResponse.ts
import {DefaultRequestBody, ResponseComposition, RestContext} from 'msw';

const errorKey = '400';

export function requestErrorResponse() {
  localStorage.setItem(errorKey, 'true');
}

export function getErrorResponse(res: ResponseComposition<DefaultRequestBody>, ctx: RestContext) {
  if (localStorage.getItem(errorKey)) {
    return res(
      ctx.status(400),
      ctx.json({
        detail: 'Something Went Wrong on The Server',
      })
    );
  }
  return;
}


```



