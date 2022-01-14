import { BaseEntity } from '../model';
import { Store } from './store';

export type Repository<T extends BaseEntity> = {
  getItems: () => Result<T[]>;
  getItemById: (id: string | number) => Result<T>;
  addItem: (item: T) => void;
  deleteItem: (id: string | number) => void;
  editItem: (item: T) => void;
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

export interface Result<T> {
  errorMessage?: string;
  data?: T;
}

function ensureItemIsInStore<T extends BaseEntity>(
  id: string | number,
  entityName: string,
  store: Store<T>
) {
  const { errorMessage } = getItemById<T>(id, entityName, store);
  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

function getItems<T extends BaseEntity>(
  entityName: string,
  store: Store<T>
): Result<T[]> {
  const item = store.getItem(entityName);
  if (item === null) {
    return {
      errorMessage: `No ${entityName} found`,
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
  const { errorMessage, data } = getItems<T>(entityName, store);
  if (errorMessage) {
    return {
      errorMessage,
    };
  }
  const result = data?.find((item) => item.id === id);
  return {
    errorMessage: result ? undefined : `No ${entityName} of id ${id} found`,
    data: result,
  };
}

function addItem<T extends BaseEntity>(
  item: T,
  entityName: string,
  store: Store<T>
): void {
  const { data } = getItems<T>(entityName, store);
  store.setItem(entityName, [...(data ?? []), item]);
}

function deleteItem<T extends BaseEntity>(
  id: string | number,
  entityName: string,
  store: Store<T>
): void {
  ensureItemIsInStore(id, entityName, store);
  const { data: existingSuppliers } = getItems<T>(entityName, store);

  const newItems = existingSuppliers?.filter((item) => item.id !== id);
  store.setItem(entityName, newItems ?? []);
}

function editItem<T extends BaseEntity>(
  item: T,
  entityName: string,
  store: Store<T>
): void {
  ensureItemIsInStore(item.id, entityName, store);
  const { data: existingSuppliers } = getItems<T>(entityName, store);
  const newItems = existingSuppliers?.map((s) => (s.id === item.id ? item : s));
  store.setItem(entityName, newItems ?? []);
}

function seed<T extends BaseEntity>(
  items: T[],
  entityName: string,
  store: Store<T>
): void {
  store.setItem(entityName, items);
}
