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
      let attributes = "src0:"+srcSides+";"+" src1:"+srcSides+";"+" src4:"+srcSides+";"+" src5:"+srcSides+";"
      if(srcTop != null){
        attributes.concat(" src2:"+srcTop+";");
        attributes.concat(" src3:"+srcBottom);
      }
      el.setAttribute('multisrc', attributes);
    }
  },

  update: function(){
    const pos = AFRAME.utils.clone(this.originalPos);

    pos.x = Math.floor(pos.x / .5) * .5;
    pos.y = Math.floor(pos.y / .5) * .5 + .5;
    pos.z = Math.floor(pos.z / .5) * .5;

    this.el.setAttribute('position', pos);
  }
});
