import { promisify } from 'util';
import * as gracefulFs from 'graceful-fs';

export const readdirAsync = promisify(gracefulFs.readdir);
export const statAsync = promisify(gracefulFs.stat);
export const safeCreateReadStream = gracefulFs.createReadStream;
export const safeCreateWriteStream = gracefulFs.createWriteStream;
export const safeExistsSync = gracefulFs.existsSync;
export const safeMkdirSync = gracefulFs.mkdirSync;
export const safeReadFileSync = gracefulFs.readFileSync;
export const safeStatSync = gracefulFs.statSync;
