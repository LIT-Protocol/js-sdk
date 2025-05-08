/**
 * Compares two arrays of strings to determine if they are different.
 * Two arrays are considered different if they have different lengths,
 * or if they do not contain the same elements with the same frequencies, regardless of order.
 *
 * @param arr1 The first array of strings.
 * @param arr2 The second array of strings.
 * @returns True if the arrays are different, false otherwise.
 */
export const areStringArraysDifferent = (
  arr1: string[],
  arr2: string[]
): boolean => {
  if (arr1.length !== arr2.length) {
    return true;
  }

  // Create sorted copies of the arrays
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  // Compare the sorted arrays element by element
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return true; // Found a difference
    }
  }

  return false; // Arrays are permutations of each other (same elements, same frequencies)
};
