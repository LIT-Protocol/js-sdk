import * as constantsModule from '@litprotocol-dev/constants';

export const utils = () => {
  console.log("[utils] has been called!");
  return 'utils()';
}

export const testImportedConstantModules = () => {

  console.log("[utils] import<constantsModule>:", constantsModule);

  return {
    constantsModule,
  }

}