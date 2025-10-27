// Local shims so the project compiles even without @types/node or @types/nodemailer.

// Node globals (minimal)
declare var process: any;
declare var require: any;
declare var module: any;
declare var __dirname: string;
declare var Buffer: any;

// Node built-ins we touch (very loose any-typed shims)
declare module 'crypto' {
  const anything: any;
  export = anything;
}
declare module 'node:crypto' {
  const anything: any;
  export = anything;
}

// Optional built-ins (add if you later import them)
declare module 'fs' {
  const anything: any;
  export = anything;
}
declare module 'path' {
  const anything: any;
  export = anything;
}

// Nodemailer shim (until @types/nodemailer is installed)
declare module 'nodemailer' {
  const nodemailer: any;
  export = nodemailer;
}
