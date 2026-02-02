# CSE 160 - Assignment 2 - Blocky Animal
Name: Alexander Bateman  
Email: arbatema@ucsc.edu  

Live Demo: https://ycmsoft.github.io/BlockyAnimal/src/BlockyAnimal.html

# Files:
- `index.html` - Root `index.html` redirects to `src/BlockyAnimal.html` for GitHub Pages.
- `src/BlockyAnimal.html` - UI/canvas.
- `src/BlockyAnimal.js` - Render/animation implementation file. 
- `src/Cube.js` - Cube shape class.
- `src/Triangle.js` - Triangle shape class.
- `src/Cylinder.js` - Cylinder shape class.
- `lib/cuon-utils.js` - Shader utilities.
- `lib/cuon-matrix-cse160.js` - Matrix utilities.
- `lib/webgl-debug.js` - WebGL debugging utilities.
- `lib/webgl-utils.js` - WebGL utilities.
- `README.md` - This readme.

# Controls:
  - Sliders rotate the camera view X and Y.
  - Mouse drag rotates the camera view X and Y.
  - Sliders control one leg chain joints (Right Hip / Right Knee).
  - Animation ON/OFF buttons toggle walking animation.
  - Shift + Click triggers poke animation.


# Notes to Grader:
Awesomeness: 
- Non cube primitive: Cylindrical bamboo stalks using Cylinder.js.
- Performance indicators: ms/fps shown.
- 3 part leg chain: thigh, calf, foot, with a slight ankle motion.
- Mouse rotation: Click and drag rotates camera view X and Y.
- Poke animation: panda does a little nod on shift + click.
- Animation: Subtle ankle/foot motion during walking.


# Resources used: 
Starter code from lectures and provided course libraries (cuon-*, webgl-utils, etc.).

Used ChatGPT for debugging, implementation suggestions (motion), but I wrote/controlled final code and manually tuned the transforms and animations. 

ChatGPT was helpful for mouse drag rotation and a first-pass Cylinder.js, plus some minor cleanup (pulling repeated values into constants/parameters), but it wasn't great for leg motion or for performance/FPS display logic.

Specific places it helped:
- Mouse rotation / drag controls and clamping the X rotation to avoid flipping
// clamp X rotation to avoid flipping
if (g_globalRotX > 89) g_globalRotX = 89;
if (g_globalRotX < -89) g_globalRotX = -89;
- For Cylinder.js, I generated the initial cylinder triangle logic with ChatGPT and then integrated/tuned segments/scale/placement.
- Helped with eye patches/black cubes around the pandas eyes. 
- It helped with it not messing with my sliders when I added the poke animation, and a whole lot of leg rotation/motion fine tuning:
// If animation is OFF, do not overwrite slider angles (unless poke is active)
  if (g_animationOn) {
    const s = -Math.sin(g_seconds * 2.0);
    g_rightHip = 25 * s;

    // knee bends mostly during "back swing"
    g_rightKnee = 35 * Math.max(0, -s);
  }


