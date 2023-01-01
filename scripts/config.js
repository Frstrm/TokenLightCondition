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

  let choices = {
    'none': game.i18n.localize("tokenlightcond-effectSource-none"),
    'ae': game.i18n.localize("tokenlightcond-effectSource-ae"),
  };
  let defaultSource = 'ae';
  let findCubDark = game.cub?.getCondition(game.i18n.localize("tokenlightcond-effect-dark"));
  let findCubDim = game.cub?.getCondition(game.i18n.localize("tokenlightcond-effect-dim"));
  let findCE = game.dfreds?.effectInterface;

  if (findCubDark && findCubDim) {
    choices['cub'] = game.i18n.localize("tokenlightcond-effectSource-cub");
    defaultSource = 'cub';
  }
  if (findCE) {
    choices['ce'] = game.i18n.localize("tokenlightcond-effectSource-ce");
    defaultSource = 'ce';
  }

  game.settings.register('tokenlightcondition', 'effectSource', {
    name: game.i18n.localize("tokenlightcond-effectSource-name"),
    hint: game.i18n.localize("tokenlightcond-effectSource-hint"),
    scope: 'world',
    config: true,
    type: String,
    choices,
    default: defaultSource
  });

});
