/* Automotive chassis teaching model. Parametric, not OEM CAD or a vehicle BOM. */
(function () {
  'use strict';
  window.buildChassisSystem = function (THREE, palette) {
    palette = Object.assign({structure:'#738595',metal:'#b8c4cd',dark:'#303d48',baseline:'#e96824'},palette || {});
    var group = new THREE.Group(), parts = [], serial = 0;
    group.name = '汽车底盘 · 密封件应用研究模型';
    var zero = new THREE.Vector3();
    var assembly = {
      id:'auto-chassis', name:'汽车底盘', en:'Automotive chassis', group:group,
      base:zero.clone(), explode:zero.clone(), detailOnly:true,
      note:'四轮独立悬架与传动底盘的通用示意，重点显示轮毂、差速器、等速节、齿条、减振器和球铰六类密封。轮毂及差速器采用局部剖视，尺寸、车型布置和密封数量不代表原厂设计。防尘套用于保脂及防污，不等同于承压油封。'
    };
    function color(key) { return palette[key] && palette[key].isColor ? palette[key].clone() : new THREE.Color(palette[key]); }
    var materials = {
      metal:new THREE.MeshStandardMaterial({color:color('metal'),metalness:.8,roughness:.33}),
      structure:new THREE.MeshStandardMaterial({color:color('structure'),metalness:.62,roughness:.42}),
      dark:new THREE.MeshStandardMaterial({color:color('dark'),metalness:.1,roughness:.74}),
      bright:new THREE.MeshStandardMaterial({color:color('metal').offsetHSL(0,-.1,.15),metalness:.9,roughness:.24}),
      seal:new THREE.MeshStandardMaterial({color:'#e96824',metalness:.07,roughness:.58}),
      rubber:new THREE.MeshStandardMaterial({color:'#26323b',metalness:0,roughness:.83})
    };
    function vector(a) { return new THREE.Vector3(a[0],a[1],a[2]); }
    function add(geometry,name,en,pos,rotation,options) {
      var o = options || {}, seal = !!o.failureKey;
      var mesh = new THREE.Mesh(geometry,o.material || materials[seal?'seal':'metal']);
      mesh.name = name;
      if(pos)mesh.position.copy(vector(pos));
      if(rotation)mesh.rotation.set(rotation[0],rotation[1],rotation[2]);
      mesh.castShadow=true;mesh.receiveShadow=true;
      var outward = pos && Math.hypot(pos[0],pos[1],pos[2]) > .1 ? vector(pos).normalize().toArray() : [0,1,0];
      mesh.userData = {
        id:'ch-'+(++serial), assembly:assembly.id, name:name, en:en,
        status:seal?'baseline':'structure', type:o.type || (seal?'底盘密封件':'结构件'),
        description:o.description || '底盘结构研究示意；实际车型的结构、尺寸和配套关系以原厂资料为准。',
        productKey:o.productKey || name, system:'chassis', role:seal?'seal':'structure',
        sourceIds:[], explodeAxis:o.explodeAxis || outward,
        explodeDistance:o.explodeDistance == null ? (seal?.35:.06) : o.explodeDistance
      };
      if(seal)mesh.userData.failureKey=o.failureKey;
      group.add(mesh);parts.push(mesh);return mesh;
    }
    function cylinder(name,en,radius,length,pos,axis,options) {
      return add(new THREE.CylinderGeometry(radius,radius,length,36),name,en,pos,
        axis==='x'?[0,0,-Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:null,options);
    }
    function box(name,en,size,pos,options) { return add(new THREE.BoxGeometry(size[0],size[1],size[2]),name,en,pos,null,options); }
    function torus(name,en,radius,tube,pos,axis,options) {
      return add(new THREE.TorusGeometry(radius,tube,12,56),name,en,pos,
        axis==='x'?[0,Math.PI/2,0]:axis==='y'?[-Math.PI/2,0,0]:null,options);
    }
    function annulus(name,en,outer,inner,depth,pos,axis,options,cut) {
      var outline = new THREE.Shape(), hole = new THREE.Path();
      // A 90-degree inspection opening exposes races and the axial seal contact.
      var start = cut?Math.PI*.16:0, end = cut?Math.PI*1.66:Math.PI*2;
      if(cut) {
        outline.absarc(0,0,outer,start,end,false);
        outline.lineTo(Math.cos(end)*inner,Math.sin(end)*inner);
        outline.absarc(0,0,inner,end,start,true);outline.closePath();
      } else {
        outline.absarc(0,0,outer,0,Math.PI*2,false);
        hole.absarc(0,0,inner,0,Math.PI*2,true);outline.holes.push(hole);
      }
      var g = new THREE.ExtrudeGeometry(outline,{depth:depth,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:42});
      g.translate(0,0,-depth/2);
      return add(g,name,en,pos,axis==='x'?[0,Math.PI/2,0]:axis==='y'?[-Math.PI/2,0,0]:null,options);
    }
    function rod(name,en,from,to,radius,options) {
      var a=vector(from),b=vector(to),delta=b.clone().sub(a);
      var m=add(new THREE.CylinderGeometry(radius,radius,delta.length(),14),name,en,a.clone().add(b).multiplyScalar(.5).toArray(),null,options);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;
    }
    function sphere(name,en,r,pos,options) {return add(new THREE.SphereGeometry(r,24,16),name,en,pos,null,options);}
    function spring(name,pos,options) {
      var pts=[];for(var i=0;i<=160;i++){var t=i/160;pts.push(new THREE.Vector3(Math.cos(t*Math.PI*14)*.3,(t-.5)*1.14,Math.sin(t*Math.PI*14)*.3));}
      var path=new THREE.CatmullRomCurve3(pts);
      return add(new THREE.TubeGeometry(path,160,.052,8,false),name,'Coil spring',pos,null,options);
    }
    function boot(name,en,pos,axis,length,rSmall,rLarge,key,product,description,sign,largeEndDirection) {
      // The lathed profile runs from the small end (-Y) to the large end (+Y).
      // Orient that large end toward its housing independently of the explode axis.
      var direction=largeEndDirection < 0 ? -1 : 1;
      var profile=[],folds=7;
      for(var i=0;i<=folds*2;i++) {
        var t=i/(folds*2),r=rSmall+(rLarge-rSmall)*t;
        if(i%2===1)r+=.07;
        profile.push(new THREE.Vector2(r,-length/2+t*length));
      }
      var g=new THREE.LatheGeometry(profile,36);
      var rotation=axis==='x'?[0,0,-Math.PI/2*direction]:direction<0?[0,0,Math.PI]:null;
      var m=add(g,name,en,pos,rotation,{
        failureKey:key,productKey:product,type:'弹性体防尘套',description:description,
        explodeAxis:axis==='x'?[sign||1,0,0]:[0,1,0],explodeDistance:.4
      });
      // Metal clamp bands are deliberately separate from the boot sealing product.
      [-1,1].forEach(function(end) {
        var p=pos.slice();p[axis==='x'?0:1]+=end*direction*length/2;
        torus(name+' · '+(end<0?'小端':'大端')+'卡箍','Boot clamp',end<0?rSmall:rLarge,.018,p,axis,{material:materials.bright,explodeDistance:.13});
      });
      return m;
    }
    var railOpts={material:materials.structure,explodeAxis:[0,-1,0],explodeDistance:.08};
    [-1,1].forEach(function(s) {
      box((s<0?'左':'右')+'底盘纵梁','Longitudinal chassis rail',[.28,.28,8.7],[s*1.12,.34,0],railOpts);
      rod((s<0?'左':'右')+'传动隧道加强梁','Tunnel reinforcement',[s*.5,.44,-2.85],[s*.5,.44,2.45],.07,railOpts);
    });
    [-3.9,-2.55,2.5,3.9].forEach(function(z,i) {
      box((i<2?'前':'后')+'副车架横梁 '+(i+1),'Subframe cross member',[3.85,.24,.25],[0,.3,z],railOpts);
    });
    box('中央地板结构框','Center floor frame',[2.12,.12,3.5],[0,.16,.1],{material:materials.structure,explodeAxis:[0,-1,0],explodeDistance:.18});
    // Longitudinal prop shaft and an open front gearbox / rear differential.
    cylinder('中央传动轴','Propeller shaft',.13,5.8,[0,.68,.62],'z',{material:materials.bright});
    [-2.27,3.52].forEach(function(z,i){sphere((i?'后':'前')+'传动轴万向接头','Universal coupling',.21,[0,.68,z],{material:materials.dark});});
    cylinder('变速器尾端壳体（示意）','Transmission tail housing',.48,1.15,[0,.73,-2.45],'z',{material:materials.structure});
    [-3.9,3.9].forEach(function(z,axle) {
      var end=axle?'后':'前';
      // Rear half shell, lower support and visible bevel gear communicate a cutaway.
      add(new THREE.SphereGeometry(.68,40,24,0,Math.PI),end+'差速器局部剖开壳体','Differential housing, cutaway',[0,.72,z],[0,0,Math.PI/2],{material:materials.structure,explodeAxis:[0,-1,0],explodeDistance:.22});
      annulus(end+'差速器主减速齿圈','Differential ring gear',.51,.3,.22,[0,.72,z],'z',{material:materials.metal});
      cylinder(end+'差速器横向输出轴','Differential output shaft',.12,4.6,[0,.72,z],'x',{material:materials.bright});
      [-1,1].forEach(function(s) {
        var side=(s<0?'左':'右'),loc=end+side;
        cylinder(loc+'差速器输出轴承座','Differential output bearing housing',.31,.38,[s*.59,.72,z],'x',{material:materials.structure,explodeAxis:[s,0,0],explodeDistance:.18});
        annulus(loc+'差速器输出轴油封','Differential output shaft oil seal',.3,.125,.07,[s*.81,.72,z],'x',{
          failureKey:'ch-diff',productKey:'差速器输出轴油封',type:'旋转轴唇形油封',
          description:'油封位于差速器壳体的半轴输出孔，唇口与输出轴接触，保留齿轮油并阻挡外界污物。局部剖视显示其轴向位置。',explodeAxis:[s,0,0],explodeDistance:.48
        });
        rod(loc+'半轴','Drive halfshaft',[s*.77,.72,z],[s*2.22,.72,z],.105,{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.1});
        cylinder(loc+'内等速节壳体','Inner CV joint housing',.23,.36,[s*.99,.72,z],'x',{material:materials.dark});
        cylinder(loc+'外等速节壳体','Outer CV joint housing',.25,.27,[s*2.08,.72,z],'x',{material:materials.dark});
        boot(loc+'内等速万向节防尘套','Inner CV joint boot',[s*1.28,.72,z],'x',.52,.13,.235,'ch-cv','等速万向节防尘套','波纹防尘套随等速节摆动及伸缩；两端卡箍保持密闭，用于保留润滑脂并阻止泥水进入。',s,-s);
        boot(loc+'外等速万向节防尘套','Outer CV joint boot',[s*1.91,.72,z],'x',.43,.125,.24,'ch-cv','等速万向节防尘套','外等速节防尘套承担保脂、防尘和防水。其破损后的失效路径与等速节润滑及污染有关。',s,s);
        // The two arms form a visible triangular independent-suspension wishbone.
        rod(loc+'下摆臂前支臂','Lower control arm, front link',[s*1.05,.3,z-.65],[s*2.18,.33,z],.095,{material:materials.structure,explodeAxis:[0,-1,0],explodeDistance:.15});
        rod(loc+'下摆臂后支臂','Lower control arm, rear link',[s*1.05,.3,z+.65],[s*2.18,.33,z],.095,{material:materials.structure,explodeAxis:[0,-1,0],explodeDistance:.15});
        sphere(loc+'悬架球铰壳体','Suspension ball joint housing',.18,[s*2.18,.34,z],{material:materials.metal,explodeAxis:[0,-1,0],explodeDistance:.18});
        cylinder(loc+'悬架球头销','Ball stud',.075,.42,[s*2.18,.53,z],'y',{material:materials.bright});
        boot(loc+'悬架球铰防尘套','Suspension ball joint dust boot',[s*2.18,.54,z],'y',.18,.11,.19,'ch-ball','悬架球铰防尘套','柔性防尘套包住球头销与壳口，保留润滑脂并阻挡泥水；它不是控制悬架位置的金属球头本体。',s,-1);
        box(loc+'转向节支承架','Steering knuckle carrier',[.17,.95,.29],[s*2.24,.8,z],{material:materials.structure,explodeAxis:[s,0,0],explodeDistance:.16});
        var bearingX=s*2.28;
        annulus(loc+'轮毂轴承外圈（局部剖视）','Wheel bearing outer race, cutaway',.36,.285,.3,[bearingX,.72,z],'x',{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.24},true);
        cylinder(loc+'轮毂轴颈','Wheel hub spindle',.17,.43,[s*2.29,.72,z],'x',{material:materials.bright});
        for(var b=0;b<10;b++) {
          var angle=b/10*Math.PI*2;
          sphere(loc+'轮毂轴承滚珠 '+(b+1),'Wheel bearing ball',.055,[bearingX,.72+Math.cos(angle)*.255,z+Math.sin(angle)*.255],{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.18});
        }
        annulus(loc+'轮毂轴承密封圈','Wheel bearing seal',.34,.17,.055,[s*2.47,.72,z],'x',{
          failureKey:'ch-bearing',productKey:'轮毂轴承密封圈',type:'轴承密封圈',
          description:'轴承端面密封保留轴承润滑脂，并限制泥水及颗粒进入滚道。其结构与材料按轴承形式及车型确定。',explodeAxis:[s,0,0],explodeDistance:.58
        });
        // Brake rotor is offset outside the inspection-bearing plane.
        annulus(loc+'制动盘','Brake disc',.64,.22,.06,[s*2.57,.72,z],'x',{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.55});
        annulus(loc+'轮毂法兰','Wheel hub flange',.34,.15,.1,[s*2.64,.72,z],'x',{material:materials.metal,explodeAxis:[s,0,0],explodeDistance:.6});
        box(loc+'制动钳','Brake caliper',[.21,.48,.21],[s*2.56,.78,z+.53],{material:materials.dark,explodeAxis:[s,0,0],explodeDistance:.55});
        var wx=s*2.79;
        torus(loc+'轮胎','Tire',.91,.235,[wx,.72,z],'x',{material:materials.rubber,explodeAxis:[s,0,0],explodeDistance:.82});
        annulus(loc+'轮辋','Wheel rim',.78,.67,.34,[wx,.72,z],'x',{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.82});
        for(var spoke=0;spoke<5;spoke++) {
          var phi=spoke/5*Math.PI*2;
          rod(loc+'轮辐 '+(spoke+1),'Wheel spoke',[wx,.72+Math.cos(phi)*.19,z+Math.sin(phi)*.19],[wx,.72+Math.cos(phi)*.72,z+Math.sin(phi)*.72],.055,{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.82});
        }
        cylinder(loc+'轮心','Wheel center',.22,.15,[wx,.72,z],'x',{material:materials.bright,explodeAxis:[s,0,0],explodeDistance:.82});
        // A vertical strut permits the oil-seal / piston-rod interface to be read clearly.
        var sx=s*2.02;
        cylinder(loc+'减振器筒体','Shock absorber housing',.18,1.02,[sx,1.43,z],'y',{material:materials.dark,explodeAxis:[s*.25,0,0],explodeDistance:.18});
        cylinder(loc+'减振器活塞杆','Shock absorber piston rod',.065,1.21,[sx,2.11,z],'y',{material:materials.bright,explodeAxis:[0,1,0],explodeDistance:.22});
        annulus(loc+'减振器活塞杆油封','Shock absorber rod seal',.205,.066,.08,[sx,1.98,z],'y',{
          failureKey:'ch-shock',productKey:'减振器活塞杆油封',type:'往复杆密封',
          description:'活塞杆穿出减振器筒体的位置设往复密封，限制阻尼油外漏；外侧通常另设防尘或刮尘结构。',explodeAxis:[0,1,0],explodeDistance:.42
        });
        cylinder(loc+'下弹簧座','Lower spring seat',.4,.07,[sx,1.84,z],'y',{material:materials.metal,explodeAxis:[0,1,0],explodeDistance:.18});
        spring(loc+'悬架螺旋弹簧',[sx,2.48,z],{material:materials.dark,explodeAxis:[0,1,0],explodeDistance:.28});
        cylinder(loc+'减振器上支座','Strut upper mount',.36,.13,[sx,3.1,z],'y',{material:materials.structure,explodeAxis:[0,1,0],explodeDistance:.44});
      });
    });
    // Front rack steering lies ahead of the differential so its boots remain visible.
    cylinder('转向机齿条壳体','Steering rack housing',.16,2.2,[0,.44,-4.66],'x',{material:materials.structure,explodeAxis:[0,0,-1],explodeDistance:.18});
    cylinder('转向齿条及横拉杆','Steering rack and tie rod',.055,4.38,[0,.44,-4.66],'x',{material:materials.bright,explodeAxis:[0,0,-1],explodeDistance:.18});
    rod('转向输入轴','Steering input shaft',[.46,.46,-4.66],[.46,1.42,-4.23],.075,{material:materials.bright});
    [-1,1].forEach(function(s) {
      var loc=s<0?'左':'右';
      boot(loc+'转向机齿条防尘套','Steering rack boot',[s*1.39,.44,-4.66],'x',.65,.09,.19,'ch-rack','转向机齿条防尘套','波纹防尘套保护齿条和内球头工作区，阻挡污物；液压转向机的压力油封位于壳体内部，不能用更换外防尘套代替压力油封修复。',s,-s);
      rod(loc+'转向外横拉杆','Outer tie rod',[s*1.76,.44,-4.66],[s*2.22,.62,-4.1],.065,{material:materials.bright,explodeAxis:[0,0,-1],explodeDistance:.2});
      sphere(loc+'转向外球头','Outer tie rod end',.13,[s*2.22,.62,-4.1],{material:materials.metal});
    });
    group.updateMatrixWorld(true);
    return {assemblies:[assembly],parts:parts};
  };
})();
