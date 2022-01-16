import { rest, RestHandler } from 'msw';
import { getRepository, Store } from '../repository';
import { BaseEntity } from '../model';
import { errorResponseFactory } from './errorResponseFactory';

export const getDefaultEndpoints =
  <T extends BaseEntity>(baseUrl: string, store: Store<T>) =>
  (entityName: string, handler: RestHandler[] = []) => {
    const repository = getRepository<T>(entityName, store);
    return [
      ...handler,
      rest.get(`${baseUrl}/${entityName}`, (req, res, ctx) => {
        const { data: items = [], error } = repository.getItems();
        if (error) {
          return errorResponseFactory(res, ctx)(error);
        }
        return res(ctx.status(200), ctx.json(items));
      }),

      rest.get(`${baseUrl}/${entityName}/:id`, (req, res, ctx) => {
        const { id } = req.params;
        if (!id) {
          return res(ctx.status(400), ctx.json({ errors: ['Id is required'] }));
        }
        const { data: item, error } = repository.getItemById(id as string);
        if (error) {
          return errorResponseFactory(res, ctx)(error);
        }

        return res(ctx.status(200), ctx.json(item));
      }),

      rest.post(`${baseUrl}/${entityName}`, (req, res, ctx) => {
        const item = req.body as T;
        const { error } = repository.addItem(item);
        if (error) {
          return errorResponseFactory(res, ctx)(error);
        }

        return res(ctx.status(201));
      }),

      rest.put(`${baseUrl}/${entityName}/:id`, (req, res, ctx) => {
        const item = req.body as T;
        const { id } = req.params;
        if (id !== item.id) {
          return res(
            ctx.status(400),
            ctx.json({ errors: ['Id does not match'] })
          );
        }
        const { error } = repository.editItem(item);
        if (error) {
          return errorResponseFactory(res, ctx)(error);
        }
        return res(ctx.status(200));
      }),

      rest.delete(`${baseUrl}/${entityName}/:id`, (req, res, ctx) => {
        const { id } = req.params;
        if (!id) {
          return res(ctx.status(400), ctx.json({ errors: ['Id is required'] }));
        }
        const { data: item, error } = repository.getItemById(id as string);
        if (error) {
          return errorResponseFactory(res, ctx)(error);
        }
        if (!item) {
          return res(ctx.status(404), ctx.json({ errors: ['Item not found'] }));
        }
        repository.deleteItem(item.id);
        return res(ctx.status(204));
      }),
    ];
  };
