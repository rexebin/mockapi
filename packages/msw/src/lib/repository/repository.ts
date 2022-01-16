import { BaseEntity } from '../model';
import { Store } from './store';
import { Result } from './result';

export type Repository<T extends BaseEntity> = {
  getItems: () => Result<T[]>;
  getItemById: (id: string | number) => Result<T>;
  addItem: (item: T) => Result<never>;
  deleteItem: (id: string | number) => Result<never>;
  editItem: (item: T) => Result<never>;
  seed: (items: T[]) => void;
};

export function getRepository<T extends BaseEntity>(
  entityName: string,
  store: Store<T>
): Repository<T> {
  return {
    getItems: () => getItems<T>(entityName, store),
    getItemById: (id: string | number) => getItemById<T>(id, entityName, store),
    addItem: (item: T) => addItem<T>(item, entityName, store),
    deleteItem: (id: string | number) => deleteItem<T>(id, entityName, store),
    editItem: (item: T) => editItem<T>(item, entityName, store),
    seed: (items: T[]) => seed<T>(items, entityName, store),
  };
}

function getItems<T extends BaseEntity>(
  entityName: string,
  store: Store<T>
): Result<T[]> {
  const item = store.getItem(entityName);
  if (item === null) {
    return {
      error: {
        statusCode: 404,
        message: `No ${entityName} found`,
      },
    };
  }
  return {
    data: item,
  };
}

function getItemById<T extends BaseEntity>(
  id: string | number,
  entityName: string,
  store: Store<T>
): Result<T> {
  const { error, data } = getItems<T>(entityName, store);
  if (error) {
    return {
      error: error,
    };
  }
  const result = data?.find((item) => item.id === id);
  return {
    error: result
      ? undefined
      : {
          statusCode: 404,
          message: `No ${entityName} found with id ${id}`,
        },
    data: result,
  };
}

function addItem<T extends BaseEntity>(
  item: T,
  entityName: string,
  store: Store<T>
): Result<never> {
  const { data, error } = getItems<T>(entityName, store);
  if (error) {
    return {
      error: error,
    };
  }
  store.setItem(entityName, [...(data ?? []), item]);
  return {};
}

function deleteItem<T extends BaseEntity>(
  id: string | number,
  entityName: string,
  store: Store<T>
): Result<never> {
  const { error: itemNotFound } = getItemById<T>(id, entityName, store);
  if (itemNotFound) {
    return { error: itemNotFound };
  }
  const { data: existingSuppliers, error } = getItems<T>(entityName, store);
  if (error) {
    throw { error: error };
  }

  const newItems = existingSuppliers?.filter((item) => item.id !== id);
  store.setItem(entityName, newItems ?? []);
  return {};
}

function editItem<T extends BaseEntity>(
  item: T,
  entityName: string,
  store: Store<T>
): Result<never> {
  const { error: itemNotFound } = getItemById<T>(item.id, entityName, store);
  if (itemNotFound) {
    return { error: itemNotFound };
  }
  const { data: existingSuppliers } = getItems<T>(entityName, store);
  const newItems = existingSuppliers?.map((s) => (s.id === item.id ? item : s));
  store.setItem(entityName, newItems ?? []);
  return {};
}

function seed<T extends BaseEntity>(
  items: T[],
  entityName: string,
  store: Store<T>
): void {
  store.setItem(entityName, items);
}
