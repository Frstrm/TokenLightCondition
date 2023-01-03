import { Core } from './core.js';
import { Effects } from './effects.js';

export class Lighting {

  static lightTable = {'dark':'DRK', 'dim':'DIM', 'bright':'BRT'};

  static async setDarknessThreshold(darknessLevel) {
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

  static setLightLevel(darknessLevel) {
    if (darknessLevel >= 0 && darknessLevel < 0.5) {
      return 2;
    }
    if (darknessLevel >= 0.5 && darknessLevel < 0.75) {
      return 1;
    }
    if (darknessLevel >= 0.75 && darknessLevel <= 1) {
      return 0;
    }
  }

  static async show_lightLevel_box(selected_token, tokenHUD, html) {
    if (selected_token.actor.system.attributes.hp.value > 0) {
      // Determine lightLevel of the token (dark,dim,light)
      let boxString = this.lightTable[await this.find_token_lighting(selected_token)];

      const divToAdd = $('<input disabled size="3" id="lightL_scr_inp_box" title="Light Level" type="text" name="lightL_score_inp_box" value="' + boxString + '"></input>');
      html.find('.right').append(divToAdd);
    
      divToAdd.change(async (inputbox) => {
      });
    }
  }

  static async check_token_lighting(placed_token) {
    if (game.user.isGM) {
      if (Core.isValidActor(placed_token)) {
        if (placed_token.actor.system.attributes.hp.value > 0) {
          await this.find_token_lighting(placed_token);
        } else {
          Effects.clearEffects(placed_token);
        }
      }
    }
  }
  
  static async check_all_tokens_lightingRefresh() {
    let result = [];
    for (const placed_token of canvas.tokens.placeables) {
        result.push(await this.check_token_lighting(placed_token));
    }
    return result;
  }

  static async find_token_lighting(selected_token) {
    let lightLevel = 0;

    // placed drawings with light overrides (perfect-vision)
    if (canvas.drawings.placeables) {
      for (const placed_drawing of canvas.drawings.placeables) {
        if (placed_drawing.document.flags['perfect-vision'].enabled) {
          let result = Core.placedDrawingsContain(placed_drawing.document,selected_token);
          Core.log("result:",selected_token.actor.name,result);

          if (result) {
            let drawingOverride = placed_drawing.document.flags['perfect-vision'].darkness;
            let drawingLightLevel = this.setLightLevel(drawingOverride);
            Core.log("return lightLevel:",drawingLightLevel);
            if (drawingLightLevel > lightLevel) {
              lightLevel = drawingLightLevel;
              Core.log("set lightLevel:",lightLevel);
            }
          }
        }
        else {
          Core.log("no darkness:",placed_drawing);
        }
      }
    }

    // placed lights
    if (canvas.lighting.objects) {
      for (const placed_light of canvas.lighting.objects.children) {
        if (placed_light.source.active == true) {
          let tokenDistance = this.get_calculated_light_distance(selected_token, placed_light);
          let foundWall = Core.get_wall_collision(selected_token, placed_light);
          if (!foundWall) {
            // check for dim
            if (tokenDistance <= placed_light.document.config.dim) {
              if ((lightLevel < 1) && (placed_light.document.config.dim > 0)) {
                lightLevel = 1;
              }
            }
            // check for bright
            if (tokenDistance <= placed_light.document.config.bright) {
              if ((lightLevel < 2) && (placed_light.document.config.bright > 0)) {
                lightLevel = 2;
              }
            }
          }
        }
      }
    }
    // placed tokens
    if (canvas.tokens.placeables) {
      for (const placed_token of canvas.tokens.placeables) {
        if (placed_token.actor) {
          if (placed_token.light.active == true) {
            let tokenDistance = Core.get_calculated_distance(selected_token, placed_token);
            let foundWall = Core.get_wall_collision(selected_token, placed_token);
            if (!foundWall) {
              // check for dim
              if (tokenDistance <= placed_token.document.light.dim) {
                if ((lightLevel < 1) && (placed_token.document.light.dim > 0)) {
                  lightLevel = 1;
                }
              }
              // check for bright
              if (tokenDistance <= placed_token.document.light.bright) {
                if ((lightLevel < 2) && (placed_token.document.light.bright > 0)) {
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
    let z1Actual = 0;
    let z2Actual = 0;

    const x1 = selected_token.center.x;
    const y1 = selected_token.center.y;
    let z1 = selected_token.document.elevation;

    const x2 = placed_lights.center.x;
    const y2 = placed_lights.center.y;
    let z2 = 0;

    // If using Mod that adds elevation to light placements ( Levels for example )
    if (placed_lights.document.elevation) {
      z2 = placed_lights.document.elevation;
     
      if (placed_lights.t || placed_lights.b) {
        let t = placed_lights.t;
        let b = placed_lights.b;

        if (t == 'Infinity') {t = z1;}
        if (b == 'Infinity') {b = z1;}

        if (z1 <= b) {z2 = b;}
        if (z1 >= t) {z2 = t;}
        // between top and bottom so, treat it as a pill
        // treat the light as being at the same level as the token for calculation
        if ((z1 >= t) && (z1 <= t)) {
          z2 = z1;
        }
      }
    }

    // convert elevation (ft) to canvas grid values
    z1Actual =  (z1 / gridDistance) * gridSize;
    z2Actual = (z2 / gridDistance) * gridSize;
    
    // Measure grid distance with elevation
    let e1 = Math.abs(x1 - x2);
    let e2 = Math.abs(y1 - y2);
    let e3 = Math.abs(z1Actual - z2);
    let distance = Math.sqrt(e1*e1 + e2*e2 + e3*e3);

    elevated_distance = (distance / gridSize) * gridDistance;;

    return elevated_distance;
  }
}