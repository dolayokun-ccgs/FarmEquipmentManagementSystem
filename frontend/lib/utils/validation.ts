/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number (Nigerian format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Nigerian phone: +234XXXXXXXXXX or 0XXXXXXXXXX or XXXXXXXXXXX
  const phoneRegex = /^(\+234|0)?[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number to Nigerian format
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');

  if (cleaned.startsWith('+234')) {
    return cleaned;
  }

  if (cleaned.startsWith('0')) {
    return `+234${cleaned.substring(1)}`;
  }

  return `+234${cleaned}`;
};
