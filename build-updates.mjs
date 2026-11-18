import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const read = name => fs.readFileSync(path.join('src', name), 'utf8');
const legacy = name => gunzipSync(Buffer.from(read(name + '.gz.b64').trim(), 'base64')).toString();
const three = legacy('three');
const inline = text => text.replace(/<!-- INLINE:([\w.-]+) -->/g, (_, name) => {
  const tag = name.endsWith('.css') ? 'style' : 'script';
  return `<${tag}>\n${name === 'three.min.js' ? three : read(name)}\n</${tag}>`;
});
fs.mkdirSync('dist/thermal', {recursive:true});
fs.writeFileSync('dist/index.html', legacy('motorcycle'));
fs.writeFileSync('dist/thermal/index.html', legacy('thermal'));
for (const [system,title,english] of [['transmission','汽车变速器','AUTOMOTIVE TRANSMISSION'],['chassis','汽车底盘','AUTOMOTIVE CHASSIS']]) {
  const directory = path.join('dist',system);
  fs.mkdirSync(directory,{recursive:true});
  const template = read('system-page.html').replaceAll('__TITLE__',title).replaceAll('__SYSTEM__',system).replaceAll('__ENGLISH__',english);
  const reference = fs.readFileSync(path.join('src','reference-'+system+'.jpg'));
  const online = inline(template.replace('__REFERENCE__','./reference.jpg'));
  let offline = inline(template.replace('__REFERENCE__','data:image/jpeg;base64,'+reference.toString('base64')));
  // Module links remain usable when the standalone file is opened from disk.
  for (const [rel,url] of [['../',''],['../thermal/','thermal/'],['../transmission/','transmission/'],['../chassis/','chassis/']]) {
    offline = offline.replaceAll(`href="${rel}"`,`href="https://alexwu1995.github.io/tch-engine-seal-viewer/${url}"`);
  }
  offline = offline.replace(/<a id="download"[^>]*>[^<]*<\/a>/,'<span>离线文件 · 原厂来源链接需联网</span>');
  fs.writeFileSync(path.join(directory,'index.html'),online);
  fs.writeFileSync(path.join(directory,'offline.html'),offline);
  fs.writeFileSync(path.join(directory,'reference.jpg'),reference);
}
console.log('Updated motorcycle and thermal pages; built transmission and chassis viewers with offline editions.');
