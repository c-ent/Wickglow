// Web and iOS: no system date dialog here. The web uses a hidden browser date
// input and iOS keeps the typed field (see DueControl in task-list.tsx);
// Android has its own file, due-picker.android.ts.
export const openDuePicker: ((value: string, onChange: (value: string) => void) => void) | null = null;
