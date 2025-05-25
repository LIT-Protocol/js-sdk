import inquirer from 'inquirer';
import { customAuthFlow } from './src/custom-auth-flow';
import { init } from './src/init';
import { eoaNativeAuthFlow } from './src/eoa-native-auth-flow';

// Configuration constants
const CLI_TITLE = 'Function Runner CLI';
const EXIT_OPTION = 'Exit';
/**
 * Function map containing all available functions
 * Add new functions here to include them in the CLI
 */
const functionMap: Record<string, () => void> = {
  init: init,
  customAuthFlow: customAuthFlow,
  eoaNativeAuthFlow: eoaNativeAuthFlow,
};

/**
 * Gets the list of available function names plus the exit option
 */
function getAvailableOptions(): string[] {
  return [...Object.keys(functionMap), EXIT_OPTION];
}

/**
 * Displays the CLI title and instructions
 */
function displayWelcome(): void {
  console.clear();
  console.log(`\n=== ${CLI_TITLE} ===`);
  console.log('Use ↑/↓ arrow keys to navigate, Enter to select\n');
}

/**
 * Prompts user to select a function using keyboard navigation
 */
async function promptFunctionSelection(): Promise<string> {
  const { selectedFunction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFunction',
      message: 'Select a function to execute:',
      choices: getAvailableOptions(),
      pageSize: 10,
    },
  ]);

  return selectedFunction;
}

/**
 * Executes the selected function if it exists in the function map
 */
function executeFunction(functionName: string): void {
  const func = functionMap[functionName];
  if (func) {
    console.log(`\n--- Executing ${functionName} ---`);
    func();
    console.log(`--- ${functionName} completed ---\n`);
  } else {
    console.log(`❌ Function '${functionName}' not found`);
  }
}

/**
 * Prompts user to continue or exit the application
 */
async function promptContinue(): Promise<boolean> {
  const { shouldContinue } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldContinue',
      message: 'Would you like to run another function?',
      default: true,
    },
  ]);

  return shouldContinue;
}

/**
 * Main CLI application loop
 */
async function runCLI(): Promise<void> {
  try {
    displayWelcome();

    let keepRunning = true;

    while (keepRunning) {
      const selectedFunction = await promptFunctionSelection();

      if (selectedFunction === EXIT_OPTION) {
        console.log('👋 Goodbye!');
        break;
      }

      executeFunction(selectedFunction);

      keepRunning = await promptContinue();

      if (keepRunning) {
        console.clear();
        console.log(`\n=== ${CLI_TITLE} ===`);
        console.log('Use ↑/↓ arrow keys to navigate, Enter to select\n');
      }
    }
  } catch (error) {
    console.error('❌ An error occurred:', error);
    process.exit(1);
  }
}

// Start the CLI if this file is run directly
if (require.main === module) {
  runCLI().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

// Export for potential use as a module
export { functionMap, runCLI };
