import { rest, RestHandler } from 'msw';
import { BaseEntity, getRepository, Store } from '@mockapi/repository';

import { getDefaultGetItemsResponse, getErrorResponse } from '../responses';

export const getDefaultEndpoints =
  <T extends BaseEntity>(baseUrl: string, store: Store<T>) =>
  (entityName: string, handler: RestHandler[] = []) => {
    const repository = getRepository<T>(entityName, store);
    return [
      ...handler,
      rest.get(`${baseUrl}/${entityName}`, (req, res, ctx) => {
        const defaultHttpResponse = getDefaultGetItemsResponse(
          entityName,
          repository
        )(res, ctx);
        if (defaultHttpResponse.response) {
          return defaultHttpResponse.response;
        }

        return res(ctx.status(200), ctx.json(defaultHttpResponse.data));
      }),

      rest.get(`${baseUrl}/${entityName}/:id`, (req, res, ctx) => {
        const errorResponse = getErrorResponse(res, ctx);
        if (errorResponse) {
          return errorResponse;
        }

        const { id } = req.params;
        if (!id) {
          return res(ctx.status(400), ctx.json({ errors: ['Id is required'] }));
        }
        const { data: item, errorMessage } = repository.getItemById(
          id as string
        );
        if (errorMessage) {
          return res(ctx.status(404), ctx.json({ detail: errorMessage }));
        }

        return res(ctx.status(200), ctx.json(item));
      }),

      rest.post(`${baseUrl}/${entityName}`, (req, res, ctx) => {
        const errorResponse = getErrorResponse(res, ctx);
        if (errorResponse) {
          return errorResponse;
        }

        const item = req.body as T;

        repository.addItem(item);
        const id = req.url.searchParams.get('id');
        if (id) {
          localStorage.setItem('id', id);
        }
        return res(ctx.status(201));
      }),

      rest.put(`${baseUrl}/${entityName}/:id`, (req, res, ctx) => {
        const errorResponse = getErrorResponse(res, ctx);
        if (errorResponse) {
          return errorResponse;
        }

        const item = req.body as T;
        const { id } = req.params;
        const { data: itemInStore, errorMessage } = repository.getItemById(
          id as string
        );
        if (itemInStore && !errorMessage) {
          repository.editItem(item);
          return res(ctx.status(200));
        }
        return res(
          ctx.status(404),
          ctx.json({ detail: `No ${entityName} of id ${id} found` })
        );
      }),

      rest.delete(`${baseUrl}/${entityName}/:id`, (req, res, ctx) => {
        const errorResponse = getErrorResponse(res, ctx);
        if (errorResponse) {
          return errorResponse;
        }

        const { id } = req.params;
        if (!id) {
          console.log('id is required');
          return res(ctx.status(400), ctx.json({ errors: ['Id is required'] }));
        }
        const { data: item, errorMessage } = repository.getItemById(
          id as string
        );
        if (errorMessage || !item) {
          return res(ctx.status(404), ctx.json({ detail: errorMessage }));
        }

        repository.deleteItem(item.id);
        return res(ctx.status(204));
      }),
    ];
  };
