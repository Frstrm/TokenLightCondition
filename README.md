[![License](https://img.shields.io/github/license/Frstrm/TokenLightCondition?label=License)](LICENSE)
[![Latest Version](https://img.shields.io/github/v/release/frstrm/tokenlightcondition?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/frstrm/tokenlightcondition/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Ffrstrm%2Ftokenlightcondition%2Fmain%2Fmodule.json)

![Latest Downloads](https://img.shields.io/github/downloads/Frstrm/TokenLightCondition/latest/total?color=blue&label=latest%20downloads)
![Total Downloads](https://img.shields.io/github/downloads/Frstrm/TokenLightCondition/total?color=blue&label=total%20downloads)

# Token Light Condition

A module for <a href="https://foundryvtt.com/">FoundryVTT</a> that modifies token effects based on lighting conditions.

![effect-transitions](https://user-images.githubusercontent.com/46358673/211183803-89dc8242-3574-42bb-be45-ce593e443fc9.gif)
![effect-angle-transitions](https://user-images.githubusercontent.com/46358673/211233941-030719db-2aa4-4ba4-b1ed-fade63e44a80.gif)

# Purpose

Determine the light condition of a token, and generate effects on the token to indicate light condtions.

This is to allow players, or modules to use these effects to help rules determination around those conditions.

# Features
- Adds a token Hud element to selected token (right-click the token):
-   Hud indicator - ( DRK, DIM, BRT )
- Adds an Effect when token is in Dim or Dark conditions.
- Removes Dim/Dark effects while in Bright conditions.
- Updates tokens on scene Darkness Level changes.
- Tokens will be updated on drop in scene.
- Token is only processed if of type (character, npc) and have hp > 0
- TokenHud light box indicator is only shown if token hp > 0
- Lighting Control that can enable/disable Token Light Condition use.

# Lighting Controls

Look for this Icon on the Lighting Controls

![toggle-tlc-icon](https://user-images.githubusercontent.com/46358673/211183876-0aa2273e-7d66-4a60-8eff-a1cd39a31dac.png)

When Enabled (default) the module will process the tokens and add/remove Dim/Dark effects as needed.

If you are switching TO enabled, give the module a moment to process all the viable tokens on the scene.
![enabled-processing](https://user-images.githubusercontent.com/46358673/211184079-1d016bc0-bafb-4840-a004-baf0975e15c1.png)

When Disabled, the module will process the tokens and Remove any Dim/Dark effects currently in use.
![disabled-removing](https://user-images.githubusercontent.com/46358673/211184103-8daad474-f02b-4329-a5f9-f027f829d7a7.png)
![disabled-done](https://user-images.githubusercontent.com/46358673/211184108-555ec22d-5414-466f-82c5-a7fb7ccf2502.png)

# Note

Tokens must be type Characters/NPC, and have an HP > 0 in order to be processed.  Otherwise they will be skipped.

# Support

Efforts are being made for tokens to respect tile overrides, and other methods.
These may work with some degree of success/failure.
* lights with elevations (Levels)
* * This has been problematic to sort out, as lights are treated as cyclinders,
* * with a top and bottom, that act as floors.  But testing results around this have been problematic.

* Drawings with lighting overrides (perfect-vision)
* * This seems to be working correctly...

## Options

### **Console logging level**
Sets the level of console used for logging:
<ul>
  <li>No Logging - Use this for no output</li>
  <li>Debug</li>
  <li>Log</li>
</ul>

### **Show TokenHud**
Enables or Disables the display of the light condition on the TokenHud.
- Adds a token Hud element to selected token (right-click the token):
-   Hud indicator - ( DRK, DIM, BRT )

### **Source for lighting effect**
Choose which source or application the effects are generated from.
<ul>
  <li>Disable token effect (None)</li>
  <li>Token Light Condition (Active Effects)</li>
  <li>Convienent Effects (CE)</li>
  <li>Combat Utility Belt (CUB)</li>
</ul>

None means there no effects placed on tokens, but the token Hud will still work.

CUB option is only available if both Dim AND Dark conditions exist in the Lab.

Convienent Effects entries are added on module load if they don't exist.

## Suggested Modules
* [Stealthy](https://foundryvtt.com/packages/stealthy)
