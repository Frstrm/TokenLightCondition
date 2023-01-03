import { Lighting } from './lighting.js';

export class Core {

  static CONSOLE_COLORS = ['background: #222; color: #ff80ff', 'color: #fff'];

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
    } else{
      return true; // found collision
    }
  }

  static placedDrawingsContain(placeable, token) {
    let position = token.center

    if (placeable instanceof DrawingDocument) {
      let x = placeable.x;
      let y = placeable.y;
      let width = placeable.shape.width;
      let height = placeable.shape.height;
      let type = placeable.shape.type;

      if (placeable.rotation != 0) {
        let drawing_center = [x + 0.5 * width, y + 0.5 * height];
        position = {
          x:
            Math.cos((-placeable.rotation * Math.PI) / 180) * (position.x - drawing_center[0]) -
            Math.sin((-placeable.rotation * Math.PI) / 180) * (position.y - drawing_center[1]) +
            drawing_center[0],
          y:
            Math.sin((-placeable.rotation * Math.PI) / 180) * (position.x - drawing_center[0]) +
            Math.cos((-placeable.rotation * Math.PI) / 180) * (position.y - drawing_center[1]) +
            drawing_center[1],
        };
      }

      if (Number.between(position.x, x, x + width) && Number.between(position.y, y, y + height)) {
        if (type == 'r') { // rectangular
          return true;
        } else if (type == 'e') { // ellipse
          return (
            (position.x - x - 0.5 * width) ** 2 * (0.5 * height) ** 2 +
              (position.y - y - 0.5 * height) ** 2 * (0.5 * width) ** 2 <=
            (0.5 * width) ** 2 * (0.5 * height) ** 2
          );
        } else if (type == 'p' || type == 'f') { // polygon or freehand
          let vertices = [];
          for (let i = 0; i < placeable.shape.points.length; i++) {
            if (i % 2) vertices.push([placeable.shape.points[i-1] + x, placeable.shape.points[i] + y])
          }
          let isInside = false;
          let i = 0,
            j = vertices.length - 1;
          for (i, j; i < vertices.length; j = i++) {
            if (
              vertices[i][1] > position.y != vertices[j][1] > position.y &&
              position.x <
                ((vertices[j][0] - vertices[i][0]) * (position.y - vertices[i][1])) /
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

    // TODO other specific placeable case NoteDocument, WallDocument
    else {
      // Other types of placeables don't have an area that could contain the position
      let width = placeable.w ?? placeable.document?.width ?? placeable.width;
      if (placeable?.object) {
        width = placeable?.object?.w ?? placeable?.object?.document?.width ?? placeable?.object?.width ?? width;
      }
      let height = placeable.h ?? placeable.document?.height ?? placeable.height;
      if (placeable?.object) {
        height = placeable?.object?.h ?? placeable?.object?.document?.height ?? placeable?.object?.height ?? height;
      }
      let x = placeable.x ?? placeable?.document?.x;
      if (placeable?.object) {
        x = placeable?.object?.x ?? placeable?.object?.document?.x ?? x;
      }
      let y = placeable?.y ?? placeable?.document?.y;
      if (placeable?.object) {
        y = placeable?.object?.y ?? placeable?.object?.document?.y ?? y;
      }
      return Number.between(position.x, x, x + width) && Number.between(position.y, y, y + height);
    }
  }

}
