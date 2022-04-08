import { bootstrapDB, teardownDB } from './bootstrapDB';

export default async function setup(): Promise<void> {
  await teardownDB();
  await bootstrapDB();
}

setup()
  .then(() => console.log('DB: migration OK'))
  .catch((err) => console.log('DB: migration Error:', err));
