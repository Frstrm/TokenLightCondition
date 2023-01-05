### Version 0.3.3
* Add Option to enable/disable the TokenHud display.

### Version 0.3.2
* Detecting Token is in a drawing with darkness overrides (perfect-vision)
* Attempt to account for light elevation (levels)

### Version 0.3.1
* variable assignment fix

### Version 0.3.0
* Distance calculations now account for elevation (token, lights)
* Effects are now updated on lightingRefresh
* Added armor around updates and token checks
* Effects are removed if at 0 hp.
* TokenHud light indicator is not show at 0 hp.

### Version 0.2.0
* Added option to select effect source.
* * none, Active Effect, CUB, Convenient Effect
* * CUB option is only visible if Dark AND Dim exist as conditions in Lab
* Cleaned up and optimized how effects were being removed.
* Updated Icon image selection used for effects
* * IF effects already exist in CE, they are not replaced/updated.
* * You can clear them from CE, and they will be regenerated on reload.
* Moved effects functions into their own script

### Version 0.1.0
* Updates effects on tokens on scene Darkness Level changes.
* Updates effects on tokens when dropped into scene.

### Version 0.0.2
* formatting fixup
* fixed some issue around clearing effects when moving to Bright lighting condition.

### Version 0.0.1
* Initial implementation