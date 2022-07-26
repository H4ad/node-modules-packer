//#region Imports

import { join, relative, resolve } from 'path';
import {
  DependencyInfo,
  DependencyType,
  ExtractorContainer,
  NpmExtractor,
} from '@h4ad/dependency-extractor';
import { Flags } from '@oclif/core';
import { LoadOptions } from '@oclif/core/lib/interfaces';
import esbuild from 'esbuild';
import rimraf from 'rimraf';
import CustomCommand from '../../common/custom-command';
import CustomError from '../../common/custom-error';
import { defaultIgnoredFileExtensions } from '../../common/extensions';
import {
  safeExistsSync,
  safeMkdirSync,
  safeReadFileSync,
  safeStatSync,
} from '../../common/fs';
import { HeadlessOptions } from '../../common/headless';
import { OutputInfo } from '../../common/output-info';
import { FasterZip, TransformAsyncCode, ZipArtifact } from '../../common/zip';

//#endregion

export default class Run extends CustomCommand {
  //#region Static Properties

  static description = 'Pack files and node dependencies to zip file.';
  static examples = [
    '<%= config.bin %> <%= command.id %> /project/path -i dist',
  ];

  static args = [
    {
      name: 'dir',
      description: 'Project root directory',
      required: false,
      default: './',
    },
  ];

  static flags = {
    include: Flags.string({
      char: 'i',
      description: 'Include more files during packing (eg: -i dist).',
      helpValue: 'package.json',
      multiple: true,
      required: false,
    }),
    'ignore-file-ext': Flags.string({
      char: 'e',
      description: 'Force ignore specific file extension.',
      multiple: true,
      required: false,
    }),
    'disable-default-ignore-file-ext': Flags.boolean({
      description:
        'Disable including default ignored extensions that we consider as useless.',
      required: false,
      default: false,
      allowNo: true,
    }),
    'include-node-path': Flags.string({
      description:
        'Force include folders starting with the specified path (eg --include-node-path "dev-dependency" will include node_modules/dev-dependency), but you need to MANUALLY add your sub-dependencies if dev-dependency has production dependencies.',
      helpValue: 'dev-dependency',
      multiple: true,
      required: false,
    }),
    'ignore-node-path': Flags.string({
      description:
        'Force exclude folders starting with specified path (eg: -n "typeorm/browser" will exclude node_modules/typeorm/browser).',
      helpValue: 'typeorm/browser',
      multiple: true,
      required: false,
    }),
    prod: Flags.boolean({
      description:
        'Include production dependencies when pack node dependencies.',
      default: true,
      required: false,
      allowNo: true,
    }),
    peer: Flags.boolean({
      description: 'Include peer dependencies when pack node dependencies.',
      default: false,
      required: false,
      allowNo: true,
    }),
    dev: Flags.boolean({
      description:
        'Include development dependencies when pack node dependencies.',
      default: false,
      required: false,
      allowNo: true,
    }),
    optional: Flags.boolean({
      description: 'Include optional dependencies when pack node dependencies.',
      default: false,
      required: false,
      allowNo: true,
    }),
    'output-path': Flags.string({
      description: 'Specify output path for the zip file.',
      default: './',
      required: false,
    }),
    'output-file': Flags.string({
      description: 'Specify output file name for the zip file.',
      default: 'deploy.zip',
      required: false,
    }),
    minify: Flags.boolean({
      description: 'Minify each .js file with esbuild.',
      default: false,
      required: false,
      allowNo: true,
    }),
    'minify-keep-names': Flags.boolean({
      description: 'Keep the names during minification.',
      default: false,
      required: false,
      allowNo: true,
    }),
    quiet: Flags.boolean({
      char: 'q',
      description: 'Run without logging.',
      default: false,
      required: false,
    }),
  };

  //#endregion

  //#region Static Methods

  public static async headless(
    options: HeadlessOptions,
    loadOptions?: LoadOptions,
  ): Promise<OutputInfo> {
    const args: string[] = [options.dir];

    const pushFlagWithArguments = (flag: string, options: string[]) => {
      for (const option of options) {
        args.push(flag);
        args.push(option);
      }
    };

    const pushFlagBoolean = (flag: string, cond: boolean) => {
      const prefix = cond ? '--' : '--no-';

      args.push(`${prefix}${flag}`);
    };

    if (Array.isArray(options.include))
      pushFlagWithArguments('-i', options.include);

    if (Array.isArray(options.ignoreFileExt))
      pushFlagWithArguments('-e', options.ignoreFileExt);

    if (options.disableDefaultIgnoreFileExt !== undefined) {
      pushFlagBoolean(
        'disable-default-ignore-file-ext',
        options.disableDefaultIgnoreFileExt,
      );
    }

    if (Array.isArray(options.includeNodePath))
      pushFlagWithArguments('--include-node-path', options.includeNodePath);

    if (Array.isArray(options.ignoreNodePath))
      pushFlagWithArguments('--ignore-node-path', options.ignoreNodePath);

    if (options.prod !== undefined) pushFlagBoolean('prod', options.prod);

    if (options.dev !== undefined) pushFlagBoolean('dev', options.dev);

    if (options.peer !== undefined) pushFlagBoolean('peer', options.peer);

    if (options.optional !== undefined)
      pushFlagBoolean('optional', options.optional);

    if (options.outputPath !== undefined)
      args.push('--output-path', options.outputPath);

    if (options.outputFile !== undefined)
      args.push('--output-file', options.outputFile);

    if (options.minify !== undefined) pushFlagBoolean('minify', options.minify);

    if (options.minifyKeepNames !== undefined)
      pushFlagBoolean('minify-keep-names', options.minifyKeepNames);

    return await this.run(args, loadOptions);
  }

  //#endregion

  //#region Public Methods

  public async run(): Promise<OutputInfo> {
    const { args, flags } = await this.parse(Run);

    const dir = args['dir'];
    const outputPath = flags['output-path'];
    const outputFile = flags['output-file'];

    this.checkForNodeModules(flags, dir);
    this.checkForNoOutputFile(flags, dir, outputPath, outputFile);

    const ignoredFileExtensions = this.getIgnoredFileExtensions(flags);
    const ignoredNodePaths = this.getIgnoredNodePaths(flags);
    const includedNodePaths = this.getIncludedNodePaths(flags);
    const selectedDependencies = this.getSelectedDependencies(flags, dir);

    const shouldIgnoreNodeFile = this.getShouldIgnoreNodeFileCallback(
      dir,
      ignoredFileExtensions,
      ignoredNodePaths,
      includedNodePaths,
      selectedDependencies,
    );

    const zipArtifacts: ZipArtifact[] = this.getZipArtifacts(
      dir,
      flags,
      shouldIgnoreNodeFile,
    );

    const outputFilePath = resolve(dir, outputPath, outputFile);

    await this.zipDirectory(flags, dir, zipArtifacts, outputFilePath);

    const size = safeStatSync(outputFilePath).size;

    return { size, file: outputFile, path: outputPath };
  }

  //#endregion

  //#region Protected Methods

  protected checkForNodeModules(flags: typeof Run.flags, dir: string): void {
    this.logMessage(flags, 'log', 'Checking node folder');

    const nodeModulesFolderPath = join(dir, 'node_modules');

    if (safeExistsSync(nodeModulesFolderPath)) {
      this.logMessage(flags, 'log', 'Checking node folder... found');
      return;
    }

    throw new CustomError(
      `Invalid Node Modules: folder ${nodeModulesFolderPath} does not exist`,
      {
        code: 'ERR_NODE_MODULES_NOT_FOUND',
        suggestions: [`Maybe you forgot to run "npm i" on ${dir}?`],
      },
    );
  }

  protected checkForNoOutputFile(
    flags: typeof Run.flags,
    dir: string,
    outputPath: string,
    outputFile: string,
  ): void {
    this.logMessage(flags, 'log', 'Removing old output file');

    const resolvedOutputPath = resolve(dir, outputPath);
    const outputFilePath = join(resolvedOutputPath, outputFile);

    if (!safeExistsSync(resolvedOutputPath)) {
      this.logMessage(
        flags,
        'log',
        `Not found folder in ${outputPath}, creating new one...`,
      );

      safeMkdirSync(resolvedOutputPath, { recursive: true });
    }

    if (!safeExistsSync(outputFilePath)) {
      this.logMessage(
        flags,
        'debug',
        `Not found ${outputFilePath} in output folder, it's not necessary remove.`,
      );

      this.logMessage(flags, 'log', 'Removing old output file... done');

      return;
    }

    this.logMessage(
      flags,
      'log',
      `File found at ${outputFilePath}, removing...`,
    );
    rimraf.sync(outputFilePath);
    this.logMessage(flags, 'log', `File found at ${outputFilePath}, removed.`);

    this.logMessage(flags, 'log', 'Removing old output file... done');
  }

  protected getSelectedDependencies(
    flags: typeof Run.flags,
    dir: string,
  ): DependencyInfo[] {
    this.logMessage(flags, 'log', 'Getting selected dependencies');

    const dependenciesContainer = this.getExtractedDependenciesFromLockFile(
      flags,
      dir,
    );

    const allDependencies = dependenciesContainer.getAllDependencies();
    const hasFlag = (type: number, flag: DependencyType) => (type & flag) > 0;

    const selectedDependencies = allDependencies.filter(dependency => {
      if (
        flags.prod &&
        hasFlag(dependency.type, DependencyType.PRODUCTION) &&
        !hasFlag(dependency.type, DependencyType.PEER)
      )
        return true;

      if (flags.dev && hasFlag(dependency.type, DependencyType.DEVELOPMENT))
        return true;

      if (flags.peer && hasFlag(dependency.type, DependencyType.PEER))
        return true;

      if (flags.optional && hasFlag(dependency.type, DependencyType.OPTIONAL))
        return true;

      return false;
    });

    this.logMessage(
      flags,
      'log',
      `Total dependencies found: ${allDependencies.length}.`,
    );
    this.logMessage(
      flags,
      'log',
      `Selected dependencies: ${selectedDependencies.length}.`,
    );

    return selectedDependencies;
  }

  protected getExtractedDependenciesFromLockFile(
    flags: typeof Run.flags,
    dir: string,
  ): ExtractorContainer {
    const packageLockFilePath = join(dir, 'package-lock.json');

    if (safeExistsSync(packageLockFilePath)) {
      this.logMessage(
        flags,
        'debug',
        `Found lock file in ${packageLockFilePath}.`,
      );
      this.logMessage(
        flags,
        'debug',
        'Reading and parsing lock file with NpmExtractor.',
      );

      return new NpmExtractor().parse(
        safeReadFileSync(packageLockFilePath).toString('utf-8'),
      );
    }

    throw new CustomError(
      `Invalid package-lock.json: file ${packageLockFilePath} does not exist`,
      {
        code: 'ERR_LOCK_FILE',
        suggestions: [
          'Currently we only support package-lock.json to detect production dependencies.',
        ],
      },
    );
  }

  protected getIgnoredFileExtensions(flags: typeof Run.flags): string[] {
    const ignoredFileExtensions: string[] = [];

    if (!flags['disable-default-ignore-file-ext'])
      ignoredFileExtensions.push(...defaultIgnoredFileExtensions);

    if (Array.isArray(flags['ignore-file-ext']))
      ignoredFileExtensions.push(...flags['ignore-file-ext']);

    this.logMessage(flags, 'debug', 'Using following ignored file extensions:');
    this.logMessage(flags, 'debug', JSON.stringify(ignoredFileExtensions));

    return ignoredFileExtensions;
  }

  protected getIgnoredNodePaths(flags: typeof Run.flags): string[] {
    const ignoredNodePaths: string[] = [];

    if (Array.isArray(flags['ignore-node-path']))
      ignoredNodePaths.push(...flags['ignore-node-path']);

    this.logMessage(flags, 'debug', 'Using following ignored node paths:');
    this.logMessage(flags, 'debug', JSON.stringify(ignoredNodePaths));

    return ignoredNodePaths.map(this.fixPath.bind(this));
  }

  protected getIncludedNodePaths(flags: typeof Run.flags): string[] {
    const includedNodePaths: string[] = [];

    if (Array.isArray(flags['include-node-path']))
      includedNodePaths.push(...flags['include-node-path']);

    this.logMessage(flags, 'debug', 'Using following included node paths:');
    this.logMessage(flags, 'debug', JSON.stringify(includedNodePaths));

    return includedNodePaths.map(this.fixPath.bind(this));
  }

  protected getShouldIgnoreNodeFileCallback(
    dir: string,
    ignoredFileExtensions: string[],
    ignoredNodePaths: string[],
    includedNodePaths: string[],
    selectedDependencies: DependencyInfo[],
  ): (filename: string) => boolean {
    return filename => {
      if (ignoredFileExtensions.some(ext => filename.endsWith(ext)))
        return true;

      const filenameNodePath = this.fixPath(
        relative(resolve(dir, 'node_modules'), filename),
      );

      if (includedNodePaths.some(path => filenameNodePath.startsWith(path)))
        return false;

      if (ignoredNodePaths.some(path => filenameNodePath.startsWith(path)))
        return true;

      const isSelectedDependency = selectedDependencies.some(dependency =>
        filenameNodePath.startsWith(dependency.name),
      );

      return !isSelectedDependency;
    };
  }

  protected getZipArtifacts(
    dir: string,
    flags: typeof Run.flags,
    shouldIgnoreNodeFile: (filename: string) => boolean,
  ): ZipArtifact[] {
    this.logMessage(flags, 'log', 'Getting artifacts to zip');

    const isJsFileRegex = /(\.js|\.cjs|\.mjs)$/;

    const keepNames = !!flags['minify-keep-names'];

    const transformAsyncCode: TransformAsyncCode = (code: Uint8Array) =>
      esbuild
        .transform(code, { minify: true, keepNames })
        .then(result => result.code);

    const transformerFunction: ZipArtifact['transformer'] = (
      filePath,
      metadataPath,
    ) => {
      const isJsFile =
        isJsFileRegex.test(filePath) || isJsFileRegex.test(metadataPath);

      if (!isJsFile) return undefined;

      return transformAsyncCode;
    };

    const transformer = flags.minify ? transformerFunction : undefined;

    const artifacts: ZipArtifact[] = [
      {
        path: join(dir, 'node_modules'),
        name: 'node_modules',
        type: 'directory',
        transformer,
        shouldIgnore: shouldIgnoreNodeFile,
      },
    ];

    const includeFiles = Array.isArray(flags.include) ? flags.include : [];

    for (const includeFile of includeFiles) {
      const [relativePath, pathMappedTo] = includeFile.split(':');

      const includeFilePath = join(dir, relativePath);
      const stats = safeStatSync(includeFilePath);
      const metadataPath = pathMappedTo
        ? resolve('/', pathMappedTo).slice(1)
        : undefined;

      const type = stats.isDirectory() ? 'directory' : 'file';

      artifacts.push({
        path: this.fixPath(includeFilePath),
        name: this.fixPath(includeFile),
        metadataPath: metadataPath ? this.fixPath(metadataPath) : metadataPath,
        transformer,
        type,
      });
    }

    this.logMessage(
      flags,
      'log',
      `Getting artifacts to zip... ${artifacts.length} selected`,
    );

    return artifacts;
  }

  protected async zipDirectory(
    flags: typeof Run.flags,
    dir: string,
    zipArtifacts: ZipArtifact[],
    outputPath: string,
  ): Promise<void> {
    this.logMessage(flags, 'log', 'Creating the output file');

    if (!outputPath.endsWith('.zip')) {
      throw new CustomError('Invalid output file extension.', {
        code: 'ERR_OUTPUT_FILE',
        suggestions: [
          'You should specific an --output-file with .zip extension.',
        ],
      });
    }

    const rootPath = resolve(process.cwd(), dir);
    const fasterZip = new FasterZip();

    await fasterZip.run(rootPath, outputPath, zipArtifacts);

    this.logMessage(flags, 'log', 'Creating the output file... created');
  }

  protected logMessage(
    flags: typeof Run.flags,
    type: 'log' | 'debug',
    message?: string,
    ...args: any[]
  ): void {
    if (flags.quiet) return;

    this[type](message, args);
  }

  protected fixPath(path: string): string {
    return path.replace(/\\\\/g, '/').replace(/\\/g, '/');
  }

  //#endregion
}
