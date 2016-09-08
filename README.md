# blogger

## Installation

- npm install -g nw bower
- git clone https://github.com/xy124/blogger.git
- cd blogger
- npm i
- bower i

## usage
- nw (from folder where the pictures are... or one can select the folder in the gui...)

### commandline options:
- `--debug` for debug console
- `--export-only EXPORTER` where exporter is one of
  - revealJs
  - simpleHTML
  - lightview
  to simply export and then quit

### in gui:
Step 1: select folder

Step 2: reorder pictures

Step 3: add description

Step 4: save json

Step 4.1: export reveal.js

Step 5: present
- cd node_modules/reveal.js
- chromium pictures.html
- ......voila!

#### alternative exporters:
- SimpleHTML - will give one large html page with all the pictures listet
- lightview - will give a fancy slideshow that may only used for non comercial perposes(see lightview licence.) (use lightview_install.sh to install the needed deps for the html file.)


