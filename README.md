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




Setting up an animation:
===
Overview:
---
Your animation will run on a web server. The LedWall menu will need to know where to find it and how long a frame lasts (host, port, path, frameDuration), your animation server will need to implement a few urls ( /init, /timeCycle, /stop).

The Led Wall Server will first call init, and then every frameDuration milliseconds it will send a request to /timeCycle. If the Animation Server returns a json string containing a frame, then this frame will overwrite the previous frame on the screen.

The first subsection documents how to add your animation to the Led Wall Server, the second sub section documents the http requests your server should implement, and the information the Led Wall Server expects in response.


Actually adding your animation to the Led Wall Server
---

There are two ways of adding your animation to the Led Wall Server.

1. Go to {Led Wall Server Host}:3000/list add your animation name in the top text field and press enter. Fill in the form and you are good to go. Your animation will appear in the menu as a question mark. The first (and every other) time you quit your animation a screen shot is made and stored as an icon. This icon will now represent your animation in the menu.

2. Add a json file to the games directory of the root directory of the Led Wall Server

{ "host": (your host in a string), "port": (your port in a string), "path": (the path on your server in a string), "frameDuration": (how long a frame lasts in milliseconds as an int) }



The urls your Animation Server must implement
---

An Animation Server has to implement three urls: /init, /timeCycle and /stop.

/init

The Led Wall Server sends a json string to /init of the following format:

{ "width": ( width as an int), "height": ( height as an int) } 

The actual string contains more information, but that is only relevant for writing games.

/stop

Your server is not passed anything. It just indicates that the animation should be stopped.

/timeCycle

Your server does not receive any information, but is expected to return information in the form of the following json string:

{ "type":"bitmap", "content": (content) }

(content) contains the actual frame, again as a json string.

It is a table of colors. A color is an array containing three real numbers in the range of 0 to 1. The table is an array indexed by x coordinate, containing an array indexed by y coordinate. The y coordinate indexed array contains the colors. Example

[ [ [0,0,0], [1,1,1],[0,0,0],[0,0,0] ],

  [ [1,1,1], [1,1,1],[1,1,1],[1,1,1] ],
  
  [ [0,0,0], [1,1,1],[0,0,0],[0,0,0] ] ]

This contains an image of a white arrow, pointing UPWARD (not sideways, as it appears to be), in an image that has width 3 and height 4. 

To send this red image return the following string:

{ "type": "bitmap",
  "content":
[ [ [0,0,0], [1,1,1],[0,0,0],[0,0,0] ],

  [ [1,1,1], [1,1,1],[1,1,1],[1,1,1] ],
  
  [ [0,0,0], [1,1,1],[0,0,0],[0,0,0] ] ] }

NOTE: you will probably be required to return an image that is 12 by 10, because those are the dimensions of the screen! The actual dimensions are passed when /init is called on your server.

That's it.


Reference for building a game server
---

/init 

A json file is passed:

{ 
"width":  (width of the screen),
"height": (height of the screen),
"serverHost": (the host of the server),
"serverPort": (the port of the server),
"serverPath": (the path on the host where the server expect you to information)
}

/stop

nothing is passed or required. It just informs that you should stop the game.

/timeCycle

see the section on building an animation server.


/introduce

a json string with an id for a new player that should be introduced:

example: "AFSefsasDSffae234wsff34f34f"

/removePlayer

a json string with an id for a  player that should be removed:

example: "AFSefsasDSffae234wsff34f34f"


/playerCommand

a json string containing a player command is passed

{ "button": "left",
  "event": "up" }
  
  values for "button" are "up", "down", "left", "right", "a", "b", "x","y", "start" (select is reserved)
  values for "event" are "up" and "down"
  
  
 To kill a player do a post request at 
 
 (serverHost):(serverPort)/(serverPath)/killPlayer

with value "playerId" set to the id of the player that must be killed.







