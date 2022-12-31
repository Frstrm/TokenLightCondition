[![License](https://img.shields.io/github/license/frstrm/tokenlightcondition?label=License)](LICENSE)
[![Latest Version](https://img.shields.io/github/v/release/frstrm/tokenlightcondition?display_name=tag&sort=semver&label=Latest%20Version)](https://github.com/frstrm/tokenlightcondition/releases/latest)
![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fraw.githubusercontent.com%2Ffrstrm%2Ftokenlightcondition%2Fmain%2Fmodule.json)

# TokenLightCondition

A module for <a href="https://foundryvtt.com/">FoundryVTT</a> that modifies token effects based on lighting conditions.

# Purpose

Determine the light condition of a token, and generate effects on the token to indicate light condtions.
This is to allow players, or modules to use these effects to help rules determination around those conditions.

# Features

Adds a token Hud element to selected token (right-click the token):
* Lighting - ( DRK, DIM, BRT )
Adds an Effect when token is in Dim or Dark conditions.
Removes Dim/Dark effects while in Bright conditions.

## Options

### **Console logging level**
Sets the level of console used for logging (no logging, debug, log)
Just set to 'No ogging' to turn off any output.

## Suggested Modules
* [Stealthy](https://foundryvtt.com/packages/stealthy)
