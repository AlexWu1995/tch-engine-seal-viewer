(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const system = document.body.dataset.system;
  const T = window.THREE;
  const F = window.SEAL_FAILURES;
  const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const config = system === 'transmission' ? {
    keys:['tx-front','tx-output','tx-clutch','tx-ring','tx-hydraulic','tx-pan'],
    names:['前泵油封','输出轴油封','离合器活塞密封','旋转轴密封环','液压系统 O 形圈','油底壳密封垫'],
    intro:'从液力变矩器、离合器到液压阀体，查看六类密封件的安装位置。选择部位，沿着泄漏路径理解换挡、传扭和润滑功能怎样受到影响。',
    rotation:[.28,-.42,0], build:window.buildTransmissionSystem
  } : {
    keys:['ch-bearing','ch-diff','ch-cv','ch-rack','ch-shock','ch-ball'],
    names:['轮毂轴承密封圈','差速器输出轴油封','等速万向节防尘套','转向齿条防尘套','减振器活塞杆油封','悬架球铰防尘套'],
    intro:'沿着轮端、传动、转向和悬架，查看六类密封位置。区别承压与保油密封、防水防尘护套，理解破损怎样逐步影响传动、转向与阻尼。',
    rotation:[.44,-.58,0], build:window.buildChassisSystem
  };
  document.querySelector(`[data-nav="${system}"]`)?.setAttribute('aria-current','page');
  $('intro-text').textContent = config.intro;
  const model = config.build(T, {structure:'#829ba9',metal:'#aebdc7',dark:'#283945',baseline:'#e66b25'});
  const parts = model.parts;
  const group = model.assemblies[0].group;
  let selectedKey = config.keys[0], selected = null;
  const representatives = new Map(config.keys.map(key => [key, parts.find(m => m.userData.failureKey === key)]));
  const sourceLinks = ids => ids.map(id => F.sources.find(s => s.id === id)).filter(Boolean).map(s => `<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a>`).join(' ');
  const pointButtons = new Map(), markers = new Map();
  const allParts = $('all-parts');
  for (const [i,key] of config.keys.entries()) {
    const item = F.entries[key];
    const b = document.createElement('button'); b.className = 'seal-point'; b.type = 'button';
    b.innerHTML = `<b>${i+1}</b><span><strong>${escape(config.names[i])}</strong><small>${escape(item.kind)}</small></span>`;
    b.addEventListener('click', () => choose(representatives.get(key)));
    pointButtons.set(key,b); $('seal-points').append(b);
    const marker = document.createElement('button'); marker.type='button';marker.className='marker';marker.textContent=String(i+1);
    marker.setAttribute('aria-label',config.names[i]);marker.title=config.names[i];marker.addEventListener('click',()=>choose(representatives.get(key)));
    markers.set(key,marker);$('markers').append(marker);
    const tr = document.createElement('tr');
    const name = document.createElement('td');const action=document.createElement('button');action.type='button';action.textContent=`${i+1} ${config.names[i]}`;action.addEventListener('click',()=>{choose(representatives.get(key));$('stage').scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});});name.append(action);tr.append(name);
    for(const field of ['mechanism','impact','symptoms']){const td=document.createElement('td');td.textContent=item[field];tr.append(td);}
    $('failure-table').append(tr);
  }
  const usedSources = new Set(config.keys.flatMap(k=>F.entries[k].sourceIds));
  for(const s of F.sources.filter(s=>usedSources.has(s.id))){const li=document.createElement('li');li.innerHTML=`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a><small>${escape(s.scope)}</small>`;$('source-list').append(li);}
  for(const m of parts){const o=document.createElement('option');o.value=m.userData.id;o.textContent=(m.userData.role==='seal'?'● ':'')+m.userData.name;allParts.append(o);}
  let renderer, scene, camera, pivot, distance = 20;
  let exploded=.2, opacity=1, sealsOnly=false, single=false, auto=false, dirty=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const originals = new Map(), materials=new Map();
  parts.forEach(m=>{
    originals.set(m,m.position.clone());m.material=m.material.clone();
    materials.set(m,{color:m.material.color.clone(),emissive:m.material.emissive.clone(),opacity:m.material.opacity,transparent:m.material.transparent});
    if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();
    if(!m.geometry.boundingSphere)m.geometry.computeBoundingSphere();
  });
  function highlight(){
    for(const m of parts){const original=materials.get(m);m.material.color.copy(original.color);m.material.emissive.copy(original.emissive);
      const hit=selectedKey?m.userData.failureKey===selectedKey:m===selected;
      if(hit){m.material.color.set('#ef842e');m.material.emissive.set('#9c3700');m.material.emissiveIntensity=.21;}
      else m.material.emissiveIntensity=.08;
    }
    for(const [key,b] of pointButtons)b.setAttribute('aria-pressed',String(key===selectedKey));
    for(const [key,b] of markers)b.setAttribute('aria-pressed',String(key===selectedKey));dirty=true;
  }
  function choose(mesh){
    if(!mesh)return;const wasSingle=single;selected=mesh;selectedKey=F.match(mesh.userData);allParts.value=mesh.userData.id;
    const index=config.keys.indexOf(selectedKey),entry=F.entries[selectedKey];
    $('selected-title').textContent=index>=0?config.names[index]:mesh.userData.name;
    $('selected-kind').textContent=entry?entry.kind:'结构件 / STRUCTURAL COMPONENT';
    $('selected-location').textContent=mesh.userData.description;
    $('failure-badge').hidden=!entry;
    $('failure-grid').replaceChildren();
    if(entry){
      for(const [title,field] of [['01 / 破损机制','mechanism'],['02 / 功能影响','impact'],['03 / 可观察表现','symptoms']]){
        const article=document.createElement('article');article.className='failure-card';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=entry[field];article.append(h,p);$('failure-grid').append(article);
      }
      $('selected-sources').innerHTML='技术依据与工程推断：'+sourceLinks(entry.sourceIds);
    }else{$('selected-sources').textContent='该部件是结构件。可从右侧六个密封部位查看对应密封件的破损后果。';}
    $('single').disabled=!entry;
    if(!entry&&single){single=false;$('single').setAttribute('aria-pressed','false');}
    if(!entry&&sealsOnly){sealsOnly=false;$('seals-only').setAttribute('aria-pressed','false');}
    highlight();if(renderer){layout();if(single||wasSingle)fit();}save();
  }
  function layout(){
    for(const m of parts){const d=m.userData;m.position.copy(originals.get(m)).addScaledVector(new T.Vector3(...d.explodeAxis),exploded*d.explodeDistance);
      m.visible=single?d.failureKey===selectedKey:(!sealsOnly||d.role==='seal');
      const mat=materials.get(m);m.material.opacity=d.role==='seal'?mat.opacity:opacity*mat.opacity;m.material.transparent=mat.transparent||m.material.opacity<1;m.material.depthWrite=m.material.opacity>=.35;
    }
    $('explode-value').textContent=Math.round(exploded*100)+'%';$('opacity-value').textContent=Math.round(opacity*100)+'%';dirty=true;
  }
  function fit(){
    if(!renderer)return;group.position.set(0,0,0);pivot.position.set(0,0,0);scene.updateMatrixWorld(true);
    const box=new T.Box3();parts.filter(m=>m.visible).forEach(m=>box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)));
    if(box.isEmpty())return;
    pivot.position.copy(box.getCenter(new T.Vector3())).negate();scene.updateMatrixWorld(true);
    const centered=new T.Box3();parts.filter(m=>m.visible).forEach(m=>centered.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)));
    const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2));distance=Math.max(.8,centered.max.z+Math.max(Math.max(Math.abs(centered.min.y),Math.abs(centered.max.y))/tan,Math.max(Math.abs(centered.min.x),Math.abs(centered.max.x))/(tan*camera.aspect))*1.18);
    camera.position.set(0,0,distance);camera.lookAt(0,0,0);dirty=true;
  }
  function save(){
    try{localStorage.setItem('tch-seal-'+system+'-v1',JSON.stringify({key:selectedKey,exploded,opacity}));}catch{}
  }
  allParts.addEventListener('change',()=>choose(parts.find(m=>m.userData.id===allParts.value)));
  let saved;try{saved=JSON.parse(localStorage.getItem('tch-seal-'+system+'-v1'));}catch{}
  if(saved){if(config.keys.includes(saved.key))selectedKey=saved.key;if(Number.isFinite(saved.exploded))exploded=T.MathUtils.clamp(saved.exploded,0,1);if(Number.isFinite(saved.opacity))opacity=T.MathUtils.clamp(saved.opacity,.08,1);}
  $('explode').value=Math.round(exploded*100);$('opacity').value=Math.round(opacity*100);
  choose(representatives.get(selectedKey));
  try{
    renderer=new T.WebGLRenderer({canvas:$('model'),antialias:true,alpha:true,preserveDrawingBuffer:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  }catch(error){$('model-status').textContent='当前浏览器未能开启三维显示；部位说明和失效对照仍可查看。';$('markers').hidden=true;return;}
  scene=new T.Scene();camera=new T.PerspectiveCamera(35,1,.02,300);pivot=new T.Group();scene.add(pivot);pivot.add(group);
  scene.add(new T.HemisphereLight(0xffffff,0x596e79,1.05));
  for(const [position,color,intensity] of [[[6,9,12],0xffffff,1.5],[[-8,2,3],0xdbefff,.85],[[0,6,-8],0xffffff,.8]]){const l=new T.DirectionalLight(color,intensity);l.position.set(...position);scene.add(l);}
  const initialQ=new T.Quaternion().setFromEuler(new T.Euler(...config.rotation));pivot.quaternion.copy(initialQ);
  const stage=$('stage');
  function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fit();}
  new ResizeObserver(resize).observe(stage);layout();resize();
  const turn=(dx,dy)=>{pivot.quaternion.premultiply(new T.Quaternion().setFromEuler(new T.Euler(dy,dx,0)));dirty=true;};
  const zoom=factor=>{distance=T.MathUtils.clamp(distance*factor,.8,180);camera.position.z=distance;dirty=true;};
  $('zoom-in').addEventListener('click',()=>zoom(.83));$('zoom-out').addEventListener('click',()=>zoom(1.2));
  $('reset').addEventListener('click',()=>{pivot.quaternion.copy(initialQ);fit();});
  $('explode').addEventListener('input',e=>{exploded=+e.target.value/100;layout();fit();});$('explode').addEventListener('change',save);
  $('opacity').addEventListener('input',e=>{opacity=+e.target.value/100;layout();});$('opacity').addEventListener('change',save);
  $('seals-only').addEventListener('click',e=>{sealsOnly=!sealsOnly;e.currentTarget.setAttribute('aria-pressed',String(sealsOnly));layout();fit();});
  $('single').addEventListener('click',e=>{single=!single;e.currentTarget.setAttribute('aria-pressed',String(single));layout();fit();});
  $('rotate').addEventListener('click',e=>{auto=!auto;e.currentTarget.setAttribute('aria-pressed',String(auto));dirty=true;});
  $('model').addEventListener('keydown',e=>{const keys={ArrowLeft:()=>turn(-.15,0),ArrowRight:()=>turn(.15,0),ArrowUp:()=>turn(0,-.15),ArrowDown:()=>turn(0,.15),'+':()=>zoom(.85),'=':()=>zoom(.85),'-':()=>zoom(1.18),'0':()=>{pivot.quaternion.copy(initialQ);fit();}};if(keys[e.key]){e.preventDefault();keys[e.key]();}});
  const pointers=new Map();let travel=0,down=null;
  $('model').addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);$('model').setPointerCapture(e.pointerId);if(pointers.size===1){travel=0;down=[e.clientX,e.clientY];}else travel=100;});
  $('model').addEventListener('pointermove',e=>{const before=pointers.get(e.pointerId);if(!before)return;
    const after=[e.clientX,e.clientY];travel+=Math.hypot(after[0]-before[0],after[1]-before[1]);
    if(pointers.size===1)turn((after[0]-before[0])*.008,(after[1]-before[1])*.008);
    else{const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];if(other){const a=Math.hypot(before[0]-other[0],before[1]-other[1]),b=Math.hypot(after[0]-other[0],after[1]-other[1]);if(a>3&&b>3)zoom(a/b);}}
    pointers.set(e.pointerId,after);
  });
  const ray=new T.Raycaster(),mouse=new T.Vector2();
  function pointerEnd(e){if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(e.type==='pointerup'&&travel<6&&down){const r=$('model').getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(parts.filter(m=>m.visible));const hit=(opacity<.4?hits.find(h=>h.object.userData.role==='seal'):null)||hits[0];if(hit)choose(hit.object);}down=null;}
  for(const type of ['pointerup','pointercancel','lostpointercapture'])$('model').addEventListener(type,pointerEnd);
  $('model').addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
  let lastTime=0;
  function draw(time){
    requestAnimationFrame(draw);if(document.hidden)return;
    if(auto){turn(Math.min(50,time-(lastTime||time))*.00018,0);}lastTime=time;
    if(!dirty)return;scene.updateMatrixWorld(true);renderer.render(scene,camera);
    const r=stage.getBoundingClientRect(),occupied=[];
    for(const [key,button] of markers){const mesh=representatives.get(key);button.hidden=single&&key!==selectedKey;if(button.hidden)continue;
      const point=mesh.localToWorld(mesh.geometry.boundingSphere.center.clone()).project(camera);let x=(point.x+1)*r.width/2,y=(1-point.y)*r.height/2;
      if(point.z>1||point.z< -1||x<12||x>r.width-12||y<12||y>r.height-32){button.hidden=true;continue;}
      for(const p of occupied)if(Math.hypot(x-p.x,y-p.y)<33)y=p.y+34;
      y=Math.min(r.height-35,Math.max(16,y));occupied.push({x,y});button.style.left=x+'px';button.style.top=y+'px';
    }
    dirty=false;
  }
  $('model-status').textContent='参数化结构示意 · 编号对应右侧密封部位';
  requestAnimationFrame(draw);
  window.__systemViewer={parts,assemblies:model.assemblies,scene,camera,pivot,renderer,choose,get state(){return {system,key:selectedKey,exploded,opacity,sealsOnly,single,distance};}};
})();
