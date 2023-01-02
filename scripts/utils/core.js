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

    // Measure grid distance with elevation
    let e1 = Math.abs((selected_token.center.x - placed_token.center.x));
    let e2 = Math.abs((selected_token.center.y - placed_token.center.y));
    let e3 = Math.abs((((selected_token.document.elevation / gridDistance) - (placed_token.document.elevation / gridDistance)) * gridSize));
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
  
}

