import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { parseDueDate } from '@/src/core/tasks';

// A Date as the local day "YYYY-MM-DD", the form due dates are stored in.
function toDueDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Opens Android's own date dialog on `value` (or today when there is none).
 * OK sends the picked day, Clear sends '' to remove the date, Cancel sends
 * nothing.
 */
export function openDuePicker(value: string, onChange: (value: string) => void): void {
  const current = parseDueDate(value);
  const [year, month, day] = current ? current.split('-').map(Number) : [];
  DateTimePickerAndroid.open({
    mode: 'date',
    value: current ? new Date(year, month - 1, day) : new Date(),
    neutralButton: { label: 'Clear' },
    onChange: (event, date) => {
      if (event.type === 'set' && date) onChange(toDueDate(date));
      else if (event.type === 'neutralButtonPressed') onChange('');
    },
  });
}
