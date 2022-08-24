import * as constantsModule from '@litprotocol-dev/constants/dist';
import * as constantsModuleVanilla from '@litprotocol-dev/constants/vanilla';

/**
 * Test 8
 */
export const utils = () => {
  console.log("[utils] has been called!");
  return 'utils()';
}

export const testImportedConstantModules = () => {

  console.log("[utils] import<constantsModule>:", constantsModule);
  // console.log("[utils] import<constantsModuleVanilla>:", constantsModuleVanilla);

}