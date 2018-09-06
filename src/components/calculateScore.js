export default function calculateScore(value) {
  if (value === null) {
    return null;
  } else {
    return ((value === 0) || (value === 1)) ? 0 : 3 ** (value - 1);
  }
}
