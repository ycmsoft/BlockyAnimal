// BlockyAnimal.js
// Alexander Bateman
// arbatema@ucsc.edu
// Notes to Grader: 
// Awesomeness: 
// Resources used:



let canvas = null;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalRotY = 0;
let g_globalRotX = 0;
let g_rightHip = 0;
let g_rightKnee = 0;
let g_animationOn = false;
let g_seconds = 0;
let g_poke = false;
let g_pokeStart = 0;
let g_perfLast = 0;
let g_lastFrameTime = performance.now();
let g_perfAcc = 0;          
let g_perfFrames = 0;       
let g_perfLastUpdate = performance.now();
let g_bamboo = null;

//Panda colors
const COLOR_WHITE = [1.0, 1.0, 1.0, 1.0];
const COLOR_BLACK = [0.05, 0.05, 0.05, 1.0];
const COLOR_PINK  = [1.0, 0.6, 0.7, 1.0];

let g_cube = null;

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


function main(){
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHTMLUI();


let g_isDragging = false;

canvas.onmousedown = function(ev) {
  if (ev.shiftKey) {
    g_poke = true;
    g_pokeStart = g_seconds;
    return;
  }
  g_isDragging = true;
};

canvas.onmouseup = function() {
  g_isDragging = false;
};

canvas.onmouseleave = function() {
  g_isDragging = false;
};

canvas.onmousemove = function(ev) {
  if (!g_isDragging) return;

  const s = 1.0;

  g_globalRotY += ev.movementX * s;
  g_globalRotX += ev.movementY * s;

  // clamp X rotation to avoid flipping
  if (g_globalRotX > 89) g_globalRotX = 89;
  if (g_globalRotX < -89) g_globalRotX = -89;

  renderScene();
};

  gl.enable(gl.DEPTH_TEST);
  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(0.9, 0.9, 0.9, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  g_cube = new Cube();
  g_bamboo = new Cylinder();  
  g_bamboo.segments = 24;  
  
  renderScene();
  requestAnimationFrame(tick);
}

function tick() {
  const now = performance.now();
  const dt = now - g_lastFrameTime;     
  g_lastFrameTime = now;

  g_seconds = now / 1000.0;

  if (g_animationOn || g_poke) {
    updateAnimationAngles();
  }

  renderScene();

  g_perfAcc += dt;
  g_perfFrames++;

  if (now - g_perfLastUpdate > 200) {
    const avgMs = g_perfAcc / g_perfFrames;
    const fps = 1000.0 / avgMs;
    sendTextToHTML(`ms: ${avgMs.toFixed(1)} fps: ${fps.toFixed(1)}`, "perf");

    g_perfAcc = 0;
    g_perfFrames = 0;
    g_perfLastUpdate = now;
  }

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animationOn) {
    const s = -Math.sin(g_seconds * 2.0);
    g_rightHip = 25 * s;

    g_rightKnee = 35 * Math.max(0, -s);
  }

  if (g_poke) {
    const t = g_seconds - g_pokeStart;
    if (t > 0.6) {
      g_poke = false;
    } else {

      const w = Math.sin(t * Math.PI * 2.0);
      g_rightHip = -40 * w;
      g_rightKnee = 60 * Math.max(0, w);
    }
  }
}


function setupWebGL(){
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get WebGL context");
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
    console.log("Failed to init shaders");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get a_Position");
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get u_FragColor");
    return;
  }


  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
if (!u_ModelMatrix) {
  console.log("Failed to get u_ModelMatrix");
  return;
}

u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
if (!u_GlobalRotateMatrix) {
  console.log("Failed to get u_GlobalRotateMatrix");
  return;
}
var identityM = new Matrix4();
gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

function addActionsForHTMLUI() {
  // Global rotation (view)
  const globalYSlider = document.getElementById("globalYSlider");
  const globalXSlider = document.getElementById("globalXSlider");

  globalYSlider.addEventListener("input", function () {
    g_globalRotY = parseFloat(globalYSlider.value);
    document.getElementById("globalYValue").textContent = g_globalRotY.toFixed(0);
    renderScene();
  });

  globalXSlider.addEventListener("input", function () {
    g_globalRotX = parseFloat(globalXSlider.value);
    document.getElementById("globalXValue").textContent = g_globalRotX.toFixed(0);
    renderScene();
  });

  const rightHipSlider = document.getElementById("rightHipSlider");
  const rightKneeSlider = document.getElementById("rightKneeSlider");

  rightHipSlider.addEventListener("input", function () {
    g_rightHip = parseFloat(rightHipSlider.value);
    document.getElementById("rightHipValue").textContent = g_rightHip.toFixed(0);
    renderScene();
  });

  rightKneeSlider.addEventListener("input", function () {
    g_rightKnee = parseFloat(rightKneeSlider.value);
    document.getElementById("rightKneeValue").textContent = g_rightKnee.toFixed(0);
    renderScene();
  });

  document.getElementById("animOnButton").addEventListener("click", function () {
    g_animationOn = true;
  });

  document.getElementById("animOffButton").addEventListener("click", function () {
    g_animationOn = false;
    renderScene();
  });
}


function convertCoordinatesEventToGL(ev){
  let x = ev.clientX;
  let y = ev.clientY;
  let rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}


function sendTextToHTML(text, htmlID){
  const htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

  function drawCubeWith(mat, color) {
    g_cube.color = color;
    g_cube.matrix = mat;
    g_cube.render();
  }

  function drawLeg3(bodyBase, hipX, hipY, hipZ, hipAng, kneeAng) {
  //Hip pivot
  const thighBase = new Matrix4(bodyBase);
  thighBase.translate(hipX, hipY, hipZ);
  thighBase.rotate(-hipAng, 1, 0, 0);

  //Thigh
  const thighMat = new Matrix4(thighBase);
  thighMat.translate(-0.07, -0.20, -0.07);
  thighMat.scale(0.16, 0.22, 0.14);
  drawCubeWith(thighMat, COLOR_BLACK);

  //Knee pivot
  const calfBase = new Matrix4(thighBase);
  calfBase.translate(0.0, -0.20, 0.0);
  calfBase.rotate(-kneeAng, 1, 0, 0);

  //Calf
  const calfMat = new Matrix4(calfBase);
  calfMat.translate(-0.05, -0.18, -0.06);
  calfMat.scale(0.12, 0.20, 0.12);
  drawCubeWith(calfMat, COLOR_BLACK);

  //Ankle pivot
  const footBase = new Matrix4(calfBase);
  footBase.translate(0.0, -0.20, -0.03);
  //3rd level joint, ankle/foot rotations
  if (g_animationOn) {
  const s = Math.sin(g_seconds * 2.0);
  footBase.rotate(15 * Math.max(0, s), 1, 0, 0);   }
  //Foot
  const footMat = new Matrix4(footBase);
  footMat.translate(-0.08, -0.04, -0.12);
  footMat.scale(0.16, 0.08, 0.28);
  drawCubeWith(footMat, COLOR_BLACK);
}


function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //Global Rotation
  const globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalRotY, 0, 1, 0);
  globalRotMat.rotate(g_globalRotX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //Leg anchors
  const frontZ = 0.15;
  const backZ  = 0.52;
  const rightX = 0.42;
  const leftX  = 0.14;
  const hipY   = -0.02;

  //Body
  const bodyBase = new Matrix4();
  bodyBase.translate(-0.25, -0.35, -0.20);

  const bodyMat = new Matrix4(bodyBase);
  bodyMat.scale(0.55, 0.40, 0.75);
  drawCubeWith(bodyMat, COLOR_WHITE);

  //Head (poke gives a nod)
  const headBase = new Matrix4(bodyBase);
  headBase.translate(0.12, 0.22, -0.12);

  if (g_poke) {
    const t = g_seconds - g_pokeStart;
    const nod = 20 * Math.sin(t * Math.PI * 4.0);
    headBase.rotate(nod, 1, 0, 0);
  }

  const headMat = new Matrix4(headBase);
  headMat.scale(0.32, 0.28, 0.32);
  drawCubeWith(headMat, COLOR_WHITE);

  //Ears
  const leftEarBase = new Matrix4(headBase);
  leftEarBase.translate(-0.04, 0.26, 0.06);
  const leftEarMat = new Matrix4(leftEarBase);
  leftEarMat.translate(-0.03, -0.03, -0.03);
  leftEarMat.scale(0.12, 0.12, 0.12);
  drawCubeWith(leftEarMat, COLOR_BLACK);

  const rightEarBase = new Matrix4(headBase);
  rightEarBase.translate(0.30, 0.26, 0.06);
  const rightEarMat = new Matrix4(rightEarBase);
  rightEarMat.translate(-0.03, -0.03, -0.03);
  rightEarMat.scale(0.12, 0.12, 0.12);
  drawCubeWith(rightEarMat, COLOR_BLACK);

  //Eye Patches
  const leftPatchBase = new Matrix4(headBase);
  leftPatchBase.translate(0.08, 0.10, -0.02);
  const leftPatchMat = new Matrix4(leftPatchBase);
  leftPatchMat.translate(-0.06, -0.04, -0.03);
  leftPatchMat.scale(0.16, 0.12, 0.08);
  drawCubeWith(leftPatchMat, COLOR_BLACK);

  const rightPatchBase = new Matrix4(headBase);
  rightPatchBase.translate(0.19, 0.10, -0.02);
  const rightPatchMat = new Matrix4(rightPatchBase);
  rightPatchMat.translate(-0.06, -0.04, -0.03);
  rightPatchMat.scale(0.16, 0.12, 0.08);
  drawCubeWith(rightPatchMat, COLOR_BLACK);

  //Eyes
  const leftEyeBase = new Matrix4(headBase);
  leftEyeBase.translate(0.07, 0.13, -0.05);
  const leftEyeMat = new Matrix4(leftEyeBase);
  leftEyeMat.translate(-0.02, -0.02, -0.02);
  leftEyeMat.scale(0.05, 0.05, 0.05);
  drawCubeWith(leftEyeMat, [1, 1, 1, 1]);

  const rightEyeBase = new Matrix4(headBase);
  rightEyeBase.translate(0.23, 0.13, -0.05);
  const rightEyeMat = new Matrix4(rightEyeBase);
  rightEyeMat.translate(-0.02, -0.02, -0.02);
  rightEyeMat.scale(0.05, 0.05, 0.05);
  drawCubeWith(rightEyeMat, [1, 1, 1, 1]);

  //Nose and Mouth
  const noseBase = new Matrix4(headBase);
  noseBase.translate(0.15, 0.06, -0.08);
  const noseMat = new Matrix4(noseBase);
  noseMat.translate(-0.03, -0.02, -0.03);
  noseMat.scale(0.07, 0.05, 0.06);
  drawCubeWith(noseMat, COLOR_BLACK);

  const mouthBase = new Matrix4(headBase);
  mouthBase.translate(0.15, 0.02, -0.08);
  const mouthMat = new Matrix4(mouthBase);
  mouthMat.translate(-0.03, -0.01, -0.01);
  mouthMat.scale(0.06, 0.02, 0.02);
  drawCubeWith(mouthMat, COLOR_PINK);


  //Bamboo
  function drawBambooAt(bodyBase, x, y, z, h) {
  if (!g_bamboo) return;

  const m = new Matrix4(bodyBase);
  m.translate(x, y, z);
  m.scale(0.03, h, 0.03);

  g_bamboo.matrix = m;
  g_bamboo.color = [0.2, 0.8, 0.2, 1.0];
  g_bamboo.render();
}

  drawBambooAt(bodyBase, 0.80, -0.63, 0.35, 1.20);
  drawBambooAt(bodyBase, 0.65, -0.63, 0.85, 1.20);
  drawBambooAt(bodyBase, 0.95, -0.63, 0.05, 1.20);

  let frHip, frKnee, flHip, flKnee, brHip, brKnee, blHip, blKnee;

  if (g_animationOn) {
    const s = Math.sin(g_seconds * 2.0);
    const hipAmp = 25;
    const kneeAmp = 35;

    frHip  = hipAmp * s;
    flHip  = -hipAmp * s;
    brHip  = -hipAmp * s;
    blHip  = hipAmp * s;

    frKnee = kneeAmp * Math.max(0, -s);
    flKnee = kneeAmp * Math.max(0,  s);
    brKnee = kneeAmp * Math.max(0,  s);
    blKnee = kneeAmp * Math.max(0, -s);
  } else {
    frHip = g_rightHip;  frKnee = g_rightKnee;
    flHip = -0.8 * g_rightHip; flKnee = -0.8 * g_rightKnee;
    brHip = -0.8 * g_rightHip; brKnee = -0.8 * g_rightKnee;
    blHip =  0.8 * g_rightHip; blKnee =  0.8 * g_rightKnee;
  }

  drawLeg3(bodyBase, rightX, hipY, frontZ, frHip, frKnee); 
  drawLeg3(bodyBase, leftX,  hipY, frontZ, flHip, flKnee); 
  drawLeg3(bodyBase, rightX, hipY, backZ,  brHip, brKnee); 
  drawLeg3(bodyBase, leftX,  hipY, backZ,  blHip, blKnee); 

  //Tail
  const tailBase = new Matrix4(bodyBase);
  tailBase.translate(0.3, 0.22, 0.70);
  const tailMat = new Matrix4(tailBase);
  tailMat.translate(-0.03, -0.03, -0.03);
  tailMat.scale(0.1, 0.1, 0.1);
  drawCubeWith(tailMat, COLOR_BLACK);
}

