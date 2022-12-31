import { Core } from './utils/core.js';

Hooks.once('ready', () => {

  const module = game.modules.get('tokenlightcondition');
  const moduleVersion = module.version;
  console.log(`tokenlightcondition | Initializing ${moduleVersion}`);

  game.settings.register('tokenlightcondition', 'logLevel', {
    name: game.i18n.localize('tokenlightcond-config-logLevel-name'),
    hint: game.i18n.localize('tokenlightcond-config-logLevel-hint'),
    scope: 'client',
    config: true,
    type: String,
    choices: {
      'none': 'No logging',
      'debug': 'Debug level',
      'log': 'Log level',
    },
    default: 'none'
  });

});
