[![License](https://img.shields.io/github/license/Frstrm/TokenLightCondition?label=License)](LICENSE)
[![Latest Version](https://img.shields.io/github/v/release/frstrm/tokenlightcondition?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/frstrm/tokenlightcondition/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Ffrstrm%2Ftokenlightcondition%2Fmain%2Fmodule.json)

![Latest Downloads](https://img.shields.io/github/downloads/Frstrm/TokenLightCondition/latest/total?color=blue&label=latest%20downloads)
![Total Downloads](https://img.shields.io/github/downloads/Frstrm/TokenLightCondition/total?color=blue&label=total%20downloads)

# Token Light Condition

A module for <a href="https://foundryvtt.com/">FoundryVTT</a> that modifies token effects based on lighting conditions.

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
- Only processes tokens that are of type: character, npc
-    And have hp > 0

# Known Issues
Tokens currently ONLY checks against placed lights, and token lighting.

Efforts are being made for tokens to respect tile overrides, and other methods.

## Options

### **Console logging level**
Sets the level of console used for logging:
<ul>
  <li>No Logging - Use this for no output</li>
  <li>Debug</li>
  <li>Log</li>
</ul>

### **Source for lighting effect**
Choose which source or application the effects are generated from.
<ul>
  <li>Disable token effect (None)</li>
  <li>Token Light Condition (Active Effects)</li>
  <li>Convienent Effects (CE)</li>
  <li>Combat Utility Belt (CUB)</li>
</ul>

None means there are token effects, but the token Hud will still work.

CUB option is only available if both Dim AND Dark conditions exist in the Lab.

Convienent Effects entries are added on module load if they don't exist.

## Suggested Modules
* [Stealthy](https://foundryvtt.com/packages/stealthy)
