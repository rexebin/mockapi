import { BaseEntity } from '../model';
import { getRepository, localStorageStore, Store } from '../repository';

import { getDefaultEndpoints } from './getDefaultEndpoints';

export function configMockApi<T extends BaseEntity>({
  baseUrl,
  store = localStorageStore,
}: {
  baseUrl: string;
  store?: Store<T>;
}) {
  return {
    repositoryFactory: <TR extends BaseEntity>(entityName: string) =>
      getRepository<TR>(entityName, store as unknown as Store<TR>),
    handlerFactory: getDefaultEndpoints(baseUrl, store),
    clearAllData: () => store.clearAll(),
  };
}
