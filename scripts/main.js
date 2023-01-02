
import { Core } from './utils/core.js';
import { Lighting } from './utils/lighting.js';
import { Effects } from './utils/effects.js';

let canvasDarknessLevel = 'dark';

// ******************************************
// Hooks
// ******************************************
Hooks.once('init', () => {
  // Create a socket event handler to listen to incomming sockets and dispatch to callbacks
  game.socket.on(`module.tokenlightcondition`, (data) => {
  });
});

Hooks.once('ready', () => {
  const module = game.modules.get('tokenlightcondition');
  const moduleVersion = module.version;
  console.log(`tokenlightcondition | Ready ${moduleVersion}`);

  canvasDarknessLevel = Lighting.setDarknessThreshold(canvas.darknessLevel);

  Effects.initializeEffects();

});

Hooks.on('refreshToken', (token) => {
//  Core.initialize_token(token);
});

Hooks.on('renderTokenHUD', (tokenHUD,html,app) => {
  let selected_token = Core.find_selected_token(tokenHUD);
  if (Core.isValidActor(selected_token)) {
    if (game.user.isGM) {
      show_gm_tokenhud(selected_token, tokenHUD,html);
    } else {
      show_player_tokenhud(selected_token, tokenHUD,html);
    }
  }
});

// This occurs on both server and client
Hooks.on('updateToken', (data, diff, options, userId) => {
  if (game.user.isGM) {
    if (diff.x || diff.y || diff.elevation) { // If the x/y is updated, they moved.
      for (const placed_token of canvas.tokens.placeables) {
        if (placed_token.id == data._id) { // Find the Token in Question
//          testUpdateToken(placed_token);
        }
      }
    }
  }
});

let inProgressUpdate = false;

async function testUpdateToken( placed_token) {
  if (!inProgressUpdate) {
    inProgressUpdate = true;
    let result = await Lighting.check_token_lighting(placed_token);
    Core.log('testUpdateToken Result:',result);
    inProgressUpdate = false;
  } else {
    Core.log("updateToken Busy")
  }
}

Hooks.on('lightingRefresh', (data) => {
  if (game.user.isGM) {
    testLightingRefresh();
  }
});

let inProgressLight = false;

async function testLightingRefresh() {
  if (!inProgressLight) {
    // has the light level change of the scene crossed a threshold?
    let testLight = await Lighting.setDarknessThreshold(canvas.darknessLevel);
//    if (canvasDarknessLevel != testLight) {
    inProgressLight = true;
    await Lighting.check_all_tokens_lightingRefresh();
    canvasDarknessLevel = testLight;
    inProgressLight = false;
  } else {
    Core.log("testLightingRefresh Busy");
  }
}

Hooks.on('renderSettingsConfig', (app, html, data) => {
  $('<div>').addClass('form-group group-header').html(game.i18n.localize('tokenlightcond-config-debug')).insertBefore($('[name="tokenlightcondition.logLevel"]').parents('div.form-group:first'));
  $('<div>').addClass('form-group group-header').html(game.i18n.localize('tokenlightcond-config-general')).insertBefore($('[name="tokenlightcondition.effectSource"]').parents('div.form-group:first'));
});

// ******************************************
// Functions
// ******************************************

function show_gm_tokenhud(selected_token, tokenHUD,html) {
  Lighting.show_lightLevel_box(selected_token, tokenHUD,html);
}

function show_player_tokenhud(selected_token, tokenHUD,html) {
  Lighting.show_lightLevel_box(selected_token, tokenHUD,html);
}
