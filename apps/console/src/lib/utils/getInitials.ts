const UPPERCASE_FIRST_LETTER_INDEX = 0;

/**
 * Extracts and returns initials from a full name.
 * @param fullName - The full name to extract initials from
 * * @returns Uppercase initials or empty string if name is invalid
 * @example
 * getInitials('John Doe') // returns 'JD'
 * getInitials('Mary Jane Watson') // returns 'MJW'
 */
export const getInitials = (fullName: string): string => {
  if (!fullName || !fullName.trim()) {
    return '';
  }

  const parts = fullName.trim().split(/\s+/);

  return parts
    .map((part) => part.charAt(UPPERCASE_FIRST_LETTER_INDEX))
    .join('')
    .toUpperCase();
};
