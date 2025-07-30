// Helper function for aligned console output
export const printAligned = (entries: Array<{ label: string; value: string | number }>, minPadding: number = 2) => {
  // Find the maximum label length
  const maxLabelLength = Math.max(...entries.map(entry => entry.label.length));
  const paddingWidth = maxLabelLength + minPadding;
  
  // Print each entry with consistent alignment
  entries.forEach(({ label, value }) => {
    console.log(label.padEnd(paddingWidth), value);
  });
};