import { Core } from './core.js';

export class Lighting {

  static lightTable = {'dark':'DRK','dim':'DIM','bright':'BRT'};

  static async show_lightLevel_box(selected_token, tokenHUD,html){
    // Determine lightLevel of the token (dark,dim,light)
    let flagText = await Lighting.find_token_lighting(selected_token);
    let boxString = Lighting.lightTable[flagText];

    const divToAdd = $('<input disabled id="lightL_scr_inp_box" title="Light Level" type="text" name="lightL_score_inp_box" value="' + boxString + '"></input>');
    html.find('.right').append(divToAdd);
  
    divToAdd.change(async (inputbox) => {
    });
  }

  static async check_token_lighting(placed_token){
    let lightLevel = await Lighting.find_token_lighting(placed_token);
  }
  
  static async check_all_token_lighting(data){
    if (data.label == game.i18n.localize('tokenlightcond-effect-light')){
      for (const placed_token of canvas.tokens.placeables){
        if (Core.isValidActor(placed_token)){
          Lighting.check_token_lighting(placed_token);
        }
      }
    }
  }

  static async find_token_lighting(selected_token){
    let lightLevel = 0;
    // placed lights
    for (const placed_lights of canvas.lighting.objects.children){
      if (placed_lights.source.active == true){
        let tokenDistance = Lighting.get_calculated_light_distance(selected_token, placed_lights);
        let foundWall = Core.get_wall_collision(selected_token, placed_lights);
        if (!foundWall){
          // check for dim
          if (tokenDistance <= placed_lights.document.config.dim){
            if ((lightLevel < 1) && (placed_lights.document.config.dim > 0)){
              lightLevel = 1;
            }
          }
          // check for bright
          if (tokenDistance <= placed_lights.document.config.bright){
            if ((lightLevel < 2) && (placed_lights.document.config.bright > 0)){
              lightLevel = 2;
            }
          }
        }
      }
    }
    // placed tokens
    for (const placed_tokens of canvas.tokens.placeables){
      if (placed_tokens.actor){
        if (placed_tokens.light.active == true){
          let tokenDistance = Core.get_calculated_distance(selected_token, placed_tokens);
          let foundWall = Core.get_wall_collision(selected_token, placed_tokens);
          if (!foundWall){
            // check for dim
            if (tokenDistance <= placed_tokens.document.light.dim){
              if ((lightLevel < 1) && (placed_tokens.document.light.dim > 0)){
                lightLevel = 1;
              }
            }
            // check for bright
            if (tokenDistance <= placed_tokens.document.light.bright){
              if ((lightLevel < 2) && (placed_tokens.document.light.bright > 0)){
                lightLevel = 2;
              }
            }
          }
        }
      }
    }

    // final results determine if effects need to be removed/applied.
    let lightLevelText = 'bright';
    switch (lightLevel){
      case 0:
        lightLevelText = 'dark';
        Lighting.addDark(selected_token);
        break;
      case 1:
        lightLevelText = 'dim';
        Lighting.addDim(selected_token);
        break;
      case 2:
        lightLevelText = 'bright';
        Lighting.clearEffects(selected_token);
    }        
    await selected_token.actor.setFlag('tokenlightcondition', 'lightLevel', lightLevelText);
    
    let result = selected_token.actor.getFlag('tokenlightcondition','lightLevel')
    Core.log(`${selected_token.actor.name} : ${result}`);

    return result;
  }
  
  static async clearEffects(selected_token){
    let dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
    if (dim){
      await game.dfreds.effectInterface.removeEffect({ effectName: dim.label, uuid: selected_token.actor.uuid });
      Core.log(`CE Dim Removed: ${selected_token.actor.name}`);
    }
    let dark = selected_token.actor.effects.find(e => e.label === lableDark);
    if (dark){
      await game.dfreds.effectInterface.removeEffect({ effectName: dark.label, uuid: selected_token.actor.uuid });
      Core.log(`CE Dark Removed: ${selected_token.actor.name}`);
    }
  }

  static async addDark(selected_token){
    let dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
    if (dim){
      await game.dfreds.effectInterface.removeEffect({ effectName: dim.label, uuid: selected_token.actor.uuid });
      Core.log(`CE Dim Removed: ${selected_token.actor.name}`);
    }

    let dark  = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dark'));
    if (!dark) {
      await game.dfreds.effectInterface.addEffect({ effectName: game.i18n.localize('tokenlightcond-effect-dark'), uuid: selected_token.actor.uuid });
      dark = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dark'));
      Core.log(`CE Dark added: ${selected_token.actor.name}`);
    }
  }

  static async addDim(selected_token){
    let dark = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dark'));
    if (dark){
      await game.dfreds.effectInterface.removeEffect({ effectName: dark.label, uuid: selected_token.actor.uuid });
      Core.log(`CE Dark Removed: ${selected_token.actor.name}`);
    }

    let dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
    if (!dim) {
      await game.dfreds.effectInterface.addEffect({ effectName: game.i18n.localize('tokenlightcond-effect-dim'), uuid: selected_token.actor.uuid });
      dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
      Core.log(`CE Dim added: ${selected_token.actor.name}`);
    }
  }

  // Check if Token is within defined range of another token i.e. Is friendly token within range of hostile token
  static get_calculated_light_distance(selected_token, placed_lights){
    let calculated_distance = 0;

    // Measure grid distance
    let gridsize = canvas.grid.size;
    let d1 = Math.abs((selected_token.center.x - placed_lights.document.x) / gridsize);
    let d2 = Math.abs((selected_token.center.y - placed_lights.document.y) / gridsize);
    let dist = Math.max(d1, d2);

    calculated_distance = dist * canvas.scene.grid.distance;
    return calculated_distance;
  }

  static makeDarkEffect() {
    const dark = {
      label: game.i18n.localize('tokenlightcond-effect-dark'),
      icon: 'icons/magic/perception/shadow-stealth-eyes-purple.webp',
      changes: [],
      flags: { convenientDescription: game.i18n.localize('tokenlightcond-effect-dark-desc') },
    };

    return dark;
  }

  static makeDimEffect() {
    const dim = {
      label: game.i18n.localize('tokenlightcond-effect-dim'),
      icon: 'icons/magic/perception/shadow-stealth-eyes-purple.webp',
      changes: [],
      flags: { convenientDescription: game.i18n.localize('tokenlightcond-effect-dim-desc') },
    };

    return dim;
  }

}