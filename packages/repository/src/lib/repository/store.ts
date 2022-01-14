import { BaseEntity } from '../model';

export type Store<T extends BaseEntity> = {
  setItem: (key: string, value: T[]) => void;
  getItem: (key: string) => T[] | null;
};

export const localStorageStore = {
  getItem: (key: string) => {
    const result = localStorage.getItem(key);
    return result ? JSON.parse(result) : null;
  },
  setItem: (key: string, value: unknown) =>
    localStorage.setItem(key, JSON.stringify(value)),
};
