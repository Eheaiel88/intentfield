// Owner-run import. The private curriculum stays outside the public repository.
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(process.argv[2]||'..');
const course=JSON.parse(readFileSync(resolve(root,'versions/v2.1-source-integrated/deliverables/source/product-config.json'),'utf8'));
const book=JSON.parse(readFileSync(resolve(root,'launch-preview/content/book.json'),'utf8'));
const {audioScripts}=await import(pathToFileURL(resolve(root,'launch-preview/content/audio.js')));
const body=x=>({title:'',summary:'',paragraphs:[],steps:[],action:'',reflection:'',am:'',pm:'',sources:[],fields:[],...x});
const items=[...course.days.map(d=>({key:`lesson/${d.day}`,sku:'course',body:body({title:d.title,summary:d.inner,paragraphs:d.teaching,steps:d.steps,action:d.action,reflection:d.reflection,am:d.am,pm:d.pm,sources:d.sourceLocators})})),...course.tools.map(t=>({key:`tool/${t.id}`,sku:'course',body:body({title:t.title,summary:t.purpose,steps:t.steps,fields:t.fields,sources:t.sourceLocators})})),{key:'profile',sku:'course',body:body({title:'My self-image',fields:course.domains.flatMap(d=>d.questions.map((label,i)=>({id:`${d.id}-${i}`,label,placeholder:d.name})))})},{key:'book',sku:'book',body:body({title:book.title,summary:book.status,paragraphs:[...book.opening,book.teachingTitle,...book.teaching],fields:book.fields,steps:book.checklist,sources:[book.sourceNote]})},...['morning','evening'].map(mode=>({key:`audio/${mode}`,sku:'audio',body:body({title:mode==='morning'?'Make room for the life you want.':'Receive the day as it was.',summary:'Day 1 pilot script',paragraphs:audioScripts[mode]})}))];
for(let i=0;i<items.length;i+=10){const result=execFileSync('npx',['convex','run','content:seed',JSON.stringify({items:items.slice(i,i+10)})],{encoding:'utf8'});process.stdout.write(result);}
