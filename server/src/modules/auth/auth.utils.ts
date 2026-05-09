export const getSlug = (email: string): string => {
  return email.split("@")[0] || "";
};
