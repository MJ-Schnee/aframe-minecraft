var placingBlocks = true;
var selectedBlock = 1;
var listOfBlocks = [
  ["#bedrock"],
  ["#cobblestone"],
  ["#dirt"],
  ["#grassBlockTop", "#drt", "#grassBlockSide"],
  ["#sand"],
  ["#stone"],
  ["#woodBlockTop", "#woodBlockTop", "#woodBlockSide"],
  ["#woodenPlank"]
];

AFRAME.registerComponent('isblock', {
  dependencies: ['position'],

  init: function(){
    const data = this.data;
    const el = this.el;

    const src = data.src;
    const srcTop = data.srcTop;
    const srcBottom = data.srcBottom;
    const srcSides = data.srcSides;

    this.originalPos = el.getAttribute('position');

    el.setAttribute('geometry', "primitive: box");
    el.setAttribute('material', 'material', 'flat');

    if(src != null)
      el.setAttribute('material', 'src', data.src);
    else {
      el.setAttribute('multisrc', "");
      // srcs: right, left, top, bottom, front, back
      // srcs: 0,     1,    2,   3,      4,     5
      const attributes = `src0: ${srcSides}; src1: ${srcSides}; src2: ${srcTop}; src3: ${srcBottom}; src4: ${srcSides}; src5: ${srcSides}; `;
      el.setAttribute('multisrc', attributes);
    }
  },

  update: function(){
    const pos = AFRAME.utils.clone(this.originalPos);

    pos.x = Math.floor(pos.x+.5);
    pos.y = Math.floor(pos.y+.5);
    pos.z = Math.floor(pos.z+.5);

    this.el.setAttribute('position', pos);
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
        // Prevents from (re)placing the "ground"
        if(pos.y<0)
          pos.y+=.5;
        newBlock.setAttribute('position', pos);
        newBlock.setAttribute('isBlock', blockTexture);
        newBlock.setAttribute('breakable', "");
        // Add block to scene
        scene.appendChild(newBlock);
      }
    });
    this.el.addEventListener('keyup', function(evt){
      console.log("onKeyUp:\n"+evt);
      placingBlocks = !placingBlocks;
    });
    window.addEventListener('keyup', function(evt){
      // Key Code 'r' = 82
      if(evt.keyCode == 82){
        placingBlocks = !placingBlocks;
        console.log(`Placing Blocks = ${placingBlocks}`);
      }
    }, false);
  }
});
