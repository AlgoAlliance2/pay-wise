export function getAuthErrorMessage(code: string) {
  switch (code) {
    case "auth/invalid-email":
      return "The email address is invalid.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many login attempts. Try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}
