// The read-failure cases are the point of this file. `storage.ts` returns fresh
// defaults when a read throws, and that fallback must not be written back over
// progress that is still in storage, so the last two cases check that a later
// save is skipped until a read succeeds.

import { STORAGE_KEY } from './saved-state';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// `storage.ts` keeps a module-level read-failed flag. Each test loads a fresh
// copy of the module (and the storage mock it uses), so a failed read in one
// test cannot leave the flag set for the next.
type StorageModule = typeof import('./storage');
type AsyncStorageType = typeof import('@react-native-async-storage/async-storage').default;
let AsyncStorage: AsyncStorageType;
let loadWickglowState: StorageModule['loadWickglowState'];
let saveWickglowState: StorageModule['saveWickglowState'];

describe('loading saved state', () => {
  const now = new Date(2026, 10, 2, 8).getTime();
  const progress = JSON.stringify({ xp: 40, streak: { n: 3, last: '2026-11-1' } });

  beforeEach(async () => {
    jest.isolateModules(() => {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const mock = require('@react-native-async-storage/async-storage');
      AsyncStorage = mock.default ?? mock;
      ({ loadWickglowState, saveWickglowState } = require('./storage') as StorageModule);
      /* eslint-enable @typescript-eslint/no-require-imports */
    });
    await AsyncStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads the current key', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, progress);
    const state = await loadWickglowState();
    expect(state.xp).toBe(40);
    expect(state.streak.n).toBe(3);
  });

  it('starts fresh when the read itself fails', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage unavailable'));
    const state = await loadWickglowState();
    expect(state.xp).toBe(0);
    expect(state.streak).toEqual({ n: 0, last: '' });
  });

  it('does not write defaults over stored progress when the first read fails', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, progress);
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage unavailable'));

    const state = await loadWickglowState();
    await saveWickglowState({ ...state, xp: 5 });

    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) as string).xp).toBe(40);
  });

  it('saves again once a later read succeeds', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('storage unavailable'));
    await loadWickglowState();

    const state = await loadWickglowState();
    await saveWickglowState({ ...state, xp: 7 });

    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) as string).xp).toBe(7);
  });
});
