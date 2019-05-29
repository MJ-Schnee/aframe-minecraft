// Player attributes
var placingBlocks = true;
var activeSprint = false;
var flyingDwn = false;
var flyingUpw = false;
var changePlacingBlock = true;
// Blocks
var selectedBlock = 1;
var listOfBlocks = [
  ["#bedrock"],
  ["#cobblestone"],
  ["#dirt"],
  ["#grassBlockTop", "#dirt", "#grassBlockSide"],
  ["#sand"],
  ["#stone"],
  ["#woodBlockTop", "#woodBlockTop", "#woodBlockSide"],
  ["#woodenPlank"]
];
// Keys
var switchPlaceBreakBttn = 'Backquote'
var increaseBlockBttn = 'Equal';
var decreaseBlockBttn = 'Minus';
var activeSprintBttn = 'ShiftLeft';
var flyingDwnBttn = 'ControlLeft';
var flyingUpwBttn = 'Space';

window.addEventListener('keyup', function(evt){
  switch(evt.code){
    // Detecting sprint
    case activeSprintBttn:
      activeSprint = false;
      break;
    // Detecting flying up
    case flyingUpwBttn:
      flyingUpw = false;
      break;
    // Detecting flying down
    case flyingDwnBttn:
      flyingDwn = false;
      break;
  }
});
window.addEventListener('keydown', function(evt){
  switch(evt.code){// Switching placing and blocking
    case switchPlaceBreakBttn:
      placingBlocks = !placingBlocks;
      changePlacingBlock = true;
      break;
    // Swithcing placing item
    case increaseBlockBttn:
      selectedBlock++;
      if(selectedBlock >= listOfBlocks.length)
        selectedBlock = 0;
      changePlacingBlock = true;
      break;
    case decreaseBlockBttn:
      selectedBlock--;
      if(selectedBlock <= 0)
        selectedBlock = listOfBlocks.length-1;
      changePlacingBlock = true;
      break;
    // Detecting sprint
    case activeSprintBttn:
      activeSprint = true;
      break;
    // Detecting flying up
    case flyingUpwBttn:
      flyingUpw = true;
      break;
    // Detecting flying down
    case flyingDwnBttn:
      flyingDwn = true;
      break;
  }
});

AFRAME.registerComponent('isblock', {
  dependencies: ['position'],

  init: function(){
    const el = this.el;

    this.originalPos = el.getAttribute('position');

    el.setAttribute('geometry', "primitive: box");
    el.setAttribute('material', 'material', 'flat');
  },

  update: function(){
    const el = this.el;
    const data = this.data;
    const src = data.src;
    const srcTop = data.srcTop;
    const srcBottom = data.srcBottom;
    const srcSides = data.srcSides;

    if(src != null)
      el.setAttribute('material', 'src', data.src);
    else {
      el.setAttribute('multisrc', "");
      // srcs: right, left, top, bottom, front, back
      // srcs: 0,     1,    2,   3,      4,     5
      const attributes = `src0: ${srcSides}; src1: ${srcSides}; src2: ${srcTop}; src3: ${srcBottom}; src4: ${srcSides}; src5: ${srcSides}; `;
      el.setAttribute('multisrc', attributes);
    }

    if(this.data.snappable == null){
      const pos = AFRAME.utils.clone(this.originalPos);

      pos.x = Math.floor(pos.x+.5);
      pos.y = Math.floor(pos.y+.5);
      pos.z = Math.floor(pos.z+.5);

      this.el.setAttribute('position', pos);
    }
  }
});

/**
  * Made its own component because certain blocks cannot be broken
  * Unbreakable blocks: bedrock, water, item in hand
*/
AFRAME.registerComponent('breakable', {
  dependencies: ['isblock'],

  init: function(){
    const el = this.el;
    el.addEventListener('mouseup', function(){
      if(!placingBlocks)
        el.parentNode.removeChild(el);
    });
  }
});

AFRAME.registerComponent('blockmanipulator', {
  init: function(){
    const scene = document.querySelector('a-scene');
    const camera = document.querySelector('#head');
    this.el.addEventListener('mouseup', function(evt){
      if(placingBlocks){
        // Create new blank entity
        const newBlock = document.createElement('a-entity');
        // Get the texture(s) the block will have
        let blockTexture;
        if(!(selectedBlock==3 || selectedBlock==6))
          blockTexture = `src: ${listOfBlocks[selectedBlock][0]}`;
        else
          blockTexture = `srcTop: ${listOfBlocks[selectedBlock][0]};
                          srcBottom: ${listOfBlocks[selectedBlock][1]};
                          srcSides: ${listOfBlocks[selectedBlock][2]}`;
        // Give the block attributes
        let pos = evt.detail.intersection.point;
        // Fixes user being unable to place block on left side of another block
        if(Math.abs(pos.x)%1==.5 && camera.getAttribute('rotation').y<=0)
          pos.x-=.5;
        if(Math.abs(pos.z)%1==.5 &&
            camera.getAttribute('rotation').y<=-90 ||camera.getAttribute('rotation').y>=90)
          pos.z-=.5;
        // Prevents from (re)placing the "ground"
        if(pos.y<0)
          pos.y+=.5;
        // Fixed user being unable to place underneath blocks
        if(Math.abs(pos.y)%1==.5 && camera.getAttribute('rotation').x>0)
          pos.y-=5;
        newBlock.setAttribute('position', pos);
        newBlock.setAttribute('isBlock', blockTexture);
        newBlock.setAttribute('breakable', "");
        // Add block to scene
        scene.appendChild(newBlock);
      }
    });
  }
});

AFRAME.registerComponent('playercontrol', {
  tick: function(){
    const rig = document.querySelector('#rig');
    const blockInHand = document.querySelector('#blockInHand');

    // Sprinting
    if(activeSprint){
      this.el.setAttribute('wasd-controls', 'acceleration', 230);
      this.el.setAttribute('camera', 'fov', 90);
    } else {
      this.el.setAttribute('wasd-controls', 'acceleration', 150);
      this.el.setAttribute('camera', 'fov', 80);
    }
    // Flying
    if(flyingUpw)
      rig.object3D.position.set(
          rig.object3D.position.x,
          rig.object3D.position.y+.05,
          rig.object3D.position.z
      );
    else if(flyingDwn && rig.object3D.position.y>1.25)
      rig.object3D.position.set(
          rig.object3D.position.x,
          rig.object3D.position.y-.05,
          rig.object3D.position.z
      );
    // Change in block being placed
    if(changePlacingBlock){
      console.log("Change in placing blocks detected");
      if(placingBlocks) {
        blockInHand.setAttribute("visible", true);
        // OPTIMIZE: Make a boolean value to detect if a change has occured to stop computer from constantly changing attribute
        if(selectedBlock==3 || selectedBlock==6){
          blockInHand.setAttribute("isblock", `srcTop: ${listOfBlocks[selectedBlock][0]};
              srcSides: ${listOfBlocks[selectedBlock][2]};
              srcBottom: ${listOfBlocks[selectedBlock][1]};
              snappable: false`);
          console.log(`${listOfBlocks[selectedBlock][0]}`);
            }
        else
          blockInHand.setAttribute("isblock", `src: ${listOfBlocks[selectedBlock]};
              snappable: false`);
      } else
        blockInHand.setAttribute("visible", false);
      changePlacingBlock = false;
    }
  }
});
