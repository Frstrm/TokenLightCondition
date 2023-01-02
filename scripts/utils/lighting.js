import { Core } from './core.js';
import { Effects } from './effects.js';

export class Lighting {

  static lightTable = {'dark':'DRK', 'dim':'DIM', 'bright':'BRT'};

  static setDarknessThreshold(darknessLevel) {
    if (darknessLevel >= 0 && darknessLevel < 0.5) {
      return 'bright';
    }
    if (darknessLevel >= 0.5 && darknessLevel < 0.75) {
      return 'dim';
    }
    if (darknessLevel >= 0.75 && darknessLevel <= 1) {
      return 'dark';
    }
  }

  static async show_lightLevel_box(selected_token, tokenHUD, html) {
    // Determine lightLevel of the token (dark,dim,light)
    let boxString = this.lightTable[await this.find_token_lighting(selected_token)];

    const divToAdd = $('<input disabled size="3" id="lightL_scr_inp_box" title="Light Level" type="text" name="lightL_score_inp_box" value="' + boxString + '"></input>');
    html.find('.right').append(divToAdd);
  
    divToAdd.change(async (inputbox) => {
    });
  }

  static check_token_lighting(placed_token) {
    if (game.user.isGM) {
      if (Core.isValidActor(placed_token)) {
        if (placed_token.actor.system.attributes.hp.value > 0) {
          this.find_token_lighting(placed_token);
        }
      }
    }
  }
  
  static async check_all_tokens_lightingRefresh() {
    for (const placed_token of canvas.tokens.placeables) {
        this.check_token_lighting(placed_token);
    }
  }

  static async find_token_lighting(selected_token) {
    let lightLevel = 0;
    // placed lights
    if (canvas.lighting.objects) {
      for (const placed_lights of canvas.lighting.objects.children) {
        if (placed_lights.source.active == true) {
          let tokenDistance = this.get_calculated_light_distance(selected_token, placed_lights);
          let foundWall = Core.get_wall_collision(selected_token, placed_lights);
          if (!foundWall) {
            // check for dim
            if (tokenDistance <= placed_lights.document.config.dim) {
              if ((lightLevel < 1) && (placed_lights.document.config.dim > 0)) {
                lightLevel = 1;
              }
            }
            // check for bright
            if (tokenDistance <= placed_lights.document.config.bright) {
              if ((lightLevel < 2) && (placed_lights.document.config.bright > 0)) {
                lightLevel = 2;
              }
            }
          }
        }
      }
    }
    // placed tokens
    if (canvas.tokens.placeables) {
      for (const placed_tokens of canvas.tokens.placeables) {
        if (placed_tokens.actor) {
          if (placed_tokens.light.active == true) {
            let tokenDistance = Core.get_calculated_distance(selected_token, placed_tokens);
            let foundWall = Core.get_wall_collision(selected_token, placed_tokens);
            if (!foundWall) {
              // check for dim
              if (tokenDistance <= placed_tokens.document.light.dim) {
                if ((lightLevel < 1) && (placed_tokens.document.light.dim > 0)) {
                  lightLevel = 1;
                }
              }
              // check for bright
              if (tokenDistance <= placed_tokens.document.light.bright) {
                if ((lightLevel < 2) && (placed_tokens.document.light.bright > 0)) {
                  lightLevel = 2;
                }
              }
            }
          }
        }
      }
    }

    // final results determine if effects need to be removed/applied.
    let lightLevelText = 'bright';
    switch (lightLevel) {
      case 0:
        lightLevelText = 'dark';
        let dark = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dark'));
        if (!dark) {
          Effects.clearEffects(selected_token);
          Effects.addDark(selected_token);
        }
        break;
      case 1:
        lightLevelText = 'dim';
        let dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
        if (!dim) {
          Effects.clearEffects(selected_token);
          Effects.addDim(selected_token);
        }
        break;
      case 2:
        lightLevelText = 'bright';
        Effects.clearEffects(selected_token);
    }        
    await selected_token.actor.setFlag('tokenlightcondition', 'lightLevel', lightLevelText);
    
    let result = selected_token.actor.getFlag('tokenlightcondition','lightLevel')
    //Core.log(`${selected_token.actor.name} : ${result}`);

    return result;
  }

  // Check if Token is within defined range of another token i.e. Is friendly token within range of hostile token
  static get_calculated_light_distance(selected_token, placed_lights) {
    let elevated_distance = 0;
    let gridSize = canvas.grid.size;
    let gridDistance = canvas.scene.grid.distance;

    // Measure grid distance with elevation
    let e1 = Math.abs((selected_token.center.x - placed_lights.document.x));
    let e2 = Math.abs((selected_token.center.y - placed_lights.document.y));
    // lights don't have elevation?
    let e3 = Math.abs(((selected_token.document.elevation/gridDistance)* gridSize));
    let distance = Math.sqrt(e1*e1 + e2*e2 + e3*e3);

    elevated_distance = (distance / gridSize) * gridDistance;;

    return elevated_distance;
  }
}