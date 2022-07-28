import { Interfaces, toStandardizedId } from '@oclif/core';
import { castArray } from '@oclif/core/lib/util';
import test from '@oclif/test';
import { loadConfig } from '@oclif/test/lib/load-config';
import MockFsFactory from './mockfs.factory';

export function fsmockCommand(
  args: string[] | string,
  opts: loadConfig.Options = {},
): {
  run(ctx: { config: Interfaces.Config; expectation: string }): Promise<void>;
  finally(): void;
} {
  return {
    async run(ctx: { config: Interfaces.Config; expectation: string }) {
      if (!ctx.config || opts.reset)
        ctx.config = await loadConfig(opts).run({} as any);
      args = castArray(args);
      const [id, ...extra] = args;
      const cmdId = toStandardizedId(id, ctx.config);
      ctx.expectation = ctx.expectation || `runs ${args?.join(' ')}`;
      await ctx.config.runHook('init', { id: cmdId, argv: extra });

      MockFsFactory.createMockFs();
      await ctx.config.runCommand(cmdId, extra);
    },
    finally() {
      MockFsFactory.resetMockFs();
    },
  };
}

export const fsTest = test.register('fsmockCommand', fsmockCommand);
