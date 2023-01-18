import { Lighting } from './lighting.js';
import { Effects } from './effects.js';

export class Core {

  static CONSOLE_COLORS = ['background: #222; color: #ff80ff', 'color: #fff'];
  static HEADER = `<b>Token Light Condition:</b> `;

  static log(format, ...args) {
    const level = game.settings.get('tokenlightcondition', 'logLevel');
    if (level !== 'none') {
      function colorizeOutput(format, ...args) {
        return [
          `%ctokenlightcondition %c|`,
          ...Core.CONSOLE_COLORS,
          format,
          ...args,
        ];
      }
      if (level === 'debug')
        console.debug(...colorizeOutput(format, ...args));
      else if (level === 'log')
        console.log(...colorizeOutput(format, ...args));
    }
  }

  static notify(level, message, ...options) {
    if (message) {
      options ??= {};

      if (level === 'info') {
        ui.notifications.info(this.HEADER + message, options);
      } else if (level === 'warn') {
        ui.notifications.warn(this.HEADER + message, options);
      } else if (level === 'error') {
        ui.notifications.error(this.HEADER + message, options);
      }
    }
  }

  static checkModuleState() {
    let enableSetting = game.settings.get('tokenlightcondition', 'enable');
    if (enableSetting) {
      return true;
    } else {
      return false;
    }
  }

  static async toggleTokenLightCond(toggled) {
    await game.settings.set('tokenlightcondition', 'enable', toggled);
    if (game.user.isGM) {
      let enableSetting = game.settings.get('tokenlightcondition', 'enable');

      if (enableSetting) {
        Core.notify('info','Enabled: Processing all tokens...');
        await Lighting.check_all_tokens_lightingRefresh();
      } else {
        Core.notify('warn','Disabled: Removing light condition effects from all tokens');
        for (const placed_token of canvas.tokens.placeables) {
          if (this.isValidActor(placed_token)) {
            await Effects.clearEffects(placed_token);
          }
        }
        Core.notify('info','Removal Complete, Carry on!');
      }
    }
  }

  static async initialize_token(token) {
    if (game.user.isGM) {
      await token.actor.setFlag('tokenlightcondition');
      Lighting.check_token_lighting(token);
    }
  }

  static async isValidActor(selected_token) {
    if (selected_token.actor) {
      if (selected_token.actor.type == 'character' || selected_token.actor.type == 'npc') {
        if (!selected_token.actor.flags['tokenlightcondition']) {
          this.initialize_token(selected_token);
        }
        return true;
      }
    }
    return false;
  }
  
  // Return Token given its ID
  static find_token_by_token_id(token_id) {
    // Find Token which matches data.content.token_id
    for (const placed_token of canvas.tokens.placeables) {
      if (placed_token.id == token_id) {
        return placed_token;
      }
    }
    return;
  }

  // Return Token given its ID
  static find_token_by_actor_id(token_id) {
    // Find Token which matches data.content.token_id
    for (const placed_token of canvas.tokens.placeables) {
      if (placed_token.actor.id == token_id) {
        return placed_token;
      }
    }
    return;
  }

  // Return Token given 'Character' ID
  static find_token_by_user_char_id(actor_id) {
    // Iterate through all the placed tokens and find my token that the GM is referencing
    for (const placed_token of canvas.tokens.placeables) {
      if (placed_token.actor.id == game.user.character.id) {
        return placed_token;
      }
    }
    return;
  }

  // Find and Return the token that has the tokenHUD open
  static find_selected_token(tokenHUD) {
    let index_of_token = 0;
    // If more than one token controlled; find token with the TokenHUD opened and that's the one we'll work with
    if (canvas.tokens.controlled.length > 1) {
      // Get ID of the token that tokenHUD was opened on
      let token_with_hud_open = canvas.tokens.controlled.find(token => token.id == tokenHUD.object.actor.token.id);
      // Get array position of token in the controlled list
      index_of_token = canvas.tokens.controlled.indexOf(token_with_hud_open);        
    } 

    return canvas.tokens.controlled[index_of_token]; // Our selected token, the token with TokenHUD opened
  }

    // Check if Token is within defined range of another token i.e. Is friendly token within range of hostile token
  static get_calculated_distance(selected_token, placed_token) {
    let elevated_distance = 0;
    let gridSize = canvas.grid.size;
    let gridDistance = canvas.scene.grid.distance;
    
    const x1 = selected_token.center.x;
    const y1 = selected_token.center.y;
    const z1 = (selected_token.document.elevation / gridDistance) * gridSize;

    const x2 = placed_token.center.x;
    const y2 = placed_token.center.y;
    const z2 = (placed_token.document.elevation / gridDistance) * gridSize;

    // Measure grid distance with elevation
    let e1 = Math.abs(x1 - x2);
    let e2 = Math.abs(y1 - y2);
    let e3 = Math.abs(z1 - z2);
    let distance = Math.sqrt(e1*e1 + e2*e2 + e3*e3);

    elevated_distance = (distance / gridSize) * gridDistance;;

    return elevated_distance;
  }

  static get_wall_collision(selected_token, targetObject) {
    let testResult = canvas.walls.checkCollision(new Ray(selected_token.center,targetObject.center),{type:"sight"});
    if (testResult.length == 0) {
      return false; // found no collision
    } else {
      return true; // found collision
    }
  }

  static isWithinDrawing(drawingShape, token) {
    let tokenPosition = token.center

    let x = drawingShape.x;
    let y = drawingShape.y;
    let width = drawingShape.shape.width;
    let height = drawingShape.shape.height;
    let type = drawingShape.shape.type;

    if (drawingShape.rotation != 0) {
      let drawing_center = [x + 0.5 * width, y + 0.5 * height];
      tokenPosition = {
        x:
          Math.cos((-drawingShape.rotation * Math.PI) / 180) * (tokenPosition.x - drawing_center[0]) -
          Math.sin((-drawingShape.rotation * Math.PI) / 180) * (tokenPosition.y - drawing_center[1]) +
          drawing_center[0],
        y:
          Math.sin((-drawingShape.rotation * Math.PI) / 180) * (tokenPosition.x - drawing_center[0]) +
          Math.cos((-drawingShape.rotation * Math.PI) / 180) * (tokenPosition.y - drawing_center[1]) +
          drawing_center[1],
      };
    }

    if (Number.between(tokenPosition.x, x, x + width) && Number.between(tokenPosition.y, y, y + height)) {
      if (type == 'r') { // rectangular
        return true;
      } else if (type == 'e') { // ellipse
        return (
          (tokenPosition.x - x - 0.5 * width) ** 2 * (0.5 * height) ** 2 +
            (tokenPosition.y - y - 0.5 * height) ** 2 * (0.5 * width) ** 2 <=
          (0.5 * width) ** 2 * (0.5 * height) ** 2
        );
      } else if (type == 'p' || type == 'f') { // polygon or freehand
        let vertices = [];
        for (let i = 0; i < drawingShape.shape.points.length; i++) {
          if (i % 2) vertices.push([drawingShape.shape.points[i-1] + x, drawingShape.shape.points[i] + y])
        }
        let isInside = false;
        let i = 0,
          j = vertices.length - 1;
        for (i, j; i < vertices.length; j = i++) {
          if (
            vertices[i][1] > tokenPosition.y != vertices[j][1] > tokenPosition.y &&
            tokenPosition.x <
              ((vertices[j][0] - vertices[i][0]) * (tokenPosition.y - vertices[i][1])) /
                (vertices[j][1] - vertices[i][1]) +
                vertices[i][0]
          ) {
            isInside = !isInside;
          }
        }
        return isInside;
      } else {
        return true; // not a known drawing type, assume bounding box
      }
    } else {
      return false; // outside the bounding box
    }
  }
}
