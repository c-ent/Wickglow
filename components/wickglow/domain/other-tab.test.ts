import { takeOtherTabSave } from './other-tab';
import { parseSavedState, SavedState, STORAGE_KEY } from './saved-state';
import { createSavedStore } from './saved-store';

describe('taking another tab\'s save', () => {
  const base = parseSavedState(null);

  // A store whose writes land in a fake shared storage, as on web.
  function setup() {
    let stored: string | null = JSON.stringify(base);
    const store = createSavedStore<SavedState>(base, (state) => {
      stored = JSON.stringify(state);
      return true;
    }, 300);
    return {
      store,
      read: () => stored,
      otherTabWrites: (state: SavedState) => {
        stored = JSON.stringify(state);
        return { key: STORAGE_KEY, newValue: stored };
      },
    };
  }

  it('takes a save that is still the one in storage', () => {
    const { store, read, otherTabWrites } = setup();
    const notice = otherTabWrites({ ...base, xp: 40 });
    expect(takeOtherTabSave(store, notice, read)).toBe(true);
    expect(store.get().xp).toBe(40);
  });

  it('keeps a local commit made before an older notice is handled', () => {
    const { store, read, otherTabWrites } = setup();
    const notice = otherTabWrites({ ...base, xp: 40 });
    // This tab commits before the other tab's event reaches it.
    void store.commit({ ...base, xp: 90 });
    expect(takeOtherTabSave(store, notice, read)).toBe(false);
    expect(store.get().xp).toBe(90);
    expect(JSON.parse(read() ?? '{}').xp).toBe(90);
  });

  it('ignores other keys, a removed key and invalid JSON', () => {
    const { store, read } = setup();
    expect(takeOtherTabSave(store, { key: 'other', newValue: '{}' }, read)).toBe(false);
    expect(takeOtherTabSave(store, { key: STORAGE_KEY, newValue: null }, () => null)).toBe(false);
    expect(takeOtherTabSave(store, { key: STORAGE_KEY, newValue: '{oops' }, () => '{oops')).toBe(false);
    expect(store.get()).toBe(base);
  });
});
