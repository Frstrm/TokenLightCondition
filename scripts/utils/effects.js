import { Core } from './core.js';

export class Effects {

  static dimIcon = 'icons/skills/melee/weapons-crossed-swords-black-gray.webp';
  static darkIcon = 'icons/skills/melee/weapons-crossed-swords-black.webp';

  static async initializeEffects() {
    const system_pf2e = (game.system.id == 'pf2e');

    if (system_pf2e) {
      await this.initializeEffects_pf2e();
    } else {
      await this.initializeEffects_dnd5e();
    }
  }

  static async initializeEffects_dnd5e() {
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    if (source === 'ce') {
      const ce = game.dfreds?.effectInterface;
      // create CE effects

      if (ce) {
        let ceDark = ce.findCustomEffectByName(game.i18n.localize('tokenlightcond-effect-dark'));

        if (!ceDark) {
          const dark = this.makeDarkEffectCE();
          ce.createNewCustomEffectsWith({ activeEffects: [dark] });
        }

        let ceDim = ce.findCustomEffectByName(game.i18n.localize('tokenlightcond-effect-dim'));

        if (!ceDim) {
          const dim = this.makeDimEffectCE();
          ce.createNewCustomEffectsWith({ activeEffects: [dim] });
        }
      }
    }
  }

  static async initializeEffects_pf2e() {
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    const dim = game.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dim'));
    const dark = game.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dark'));

    if (!dim) {
      const dimData = this.pf2eCreateDimData();
      let dimItem = await Item.create(dimData);
    }

    if (!dark) {
      const darkData = this.pf2eCreateDarkData();
      let darkItem = await Item.create(darkData);
    }
  }

  static makeDarkEffectCE() {
    const dark = {
      label: game.i18n.localize('tokenlightcond-effect-dark'),
      icon: this.darkIcon,
      changes: [],
      flags: { convenientDescription: game.i18n.localize('tokenlightcond-effect-dark-desc') },
    };

    return dark;
  }

  static makeDimEffectCE() {
    const dim = {
      label: game.i18n.localize('tokenlightcond-effect-dim'),
      icon: this.dimIcon,
      changes: [],
      flags: { convenientDescription: game.i18n.localize('tokenlightcond-effect-dim-desc') },
    };

    return dim;
  }

  static pf2eCreateDimData() {
    const dim = {
      type: 'effect',
      name: game.i18n.localize('tokenlightcond-effect-dim'),
      img: 'systems/pf2e/icons/default-icons/character.svg',
      data: {
        tokenIcon: { show: true },
        duration: {
          value: 1,
          unit: 'unlimited',
          sustained: false,
          expiry: 'turn-start',
        },
        description: {
          value: game.i18n.localize('tokenlightcond-effect-dim-desc'),
        },
        unidentified: true,
        traits: {
          custom: '',
          rarity: 'common',
          value: [],
        },
        level: {
          value: 0,
        },
        source: {
          value: '',
        },
        slug: `tokenlightcondition-dim`,
      },
      flags: {}
    }

    return dim
  }

  static pf2eCreateDarkData() {
    const dark = {
      type: 'effect',
      name: game.i18n.localize('tokenlightcond-effect-dark'),
      img: 'systems/pf2e/icons/default-icons/ancestry.svg',
      data: {
        tokenIcon: { show: true },
        duration: {
          value: 1,
          unit: 'unlimited',
          sustained: false,
          expiry: 'turn-start',
        },
        description: {
          value: game.i18n.localize('tokenlightcond-effect-dark-desc'),
        },
        unidentified: true,
        traits: {
          custom: '',
          rarity: 'common',
          value: [],
        },
        level: {
          value: 0,
        },
        source: {
          value: '',
        },
        slug: `tokenlightcondition-dark`,
      },
      flags: {}
    }

    return dark;
  }

  static async clearEffects(selected_token) {
    const system_pf2e = (game.system.id == 'pf2e');

    if (system_pf2e) {
      await this.clearEffects_pf2e(selected_token);
    } else {
      await this.clearEffects_dnd5e(selected_token);
    }
  }

  static async clearEffects_dnd5e(selected_token){
    let foundEffects = true;

    // edge case, if there are multiple effects on the token
    while (foundEffects) {
      const dim = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
      const dark = selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dark'));

      if (!dim && !dark) {
        foundEffects = false;
      }

      if (dim) {
        await selected_token.actor.deleteEmbeddedDocuments('ActiveEffect', [dim.id])
      }

      if (dark) {
        await selected_token.actor.deleteEmbeddedDocuments('ActiveEffect', [dark.id])
      }
    }
  }

  static async clearEffects_pf2e(selected_token) {
    let foundEffects = true;

    // edge case, if there are multiple effects on the token
    while (foundEffects) {
      const dim = selected_token.actor.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dim'));
      const dark = selected_token.actor.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dark'));

      if (!dim && !dark) {
        foundEffects = false;
      }

      if (dim) {
        await selected_token.actor.deleteEmbeddedDocuments('Item', [dim.id]);
      }

      if (dark) {
        await selected_token.actor.deleteEmbeddedDocuments('Item', [dark.id])
      }
    }
  }

  static async addDark(selected_token) {
    const system_pf2e = (game.system.id == 'pf2e');
    let dark = '';
    if (system_pf2e) {
      dark = await selected_token.actor.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dark'));
    } else {
      dark = await selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dark'));
    }

    const ce = game.dfreds?.effectInterface;
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    if (!dark) {
      let added = false;
      if (source === 'ce') {
        if (ce) {
          await game.dfreds.effectInterface.addEffect({ effectName: game.i18n.localize('tokenlightcond-effect-dark'), uuid: selected_token.actor.uuid });
          added = true;
        }
      }
      if (source === 'cub') {
        await game.cub.applyCondition(game.i18n.localize('tokenlightcond-effect-dark'), selected_token.actor);
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
    const system_pf2e = (game.system.id == 'pf2e');
    let dim = '';
    if (system_pf2e) {
      dim = await selected_token.actor.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dim'));
    } else {
      dim = await selected_token.actor.effects.find(e => e.label === game.i18n.localize('tokenlightcond-effect-dim'));
    }

    const ce = game.dfreds?.effectInterface;
    const source = game.settings.get('tokenlightcondition', 'effectSource');

    if (!dim) {
      let added = false;
      if (source === 'ce') {
        if (ce) {
          await game.dfreds.effectInterface.addEffect({ effectName: game.i18n.localize('tokenlightcond-effect-dim'), uuid: selected_token.actor.uuid });
          added = true;
        }
      }
      if (source === 'cub') {
        if (source === 'cub') {
          await game.cub.applyCondition(game.i18n.localize('tokenlightcond-effect-dim'), selected_token.actor);
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
    const system_pf2e = (game.system.id == 'pf2e');
    if (system_pf2e) {
      await this.addDarkAE_pf2e(selected_token);
    } else {
      await this.addDarkAE_dnd5e(selected_token);
    }
  }

  static async addDarkAE_dnd5e(selected_token) {
    const label = game.i18n.localize('tokenlightcond-effect-dark');
    let dark = selected_token.actor.effects.find(e => e.label === label);

    if (!dark) {
      dark = {
        label: label,
        icon: this.darkIcon,
        changes: [],
        flags: { convenientDescription: game.i18n.localize('tokenlightcond-effect-dark-desc') },
      };
    }

    dark.flags['core.statusId'] = '1';
    await selected_token.actor.createEmbeddedDocuments('ActiveEffect', [dark]);
  }

  static async addDarkAE_pf2e(selected_token) {
    const label = game.i18n.localize('tokenlightcond-effect-dark');
    let dark = selected_token.actor.items.find(e => e.name === label);

    if (!dark) {
      dark = game.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dark'));
    }

    dark.flags['core.statusId'] = '1';
    await selected_token.actor.createEmbeddedDocuments('Item', [dark]);
  }

  static async addDimAE(selected_token) {
    // If we haven't found an ouside source, create the default one
    const system_pf2e = (game.system.id == 'pf2e');
    if (system_pf2e) {
      await this.addDimAE_pf2e(selected_token);
    } else {
      await this.addDimAE_dnd5e(selected_token);
    }
  }

  static async addDimAE_dnd5e(selected_token) {
    // If we haven't found an ouside source, create the default one
    const label = game.i18n.localize('tokenlightcond-effect-dim');
    let dim = selected_token.actor.effects.find(e => e.label === label);

    if (!dim) {
      dim = {
        label: label,
        icon: this.dimIcon,
        changes: [],
        flags: { convenientDescription: game.i18n.localize('tokenlightcond-effect-dim-desc') },
      };
    }

    dim.flags['core.statusId'] = '1';
    await selected_token.actor.createEmbeddedDocuments('ActiveEffect', [dim]);
  }

  static async addDimAE_pf2e(selected_token) {
    // If we haven't found an ouside source, create the default one
    const label = game.i18n.localize('tokenlightcond-effect-dim');
    let dim = selected_token.actor.items.find(e => e.name === label);

    if (!dim) {
      dim = game.items.find(e => e.name === game.i18n.localize('tokenlightcond-effect-dim'));
    }

    dim.flags['core.statusId'] = '1';
    await selected_token.actor.createEmbeddedDocuments('Item', [dim]);
  }
}
