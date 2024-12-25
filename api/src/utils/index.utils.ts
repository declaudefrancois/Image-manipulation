export const getBaseDir = (path: string) => {
  return path.split("/").slice(0, -1).join("/");
};
