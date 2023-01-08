import { Core } from './utils/core.js';

Hooks.once('setup', () => {

 game.settings.register('tokenlightcondition', 'enable', {
    name: 'tokenlightcondition.enable',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true,
    onChange: value => {
        if (!canvas.ready || !game.user.isGM) {
            Core.log('config OnChange');
            return;
        }

        if (ui.controls.control.name === 'lighting') {
            ui.controls.control.tools.find(tool => tool.name === 'tokenlightcontrol.enable').active = value;
            ui.controls.render();
        }
    }
  });

})

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
      'none': game.i18n.localize("tokenlightcond-config-logLevel-none-choice"),
      'debug': game.i18n.localize("tokenlightcond-config-logLevel-debuglevel-choice"),
      'log': game.i18n.localize("tokenlightcond-config-logLevel-loglevel-choice")
    },
    default: 'none'
  });

  game.settings.register('tokenlightcondition', 'showTokenHud', {
    name: game.i18n.localize("tokenlightcond-config-showTokenHud-name"),
    hint: game.i18n.localize("tokenlightcond-config-showTokenHud-hint"),
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
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
