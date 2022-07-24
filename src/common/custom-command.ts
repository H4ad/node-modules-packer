import { Command } from '@oclif/core';
import CustomError from './custom-error';
import JsonError from './json-error';
import JsonResult from './json-result';

export default abstract class CustomCommand extends Command {
  static enableJsonFlag = true;

  protected toSuccessJson(result: object): JsonResult {
    return { status: 'success', ...result };
  }

  protected toErrorJson(error: CustomError): JsonError {
    const result = {
      status: 'error',
      message: error.message,
      code: error.code,
      sugestions: error.suggestions,
    };

    return result;
  }
}
