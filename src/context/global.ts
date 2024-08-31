export let globalContext: {
  axiosInstances: Map<string, string>;
  importedModules: Map<string, string>;
  declaredVariables: Map<string, any>;
  typeInterfaces: Map<string, any>;
  options: {
    include?: string;
    exclude?: string;
    output?: string;
  };
};

export function initializeGlobalContext(options: {
  include?: string;
  exclude?: string;
  output?: string;
}): void {
  globalContext = {
    axiosInstances: new Map(),
    importedModules: new Map(),
    declaredVariables: new Map(),
    typeInterfaces: new Map(),
    options,
  };
}
