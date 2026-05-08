const getWorkspaceDefaultName = (name: string): string => {
  const defaultName = name + "'s Workspace" || "My Workspace";
  return defaultName;
};

export { getWorkspaceDefaultName };
