var itemInHand = 0;
/* Item IDs
  bedrock = 0
  dirt block = 1
  grass block = 2
*/

/**
 *
*/
AFRAME.registerComponent('isblock', {
  init: function(){
    const data = this.data;
    const el = this.el;

    el.setAttribute('geometry', "primitive: box");
    el.setAttribute('material', 'src', data.src);
    el.setAttribute('material', 'material', 'flat');
  }
});

/**
 * Snap entity to the closest interval specified by `snap`.
 */
AFRAME.registerComponent('snap', {
  dependencies: ['position'],

  init: function(){
    this.originalPos = this.el.getAttribute('position');
  },

  update: function(){
    const pos = AFRAME.utils.clone(this.originalPos);
    pos.x = Math.floor(pos.x / .5) * .5;
    pos.y = Math.floor(pos.y / .5) * .5;
    pos.z = Math.floor(pos.z / .5) * .5;

    this.el.setAttribute('position', pos);
  }
});
