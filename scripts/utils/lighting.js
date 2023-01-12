import { Core } from './core.js';
import { Effects } from './effects.js';

export class Lighting {

  static lightTable = {'dark':'DRK', 'dim':'DIM', 'bright':'BRT'};

  static async setDarknessThreshold(darknessLevel) {
    if (darknessLevel >= 0 && darknessLevel < 0.5) {
      return 'bright';
    } else if (darknessLevel >= 0.5 && darknessLevel < 0.75) {
      return 'dim';
    }
    return 'dark';
  }

  static setLightLevel(darknessLevel) {
    if (darknessLevel >= 0 && darknessLevel < 0.5) {
      return 2;
    } else if (darknessLevel >= 0.5 && darknessLevel < 0.75) {
      return 1;
    }
    return 0;
  }

  static async show_lightLevel_box(selected_token, tokenHUD, html) {
    if (selected_token.actor.system.attributes.hp.value > 0) {
      // Determine lightLevel of the token (dark,dim,light)
      let boxString = this.lightTable[await this.find_token_lighting(selected_token)];

      const divToAdd = $('<input disabled id="lightL_scr_inp_box" title="Light Level" type="text" name="lightL_score_inp_box" value="' + boxString + '"></input>');
      html.find('.right').append(divToAdd);
    
      divToAdd.change(async (inputbox) => {
      });
    }
  }

  static async show_lightLevel_player_box(selected_token, tokenHUD, html) {
    if (selected_token.actor.system.attributes.hp.value > 0) {
      // Show the stored value lightLevel of the token (dark,dim,light)
      // only the GM should be processing the token light level.
      let storedResult = selected_token.actor.getFlag('tokenlightcondition','lightLevel');

      let boxString = this.lightTable[storedResult];

      const divToAdd = $('<input disabled id="lightL_scr_inp_box" title="Light Level" type="text" name="lightL_score_inp_box" value="' + boxString + '"></input>');
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

    if (game.modules.get('perfect-vision')?.active) {
      // placed drawings with light overrides (perfect-vision)
      let drawingArray = [];
      if (canvas.drawings.placeables) {
        for (const placed_drawing of canvas.drawings.placeables) {
          if (placed_drawing.document.flags['perfect-vision']) {
            if (placed_drawing.document.flags['perfect-vision'].enabled) {
              let result = Core.isWithinDrawing(placed_drawing.document,selected_token);
              if (result) {
                drawingArray.push(placed_drawing);
              }
            }
            else {
              // drawing is not enabled
            }
          }
        }
        // if a drawing is found, or if there are multiple...
        if (drawingArray.length > 0) {
          let toplayer = null;
          let layerZ = -1000;
          // sort to find the top layer token is in
          for (const drawitem of drawingArray) {
            if (drawitem._zIndex > layerZ) {
              layerZ = drawitem._zIndex;
              toplayer = drawitem;
            }
          }
          // read the darkness from the top layer
          let findDarkness = false;
          let drawingOverride = toplayer.document.flags['perfect-vision'].darkness;
          if (drawingOverride != null) { 
            // found darkness, don't do anything else
          }
          else {
            // find a layer with inheritance that has darkness
            let nextLayer = toplayer; 
            let loopCount = 0;
            while (!findDarkness) {
              let objectID = nextLayer.document.flags['perfect-vision'].prototype;
              if (objectID) {
                for (const findDrawing of canvas.drawings.placeables) {
                  if (findDrawing.id == objectID) {
                    nextLayer = findDrawing;
                    drawingOverride = nextLayer.document.flags['perfect-vision'].darkness;
                    if (drawingOverride != null) {
                      findDarkness = true;
                    }
                  }
                }
              } else {
                findDarkness = true; // there is no more prototypes to search, exit
              }
              loopCount = loopCount + 1;
              if (loopCount > 10) {
                findDarkness = true; // don't get caught in a infinite loop if someone links their drawings together.
              }
            }
          }
          if (drawingOverride != null) { // we still don't have an override, skip
            let drawingLightLevel = this.setLightLevel(drawingOverride);
            if (drawingLightLevel > lightLevel) {
              lightLevel = drawingLightLevel;
            }
          }
        }
      }
    }

    if (lightLevel < 2) {
      // placed lights
      if (canvas.lighting.objects) {
        for (const placed_light of canvas.lighting.objects.children) {
          if (placed_light.source.active == true) {
            let tokenDistance = this.get_calculated_light_distance(selected_token, placed_light);
            let lightDimDis = placed_light.document.config.dim;
            let lightBrtDis = placed_light.document.config.bright;

            if (tokenDistance <= lightDimDis || tokenDistance <= lightBrtDis) {
              // If light has a reduced angle and possibly rotated...
              let inLight = true;
              if (placed_light.document.config.angle < 360) {
                let lightAngle = placed_light.document.config.angle;
                let lightRotation = placed_light.document.rotation;
                let angle = this.get_calculated_light_angle(selected_token, placed_light);

                // convert from +180/-180
                if (angle < 0) {angle += 360;}

                // find the difference between token angle and light rotation
                let adjustedAngle = Math.abs(angle - lightRotation);
                if (adjustedAngle > 180) {adjustedAngle = 360 - adjustedAngle;}
                
                // check if token is in the light wedge or not
                if (adjustedAngle > (lightAngle /2)) {
                  inLight = false;
                }
              }

              // If the token is found to be within a potential light...
              if (inLight) {
                let foundWall = Core.get_wall_collision(selected_token, placed_light);

                if (!foundWall) {
                  // check for dim
                  if (tokenDistance <= lightDimDis) {
                    if ((lightLevel < 1) && (lightDimDis > 0)) {
                      lightLevel = 1;
                    }
                  }
                  // check for bright
                  if (tokenDistance <= lightBrtDis) {
                    if ((lightLevel < 2) && (lightBrtDis > 0)) {
                      lightLevel = 2;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (lightLevel < 2) {
      // placed tokens
      if (canvas.tokens.placeables) {
        for (const placed_token of canvas.tokens.placeables) {
          if (placed_token.actor) {
            if (placed_token.light.active == true) {
              let tokenDistance = Core.get_calculated_distance(selected_token, placed_token);
              let tokenDimDis = placed_token.document.light.dim;
              let tokenBrtDis = placed_token.document.light.bright;
              
              if (tokenDistance <= tokenDimDis || tokenDistance <= tokenBrtDis) {
                let inLight = true;
                if (placed_token.light.data.angle < 360) {
                  let lightAngle = placed_token.light.data.angle;
                  let lightRotation = placed_token.light.data.rotation;
                  let angle = this.get_calculated_light_angle(selected_token, placed_token);
                  // convert from +180/-180
                  if (angle < 0) {angle += 360;}
  
                  // find the difference between token angle and light rotation
                  let adjustedAngle = Math.abs(angle - lightRotation);
                  if (adjustedAngle > 180) {adjustedAngle = 360 - adjustedAngle;}
                  
                  // check if token is in the light wedge or not
                  if (adjustedAngle > (lightAngle /2)) {
                    inLight = false;
                  }

                  // override if the source of the angled token light is yourself.
                  if (placed_token.actor.id == selected_token.actor.id) {
                    inLight = true;
                  }
                }
  
                if (inLight) {
                  let foundWall = Core.get_wall_collision(selected_token, placed_token);
                  if (!foundWall) {
                    // check for within dim
                    if (tokenDistance <= tokenDimDis) {
                      if ((lightLevel < 1) && (tokenDimDis > 0)) {
                        lightLevel = 1;
                      }
                    }
                    // check for within bright
                    if (tokenDistance <= tokenBrtDis) {
                      if ((lightLevel < 2) && (tokenBrtDis > 0)) {
                        lightLevel = 2;
                      }
                    }
                  }
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
          await Effects.clearEffects(selected_token);
          await Effects.addDark(selected_token);
        }
        break;
      case 1:
        lightLevelText = 'dim';
        let dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
        if (!dim) {
          await Effects.clearEffects(selected_token);
          await Effects.addDim(selected_token);
        }
        break;
      case 2:
        lightLevelText = 'bright';
        await Effects.clearEffects(selected_token);
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
    if (game.modules.get('levels')?.active) {
      if (placed_lights.document.flags['levels']) {
        let t = placed_lights.document.flags['levels'].rangeTop;
        let b = placed_lights.document.flags['levels'].rangeBottom;

        if (t == null) {t = 1000;}
        if (b == null) {b = -1000;}

        // for levels we should treat bottom as floor that can't be seen through

        if (z1 > t) {t = z1;}
        if (z1 < (b - 5)) {return 1000;} // Treat this as a floor
        
        // between top and bottom so, treat it as a pill
        // treat the light as being at the same level as the token for calculation
        if ((z1 > b) && (z1 < t)) {
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
    let e3 = Math.abs(z1Actual - z2Actual);
    let distance = Math.sqrt(e1*e1 + e2*e2 + e3*e3);

    elevated_distance = (distance / gridSize) * gridDistance;;

    return elevated_distance;
  }

  static get_calculated_light_angle(selected_token, placed_lights) {
    const a1 = placed_lights.center.x;
    const a2 = placed_lights.center.y;
    const b1 = selected_token.center.x;
    const b2 = selected_token.center.y;

    if (selected_token.center == placed_lights.center) {
      return 0;
    }

    let angle = Math.atan2(a1-b1, b2-a2) * ( 180 / Math.PI);

    return angle;
  }
}