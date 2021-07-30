/// <reference types="node" />
export function walkDir(parentPath: string, callback: (path: string, stats: import("fs").Stats) => void): void;
