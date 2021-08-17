# ORCT2-EarthMover

©2021 by narhiril (Velvet), distributed under MIT license.

Very barebones OpenRCT2 plugin for copying/pasting terrain between different maps.  Maps must be identical size.

The intended use for this plugin is to take surface element data (terrain height, slope, water height, etc.) from one map and copy it to another map.
You might wish to do this if, say, you want to import terrain from an existing map to a workbench of your choice, rather than trying to build the terrain 
on the workbench itself or mucking about in the object slection screen for the next several hours.

EarthMover does not save scenery, track data, or anything else, just terrain.  You're on your own with that other stuff.

This probably goes without saying, but if you use this plugin to import terrain onto a map you've already built on, you may get weird results.
You will get buggy, undersirable results if the map being saved has tiles containing multiple surface entities, which, as far as I know, 
is only possible through something like tile inspector and isn't usually done intentionally.  I may add a check for this later.

Tested on a 150x150 map without obvious issues, but might see a lag spike during save/load on extremely large maps as the arrays used in the script get quite large.

As of v0.6, this should work properly, please report any issues.  I'm going to see if I can clean it up a bit and call it 1.0.