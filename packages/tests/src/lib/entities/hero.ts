import { repositoryFactory } from '../server/server';

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
