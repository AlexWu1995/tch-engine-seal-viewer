/* Generic longitudinal automatic transmission cutaway. Parametric teaching geometry,
   based on the six seal locations in the supplied reference; not an OEM assembly. */
(function () {
  'use strict';
  window.buildTransmissionSystem = function (THREE, palette) {
    palette = palette || {};
    var parts = [], sequence = 0, group = new THREE.Group();
    group.name = '汽车自动变速器 · 六处密封位置';
    var assembly = {
      id: 'auto-transmission', name: '汽车自动变速器', en: 'Automatic transmission',
      group: group, base: new THREE.Vector3(), explode: new THREE.Vector3(),
      detailOnly: true, system: 'transmission',
      note: '纵置液力自动变速器半剖结构。可旋转、拆解并选择六类密封位置，查看密封破损、油液泄漏与换挡功能失效之间的关系；齿轮数量、油路及比例为通用示意。'
    };
    function color(key, fallback) { var c = palette[key]; return c && c.isColor ? c.clone() : new THREE.Color(c || fallback); }
    var metal = new THREE.MeshStandardMaterial({color: color('metal', '#b8c4cd'), metalness: .80, roughness: .30});
    var casting = new THREE.MeshStandardMaterial({color: color('structure', '#8b9ca8'), metalness: .64, roughness: .47, side: THREE.DoubleSide});
    var bright = new THREE.MeshStandardMaterial({color: color('metal', '#c3cdd4').offsetHSL(0, 0, .13), metalness: .88, roughness: .23});
    var dark = new THREE.MeshStandardMaterial({color: '#38444d', metalness: .35, roughness: .54});
    var clutch = new THREE.MeshStandardMaterial({color: '#6a5746', metalness: .25, roughness: .66});
    var sealMaterial = new THREE.MeshStandardMaterial({color: '#ed7029', emissive: '#ed7029', emissiveIntensity: .12, metalness: .12, roughness: .43});
    function add(geometry, name, en, position, material, extra) {
      var mesh = new THREE.Mesh(geometry, material || metal);
      mesh.name = name; mesh.position.set(position[0], position[1], position[2]);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData = Object.assign({
        id: 'tx-' + (++sequence), assembly: assembly.id, name: name, en: en,
        status: 'structure', type: '结构件', role: 'structure', system: 'transmission',
        description: '通用自动变速器结构示意，零件尺寸与配置按具体车型确认。',
        productKey: name, sourceIds: [], explodeAxis: [1, 0, 0], explodeDistance: 0
      }, extra || {});
      group.add(mesh); parts.push(mesh); return mesh;
    }
    function cyl(name, en, radius, depth, pos, material, extra, axis) {
      var g = new THREE.CylinderGeometry(radius, radius, depth, 48);
      if (axis === 'z') g.rotateX(Math.PI / 2); else if (axis !== 'y') g.rotateZ(-Math.PI / 2);
      return add(g, name, en, pos, material, extra);
    }
    function ringGeometry(outer, inner, depth, half) {
      var s = new THREE.Shape(), start = half ? -Math.PI / 2 : 0, end = half ? Math.PI / 2 : Math.PI * 2;
      if (half) {
        s.absarc(0, 0, outer, start, end, false);
        s.lineTo(Math.cos(end) * inner, Math.sin(end) * inner);
        s.absarc(0, 0, inner, end, start, true); s.closePath();
      } else {
        s.absarc(0, 0, outer, 0, Math.PI * 2, false);
        var hole = new THREE.Path(); hole.absarc(0, 0, inner, 0, Math.PI * 2, true); s.holes.push(hole);
      }
      var g = new THREE.ExtrudeGeometry(s, {depth: depth, bevelEnabled: false, curveSegments: 48});
      g.translate(0, 0, -depth / 2); g.rotateY(Math.PI / 2); return g;
    }
    function ring(name, en, outer, inner, depth, pos, material, extra, half) { return add(ringGeometry(outer, inner, depth, half), name, en, pos, material, extra); }
    function torus(name, en, radius, tube, pos, extra, material) {
      var g = new THREE.TorusGeometry(radius, tube, 12, 64); g.rotateY(Math.PI / 2);
      return add(g, name, en, pos, material || sealMaterial, extra);
    }
    function box(name, en, size, pos, material, extra) { return add(new THREE.BoxGeometry(size[0], size[1], size[2]), name, en, pos, material, extra); }
    function gear(name, outer, inner, width, teeth, pos, extra) {
      var s = new THREE.Shape();
      for (var i = 0; i < teeth * 4; i++) {
        var r = i % 4 === 1 || i % 4 === 2 ? outer : outer * .88, t = i / (teeth * 4) * Math.PI * 2;
        if (!i) s.moveTo(r * Math.cos(t), r * Math.sin(t)); else s.lineTo(r * Math.cos(t), r * Math.sin(t));
      }
      s.closePath(); var hole = new THREE.Path(); hole.absarc(0, 0, inner, 0, Math.PI * 2, true); s.holes.push(hole);
      var g = new THREE.ExtrudeGeometry(s, {depth: width, bevelEnabled: true, bevelThickness: .01, bevelSize: .01, bevelSegments: 1});
      g.translate(0, 0, -width / 2); g.rotateY(Math.PI / 2);
      return add(g, name, 'Transmission gear', pos, bright, Object.assign({type: '齿轮'}, extra || {}));
    }
    function sealExtra(key, product, type, direction, amount, description) {
      return {status: 'baseline', role: 'seal', failureKey: key, productKey: product, type: type,
        explodeAxis: direction, explodeDistance: amount, description: description};
    }
    function shell(name, profile, extra) {
      var pts = profile.map(function(p) { return new THREE.Vector2(p[1], p[0]); });
      var geo = new THREE.LatheGeometry(pts, 56, Math.PI / 2, Math.PI); geo.rotateZ(-Math.PI / 2);
      return add(geo, name, 'Sectioned transmission housing', [0, 0, 0], casting,
        Object.assign({explodeAxis:[0,0,-1],explodeDistance:.45,type:'半剖壳体',description:'背侧半剖铝壳，前侧留空以显示内部；实际壳体包覆总成。'}, extra || {}));
    }
    shell('变速器钟形壳（半剖）', [[-4.15,1.87],[-3.92,1.87],[-3.30,1.69],[-2.62,1.33],[-2.44,1.33],[-2.44,1.21],[-3.30,1.56],[-3.92,1.74],[-4.15,1.74]]);
    shell('主箱体（半剖）', [[-2.48,1.34],[1.80,1.34],[2.36,1.04],[2.36,.91],[1.75,1.21],[-2.48,1.21]]);
    shell('尾部延伸壳（半剖）', [[2.30,1.04],[2.75,.80],[3.35,.56],[3.35,.44],[2.75,.68],[2.30,.91]]);
    [-4.10,-2.43,-1.35,-.35,.68,1.75,2.35,3.32].forEach(function(x,i){
      var r = x < -3 ? 1.91 : x > 3 ? .60 : x > 2 ? 1.08 : 1.39;
      ring('箱体加强筋 '+(i+1),'Housing reinforcing rib',r,r-.13,.105,[x,0,0],casting,{explodeAxis:[0,0,-1],explodeDistance:.45},true);
    });
    for (var rib=0;rib<4;rib++) box('主箱体纵向加强筋 '+(rib+1),'Longitudinal housing rib',[4.1,.07,.09],[-.35,-.78+rib*.47,-1.15],casting,{explodeAxis:[0,0,-1],explodeDistance:.45});
    // A flattened toroidal converter and visible hub give the large front bell its identity.
    var converter = new THREE.TorusGeometry(1.10,.39,20,72);converter.rotateY(Math.PI/2);converter.scale(.68,1,1);
    add(converter,'液力变矩器壳体','Torque converter',[-3.42,0,0],metal,{explodeAxis:[-1,0,0],explodeDistance:1.15});
    ring('液力变矩器前盖','Torque converter front cover',1.29,.26,.11,[-3.69,0,0],metal,{explodeAxis:[-1,0,0],explodeDistance:1.2});
    cyl('液力变矩器轮毂','Converter hub',.24,.82,[-3.10,0,0],bright,{explodeAxis:[-1,0,0],explodeDistance:1.0});
    for(var blade=0;blade<18;blade++){
      var angle=blade/18*Math.PI*2;
      var b=box('变矩器壳体冲压纹 '+(blade+1),'Converter cover embossment',[.045,.29,.075],[-3.76,Math.sin(angle)*1.02,Math.cos(angle)*1.02],bright,{productKey:'液力变矩器前盖',explodeAxis:[-1,0,0],explodeDistance:1.2});b.rotation.x=-angle;
    }
    ring('前油泵壳体（半剖）','Front pump housing',1.23,.37,.30,[-2.38,0,0],casting,{explodeAxis:[-1,0,0],explodeDistance:.55},true);
    ring('前油泵驱动环','Front pump drive ring',.88,.41,.12,[-2.43,0,0],bright,{explodeAxis:[-1,0,0],explodeDistance:.55});
    var front=sealExtra('tx-front','前泵油封','旋转轴唇形油封',[-1,0,0],.70,'位于变矩器轮毂与前油泵壳体孔之间，阻止 ATF 沿旋转轮毂向钟形壳外泄。');
    ring('前泵油封','Front pump oil seal',.47,.265,.17,[-2.66,0,0],sealMaterial,front);
    torus('前泵油封 · 密封唇口','Front pump sealing lip',.279,.035,[-2.74,0,0],front);
    cyl('输入轴','Input shaft',.185,6.75,[-.68,0,0],bright,{explodeAxis:[1,0,0],explodeDistance:.20});
    cyl('输出轴','Output shaft',.245,2.48,[2.60,0,0],bright,{explodeAxis:[1,0,0],explodeDistance:.85});
    // Two wet clutch packs, alternating friction and steel plates.
    [-1.66,-.42].forEach(function(center, packIndex){
      ring('离合器鼓（半剖） '+(packIndex+1),'Sectioned clutch drum',1.10,.98,1.00,[center,0,0],casting,{explodeAxis:[0,0,-1],explodeDistance:.40},true);
      for(var p=0;p<9;p++)ring((p%2?'钢片':'摩擦片')+' '+(packIndex+1)+'-'+(p+1),p%2?'Clutch steel plate':'Clutch friction disc',p%2?.94:1.0,.43,.053,[center-.35+p*.083,0,0],p%2?bright:clutch,{type:'湿式离合器片',explodeAxis:[1,0,0],explodeDistance:(p-4)*.10+packIndex*.15});
      ring('离合器活塞 '+(packIndex+1),'Clutch piston',1.02,.38,.12,[center-.48,0,0],metal,{explodeAxis:[-1,0,0],explodeDistance:.35});
    });
    var clutchSeal=sealExtra('tx-clutch','离合器活塞密封','液压活塞密封',[-1,0,0],.48,'布置在离合器活塞内、外径，封住活塞压力腔；油压建立后推动活塞压紧摩擦片。');
    torus('离合器活塞密封 · 外径','Clutch piston outer seal',.963,.051,[-2.19,0,0],clutchSeal);
    torus('离合器活塞密封 · 内径','Clutch piston inner seal',.397,.039,[-2.19,0,0],clutchSeal);
    var rotary=sealExtra('tx-ring','旋转轴密封环','旋转供油密封环',[0,0,1],.44,'输入轴供油区的密封环隔离不同压力油路；图中环位与数量为原理示意。');
    [-.10,.055,.21].forEach(function(x,i){torus('旋转轴密封环 '+(i+1),'Rotary shaft sealing ring',.218,.039,[x,0,0],rotary);});
    ring('行星架端板','Planet carrier',.99,.30,.12,[.85,0,0],metal,{explodeAxis:[1,0,0],explodeDistance:.45});
    gear('太阳轮',.38,.19,.58,20,[1.22,0,0],{explodeAxis:[1,0,0],explodeDistance:.55});
    for(var planet=0;planet<4;planet++){
      var t=planet/4*Math.PI*2;
      gear('行星齿轮 '+(planet+1),.31,.075,.58,16,[1.22,Math.sin(t)*.64,Math.cos(t)*.64],{explodeAxis:[1,0,0],explodeDistance:.55});
      cyl('行星轮销轴 '+(planet+1),'Planet pin',.074,.78,[1.22,Math.sin(t)*.64,Math.cos(t)*.64],bright,{explodeAxis:[1,0,0],explodeDistance:.55});
    }
    ring('内齿圈（半剖）','Sectioned annulus gear',1.10,.94,.76,[1.22,0,0],metal,{explodeAxis:[0,0,-1],explodeDistance:.35},true);
    ring('输出轴支承轴承','Output support bearing',.46,.255,.26,[2.58,0,0],dark,{explodeAxis:[1,0,0],explodeDistance:.65});
    var output=sealExtra('tx-output','输出轴油封','旋转轴唇形油封',[1,0,0],1.02,'位于尾壳输出端，密封旋转输出轴与壳体孔之间的间隙，防止 ATF 外泄。');
    ring('输出轴油封','Output shaft oil seal',.49,.253,.16,[3.34,0,0],sealMaterial,output);
    torus('输出轴油封 · 密封唇口','Output shaft sealing lip',.265,.032,[3.44,0,0],output);
    for(var spline=0;spline<16;spline++){
      var s=spline/16*Math.PI*2;
      box('输出轴花键 '+(spline+1),'Output shaft spline',[.48,.035,.035],[3.61,Math.sin(s)*.251,Math.cos(s)*.251],bright,{productKey:'输出轴',explodeAxis:[1,0,0],explodeDistance:.85});
    }
    // Lower valve body is kept separate from the main cast shell.
    var valveShape=new THREE.Shape();
    valveShape.moveTo(-1.90,-.805);valveShape.lineTo(1.90,-.805);valveShape.lineTo(1.90,.805);valveShape.lineTo(-1.90,.805);valveShape.closePath();
    for(var bore=0;bore<4;bore++){
      var valveBore=new THREE.Path();valveBore.absarc(-1.42+bore*.80+.26,-.58,.11,0,Math.PI*2,true);valveShape.holes.push(valveBore);
    }
    var valveGeo=new THREE.ExtrudeGeometry(valveShape,{depth:.34,bevelEnabled:false,curveSegments:40});
    valveGeo.translate(0,0,-.17);valveGeo.rotateX(-Math.PI/2);
    add(valveGeo,'液压控制阀体','Hydraulic valve body',[-.26,-1.52,0],casting,{explodeAxis:[0,-1,0],explodeDistance:.46,description:'位于主箱体与油底壳之间，油道和阀芯分配压力油以控制离合器。四个Y轴供油孔与上方环形接口座贯通。'});
    for(var channel=0;channel<6;channel++){
      box('阀体油道筋 '+(channel+1),'Valve-body passage rib',[.08,.12,.88],[-1.78+channel*.59,-1.30,-.245],bright,{productKey:'液压控制阀体',explodeAxis:[0,-1,0],explodeDistance:.46});
      cyl('电磁阀 '+(channel+1),'Hydraulic solenoid',.125,.34,[-1.73+channel*.59,-1.45,.93],dark,{explodeAxis:[0,-1,0],explodeDistance:.46},'z');
    }
    var hydraulic=sealExtra('tx-hydraulic','液压系统O形圈','静态油路O形圈',[0,-1,0],.62,'阀体与壳体供油接口处的静态 O 形圈隔离压力油；不是输出轴旋转油封。');
    for(var port=0;port<4;port++){
      var ox=-1.42+port*.80;
      // Both geometries start along X and rotate onto Y.  The seal is lightly
      // embedded in the annular upper face, with the central passage left open.
      var or=torus('液压系统O形圈 '+(port+1),'Hydraulic passage O-ring',.158,.028,[ox,-1.275,.58],hydraulic);or.rotation.z=Math.PI/2;
      ring('阀体接口座 '+(port+1),'Valve-body interface port',.205,.11,.095,[ox,-1.33,.58],casting,{explodeAxis:[0,-1,0],explodeDistance:.46,description:'沿Y轴的环形供油接口座。上端面承托O形圈，中心孔与阀体油孔贯通。'}).rotation.z=Math.PI/2;
    }
    // Open tray and a continuous rounded rectangular flange gasket below the valve body.
    box('变速箱油底壳底板','Transmission oil-pan base',[4.35,.15,2.00],[-.29,-2.10,0],metal,{productKey:'变速箱油底壳',explodeAxis:[0,-1,0],explodeDistance:1.10});
    [[4.35,.36,.09,0,-.99],[4.35,.36,.09,0,.99],[.09,.36,1.98,-2.13,0],[.09,.36,1.98,2.13,0]].forEach(function(p,i){box('油底壳侧壁 '+(i+1),'Oil-pan wall',[p[0],p[1],p[2]],[-.29+p[3],-1.86,p[4]],metal,{productKey:'变速箱油底壳',explodeAxis:[0,-1,0],explodeDistance:1.10});});
    function rounded(w,h,r){var s=new THREE.Shape(),x=-w/2,z=-h/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+h-r);s.quadraticCurveTo(x+w,z+h,x+w-r,z+h);s.lineTo(x+r,z+h);s.quadraticCurveTo(x,z+h,x,z+h-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;}
    var gasketShape=rounded(4.49,2.15,.24),inner=rounded(4.27,1.93,.18);gasketShape.holes.push(new THREE.Path(inner.getPoints(56)));
    var gasketGeo=new THREE.ExtrudeGeometry(gasketShape,{depth:.055,bevelEnabled:false,curveSegments:40});gasketGeo.translate(0,0,-.0275);gasketGeo.rotateX(-Math.PI/2);
    var pan=sealExtra('tx-pan','油底壳密封垫','静态法兰密封垫',[0,-1,0],.85,'连续成型密封垫夹在变速箱体法兰与油底壳之间，防止壳体下方 ATF 外泄。');
    add(gasketGeo,'油底壳密封垫','Transmission oil-pan gasket',[-.29,-1.67,0],sealMaterial,pan);
    [-2.20,-1.43,-.66,.11,.88,1.65].forEach(function(x,i){[-1.02,1.02].forEach(function(z){cyl('油底壳法兰螺栓 '+(i+1)+(z<0?'A':'B'),'Oil-pan flange bolt',.065,.15,[x,-1.76,z],bright,{productKey:'油底壳法兰螺栓',explodeAxis:[0,-1,0],explodeDistance:1.18},'y');});});
    group.updateMatrixWorld(true);
    return {assemblies: [assembly], parts: parts};
  };
})();
