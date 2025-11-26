export const getInitials = (fullName: string): string => {
  if (!fullName) return '';

  // Split the name by spaces to handle multiple parts (first, middle, last, etc.)
  const parts = fullName.trim().split(/\s+/);

  // Extract the first letter of each part
  return parts
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};
