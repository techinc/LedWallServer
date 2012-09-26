LED Wall Server
===
This is the server that runs the [TechInc][] LED wall.

Hardware
---
The server expects 12x10 screen.
It expects a firmware that takes four bytes (LED index, red value, green value and blue value) and a 12x10 screen.
[LEDLightDistrictDriver][] is the firmware it was built for.

Getting started
---
You'll probably want the demo animations.

    cp games.dist/* games 

There are a few ways to run the server. The easiest way is to use [Norman][], the node.js Procfile runner.

    npm start

You can also use [Foreman][] itself.

    foreman start

The third option is to use Foreman to generate an Upstart config file or initscript. This is documented in the Foreman documentation.

[TechInc]: http://techinc.nl/
[Norman]: http://github.com/josh/norman
[Foreman]: http://ddollar.github.com/foreman/
[LEDLightDistrictDriver]: http://github.com/guidocalvano/LEDLightDistrictDriver

Controlling the screen
---

If you want to interact with the screen go to 10.168.0.112:3000

You will be presented with a snes controller. The buttons work. You can also use arrow keys of your keyboard and the following keys zxcvbn.