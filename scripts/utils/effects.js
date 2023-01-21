import { Core } from './core.js';

export class Effects {

  static dimIcon = 'icons/skills/melee/weapons-crossed-swords-black-gray.webp';
  static darkIcon = 'icons/skills/melee/weapons-crossed-swords-black.webp';

  static async initializeEffects() {
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    if (source === 'ce') {
      const ce = game.dfreds?.effectInterface;
      // create CE effects
      if (ce) {
        let ceDark = ce.findCustomEffectByName(game.i18n.localize('tokenlightcond.effect.dark.label'));
        if (!ceDark) {
          const dark = this.makeDarkEffectCE();
          ce.createNewCustomEffectsWith({ activeEffects: [dark] });
        }
        let ceDim = ce.findCustomEffectByName(game.i18n.localize('tokenlightcond.effect.dim.label'));
        if (!ceDim) {
          const dim = this.makeDimEffectCE();
          ce.createNewCustomEffectsWith({ activeEffects: [dim] });
        }
      }
    }
  }
  
  static makeDarkEffectCE() {
    const dark = {
      label: game.i18n.localize('tokenlightcond.effect.dark.label'),
      icon: this.darkIcon,
      changes: [],
      flags: { convenientDescription: game.i18n.localize('tokenlightcond.effect.dark.desc') },
    };

    return dark;
  }

  static makeDimEffectCE() {
    const dim = {
      label: game.i18n.localize('tokenlightcond.effect.dim.label'),
      icon: this.dimIcon,
      changes: [],
      flags: { convenientDescription: game.i18n.localize('tokenlightcond.effect.dim.desc') },
    };

    return dim;
  }

  static async clearEffects(selected_token) {
    let foundEffects = true;
    // edge case, if there are multiple effects on the token
    while (foundEffects) {
      const dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond.effect.dim.label'));
      const dark = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond.effect.dark.label'));

      if (!dim && !dark) {
        foundEffects = false;
      }

      if (dim) {
  //      Core.log(`attempting to clear: Dim: ${dim.label}:${dim.id} from: ${selected_token.actor.name}`)
        await selected_token.actor.deleteEmbeddedDocuments('ActiveEffect', [dim.id])
      }
      if (dark) {
  //      Core.log(`attempting to clear: Dark: ${dark.label}:${dark.id} from: ${selected_token.actor.name}`)
        await selected_token.actor.deleteEmbeddedDocuments('ActiveEffect', [dark.id])
      }
    }
  }

  static async addDark(selected_token) {
    const dark = await selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond.effect.dark.label'));
    const ce = game.dfreds?.effectInterface;
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    if (!dark) {
      let added = false;
      if (source === 'ce') {
        if (ce) {
          await game.dfreds.effectInterface.addEffect({ effectName: game.i18n.localize('tokenlightcond.effect.dark.label'), uuid: selected_token.actor.uuid });
          added = true;
        }
      }
      if (source === 'cub') {
        await game.cub.applyCondition(game.i18n.localize('tokenlightcond.effect.dark.label'), selected_token.actor);
        added = true;
      }
      if (source === 'ae') {
        await this.addDarkAE(selected_token);
        added = true;
      }
      if (added) {
        Core.log(`Dark added: ${selected_token.actor.name} via ${source}`);
      }
    }
  }

  static async addDim(selected_token) {
    const dim = await selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond.effect.dim.label'));
    const ce = game.dfreds?.effectInterface;
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    if (!dim) {
      let added = false;
      if (source === 'ce') {
        if (ce) {
          await game.dfreds.effectInterface.addEffect({ effectName: game.i18n.localize('tokenlightcond.effect.dim.label'), uuid: selected_token.actor.uuid });
          added = true;
        }
      }
      if (source === 'cub') {
        if (source === 'cub') {
          await game.cub.applyCondition(game.i18n.localize('tokenlightcond.effect.dim.label'), selected_token.actor);
          added = true;
        }
      }
      if (source === 'ae') {
        await this.addDimAE(selected_token);
        added = true;
      }
      if (added) {
        Core.log(`Dim added: ${selected_token.actor.name} via ${source}`);
      }
    }
  }

  static async addDarkAE(selected_token) {
    // If we haven't found an ouside source, create the default one
    const label = game.i18n.localize("tokenlightcond.effect.dark.label");
    let dark = selected_token.actor.effects.find(e => e.label === label);

    if (!dark) {
      dark = {
        label: label,
        icon: this.darkIcon,
        changes: [],
        flags: { convenientDescription: game.i18n.localize("tokenlightcond.effect.dark.desc") },
      };

      dark.flags['core.statusId'] = '1';
      await selected_token.actor.createEmbeddedDocuments('ActiveEffect', [dark]);
    }
  }

  static async addDimAE(selected_token) {
    // If we haven't found an ouside source, create the default one
    const label = game.i18n.localize("tokenlightcond.effect.dim.label");
    let dim = selected_token.actor.effects.find(e => e.label === label);

    if (!dim) {
      dim = {
        label: label,
        icon: this.dimIcon,
        changes: [],
        flags: { convenientDescription: game.i18n.localize("tokenlightcond.effect.dim.desc") },
      };

      dim.flags['core.statusId'] = '1';
      await selected_token.actor.createEmbeddedDocuments('ActiveEffect', [dim]);
    }
  }
}