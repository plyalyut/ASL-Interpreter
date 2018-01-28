// Set up plugins

let currentFrame;

const controller = Leap.loop({background: true}, frame => {
    currentFrame = frame;
    // console.log(currentFrame);
  }).use('transform', {
    vr: 'desktop' // Switch to meters.
  }).use('boneHand', {
    'targetEl': document.getElementById("leapjs-scene"),
    jointColor: new THREE.Color(0xffffff),
    rendererOps: {antialias: true, alpha: true},
  }).use('proximity');


// // Set up scene

var scene = Leap.loopController.plugins.boneHand.scene;
var camera = Leap.loopController.plugins.boneHand.camera;
var renderer = Leap.loopController.plugins.boneHand.renderer;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor( 0xaaaaaa, 0);
camera.position.set( 0, 0.3, 0.6 );

var controls = new THREE.OrbitControls( camera );

var axisHelper = new THREE.AxisHelper( 0.1 );
scene.add( axisHelper );

// Add a plane

var planeGeo = new THREE.PlaneGeometry(0.1, 0.2);
var material = new THREE.MeshPhongMaterial();
var buttonMesh = new THREE.Mesh(planeGeo, material);

buttonMesh.name = "rectangular button";

//  buttonMesh.scale.setY(0.5);


var longThrow = -0.1;
var squareButton = new PushButton(

  new InteractablePlane(buttonMesh, Leap.loopController),

  {
    locking: false,
    longThrow: longThrow
  }

).on('press', function(mesh){

  mesh.material.color.setHex(0xccccff);

}).on('release', function(mesh){

  mesh.material.color.setHex(0xeeeeee);

});

squareButton.plane.hover(
  function(mesh){ // over
    console.log('hover in');
    mesh.material.color.setHex(0xffccff);
  },
  function(mesh){ // out
    console.log('hover out');
    mesh.material.color.setHex(0xeeeeee);
  }
);


var base = new THREE.Mesh(new THREE.BoxGeometry(0.1, longThrow, longThrow), new THREE.MeshPhongMaterial({color: 0x222222}));
base.position.set(0.05, 0, -0.1);
base.rotateY(Math.PI * -0.15);

buttonMesh.position.set(
  0,
  buttonMesh.geometry.parameters.height / 2 - longThrow / 2,
  -longThrow / 2
);
squareButton.plane.resetPosition(); // resets the original position, etc to the current one

//  base.rotateX(Math.PI * -0.45);
//  base.position.set(0.2,0,0.2);

base.add(buttonMesh);

scene.add(base);


// Circular button:

var circleGeo = new THREE.CircleGeometry(0.1, 32);
buttonMesh = new THREE.Mesh(circleGeo, material.clone());
buttonMesh.name = "round button";

buttonMesh.position.set(-0.12, 0.1, -0.1);
scene.add(buttonMesh);

var roundButton = new PushButton(
  // for now, constructing with moveX and moveY turned off so that doesn't try and watch for XY intersections,
  // which won't work for circles.
  // todo - have a setter for moveX and moveY, so that proximities can be turned on and off.
  // Note that we have to bind press and release effects to each individual button. This is a long way from CSS rules still.
  new InteractablePlane(buttonMesh, Leap.loopController, {moveX: false, moveY: false})
).on('press', function(mesh){

  mesh.material.color.setHex(0xccccff);

}).on('release', function(mesh){

  mesh.material.color.setHex(0xeeeeee);

});
