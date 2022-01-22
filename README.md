# MockAPI

## The problem

Inspired by Kent C Dodds's blog post [Stop mocking fetch](https://kentcdodds.com/blog/stop-mocking-fetch), I started to
use [Mock Service Worker](https://mswjs.io/) to mock an API server both for unit testing with `jest` and for the
Browser.

However, just like developing a real API server, writing every endpoint is tedious, and it can get messy very quickly.

`@mockapi/msw` was born to solve this problem. With `@mockapi/msw`, you can mock a whole set of standard CRUD endpoints
for any entity without any code. All you have to do is configure your base URL and wire it up with `msw`.

## Endpoints Provided

1. **GET**: `baseUrl/entity`, get all entities
2. **GET**: `baseUrl/entity/:id`, get an entity by id
3. **POST**: `baseUrl/entity`, create an entity
4. **PUT**: `baseUrl/entity/:id`, update an entity
5. **DELETE**: `baseUrl/entity/:id`, delete an entity

You can override the above endpoints by providing handlers with identical signatures.

You can also build your own set of CRUD endpoints by building on top of or replacing the `handlerfactory`(introduced
below) using the provided repository methods for data access.

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

#### 1. Create a typescript file with the following content:

```typescript
// server.ts
import {configMockApi} from '@mockapi/msw';

export const baseUrl = 'http://localhost:5000/api/v1'; // change to your own base url

export const {handlerFactory, repositoryFactory, clearAllData} = configMockApi({
  baseUrl: baseUrl,
});
```

- `handlerFactory` is the function to generate and wire up all the endpoints.
- `repositoryFactory` is the function to access mocked data in your custom endpoints and tests.
- `configMockApi` takes a `store` of type `Store<T extends BaseEntity>` as an argument to configure what storage the
  mocked data will be stored. By default, it uses `localStorage`. You can also
  use [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
  or [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store the data.

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

#### 2. Create your mock entity:

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

#### 3. Optional: extend endpoints and override provided endpoints. You can skip this step if you don't need to extend or override the endpoints.

The `handlerFactory` takes a second parameter of type `RestHandler[]`, which will take precedence over the provided
endpoints.

```typescript
// heroHandlers.ts
import { errorResponseFactory } from '@mockapi/msw';

import { Hero, heroKey } from './hero';
import { rest } from 'msw';
import { baseUrl, repositoryFactory } from '../server/server';

const repository = repositoryFactory<Hero>(heroKey);

export const heroHandlers = [
  rest.get(`${baseUrl}/${heroKey}`, (req, res, ctx) => {
    const { data: items = [], error } = repository.getItems();
    if (error) {
      return errorResponseFactory(res, ctx)(error);
    }
    const search = req.url.searchParams.get('search');
    const result = items.filter((hero) =>
      search ? hero.name.toLowerCase().includes(search?.toLowerCase()) : true
    );

    return res(ctx.status(200), ctx.json(result));
  }),

  rest.get(`${baseUrl}/${heroKey}/getByName/:name`, (req, res, ctx) => {
    const { data: items = [], error } = repository.getItems();
    if (error) {
      return errorResponseFactory(res, ctx)(error);
    }

    const { name } = req.params;

    const result = items.find((hero) => hero.name === name);

    return res(ctx.status(200), ctx.json(result));
  }),
];


```

#### 4. Wire up with Mock Service Work for `jest`. For browser integration, read the msw doc [here](https://mswjs.io/docs/getting-started/integrate/browser).

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

export const server = setupServer(...handlers);

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

#### 5. Wire up with `jest`

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

If set up correctly, you can use the mock data in your tests like the below example. For more examples, please check
out `/packages/tests`.

```typescript
// getAll.spec.ts
import {baseUrl} from '../server/server';
import {todoKey, todoSeeds} from '../entities';
import axios from 'axios';

describe('Get Items Endpoint', function () {
  it('should get todos', async function () {
    const data = await axios.get(`${baseUrl}/${todoKey}`);
    expect(data.data).toMatchObject(todoSeeds);
  });
});

```

### Error Response

The best way to handle errors is to override the target endpoint using `server.use` in the tests. For more details, read the [doc here](https://mswjs.io/docs/api/setup-server/use)

### Repository

The library provides a repository for each entity, the interface is as follows: 

```typescript
export type Repository<T extends BaseEntity> = {
  getItems: () => Result<T[]>;
  getItemById: (id: string | number) => Result<T>;
  addItem: (item: T) => Result<never>;
  deleteItem: (id: string | number) => Result<never>;
  editItem: (item: T) => Result<never>;
  seed: (items: T[]) => void;
};
```

#### Result<T>

Most of the repository methods return a `Result<T>` type, which contains either the data or the error. 

This `Result` is originated from Valdimir Kudinov's Result class described here: [Functional C#: Handling failures, input errors](https://enterprisecraftsmanship.com/posts/functional-c-handling-failures-input-errors/).

```typescript
export interface Result<T> {
  error?: { statusCode: number; message: string };
  data?: T;
}
```

#### To get a repository for an entity: 

```typescript
const repository = repositoryFactory<Hero>(heroKey);
```
