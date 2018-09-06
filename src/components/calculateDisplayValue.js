export default function calculateDisplayValue(value) {
  if (value === null) {
    return null;
  } else {
    return ((value === 0 || value === 1) ? value + 1 : (3 * 2** (value-2)));
  }
}
