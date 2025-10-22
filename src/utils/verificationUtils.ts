// Utility functions for user verification status

export const isUserVerified = (user: any): boolean => {
  // If user is null/undefined, consider as not verified
  if (!user) return false;
  
  // If is_verified is explicitly false, user is not verified
  if (user.is_verified === false) return false;
  
  // If is_verified is explicitly true, user is verified
  if (user.is_verified === true) return true;
  
  // If is_verified is undefined/null, we need to check other indicators
  // For now, we'll consider undefined as not verified (requires verification)
  return false;
};

export const shouldShowVerificationPrompt = (user: any): boolean => {
  return !isUserVerified(user);
};

export const getVerificationStatus = (user: any): 'verified' | 'unverified' | 'unknown' => {
  if (!user) return 'unknown';
  
  if (user.is_verified === true) return 'verified';
  if (user.is_verified === false) return 'unverified';
  
  return 'unknown';
};

