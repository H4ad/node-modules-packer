import fs from 'fs';
import { promisify } from 'util';

export const readFileAsync = promisify(fs.readFile);
export const readdirAsync = promisify(fs.readdir);
export const statAsync = promisify(fs.stat);
