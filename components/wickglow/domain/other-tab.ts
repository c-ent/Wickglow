import { parseSavedState, SavedState, STORAGE_KEY } from './saved-state';
import type { SavedStore } from './saved-store';

// Web: browser tabs share one saved copy. When another tab saves, this tab
// takes its state, so a pause or change made there is not undone by this
// tab's next save. Taken without a write, so the two tabs do not pass a save
// back and forth.
//
// A storage event is delivered some time after the other tab wrote. If this
// tab has written since, storage no longer holds the event's value and the
// event is old news: taking it would put the older state over this tab's
// newer one. So the event is only taken while storage still holds it.

/** The parts of a `StorageEvent` this reads. */
export interface StorageNotice {
  key: string | null;
  newValue: string | null;
}

/**
 * Takes another tab's save into `store` if it is still the one in storage.
 * `readStored` reads the key now. Invalid JSON is ignored rather than read as
 * a fresh state. Returns whether the state was taken.
 */
export function takeOtherTabSave(
  store: SavedStore<SavedState>,
  notice: StorageNotice,
  readStored: () => string | null,
): boolean {
  if (notice.key !== STORAGE_KEY || notice.newValue == null) return false;
  if (readStored() !== notice.newValue) return false;
  try {
    JSON.parse(notice.newValue);
  } catch {
    return false;
  }
  store.adopt(parseSavedState(notice.newValue));
  return true;
}
