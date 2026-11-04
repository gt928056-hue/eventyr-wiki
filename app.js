
(function(){
'use strict';
var D=window.EV, app=document.getElementById('app');
var EL={storm:'#7fd4ff',fire:'#ff7a3d',void:'#9d6bff',shadow:'#8d8aa8',holy:'#ffe28a',earth:'#c09060',water:'#4aa8ff',arcane:'#d07bff',nature:'#6fd46f',frost:'#bdf0ff',blood:'#e0354d',none:'#8a8494','?':'#a3122a'};
var RAR=['common','uncommon','rare','epic','legendary','boss','mythic','secret'];
var STAGES=['Early game','Mid game','Late game','End game'];
var ERAS=['Flint','Copper','Iron','Amethyst','Deepsteel','Hellforged','Abyssal','Voidsteel','Starforged'];
function stage(t){t=t||0;return t<=2?STAGES[0]:t<=4?STAGES[1]:t<=6?STAGES[2]:STAGES[3];}
function era(t){return ERAS[t]||ERAS[ERAS.length-1];}
var NAV=[['start','Home'],['guide','Start here'],['next','What now?'],['top','Leaderboard'],['map','Map'],['weapons','Weapons'],['armor','Armor'],['tools','Tools'],['materials','Materials'],['creatures','Monsters'],['bosses','Bosses'],['worldbosses','Big bosses'],['structures','Places'],['systems','How it works'],['mythics','Super weapons']];
var BY={};
['items','mats','ores','sets','mobs','bosses','wbosses','structs','systems'].forEach(function(k){D[k].forEach(function(e){BY[e.r]=e;});});
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1);}
function ic(i,size,extra){if(!i)return '';var st='background-image:url('+i.src+');'+(size?'--s:'+size+'px;':'');var cls='ic'+(i.n?' anim':'');if(i.n)st+='--n:'+i.n+';--d:'+i.d+'s;';return '<span class="'+cls+(extra?' '+extra:'')+'" style="'+st+'" role="img"></span>';}
function rchip(r){return '<span class="chip r r-'+r+'">'+cap(r)+'</span>';}
function echip(e){if(!e||e==='none'||e==='?')return '';return '<span class="chip" style="--e:'+(EL[e]||'#999')+'"><span class="dot"></span>'+cap(e)+'</span>';}
function lk(x){if(!x)return '';var inner=(x.i?ic(x.i,28):'')+esc(x.n);return x.r?'<a class="lk" href="#'+x.r+'">'+inner+'</a>':'<span class="lk nolink">'+inner+'</span>';}
function copyBtn(key,label){return '<button class="btn sm" data-copy="'+esc(key)+'">'+(label||'Copy for AI')+'</button>';}
function img(src,cls,alt){return src?'<img loading="lazy" class="'+(cls||'')+'" src="'+src+'" alt="'+esc(alt||'')+'">':'';}

// ---------- nav
var nav=document.getElementById('nav');
nav.innerHTML=NAV.map(function(n){return '<a href="#'+n[0]+'" data-s="'+n[0]+'">'+n[1]+'</a>';}).join('');
document.getElementById('burger').onclick=function(){document.getElementById('q').focus();};

// ---------- copy
var toast=document.getElementById('toast'),tt;
function showToast(t){toast.textContent=t||'Copied!';toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on');},1800);}
function fallbackCopy(text){var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.top='-1000px';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,text.length);var ok=false;try{ok=document.execCommand('copy');}catch(e){}document.body.removeChild(ta);return ok;}
function copyText(text){
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(function(){showToast('Copied! Paste it into your AI.');},function(){showToast(fallbackCopy(text)?'Copied!':'Copy failed');});}
  else showToast(fallbackCopy(text)?'Copied! Paste it into your AI.':'Copy failed');
}
function mdFor(key){
  if(key==='ALL')return D.all_md+'\n\n'+allTreesMd();
  var m=D.md[key];
  if(!m)return D.all_md;
  if(key.indexOf('/')>0&&key!=='start')m='# Eventyr (Minecraft RPG server) - '+(BY[key]?BY[key].name:key)+'\n(Damage/health are in hearts, cooldowns in seconds.)\n\n'+m;
  if(key.indexOf('item/')===0&&BY[key]&&BY[key].tree)m+='\n'+treeMd(BY[key].id);
  return m;
}
document.addEventListener('click',function(ev){var b=ev.target.closest('[data-copy]');if(b){ev.preventDefault();copyText(mdFor(b.getAttribute('data-copy')));}});
document.getElementById('copyall').onclick=function(){copyText(mdFor('ALL'));};

// ---------- search
var q=document.getElementById('q'),sres=document.getElementById('sres'),sel=0,hits=[];
var SI=D.search.map(function(s){return {n:s[0],t:s[1],e:s[2],r:s[3],route:s[4],img:s[5],h:(s[0]+' '+s[1]+' '+s[2]+' '+s[3]).toLowerCase()};});
var SYN={pick:'pickaxe',picks:'pickaxe',pic:'pickaxe',sword:'sword',swords:'sword',bp:'backpack',bag:'backpack',bags:'backpack',
  boss:'boss',bosses:'boss',mob:'creature',mobs:'creature',monster:'creature',monsters:'creature',enemy:'creature',enemies:'creature',
  place:'structure',places:'structure',profile:'leaderboard',player:'leaderboard',players:'leaderboard',stats:'leaderboard',dungeon:'structure',dungeons:'structure',fish:'fish',fishing:'fishing',gun:'staff',guns:'staff',
  relic:'artifact',relics:'artifact',ring:'ring',rings:'ring',teleport:'waystone',tp:'waystone',armour:'armor',ore:'ore',ores:'ore'};
function lev(a,b){if(Math.abs(a.length-b.length)>2)return 9;var d=[];for(var i=0;i<=a.length;i++){d[i]=[i];}for(var j=1;j<=b.length;j++)d[0][j]=j;
  for(i=1;i<=a.length;i++)for(j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length];}
function searchHits(v,max){
  v=v.trim().split(/\s+/).map(function(w){return SYN[w]||w;}).join(' ');
  var r=searchExact(v,max);if(r.length)return r;
  var words=v.split(/\s+/);
  var h=SI.filter(function(s){var toks=s.h.split(/[^a-z0-9]+/);return words.every(function(w){return w.length<3||toks.some(function(t){return lev(w,t)<=(w.length>5?2:1);});});});
  return h.slice(0,max);
}
function searchExact(v,max){
  var words=v.trim().split(/\s+/);
  var h=SI.filter(function(s){return words.every(function(w){return s.h.indexOf(w)>=0;});});
  h.sort(function(a,b){var an=a.n.toLowerCase().indexOf(v)===0?0:1,bn=b.n.toLowerCase().indexOf(v)===0?0:1;return an-bn||a.n.localeCompare(b.n);});
  return h.slice(0,max);
}
function hitHtml(s,i){var e=BY[s.route];var icon=s.img?ic(e&&e.img?e.img:{src:s.img},32,e&&e.secret?'sil':''):'<span class="ph">'+(s.t==='Boss'||s.t==='World boss'?'&#9760;':s.t==='Structure'?'&#9873;':s.t==='Creature'?'&#9763;':s.t==='Page'?'&#9733;':'&#9670;')+'</span>';
    var rc=RAR.indexOf(s.r)>=0?' style="color:var(--'+s.r+')"':'';
    return '<a href="#'+s.route+'" class="'+(i===0?'act':'')+'">'+icon+'<span'+rc+'>'+esc(s.n)+'</span><span class="m">'+esc(s.t)+(s.e&&s.t!=='Page'?' &middot; '+esc(s.e):'')+'<br>'+esc(s.r)+'</span></a>';}
function doSearch(){
  var v=q.value.trim().toLowerCase();
  if(!v){sres.classList.remove('on');return;}
  hits=searchHits(v,40);sel=0;
  sres.innerHTML=hits.length?hits.map(hitHtml).join('')+'<a href="#search/'+encodeURIComponent(v)+'" style="justify-content:center;color:var(--gold)">See all results</a>':'<div class="empty">Nothing found. Try a shorter word, like "pickaxe" or "boss".</div>';
  sres.classList.add('on');
}
q.addEventListener('input',doSearch);
q.addEventListener('focus',doSearch);
q.addEventListener('keydown',function(e){var as=sres.querySelectorAll('a');if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!as.length)return;as[sel]&&as[sel].classList.remove('act');sel=(sel+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as[sel].classList.add('act');as[sel].scrollIntoView({block:'nearest'});}
  else if(e.key==='Enter'&&as[sel]){location.hash=as[sel].getAttribute('href');close();}else if(e.key==='Escape'){close();}});
function close(){sres.classList.remove('on');q.blur();}
document.addEventListener('click',function(e){if(!e.target.closest('.search'))sres.classList.remove('on');else if(e.target.closest('.sres a')){setTimeout(function(){sres.classList.remove('on');q.value='';},0);}});
document.addEventListener('keydown',function(e){if(e.key==='/'&&document.activeElement!==q&&!/input|select|textarea/i.test(document.activeElement.tagName)){e.preventDefault();q.focus();}});

// ---------- cards
function itemCard(e){
  if(e.secret)return '<a class="card secret r-secret" href="#'+e.r+'">'+ic(e.img,64)+'<div class="nm">Secret: ???</div><div class="meta">'+esc(e.tl)+'</div></a>';
  return '<a class="card r-'+e.rarity+'" href="#'+e.r+'">'+ic(e.img,64)+'<div class="nm">'+esc(e.name)+'</div><div class="meta">'+esc(e.tl)+' &middot; '+stage(e.tier)+'</div><div class="chips">'+rchip(e.rarity)+echip(e.element)+'</div></a>';
}
function setCard(e){return '<a class="card r-'+e.rarity+'" href="#'+e.r+'"><div style="display:flex;gap:2px">'+e.pieces.map(function(p){return ic(p.i,40);}).join('')+'</div><div class="nm">'+esc(e.name)+'</div><div class="meta">Armor set &middot; '+stage(e.tier)+'</div></a>';}
function matCard(e){return '<a class="card r-'+e.rarity+'" href="#'+e.r+'">'+ic(e.img,64)+'<div class="nm">'+esc(e.name)+'</div><div class="meta">Material &middot; '+stage(e.tier)+'</div><div class="chips">'+rchip(e.rarity)+'</div></a>';}
function oreCard(e){return '<a class="card r-'+e.rarity+'" href="#'+e.r+'">'+ic(e.img,64)+'<div class="nm">'+esc(e.name)+'</div><div class="meta">'+esc(cap(e.where))+'</div><div class="chips"><span class="chip">Ore</span></div></a>';}
function mobCard(e){return '<a class="card mobcard" style="--c:'+e.glow+'" href="#'+e.r+'">'+(e.img?img(e.img,'',e.name):'<div style="height:118px;background:#000"></div>')+'<div class="bd"><div class="nm" style="color:var(--txt)">'+esc(e.name)+'</div><div class="meta">'+stage(e.tier)+' &middot; '+cap(e.dim)+(e.gang?' &middot; gang':'')+'</div><div class="chips"><span class="chip">&#10084; '+(e.hp/2)+'</span><span class="chip">&#9876; '+(e.dmg/2)+'</span></div></div></a>';}
function bossCard(e,wb){return '<a class="card bosscard r-mythic" style="'+(wb?'--c:'+e.color:'--c:#ff6a4a')+'" href="#'+e.r+'">'+img(e.img,'',e.name)+'<div class="bd"><div class="nm">'+esc(e.name)+'</div><div class="meta">'+esc(e.title)+'</div><div class="chips"><span class="chip">'+stage(e.tier)+'</span><span class="chip">&#10084; '+(e.hp/2)+'</span>'+(e.arena?'<span class="chip">'+esc(wb?e.arena:e.arena.n)+'</span>':'')+'</div></div></a>';}
function structCard(e){return '<a class="card strcard" style="--c:'+(e.boss?'#ff6a4a':'#f2c25b')+'" href="#'+e.r+'">'+img(e.img,'',e.name)+'<div class="bd"><div class="nm" style="color:var(--txt)">'+esc(e.name)+'</div><div class="meta">'+cap(e.dim)+(e.boss?' &middot; boss arena: '+esc(e.boss.n):'')+(e.quest?' &middot; quest':'')+'</div></div></a>';}

function head(title,sub,copyKey){return '<div class="pagehead"><div><h1>'+title+'</h1>'+(sub?'<p>'+sub+'</p>':'')+'</div>'+(copyKey?copyBtn(copyKey,'Copy this section for AI'):'')+'</div>';}

// ---------- list pages with filters
var state={};
function listPage(key,title,sub,list,cardFn,filters){
  var st=state[key]||(state[key]={});
  var html=head(title,sub,key)+'<div class="filters" id="flt"></div><div class="grid" id="lst"></div>';
  app.innerHTML=html;
  var flt=document.getElementById('flt');
  var fh='<input id="ftxt" type="search" placeholder="Filter by name..." value="'+esc(st.txt||'')+'">';
  filters.forEach(function(f){
    if(f.kind==='btns'){fh+='<span class="fgroup">'+f.opts.map(function(o){var on=(st[f.k]||[]).indexOf(o)>=0;return '<button class="fbtn'+(f.k==='rarity'?' r r-'+o:'')+(on?' on':'')+'" data-f="'+f.k+'" data-v="'+o+'">'+cap(o)+'</button>';}).join(' ')+'</span>';}
    else{fh+='<select data-f="'+f.k+'"><option value="">'+f.label+'</option>'+f.opts.map(function(o){return '<option value="'+esc(o)+'"'+(st[f.k]==o?' selected':'')+'>'+esc(f.fmt?f.fmt(o):cap(o))+'</option>';}).join('')+'</select>';}
  });
  fh+='<span class="count" id="cnt"></span>';
  flt.innerHTML=fh;
  function apply(){
    var t=(st.txt||'').toLowerCase();
    var out=list.filter(function(e){
      if(t&&(e.name+' '+(e.tl||'')).toLowerCase().indexOf(t)<0)return false;
      for(var i=0;i<filters.length;i++){var f=filters[i],v=st[f.k];
        if(f.kind==='btns'){if(v&&v.length&&v.indexOf(String(f.get(e)))<0)return false;}
        else if(v!==undefined&&v!==''&&String(f.get(e))!==String(v))return false;}
      return true;});
    document.getElementById('lst').innerHTML=out.length?out.map(cardFn).join(''):'<div class="empty">No matches. Try clearing a filter.</div>';
    document.getElementById('cnt').textContent=out.length+' of '+list.length;
  }
  flt.addEventListener('input',function(e){if(e.target.id==='ftxt'){st.txt=e.target.value;apply();}});
  flt.addEventListener('change',function(e){var k=e.target.getAttribute('data-f');if(k){st[k]=e.target.value;apply();}});
  flt.addEventListener('click',function(e){var b=e.target.closest('.fbtn');if(!b)return;var k=b.getAttribute('data-f'),v=b.getAttribute('data-v');var a=st[k]||(st[k]=[]);var i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);b.classList.toggle('on');apply();});
  apply();
}
function uniq(list,fn){var s={};list.forEach(function(e){var v=fn(e);if(v!==undefined&&v!==null&&v!=='?')s[v]=1;});return Object.keys(s);}
function rarFilter(list){var have=uniq(list,function(e){return e.rarity;});return {k:'rarity',kind:'btns',opts:RAR.filter(function(r){return have.indexOf(r)>=0;}),get:function(e){return e.rarity;}};}
function itemFilters(list){
  var types=uniq(list,function(e){return e.tl;}).sort();
  var els=uniq(list.filter(function(e){return !e.secret;}),function(e){return e.element;}).sort();
  var tiers=uniq(list.filter(function(e){return !e.secret;}),function(e){return e.tier;}).sort(function(a,b){return a-b;});
  return [rarFilter(list),{k:'type',label:'All types',opts:types,get:function(e){return e.tl;}},{k:'element',label:'All elements',opts:els,get:function(e){return e.element;}},{k:'tier',label:'All stages',opts:STAGES,fmt:function(t){return t;},get:function(e){return e.secret?'':stage(e.tier);}}];
}
function sortItems(a,b){return (a.secret?1:0)-(b.secret?1:0)||(a.tier||0)-(b.tier||0)||RAR.indexOf(a.rarity)-RAR.indexOf(b.rarity)||a.name.localeCompare(b.name);}

// ---------- pages
function pStart(){
  var c=D.counts;
  var T=[['guide','I am new','Show me how to start, step by step','ti-rocket','#7FD4FF'],
    ['next','What should I do now?','Tap your best pickaxe and see your next goal','ti-route','#7ee08f'],
    ['weapons','Find a weapon',c.weapons+' weapons, each with its own moves','ti-sword','#ffb070'],
    ['armor','Get better armor','Armor sets, rings and artifacts','ti-shield','#c6a6f2'],
    ['bosses','Fight a boss','How to call a boss and what it drops','ti-skull','#ff7a6a'],
    ['structures','Find a place to explore','Dungeons, towers and ruins with loot','ti-map-2','#e8c547'],
    ['sys/artifacts','Artifacts','Double jumps, wings, lava walking and more','ti-sparkles','#ffd34d'],
    ['sys/casino','Casino and loot crates','Slot machine, loot crates and the Wandering Gambler','ti-dice','#ff9ad5'],
    ['sys/waystones','Fast travel','Waystones: unlock them and teleport for free','ti-map-pin','#7FE3FF'],
    ['top','Who is the best?','The leaderboard: bosses, fish, Colosseum and more','ti-trophy','#ffd34d'],
    ['map','Where has everyone been?','The world map of every place players have found','ti-map','#7fd4ff'],
    ['sys/commands','Commands','Every command you can type in chat','ti-terminal-2','#9fe9d8']];
  var h='<section class="kid-hero"><h1>Welcome to Eventyr!</h1><p>Minecraft, but as an adventure game: new weapons with special moves, bosses, dungeons, artifacts and loot.</p>'+
    '<button class="kid-search" id="kidsearch"><span>&#128269;</span> Search anything, for example <b>copper pickaxe</b></button></section>';
  h+='<section class="kid-new"><h2 class="kid-h">New this week</h2><ul>'+[
    '<b><a href="#sys/waystones">Waystones</a> are free</b> now, and your team shares up to 9 placed waystones.',
    '<b>Search any material</b>, like <b>diamond</b> or <b>iron ingot</b>, to see everything you can craft with it.',
    '<b>The <a href="#sys/casino">casino</a> got harder</b>: lower slot payouts, and the Wandering Gambler\'s crates cost 80, 200 or 480 emeralds.',
    '<b>Wandering Mage, Gambler and gangs</b> can now show up near anyone, also players mining in caves.',
    '<b>Sea monsters</b>: a Giant Squid that pulls you out of your boat, orcas, sharks, a singing whale and more. Plus new beasts on land, like the Sand Wyrm and the Gravelmaw Behemoth.',
    '<b>10 new places</b> to explore: sky islands, a pirate fort, a desert bazaar, a sunken library, a goblin camp, a clock tower, a train stop and more.',
    '<b>12 new legendary weapons</b>, each with its own huge move. Legendaries are now much stronger than epics.',
    '<b>Super weapons</b> (mythics) hit much harder. Still only one of each on the server.',
    '<b>Drills, chainsaws and gadgets</b>: mine a whole tunnel, grind through enemies, set traps or build a turret.',
    '<b>Boss weapons</b> have their own rarity now. Tiers are gone: an item\'s rarity tells you how strong it is.',
    '<b><a href="#top">Leaderboard</a></b>: see who has beaten the most bosses, caught the most fish and more. Tap a name to see that player\'s own page.',
    '<b><a href="#map">World map</a></b>: every place players have discovered, and who found it first.'].map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></section>';
  h+='<h2 class="kid-h">What do you want to do?</h2><div class="kid-tiles">'+T.map(function(t){return '<a class="kid-tile" href="#'+t[0]+'" style="--k:'+t[4]+'"><b>'+esc(t[1])+'</b><span>'+esc(t[2])+'</span></a>';}).join('')+'</div>';
  h+='<h2 class="kid-h">The buttons</h2><div class="kid-keys">'+[
    ['Left-click','Hit'],['Right-click','Your weapon\'s 1st move'],['Sneak + Right-click','2nd move'],['F','3rd move'],
    ['Sneak + Right-click a crafting table','See every recipe'],['/artifacts','Your artifact slots'],['/wp','Your waypoints'],['/scout','Buy where a place is'],['/stats','Your leaderboard numbers']].map(function(k){return '<div><span class="key">'+esc(k[0])+'</span><span>'+esc(k[1])+'</span></div>';}).join('')+'</div>';
  h+='<h2 class="kid-h">Your first 5 minutes</h2><ol class="kid-steps">'+[
    'Punch a tree and get some flint from gravel.',
    'Make a <a href="#item/flintblade">Flintblade</a> (a sword) and a <a href="#item/flint_pickaxe">Flint Pickaxe</a>. Sneak + right-click a crafting table to see how.',
    'Open the Leather Satchel you got (right-click it). That is your backpack.',
    'Mine copper, then iron. Every new pickaxe can mine the next ore.',
    'Stuck? Tap <a href="#next">What should I do now?</a> at the top.'].map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>';
  h+='<p class="kid-note">This game has '+c.items+' items, '+(c.bosses+c.wbosses)+' bosses and '+c.structs+' places. You do not need to read it all: search for what you need.</p>';
  app.innerHTML=h;
  document.getElementById('kidsearch').onclick=function(){window.scrollTo(0,0);q.focus();};
}

// ---------- what should I do now?
function pNext(parts){
  var P=[['flint_pickaxe','Flint'],['copper_pickaxe','Copper'],['iron_pickaxe','Iron'],['amethyst_pickaxe','Amethyst'],['deepsteel_pickaxe','Deepsteel'],['hellforged_pickaxe','Hellforged'],['abyssal_pickaxe','Abyssal'],['voidsteel_pickaxe','Voidsteel'],['starforged_pickaxe','Starforged']];
  var pick=parts[1]!=null?+parts[1]:-1;
  var h='<div class="pagehead"><div><h1>What should I do now?</h1><p>Tap the best pickaxe you have. You will see exactly what to do next.</p></div></div>';
  h+='<div class="kid-picks">'+P.map(function(p,i){var e=BY['item/'+p[0]];return '<a class="kid-pick'+(i===pick?' on':'')+'" href="#next/'+i+'">'+(e?ic(e.img,48):'')+'<b>'+p[1]+'</b></a>';}).join('')+
    '<a class="kid-pick'+(pick===-2?' on':'')+'" href="#next/none"><span style="font-size:30px">&#9995;</span><b>No pickaxe yet</b></a></div>';
  var G=D.guide||[];
  function sec(title){for(var i=0;i<G.length;i++)if(G[i].h.indexOf(title)===0)return G[i];return null;}
  var g=null,lead='';
  if(parts[1]==='none'){g=sec('Your first 30 minutes');lead='Start here: make your first tools.';}
  else if(pick>=0&&pick<8){g=sec('Step '+(pick+1)+': '+P[pick+1][1]);lead='Your next goal: '+P[pick+1][1]+' gear.';}
  else if(pick===8){g=sec('Preparing for the Starwarden');lead='You have the best pickaxe! Time for the final boss and the mythics.';}
  if(g)h+='<div class="kid-goal"><h2>'+esc(lead)+'</h2><ol class="tips">'+g.steps.map(function(x){return '<li>'+linkify(x)+'</li>';}).join('')+'</ol></div>';
  else h+='<p class="kid-note">Pick one above to see your next goal.</p>';
  app.innerHTML=h;
}
function pWeapons(){var l=D.items.filter(function(e){return e.cat==='weapons';}).sort(sortItems);listPage('weapons','Weapons','Every weapon and what its moves do. Tap one to see its moves in plain words. Secret weapons stay hidden until someone finds them.',l,itemCard,itemFilters(l));}
function pArmor(){
  var l=D.items.filter(function(e){return e.cat==='armor';}).sort(sortItems);
  listPage('armor','Armor and Sets','Wear all four pieces of a set for its bonus. Accessories work from your off-hand.',l,itemCard,itemFilters(l));
  var sets=D.sets.slice().sort(function(a,b){return a.tier-b.tier;});
  document.getElementById('flt').insertAdjacentHTML('beforebegin','<h2>Armor sets</h2><div class="grid">'+sets.map(setCard).join('')+'</div><h2>All armor and accessories</h2>');
}
function pTools(){var l=D.items.filter(function(e){return e.cat==='tools';}).sort(sortItems);listPage('tools','Tools','Pickaxes, drills, axes, shovels and hoes, plus consumables and the items that summon bosses.',l,itemCard,itemFilters(l));}
function pMaterials(){
  var l=D.mats.slice().sort(function(a,b){return a.tier-b.tier||a.name.localeCompare(b.name);});
  listPage('materials','Materials and Ores','What drops from creatures and chests, and what it crafts.',l,matCard,[rarFilter(l),{k:'tier',label:'All stages',opts:STAGES,fmt:function(t){return t;},get:function(e){return stage(e.tier);}}]);
  document.getElementById('flt').insertAdjacentHTML('beforebegin','<h2>Ores</h2><div class="grid">'+D.ores.map(oreCard).join('')+'</div><p class="note">Ores generate in every chunk and never release silverfish. <a href="#sys/ores">Which pickaxe do I need?</a></p><h2>Materials</h2>');
}
function pCreatures(){
  var l=D.mobs.slice().sort(function(a,b){return a.tier-b.tier||a.name.localeCompare(b.name);});
  listPage('creatures','Creatures','Eventyr\'s monsters, where they live and what they drop.',l,mobCard,[{k:'dim',kind:'btns',opts:['overworld','nether','end'],get:function(e){return e.dim;}},{k:'tier',label:'All stages',opts:STAGES,fmt:function(t){return t;},get:function(e){return stage(e.tier);}}]);
  document.getElementById('lst').className='grid wide';
}
function pBosses(){
  var l=D.bosses.slice().sort(function(a,b){return a.tier-b.tier;});
  app.innerHTML=head('Bosses','Craft a summon item, travel to the boss arena and use it on the altar. Stronger bosses live further from spawn.','bosses')+(D.renders.bosses_all?'<div class="banner">'+img(D.renders.bosses_all,'','All bosses')+'</div>':'')+'<h2>All bosses</h2><div class="grid wide">'+l.map(function(e){return bossCard(e,false);}).join('')+'</div>';
}
function pWB(){
  app.innerHTML=head('World Bosses',esc(D.wb_intro),'worldbosses')+'<div class="grid wide" style="margin-top:20px">'+D.wbosses.map(function(e){return bossCard(e,true);}).join('')+'</div>';
}
function pStructs(){
  var l=D.structs;
  listPage('structures','Places','Ruins, crypts, towers and boss arenas. Each has its own creatures and chest loot. Tap one to see what is inside and how to find it.',l,structCard,[{k:'dim',kind:'btns',opts:['overworld','nether','end'],get:function(e){return e.dim;}},{k:'kind',label:'All kinds',opts:['Boss arena','Quest lectern','Other'],fmt:function(x){return x;},get:function(e){return e.boss?'Boss arena':e.quest?'Quest lectern':'Other';}}]);
  document.getElementById('lst').className='grid wide';
  document.getElementById('flt').insertAdjacentHTML('beforebegin','<div class="maplink"><span>Want to know where places are? The <b>World map</b> shows every place players have already found.</span><a class="btn sm gold" href="#map">Open the map</a></div>');
}
function pSystems(){
  var ICON={keys:'&#9000;',skull:'&#9760;',pick:'&#9935;',bag:'&#128188;',fish:'&#127907;',pot:'&#127858;',paw:'&#128062;',star:'&#10022;',sword:'&#9876;',crown:'&#9813;',gem:'&#9670;',scroll:'&#128220;',book:'&#128214;',trophy:'&#127942;'};
  app.innerHTML=head('Systems','How the game works: everything beyond weapons and monsters.','systems')+'<div class="tiles" style="margin-top:20px">'+D.systems.map(function(s){return '<a class="tile" href="#'+s.r+'" style="min-height:150px"><span style="font-size:30px;position:absolute;top:14px;right:16px;z-index:1">'+(ICON[s.ic]||'&#9670;')+'</span><b>'+esc(s.name)+'</b><span>'+esc(s.sum)+'</span></a>';}).join('')+'</div>';
}
function pMythics(){
  var l=D.items.filter(function(e){return e.myth;});
  app.innerHTML=head('Mythics',D.counts.mythics+' weapons that exist only once on the whole server. The first to claim one keeps it until someone kills them for it.','mythics')+
   '<div class="panel" style="margin-top:20px"><h3>The ultimate and the combo</h3><p>'+esc(D.myth_meter)+'</p><p>'+esc(D.myth_combo)+'</p></div>'+
   '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">'+l.map(function(e){return '<a class="card r-mythic" href="#'+e.r+'">'+ic(e.img,96)+'<div class="nm">'+esc(e.name)+'</div><div class="meta">'+esc(e.myth?e.myth.epithet:'')+'</div><div class="chips">'+'<span class="chip">'+esc(e.tl)+'</span>'+echip(e.element)+'</div></a>';}).join('')+'</div>'+
   '<h2>The rules of mythics</h2><div class="grid wide">'+D.myth_rules.map(function(r){return '<div class="panel" style="margin:0"><h3>'+esc(r.h)+'</h3><p style="margin:0;color:#d2cadb">'+esc(r.text)+'</p></div>';}).join('')+'</div>';
}

function crumbs(sec,label){var n=NAV.filter(function(x){return x[0]===sec;})[0];return '<div class="crumbs"><a href="#start">Start</a> / <a href="#'+sec+'">'+(n?n[1]:sec)+'</a> / '+esc(label)+'</div>';}
function movesHtml(ab){return '<div class="moves">'+ab.map(function(m){var pas=/^Passive|^On |^When/.test(m.t);return '<div class="move"><span class="key'+(pas?' pas':'')+'">'+esc(m.t)+'</span><div><b>'+esc(m.name)+(m.sig?'<span class="sig">signature</span>':'')+'</b><p>'+esc(m.text)+'</p></div>'+(m.cd?'<span class="cd">&#8635; '+m.cd+' s</span>':'<span></span>')+'</div>';}).join('')+'</div>';}
function recipeHtml(rec){
  if(!rec)return '';
  var g='<div class="cg">';
  for(var y=0;y<3;y++)for(var x=0;x<3;x++){var row=rec.grid[y]||[],c=row[x];
    if(!c){g+='<div class="cell"></div>';continue;}
    var inner=c.i?ic(c.i,44):esc(c.n);
    g+='<div class="cell" title="'+esc(c.n)+'">'+(c.r?'<a href="#'+c.r+'">'+inner+'</a>':inner)+'</div>';}
  g+='</div>';
  return '<div class="recipe">'+g+'<div class="legend">'+rec.legend.map(function(l){return l.r?'<a href="#'+l.r+'">'+esc(l.n)+'</a>':'<span>'+esc(l.n)+'</span>';}).join('')+'</div></div>';
}
function shortBox(rows,title){return '<div class="panel kid-short"><h3>'+(title||'In short')+'</h3>'+rows.filter(function(x){return x&&x[1];}).map(function(x){return '<p><b>'+x[0]+'</b> '+x[1]+'</p>';}).join('')+'</div>';}
function tl(x){return x&&x.r?'<a href="#'+x.r+'">'+esc(x.n)+'</a>':esc(x&&x.n);}
function names3(list){var l=list.slice(0,3).map(function(x){return x.r?'<a href="#'+x.r+'">'+esc(x.n)+'</a>':esc(x.n);});return l.length?l.join(', ')+(list.length>3?' and more':''):'';}
function inShort(e){
  var what={sword:'sword',greatsword:'big sword',dagger:'dagger',axe:'axe',spear:'spear',scythe:'scythe',hammer:'hammer',mace:'mace',gauntlet:'fist weapon',whip:'whip',
    bow:'bow',crossbow:'crossbow',staff:'magic staff',wand:'magic wand',tome:'spell book',throwing:'throwing weapon',pickaxe:'pickaxe',drill:'drill',shovel:'shovel',hoe:'hoe',
    woodaxe:'wood axe',helmet:'helmet',chestplate:'chestplate',leggings:'leggings',boots:'boots',accessory:'accessory (wear it in an artifact slot)',
    artifact:'artifact (wear it in an artifact slot)',consumable:'item you use',summon:'boss summon item'}[e.type]||e.tl.toLowerCase();
  var lines=[];
  lines.push('<b>What is it?</b> A '+esc(e.rarity)+' '+esc(what)+'.');
  var g=e.src&&e.src[0];
  lines.push('<b>How do I get it?</b> '+(g?(g.k==='craft'?'Craft it. The recipe is below.':esc(g.text).replace(/\.$/,'')+'.'):'Nobody knows yet.'));
  if(e.ab&&e.ab.length)lines.push('<b>What can it do?</b> It has '+e.ab.length+' special move'+(e.ab.length>1?'s':'')+', shown below.');
  else if(e.type==='artifact'&&e.lore)lines.push('<b>What can it do?</b> '+esc(e.lore));
  else lines.push('<b>What can it do?</b> It makes you stronger with its stats.');
  return '<div class="panel kid-short"><h3>In short</h3>'+lines.map(function(x){return '<p>'+x+'</p>';}).join('')+'</div>';
}
function pItem(e){
  var sec=e.myth?'mythics':e.cat;
  if(e.secret){
    app.innerHTML=crumbs(sec,'Secret')+'<div class="detail"><div class="showcase r-secret" style="--c:var(--secret)">'+ic(e.img,192,'')+'<h1 class="px">Secret: ???</h1><div class="chips"><span class="chip">'+esc(e.tl)+'</span>'+rchip('secret')+'</div></div><div><div class="panel"><h3>A secret weapon</h3><p>Nobody knows what this is until someone finds it in play. It is never crafted and never sold. Keep your eyes open: the world rewards people who try strange things.</p></div><div class="panel"><h3>Copy for AI</h3>'+copyBtn(e.r)+'</div></div></div>';
    var s=app.querySelector('.showcase .ic');if(s)s.style.filter='brightness(0) drop-shadow(0 0 14px #a3122a)';
    return;
  }
  var h=crumbs(sec,e.name)+'<div class="detail"><div class="showcase r-'+e.rarity+'">'+ic(e.img,192)+'<h1>'+esc(e.name)+'</h1><div class="chips">'+rchip(e.rarity)+'<span class="chip">'+esc(e.tl)+'</span><span class="chip">'+stage(e.tier)+'</span>'+echip(e.element)+'</div>'+
    (e.lore?'<p class="lore">&ldquo;'+esc(e.lore)+'&rdquo;</p>':'')+
    '<div class="pow">How strong: '+e.rarity+'<div class="bar"><i style="width:'+e.pow+'%"></i></div></div>'+
    (e.credit?'<p class="note" style="margin-top:14px">Idea by '+esc(e.credit)+'. Thanks!</p>':'')+
    '</div><div>'+inShort(e);
  if(e.myth){
    h+='<div class="panel"><h3>'+esc(e.myth.epithet)+'</h3><p style="margin:0 0 6px">'+esc(e.myth.playstyle)+'</p>'+(e.myth.whisper?'<p class="note">When claimed: &ldquo;'+esc(e.myth.whisper)+'&rdquo;</p>':'')+'</div>';
    h+='<div class="panel"><h3>Mythic moves</h3><div class="moves">'+e.myth.moves.map(function(m){var pas=/Passive|Awakening/.test(m.t);return '<div class="move"><span class="key'+(m.ult?' ult':pas?' pas':'')+'">'+esc(m.t)+'</span><div><b>'+esc(m.name)+'</b><p>'+esc(m.text)+'</p>'+(m.mech?'<div class="mech">'+esc(m.mech)+'</div>':'')+'</div><span></span></div>';}).join('')+'</div></div>';
    if(e.ab.length)h+='<div class="panel"><h3>Ability details and cooldowns</h3>'+movesHtml(e.ab)+'</div>';
    h+='<div class="panel"><h3>Only one exists</h3><p style="margin:0">There is exactly one '+esc(e.name)+' on the server. <a href="#sys/mythic_rules">Read the mythic rules</a>.</p><p style="margin:8px 0 0">Held by: <b class="holder" data-m="'+esc(e.id)+'">checking...</b></p></div>';
  }else{
    h+='<div class="panel"><h3>What it does</h3>'+(e.type==='artifact'&&e.lore?'<p style="margin:0 0 8px;font-size:16px">'+esc(e.lore)+'</p>':'')+(e.ab.length?movesHtml(e.ab):(e.type==='artifact'?'':'<p style="margin:0;color:var(--mut)">No special moves: it is all about its stats.</p>'))+'</div>';
  }
  if(e.stats.length)h+='<div class="panel"><h3>Stats</h3><div class="stats">'+e.stats.map(function(s){return '<div class="stat"><span>'+esc(s.k)+'</span><b>'+esc(s.v)+'</b></div>';}).join('')+'</div></div>';
  if(e.set)h+='<div class="panel"><h3>Set bonus</h3><p style="margin:0">Part of <a href="#'+e.set.r+'">'+esc(e.set.n)+'</a>. Wear all pieces: '+esc(e.set.b)+'</p></div>';
  h+='<div class="panel"><h3>Where to get it</h3>'+(e.src.length?'<ul class="src">'+e.src.map(function(s){return '<li><span class="k">'+s.k+'</span><span>'+(s.r?'<a href="#'+s.r+'">'+esc(s.text)+'</a>':esc(s.text))+'</span></li>';}).join('')+'</ul>':'<p>Unknown.</p>')+(e.rec?'<div style="margin-top:14px">'+recipeHtml(e.rec)+'</div>':'')+'</div>';
  h+=usedHtml(e.used);
  h+='</div></div>';
  if(e.tree)h+='<div class="treefull">'+treeHtml(e.id)+'</div>';
  app.innerHTML=h;
}
function pSet(e){
  app.innerHTML=crumbs('armor',e.name)+'<div class="pagehead"><div><h1 style="color:var(--'+e.rarity+')">'+esc(e.name)+'</h1><p>Armor set &middot; '+stage(e.tier)+'</p></div>'+copyBtn(e.r)+'</div>'+
    shortBox([['What is it?','A set of '+e.pieces.length+' armor pieces for the '+stage(e.tier).toLowerCase()+'.'],['How do I get it?','Get every piece. Tap a piece below to see how to get it.'],['Why wear the full set?',esc(e.bonus)||'Each piece protects you.']])+
    '<div class="grid">'+e.pieces.map(function(p){var it=BY[p.r];return it?itemCard(it):'';}).join('')+'</div>'+
    '<div class="panel" style="margin-top:18px"><h3>Full set bonus</h3><p>'+esc(e.bonus)+'</p>'+(e.ab.length?movesHtml(e.ab):'')+'</div>';
}
function pMat(e){
  var s0=(T.src[e.id]||[])[0];
  var sb=shortBox([['What is it?','A '+esc(e.rarity)+' crafting material for the '+stage(e.tier).toLowerCase()+'.'],
    ['How do I get it?',s0?(s0[2]?'<a href="#'+s0[2]+'">'+esc(s0[1])+'</a>':esc(s0[1]))+((T.src[e.id]||[]).length>1?'. More places are listed below.':'.'):esc(e.src)||'See below.'],
    ['What is it for?',e.used.length?'You craft '+names3(e.used)+' with it.':'It is not used in any recipe yet.']]);
  app.innerHTML=crumbs('materials',e.name)+'<div class="detail"><div class="showcase r-'+e.rarity+'">'+ic(e.img,192)+'<h1>'+esc(e.name)+'</h1><div class="chips">'+rchip(e.rarity)+'<span class="chip">Material</span><span class="chip">'+stage(e.tier)+'</span></div><p class="lore">'+esc(e.desc)+'</p><div style="margin-top:16px">'+copyBtn(e.r)+'</div></div><div>'+sb+
    '<div class="panel"><h3>Where to get it</h3>'+((T.src[e.id]||[]).length?'<ul class="src">'+srcRows(e.id,12)+'</ul>':'<p style="margin:0">'+esc(e.src)+'</p>')+'</div>'+
    usedHtml(e.used)+'</div></div>';
}
function pOre(e){
  app.innerHTML=crumbs('materials',e.name)+'<div class="detail"><div class="showcase r-'+e.rarity+'">'+ic(e.img,192)+'<h1>'+esc(e.name)+'</h1><div class="chips">'+rchip(e.rarity)+'<span class="chip">Ore</span></div><div style="margin-top:16px">'+copyBtn(e.r)+'</div></div><div>'+
    shortBox([['What is it?','A new ore block. Mining it gives '+tl(e.drop)+'.'],['Where is it?','Underground in '+esc(e.where)+'.'],['What do I need?','A '+(e.picks[0]?tl({r:e.picks[0].r,n:e.picks[0].n}):'strong pickaxe')+' or anything stronger.']])+
    '<div class="panel"><h3>Where and how</h3><p style="margin:0">Generates in <b>'+esc(e.where)+'</b>. Mine it with one of the pickaxes below, or a stronger one. It drops '+lk(e.drop)+' and never releases silverfish.</p></div>'+
    '<div class="panel"><h3>Pickaxes that can mine it</h3><div class="links">'+e.picks.map(function(p){return lk({r:p.r,n:p.n,i:p.i});}).join('')+'</div></div></div></div>';
}
function dropsHtml(d){return d.length?'<div class="links">'+d.map(function(x){return lk({r:x.r,i:x.i,n:x.n+(x.q&&x.q!=='1'?' x'+x.q:'')+(x.c?' ('+x.c+')':'')});}).join('')+'</div>':'<p style="color:var(--mut);margin:0">Nothing special.</p>';}
function pMob(e){
  var sb=shortBox([['What is it?','A monster for the '+stage(e.tier).toLowerCase()+'. It has '+(e.hp/2)+' hearts and hits for '+(e.dmg/2)+'.'],
    ['Where do I find it?',cap(e.dim)+(e.biomes.length?': '+esc(e.biomes.slice(0,4).join(', '))+(e.biomes.length>4?' and more':''):'')+(e.structs.length?'. Also inside '+names3(e.structs):'')+'.'],
    ['Why fight it?',e.drops.length?'It can drop '+names3(e.drops)+'.':'It counts for the Monsters defeated board on the <a href="#top">leaderboard</a>.']]);
  app.innerHTML=crumbs('creatures',e.name)+'<div class="pagehead"><div><h1 style="color:'+e.glow+'">'+esc(e.name)+'</h1><p>'+esc(e.desc)+'</p></div>'+copyBtn(e.r)+'</div>'+(e.img?img(e.img,'render',e.name):'')+sb+
    '<div class="two" style="margin-top:16px"><div><div class="panel"><h3>Stats</h3><div class="stats"><div class="stat"><span>Health</span><b>'+(e.hp/2)+' hearts</b></div><div class="stat"><span>Hits for</span><b>'+(e.dmg/2)+' hearts</b></div><div class="stat"><span>Armor</span><b>'+e.armor+'</b></div><div class="stat"><span>Stage</span><b>'+stage(e.tier)+'</b></div></div></div>'+
    '<div class="panel"><h3>Attacks</h3>'+(e.ab.length?'<div class="moves">'+e.ab.map(function(a){return '<div class="move"><span class="key pas">'+esc(a.name)+'</span><div><p>'+esc(a.text)+'</p></div>'+(a.cd?'<span class="cd">every ~'+a.cd+' s</span>':'<span></span>')+'</div>';}).join('')+'</div>':'<p style="margin:0">Just melee.</p>')+'</div></div>'+
    '<div><div class="panel"><h3>Where it lives</h3><p style="margin:0 0 8px">'+cap(e.dim)+(e.biomes.length?': '+esc(e.biomes.join(', ')):'')+'</p>'+(e.structs.length?'<p style="margin:0">Also inside: '+e.structs.map(lk).join(' ')+'</p>':'')+(e.gang?'<p>Part of the gang <a href="#sys/gangs">'+esc(e.gang)+'</a>.</p>':'')+'</div>'+
    '<div class="panel"><h3>Drops</h3>'+dropsHtml(e.drops)+'</div></div></div>';
}
function phasesHtml(ph){return ph.map(function(p,i){return '<div class="phase"><h4>Phase '+(i+1)+': '+esc(p.name)+'<small>from '+p.hp+' health</small></h4><ul>'+p.ab.map(function(a){return '<li><b>'+esc(a.name)+':</b> '+esc(a.text)+(a.tg?' <span class="note">(warning '+a.tg+' s before it lands)</span>':'')+'</li>';}).join('')+'</ul></div>';}).join('');}
function pBoss(e){
  var bl=D.bosses.slice().sort(function(a,b){return a.tier-b.tier;}),nb=bl[bl.indexOf(e)+1];
  var h=crumbs('bosses',e.name)+'<div class="banner">'+img(e.img,'',e.name)+'<div class="cap"><h1>'+esc(e.name)+'</h1><p><b>'+esc(e.title)+'</b>. '+esc(e.desc)+'</p></div></div>'+
   shortBox([['What is it?','A boss for the '+stage(e.tier).toLowerCase()+'. It has '+(e.hp/2)+' hearts and '+e.phases.length+' phase'+(e.phases.length===1?'':'s')+'.'],
     ['How do I fight it?',(e.summon?'Craft the '+tl(e.summon)+'. ':'')+(e.arena?'Find '+tl({r:e.arena.r,n:e.arena.n})+' and use it on the altar in the middle.':'Use the summon item on its altar.')],
     ['What do I get?',e.drops.length?'It can drop '+names3(e.drops)+'.':'Glory.'],
     ['What next?',nb?'Your next boss is '+tl({r:nb.r,n:nb.name})+'.':'This is the last boss. Next: hunt the <a href="#mythics">super weapons</a>.']])+
   '<div style="margin:14px 0">'+copyBtn(e.r,'Copy this boss for AI')+'</div><div class="two"><div>'+
   '<div class="panel"><h3>How to summon</h3><ol class="plain">'+e.how.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol>'+(e.summon?'<div class="links" style="margin-top:10px">'+lk(e.summon)+(e.arena?lk({r:e.arena.r,n:e.arena.n+' ('+e.arena.dim+')'}):'')+'</div>':'')+(e.summon_rec?'<div style="margin-top:14px">'+recipeHtml(e.summon_rec)+'</div>':'')+'</div>'+
   '<div class="panel"><h3>Stats</h3><div class="stats"><div class="stat"><span>Health</span><b>'+(e.hp/2)+' hearts</b></div><div class="stat"><span>Hits for</span><b>'+(e.dmg/2)+' hearts</b></div><div class="stat"><span>Armor</span><b>'+e.armor+'</b></div><div class="stat"><span>Stage</span><b>'+stage(e.tier)+'</b></div></div></div>'+
   '<div class="panel"><h3>Drops</h3>'+dropsHtml(e.drops)+'</div>'+(e.minions.length?'<div class="panel"><h3>Minions</h3><div class="links">'+e.minions.map(lk).join('')+'</div></div>':'')+'</div>'+
   '<div><div class="panel"><h3>The fight</h3>'+phasesHtml(e.phases)+'</div></div></div>';
  app.innerHTML=h;
}
function pWBoss(e){
  app.innerHTML=crumbs('worldbosses',e.name)+'<div class="banner">'+img(e.img,'',e.name)+'<div class="cap"><h1 style="color:'+e.color+'">'+esc(e.name)+'</h1><p><b>'+esc(e.title)+'</b>. '+esc(e.desc)+'</p></div></div>'+
   shortBox([['What is it?','A world boss. You cannot call it: it comes by itself, and the whole server can fight it together.'],
     ['How do I fight it?','Wait for the warning in chat. Then type <b>/worldboss join</b> to go there. Type <b>/worldboss</b> to see when the next one comes.'],
     ['What do I get?',e.drops.length?'Everyone who helped gets rewards, like '+names3(e.drops)+'.':'Everyone who helped gets rewards.']])+
   '<div style="margin:14px 0">'+copyBtn(e.r,'Copy this boss for AI')+'</div><div class="two"><div>'+
   '<div class="panel"><h3>How it comes</h3><p style="margin:0">'+esc(D.wb_intro)+'</p><p>Its arena: <b>'+esc(e.arena)+'</b>.</p></div>'+
   '<div class="panel"><h3>Stats (before scaling)</h3><div class="stats"><div class="stat"><span>Health</span><b>'+(e.hp/2)+' hearts</b></div><div class="stat"><span>Hits for</span><b>'+(e.dmg/2)+' hearts</b></div><div class="stat"><span>Stage</span><b>'+stage(e.tier)+'</b></div><div class="stat"><span>Flies</span><b>'+(e.flying?'Yes':'No')+'</b></div></div></div>'+
   '<div class="panel"><h3>Rewards</h3>'+dropsHtml(e.drops)+'</div>'+(e.minions.length?'<div class="panel"><h3>Minions</h3><div class="links">'+e.minions.map(lk).join('')+'</div></div>':'')+'</div>'+
   '<div><div class="panel"><h3>The fight</h3>'+phasesHtml(e.phases)+'</div></div></div>';
}
function pStruct(e){
  var bio=e.biomes.filter(function(b){return b!=='*'&&b!=='Anywhere';});
  var todo=[];if(e.mobs.length)todo.push('fight its creatures');if(e.loot.length)todo.push('loot its chests');if(e.quest)todo.push('read the lectern to start a quest');if(e.boss)todo.push('call the boss '+esc(e.boss.n)+' on its altar');
  var sb=shortBox([['What is it?',(e.boss?'A boss arena':'A place to explore')+' in the '+esc(e.dim)+'.'],
    ['How do I find it?','Explore '+(bio.length?esc(bio.slice(0,3).join(', ').toLowerCase())+' areas'+(bio.length>3?' and more':''):'anywhere in the '+esc(e.dim))+(e.far?', at least '+e.far+' blocks from spawn':'')+'. Or type <b>/scout</b> in the game and buy its location with emeralds.'],
    ['What do I do there?',todo.length?cap(todo.join(', ').replace(/, ([^,]*)$/,' and $1'))+'.':'Look around: it is mostly for exploring.']]);
  app.innerHTML=crumbs('structures',e.name)+'<div class="banner">'+img(e.img,'',e.name)+'<div class="cap"><h1>'+esc(e.name)+'</h1><p>'+esc(e.desc)+'</p></div></div>'+sb+'<div id="sfound"></div><div style="margin:14px 0">'+copyBtn(e.r)+'</div><div class="two"><div>'+
   '<div class="panel"><h3>Where to find it</h3><p style="margin:0">'+cap(e.dim)+(e.biomes.length?': '+esc(e.biomes.join(', ')):'')+'.'+(e.far?' At least '+e.far+' blocks from spawn.':'')+'</p></div>'+
   (e.boss?'<div class="panel"><h3>Boss arena</h3><p style="margin:0">'+lk(e.boss)+'</p></div>':'')+(e.quest?'<div class="panel"><h3>Quest lectern</h3><p style="margin:0"><a href="#sys/quests">'+esc(e.quest)+'</a></p></div>':'')+
   '<div class="panel"><h3>Creatures</h3>'+(e.mobs.length?'<div class="links">'+e.mobs.map(lk).join('')+'</div>':'<p style="margin:0;color:var(--mut)">None in particular.</p>')+'</div></div>'+
   '<div><div class="panel"><h3>Chest loot</h3>'+(e.loot.length?'<div class="links">'+e.loot.map(lk).join('')+'</div>':'<p style="margin:0;color:var(--mut)">No special chest.</p>')+'</div></div></div>';
  getStats().then(function(d){var el=document.getElementById('sfound');if(!el)return;
    var f=(d.places||[]).filter(function(x){return x.id===e.id;});
    el.innerHTML='<div class="maplink">'+(f.length?'<span>Players have found <b>'+f.length+'</b> of these. '+(f[0].first?'First found by ':'Found by ')+plink(f[0].by)+'.</span><a class="btn sm" href="#map">See them on the map</a>':'<span>Nobody has found one yet. Be the first!</span><a class="btn sm" href="#map">Open the map</a>')+'</div>';}).catch(function(){});
}
function pSys(e){
  var h=crumbs('systems',e.name)+'<div class="pagehead"><div><h1>'+esc(e.name)+'</h1><p>'+esc(e.sum)+'</p></div>'+copyBtn(e.r)+'</div>';
  var R=D.renders;
  var pic={gangs:R.gangs_pets,mage:R.mage,ores:null};
  if(e.id==='ores')h+='<div class="grid" style="margin-top:14px">'+D.ores.map(oreCard).join('')+'</div>';
  e.blocks.forEach(function(b){
    h+='<div class="panel" style="margin-top:16px"><h3>'+esc(b.h)+'</h3>';
    if(b.kind==='gangs'){h+=b.gangs.map(function(g){return '<div class="gang" style="--gc:'+g.color+'"><h4 style="margin:0;color:'+g.color+'">'+esc(g.name)+'</h4><p class="note" style="margin:2px 0 8px">'+cap(g.dim)+(g.biomes?': '+esc(g.biomes):'')+'</p><ul class="plain">'+g.members.map(function(m){return '<li><a href="#'+m.r+'">'+esc(m.n)+'</a>: '+esc(m.role)+'</li>';}).join('')+'</ul>'+(g.pet?'<p style="margin:8px 0 0"><b>Pet: '+esc(g.pet.n)+'</b> - '+esc(g.pet.perk)+' <span class="note">'+esc(g.pet.desc)+'</span></p>'+(g.pet.img?img(g.pet.img,'render',g.pet.n):''):'')+'</div>';}).join('');}
    else if(b.kind==='shop'){h+='<div class="links">'+b.shop.map(function(x){return lk({r:x.r,i:x.i,n:x.n+' - '+x.p+' emeralds'+(x.tier!=='common'?' ('+x.tier+')':'')});}).join('')+'</div>';}
    else if(b.kind==='quests'){h+=b.quests.map(function(q){return '<div class="phase" style="border-color:var(--gold)"><h4>'+esc(q.name)+'<small>'+esc(q.giver)+'</small></h4><p style="margin:0 0 6px;color:#d2cadb">'+esc(q.desc)+'</p><ul>'+q.steps.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ul><p style="margin:8px 0 0">Reward: '+lk(q.reward)+'</p></div>';}).join('');}
    else{if(b.text)h+='<p>'+esc(b.text)+'</p>';h+='<ul class="plain">'+b.items.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
    h+='</div>';
  });
  if(pic[e.id])h+='<h2>Gallery</h2>'+img(pic[e.id],'render',e.name);
  if(e.id==='mythic_rules'){h+='<div class="panel"><h3>Who holds each mythic (live)</h3><ul class="plain">'+D.items.filter(function(x){return x.myth;}).map(function(x){return '<li><a href="#'+x.r+'">'+esc(x.name)+'</a>: <b class="holder" data-m="'+esc(x.id)+'">checking...</b></li>';}).join('')+'</ul><p class="note holdupd"></p></div>';h+='<p><a href="#mythics">See all mythics</a></p>';}
  if(e.id==='worldbosses')h+='<div class="grid wide">'+D.wbosses.map(function(x){return bossCard(x,true);}).join('')+'</div>';
  app.innerHTML=h;
}

// ---------- crafting trees
var T=D.tree||{n:{},rec:{},src:{}},MAXD=6;
var KIND={mob:'Mob',boss:'Boss',chest:'Chest',ore:'Ore',quest:'Quest',shop:'Shop',vanilla:'Vanilla',craft:'Craft'};
function tn(id){return T.n[id]||[id,'','','common'];}
function first(c){return Array.isArray(c)?c[0]:c;}
function tIc(id,s){var n=tn(id);return n[2]?ic({src:n[2]},s):'<span class="ph" style="width:'+s+'px;height:'+s+'px">'+(n[3]==='vanilla'?'&#9632;':'&#9670;')+'</span>';}
function tName(c){var ids=Array.isArray(c)?c:[c];return ids.slice(0,3).map(function(x){return tn(x)[0];}).join(' or ')+(ids.length>3?' or ...':'');}
function srcRows(id,max){var s=T.src[id]||[];var h=s.slice(0,max).map(function(x){return '<li><span class="k k-'+x[0]+'">'+(KIND[x[0]]||x[0])+'</span>'+(x[2]?'<a href="#'+x[2]+'">'+esc(x[1])+'</a>':esc(x[1]))+'</li>';}).join('');
  if(s.length>max){var n=tn(id);h+='<li class="more">'+(n[1]?'<a href="#'+n[1]+'">+'+(s.length-max)+' more places</a>':'+'+(s.length-max)+' more')+'</li>';}return h;}
function oNode(c,count,depth,path){
  var id=first(c),n=tn(id),rec=T.rec[id],rar=n[3]||'common',cyc=path.indexOf(id)>=0;
  var craft=!!(rec&&!cyc&&depth<MAXD),kids='';
  if(craft)kids='<ul>'+rec.c.map(function(x){return oNode(x[0],x[1],depth+1,path.concat([id]));}).join('')+'</ul>';
  var src=(!rec&&rar!=='vanilla'&&T.src[id]&&T.src[id].length)?T.src[id]:null;
  var kind=craft?'<span class="ok k-craft">Craft</span>':rar==='vanilla'?'<span class="ok k-van">Vanilla</span>':
    src?'<span class="ok k-'+src[0][0]+'">'+(KIND[src[0][0]]||src[0][0])+'</span>':rec?'<span class="ok">Crafted</span>':'';
  var where=src?'<span class="ow">'+(src[0][2]?'<a href="#'+src[0][2]+'">'+esc(src[0][1])+'</a>':esc(src[0][1]))+(src.length>1?' <i>+'+(src.length-1)+'</i>':'')+'</span>':
    cyc?'<span class="ow">already above</span>':rec&&!craft?'<span class="ow">open its page</span>':'';
  var name=n[1]?'<a href="#'+n[1]+'">'+esc(tName(c))+'</a>':esc(tName(c));
  var tog=craft?'<button class="ot-t" title="Show or hide what it is made of"><b class="n">+'+rec.c.length+'</b><b class="m">&minus;</b></button>':'';
  return '<li class="'+(craft?'has':'leaf')+(craft&&depth>=2?' shut':'')+'" data-id="'+esc(id)+'"><div class="oc" style="--c:var(--'+(rar==='vanilla'?'mut':rar)+')">'+
    '<span class="ochk" aria-hidden="true"></span><div class="oi">'+tIc(id,36)+'<span class="oq">'+count+'&times;</span></div>'+
    '<div class="on">'+name+'</div>'+kind+where+(craft?'<button class="tg" data-grid="'+esc(id)+'">recipe</button>':'')+'</div>'+tog+kids+'</li>';
}
function rawTotals(id,mult,depth,path,acc){
  var rec=T.rec[id];
  if(!rec||depth>=MAXD||path.indexOf(id)>=0){acc[id]=(acc[id]||0)+mult;return acc;}
  rec.c.forEach(function(x){rawTotals(first(x[0]),mult*x[1],depth+1,path.concat([id]),acc);});return acc;
}
var HAVE_KEY='eventyr.have';
function haveSet(){try{return JSON.parse(localStorage.getItem(HAVE_KEY)||'{}')||{};}catch(e){return {};}}
function saveHave(h){try{localStorage.setItem(HAVE_KEY,JSON.stringify(h));}catch(e){}}
function treeHtml(id){
  var rec=T.rec[id];if(!rec)return '';
  var n=tn(id),acc=rawTotals(id,1,0,[],{}),keys=Object.keys(acc).sort(function(a,b){return acc[b]-acc[a];});
  var shop=keys.map(function(k){var x=tn(k),s=(T.src[k]||[])[0];
    return '<label class="sh" style="--c:var(--'+(x[3]==='vanilla'?'mut':x[3]||'common')+')"><input type="checkbox" data-have="'+esc(k)+'">'+
      '<span class="shb" aria-hidden="true"></span>'+tIc(k,32)+'<span class="shq">'+acc[k]+'&times;</span>'+
      '<span class="shn">'+(x[1]?'<a href="#'+x[1]+'">'+esc(x[0])+'</a>':esc(x[0]))+(s?'<small>'+(KIND[s[0]]||s[0])+': '+esc(s[1])+'</small>':x[3]==='vanilla'?'<small>Vanilla</small>':'')+'</span></label>';}).join('');
  setTimeout(treeInit,0);
  return '<div class="panel ctree" data-root="'+esc(id)+'"><div class="ctop"><h3>Crafting tree</h3><span class="tbtns"><button class="btn sm" data-tall="1">Expand all</button><button class="btn sm" data-tall="0">Collapse</button></span></div>'+
    '<p class="note" style="margin:-4px 0 12px">Read it from the bottom up: gather what is at the ends of the branches, craft each step, and climb to the top. Drag to look around; the round buttons open and close a branch.</p>'+
    '<div class="ot-wrap"><ul class="ot"><li class="has root" data-id="'+esc(id)+'"><div class="oc root" style="--c:var(--'+n[3]+')"><span class="ochk" aria-hidden="true"></span><div class="oi">'+tIc(id,52)+'</div><div class="on">'+esc(n[0])+'</div>'+
    '<span class="ok k-craft">Goal</span><button class="tg" data-grid="'+esc(id)+'">recipe</button></div><ul>'+
    rec.c.map(function(x){return oNode(x[0],x[1],1,[id]);}).join('')+'</ul></li></ul></div>'+
    '<div class="shtop"><h3>Shopping list</h3><div class="shp"><span class="shpt"></span><span class="shpb"><i></i></span></div></div>'+
    '<p class="note" style="margin:-2px 0 10px">Everything raw that goes into it. Tick what you have: ticks are saved in this browser, show up in every tree, and branches you can craft light up.</p>'+
    '<div class="shop">'+shop+'</div></div>';
}
function treeInit(){
  [].forEach.call(app.querySelectorAll('.ctree'),function(t){
    var w=t.querySelector('.ot-wrap');if(w&&!w.dataset.c){w.dataset.c=1;requestAnimationFrame(function(){treeCenter(t);});}
    treeRefresh(t);
  });
}
function treeRefresh(t){
  var h=haveSet(),boxes=t.querySelectorAll('[data-have]'),got=0;
  [].forEach.call(boxes,function(b){b.checked=!!h[b.getAttribute('data-have')];b.closest('.sh').classList.toggle('on',b.checked);if(b.checked)got++;});
  var pt=t.querySelector('.shpt');if(pt)pt.textContent=got+' / '+boxes.length+' gathered';
  var pb=t.querySelector('.shpb i');if(pb)pb.style.width=(boxes.length?100*got/boxes.length:0)+'%';
  function ok(li){var ul=li.querySelector(':scope>ul');var r;
    if(!ul)r=!!h[li.getAttribute('data-id')];
    else{r=true;[].forEach.call(ul.children,function(c){if(!ok(c))r=false;});}
    li.classList.toggle('got',r&&!ul);li.classList.toggle('ready',r&&!!ul);return r;}
  var root=t.querySelector('.ot>li');if(root)ok(root);
}
function treeCenter(t){var w=t.querySelector('.ot-wrap'),r=t.querySelector('.oc.root');if(!w||!r)return;
  var wr=w.getBoundingClientRect(),rr=r.getBoundingClientRect();w.scrollLeft+=rr.left+rr.width/2-(wr.left+wr.width/2);}
(function(){var drag=null;
  document.addEventListener('mousedown',function(e){var w=e.target.closest('.ot-wrap');if(!w||e.button!==0||e.target.closest('a,button,input,label'))return;
    drag={w:w,x:e.clientX,y:e.clientY,l:w.scrollLeft,t:window.scrollY,moved:false};w.classList.add('drag');e.preventDefault();});
  document.addEventListener('mousemove',function(e){if(!drag)return;var dx=e.clientX-drag.x;drag.w.scrollLeft=drag.l-dx;if(Math.abs(dx)>3)drag.moved=true;});
  document.addEventListener('mouseup',function(){if(drag){drag.w.classList.remove('drag');drag=null;}});
  document.addEventListener('change',function(e){var b=e.target.closest('[data-have]');if(!b)return;var h=haveSet(),k=b.getAttribute('data-have');
    if(b.checked)h[k]=1;else delete h[k];saveHave(h);[].forEach.call(app.querySelectorAll('.ctree'),treeRefresh);});
})();
function treeText(c,count,depth,path,ind){
  var id=first(c),n=tn(id),rec=T.rec[id],out=[ind+'- '+count+'x '+tName(c)];
  if(path.indexOf(id)>=0){out[0]+=' (cycle, see above)';return out;}
  if(rec&&depth<MAXD){rec.c.forEach(function(x){out=out.concat(treeText(x[0],x[1],depth+1,path.concat([id]),ind+'  '));});}
  else if(rec){out[0]+=' (crafted; see its own tree)';}
  else if(rec){out[0]+=' (crafted; see its own tree)';}
  else if(n[3]==='vanilla'){out[0]+=' [vanilla]';}
  else{var s=(T.src[id]||[]).slice(0,3).map(function(x){return x[1];});if(s.length)out[0]+=' [from: '+s.join('; ')+']';}
  return out;
}
function treeMd(id){var rec=T.rec[id];if(!rec)return '';var out=['Crafting tree for '+tn(id)[0]+':'];rec.c.forEach(function(x){out=out.concat(treeText(x[0],x[1],1,[id],'  '));});return out.join('\n');}
function allTreesMd(){var out=['## Full crafting trees (indented: each line is an ingredient, sub-lines are what it is made of; [from: ...] = where to find it)'];
  Object.keys(T.rec).forEach(function(id){var n=tn(id);if(n[1]&&n[1].indexOf('secret/')!==0)out.push(treeMd(id));});return out.join('\n\n');}
document.addEventListener('click',function(ev){
  var gj=ev.target.closest('[data-gj]');if(gj){ev.preventDefault();var el=document.getElementById(gj.getAttribute('data-gj'));if(el)el.scrollIntoView({behavior:'smooth',block:'start'});return;}
  var t=ev.target.closest('.ot-t');if(t){t.closest('li').classList.toggle('shut');return;}
  var a=ev.target.closest('[data-tall]');if(a){var open=a.getAttribute('data-tall')==='1',tr=a.closest('.ctree');[].forEach.call(tr.querySelectorAll('.ot li.has:not(.root)'),function(l){l.classList.toggle('shut',!open);});treeCenter(tr);return;}
  var g=ev.target.closest('[data-grid]');if(g){[].forEach.call(document.querySelectorAll('.tpop'),function(p){p.remove();});var r=T.rec[g.getAttribute('data-grid')];if(!r)return;
    var nm=tn(g.getAttribute('data-grid'))[0];var p=document.createElement('div');p.className='tpop fx';
    p.innerHTML='<div class="tpin"><div class="tph"><b>'+esc(nm)+'</b><button class="tpx" aria-label="Close">&times;</button></div>'+recipeHtml(r.g)+'</div>';document.body.appendChild(p);return;}
  if(ev.target.closest('.tpx')||ev.target.classList.contains('tpop')){[].forEach.call(document.querySelectorAll('.tpop'),function(p){p.remove();});return;}
  if(!ev.target.closest('.tpin'))[].forEach.call(document.querySelectorAll('.tpop'),function(p){p.remove();});
});
function usedHtml(list){return '<div class="panel"><h3>Used in</h3>'+(list&&list.length?'<div class="links">'+list.map(lk).join('')+'</div>':'<p style="margin:0;color:var(--mut)">Not used in any recipe.</p>')+'</div>';}

// ---------- link tokens [[route|name]]
function linkify(s){return esc(s).replace(/\[\[([^|\]]*)\|([^\]]*)\]\]/g,function(m,r,n){return '<a href="#'+r+'">'+n+'</a>';});}

// ---------- pan / zoom board
function makeBoard(el,inner,o){
  o=o||{};var s=1,x=0,y=0,pts={},moved=false,startD=0,startS=1,last=null,MIN=o.min||.35,MAX=o.max||2.2;
  function apply(){inner.style.transform='translate('+x+'px,'+y+'px) scale('+s+')';if(o.onzoom)o.onzoom(s);}
  function zoomAt(f,cx,cy){var ns=Math.max(MIN,Math.min(MAX,s*f));var r=el.getBoundingClientRect();var px=cx-r.left,py=cy-r.top;x=px-(px-x)*ns/s;y=py-(py-y)*ns/s;s=ns;apply();}
  el.addEventListener('wheel',function(e){e.preventDefault();zoomAt(e.deltaY<0?1.12:1/1.12,e.clientX,e.clientY);},{passive:false});
  el.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;pts[e.pointerId]={x:e.clientX,y:e.clientY};moved=false;last={x:e.clientX,y:e.clientY};
    var k=Object.keys(pts);if(k.length===2){var a=pts[k[0]],b=pts[k[1]];startD=Math.hypot(a.x-b.x,a.y-b.y);startS=s;}});
  el.addEventListener('pointermove',function(e){if(!pts[e.pointerId])return;var k=Object.keys(pts);
    if(k.length===2){pts[e.pointerId]={x:e.clientX,y:e.clientY};var a=pts[k[0]],b=pts[k[1]];var d=Math.hypot(a.x-b.x,a.y-b.y);if(startD>0){zoomAt(startS*d/startD/s,(a.x+b.x)/2,(a.y+b.y)/2);}moved=true;return;}
    var dx=e.clientX-last.x,dy=e.clientY-last.y;if(Math.abs(e.clientX-pts[e.pointerId].x)+Math.abs(e.clientY-pts[e.pointerId].y)>6){moved=true;if(!el.hasPointerCapture(e.pointerId))el.setPointerCapture(e.pointerId);el.classList.add('drag');}
    if(moved){x+=dx;y+=dy;apply();}last={x:e.clientX,y:e.clientY};});
  function up(e){delete pts[e.pointerId];el.classList.remove('drag');}
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  el.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
  var api={zoom:function(f){var r=el.getBoundingClientRect();zoomAt(f,r.left+r.width/2,r.top+r.height/2);},reset:function(){s=1;x=0;y=0;apply();},fit:function(){var w=inner.scrollWidth,h=inner.scrollHeight,r=el.getBoundingClientRect();s=Math.max(.35,Math.min(1,(r.width-20)/w,(r.height-20)/h));x=(r.width-w*s)/2;y=10;apply();}};
  apply();return api;
}
function boardTools(){return '<div class="btools"><button class="btn sm" data-z="in" aria-label="Zoom in">+</button><button class="btn sm" data-z="out" aria-label="Zoom out">&minus;</button><button class="btn sm" data-z="fit">Fit</button><span class="note">Drag to pan &middot; scroll or pinch to zoom</span></div>';}
function wireTools(api){[].forEach.call(app.querySelectorAll('[data-z]'),function(b){b.onclick=function(){var z=b.getAttribute('data-z');if(z==='in')api.zoom(1.2);else if(z==='out')api.zoom(1/1.2);else api.fit();};});}
function isPhone(){return window.matchMedia('(max-width:700px)').matches;}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}

// ---------- progression page
var P=D.prog||{ps:[],lines:[],sets:[],tiers:[]};
function lineById(id){return P.lines.filter(function(l){return l.id===id;})[0];}
var HOW={craft:'Crafted',boss:'Boss drop',drop:'Mob drop',chest:'Chest loot',quest:'Quest reward'};
function pProgression(parts){
  var view=parts[1]||'paths';
  var tabs='<div class="ptabs"><a href="#progression" class="'+(view!=='map'?'on':'')+'">Upgrade paths</a><a href="#progression/map" class="'+(view==='map'?'on':'')+'">Progress map</a><a href="#guide">Guide</a></div>';
  var h='<div class="pagehead"><div><h1>Progression</h1><p>Don\'t chase everything. Pick how you like to fight, follow one line, and upgrade one step at a time. Each step is crafted from the one before it.</p></div>'+copyBtn('progression','Copy paths for AI')+'</div>'+tabs;
  if(view==='map'){app.innerHTML=h+tierMap();var bd=app.querySelector('.board');if(bd&&!isPhone()){var cvm=bd.querySelector('.canvas');bd.style.height=(cvm.scrollHeight+4)+'px';var api=makeBoard(bd,cvm);wireTools(api);}return;}
  var lid=parts[2]||lsGet('ev_line')||'sword',line=lineById(lid)||P.lines[0];lsSet('ev_line',line.id);
  var ps=P.ps.filter(function(p){return p.id===line.ps;})[0];
  h+='<div class="psel">'+P.ps.map(function(p){return '<a class="pst'+(p.id===ps.id?' on':'')+' ps-'+p.id+'" href="#progression/paths/'+p.types[0]+'"><b>'+esc(p.n)+'</b><span>'+esc(p.d)+'</span></a>';}).join('')+'</div>'+
    '<div class="filters">'+ps.types.map(function(t){var l=lineById(t);return '<a class="fbtn'+(t===line.id?' on':'')+'" href="#progression/paths/'+t+'">'+esc(l.n)+'</a>';}).join('')+'</div>';
  h+='<div class="pwrap"><div class="pmain">'+(isPhone()?'<div class="vpath" id="vp"></div>':boardTools()+'<div class="board"><div class="canvas" id="cv"></div></div>')+'</div><aside class="pside" id="ps"></aside></div>';
  if(ps.id==='tank')h+='<h2>Armor sets, weakest first</h2><div class="setrow">'+P.sets.map(function(s){return '<a class="card r-'+s.rar+'" href="#'+s.r+'">'+ic(s.i,48)+'<div class="nm">'+esc(s.n)+'</div><div class="meta">'+era(s.t)+(s.crafted?'':' &middot; found')+'</div></a>';}).join('')+'</div>';
  app.innerHTML=h;
  var here=lsGet('ev_here_'+line.id);if(!line.nodes.some(function(n){return n.id===here;}))here=line.spine[0]||line.nodes[0].id;
  drawLine(line,here);
}
function drawLine(line,here){
  var byId={},kids={};line.nodes.forEach(function(n){byId[n.id]=n;if(n.p){(kids[n.p]=kids[n.p]||[]).push(n);}});
  var path=[],c=byId[here];while(c){path.unshift(c.id);c=c.p?byId[c.p]:null;}
  var nk=(kids[here]||[]).slice().sort(function(a,b){return (line.spine.indexOf(b.id)>=0)-(line.spine.indexOf(a.id)>=0)||a.t-b.t;});
  var next=nk[0]||null;
  function node(n,cls){var st=n.id===here?' here':next&&n.id===next.id?' next':path.indexOf(n.id)>=0?' done':line.spine.indexOf(n.id)>=0?' spine':'';
    return '<button class="un r-'+n.rar+st+(cls||'')+'" data-node="'+n.id+'" style="--c:var(--'+n.rar+')">'+ic(n.i,36)+'<span class="unm">'+esc(n.n)+'</span><span class="umeta">'+era(n.t)+(n.how!=='craft'?' &middot; '+(HOW[n.how]||n.how):'')+'</span>'+(n.id===here?'<i class="tag">You are here</i>':next&&n.id===next.id?'<i class="tag nx">Next</i>':'')+'</button>';}
  var cv=document.getElementById('cv'),vp=document.getElementById('vp');
  if(cv){
    // layout: tidy tree, x by tier, y by lane
    var CW=200,RH=86,lane=0,pos={};
    function place(n){var ks=(kids[n.id]||[]).slice().sort(function(a,b){return (line.spine.indexOf(b.id)>=0)-(line.spine.indexOf(a.id)>=0);});
      if(!ks.length){pos[n.id]=lane++;return pos[n.id];}var ys=ks.map(place);pos[n.id]=ys[0];return pos[n.id];}
    var roots=line.nodes.filter(function(n){return !n.p&&kids[n.id];}).sort(function(a,b){return (line.spine.indexOf(b.id)>=0)-(line.spine.indexOf(a.id)>=0)||a.t-b.t;});
    roots.forEach(place);
    var loose=line.nodes.filter(function(n){return pos[n.id]===undefined;}),band=lane+(roots.length?0.6:0),col={};
    loose.forEach(function(n){col[n.t]=(col[n.t]||0);pos[n.id]=band+col[n.t];col[n.t]++;});
    var maxL=Math.max(lane,band+Math.max.apply(null,[0].concat(Object.keys(col).map(function(k){return col[k];}))));
    var W=9*CW+20,H=56+maxL*RH+20;
    var svg='<svg class="links" width="'+W+'" height="'+H+'">';
    for(var t=0;t<9;t++)svg+='<rect x="'+(t*CW+4)+'" y="0" width="'+(CW-8)+'" height="'+H+'" rx="14" class="col'+(t%2)+'"/>';
    line.nodes.forEach(function(n){if(!n.p||!byId[n.p])return;var a=byId[n.p];var x1=a.t*CW+CW-14,y1=56+pos[a.id]*RH+30,x2=n.t*CW+14,y2=56+pos[n.id]*RH+30;
      if(x2<=x1){x2=x1+12;}
      var cls=(path.indexOf(n.id)>=0&&path.indexOf(a.id)>=0)?'done':(a.id===here&&next&&n.id===next.id)?'nx':line.spine.indexOf(n.id)>=0?'sp':'';
      var mx=(x1+x2)/2;svg+='<path class="e '+cls+'" d="M'+x1+' '+y1+' C'+mx+' '+y1+' '+mx+' '+y2+' '+x2+' '+y2+'"/>';});
    svg+='</svg>';
    var hd='';for(t=0;t<9;t++)hd+='<div class="thd" style="left:'+(t*CW)+'px;width:'+CW+'px">'+era(t).toUpperCase()+'</div>';
    var nodes=line.nodes.map(function(n){return '<div class="up" style="left:'+(n.t*CW+14)+'px;top:'+(56+pos[n.id]*RH)+'px">'+node(n,pos[n.id]>=band&&loose.indexOf(n)>=0?' loose':'')+'</div>';}).join('');
    var bl=loose.length&&roots.length?'<div class="bandlbl" style="top:'+(56+(band-0.45)*RH)+'px">Found in the world, not crafted in this line</div>':'';
    cv.style.width=W+'px';cv.style.height=H+'px';cv.innerHTML=svg+hd+bl+nodes;cv.parentNode.style.height=Math.min(640,H+24)+'px';
    if(!cv._api){cv._api=makeBoard(cv.parentNode,cv);wireTools(cv._api);}
  }else if(vp){
    var tiers={};line.nodes.forEach(function(n){(tiers[n.t]=tiers[n.t]||[]).push(n);});
    vp.innerHTML=Object.keys(tiers).sort(function(a,b){return a-b;}).map(function(t){return '<div class="vt"><div class="vth">'+era(t).toUpperCase()+'</div><div class="vnodes">'+tiers[t].sort(function(a,b){return (line.spine.indexOf(b.id)>=0)-(line.spine.indexOf(a.id)>=0);}).map(function(n){return node(n,'');}).join('')+'</div></div>';}).join('');
  }
  // side panel
  var hn=byId[here],ps=document.getElementById('ps'),h='<div class="panel here"><span class="k">You are here</span><div class="hl" style="margin:8px 0 0">'+ic(hn.i,48)+'<div><b style="color:var(--'+hn.rar+')">'+esc(hn.n)+'</b><div class="note">'+era(hn.t)+' &middot; '+cap(hn.rar)+'</div></div></div><a class="btn sm" style="margin-top:10px;display:inline-block" href="#item/'+hn.id+'">Open page</a></div>';
  if(next){
    var rec=T.rec[next.id];
    h+='<div class="panel nextp"><span class="k">Next step</span><div class="hl" style="margin:8px 0 10px">'+ic(next.i,48)+'<div><a href="#item/'+next.id+'"><b style="color:var(--'+next.rar+')">'+esc(next.n)+'</b></a><div class="note">'+era(next.t)+' &middot; '+cap(next.rar)+'</div></div></div>';
    if(rec)h+='<h3>What you need</h3><ul class="need">'+rec.c.map(function(x){var id=first(x[0]),n=tn(id),s=(T.src[id]||[])[0];var isPrev=id===here;
      return '<li>'+tIc(id,28)+'<div><b>'+x[1]+'&times; '+(n[1]?'<a href="#'+n[1]+'">'+esc(tName(x[0]))+'</a>':esc(tName(x[0])))+'</b>'+(isPrev?'<span class="note"> (you have it)</span>':'')+
        '<div class="note">'+(isPrev?'':T.rec[id]?'Crafted: see its tree':n[3]==='vanilla'?'Vanilla resource':s?(s[2]?'<a href="#'+s[2]+'">'+esc(s[1])+'</a>':esc(s[1])):'')+'</div></div></li>';}).join('')+'</ul>';
    else h+='<p class="note">'+(HOW[next.how]||'Found')+': see its page for where.</p>';
    if(nk.length>1)h+='<h3 style="margin-top:12px">Or branch into</h3><div class="links">'+nk.slice(1).map(function(n){return '<button class="lk" data-node="'+n.id+'">'+ic(n.i,24)+esc(n.n)+'</button>';}).join('')+'</div>';
    h+='</div>';
  }else h+='<div class="panel"><span class="k">Top of this line</span><p style="margin:8px 0 0">Nothing is crafted from this one. Next: beat the bosses for legendaries, then chase the <a href="#mythics">mythics</a>.</p></div>';
  h+='<p class="note">Tap any node to mark it as "you are here". Gold lines show the main upgrade path.</p>';
  ps.innerHTML=h;
  [].forEach.call(app.querySelectorAll('[data-node]'),function(b){b.onclick=function(){lsSet('ev_here_'+line.id,b.getAttribute('data-node'));drawLine(line,b.getAttribute('data-node'));};});
}
function tierMap(){
  function mini(x){return '<a class="mi r-'+(x.rar||'common')+'" href="#'+x.r+'" title="'+esc(x.n)+'" style="--c:var(--'+(x.rar||'common')+')">'+ic(x.i,32)+'<span>'+esc(x.n)+'</span></a>';}
  var cols=P.tiers.map(function(t){
    var h='<div class="tcol"><div class="tch"><span class="px">'+era(t.t).toUpperCase()+'</span><span class="note">'+t.cnt+' items &middot; '+t.nmobs+' creatures</span></div>';
    if(t.mats.length||t.ores.length)h+='<div class="tsec"><b>Materials</b><div class="mis">'+t.ores.map(mini).join('')+t.mats.map(mini).join('')+'</div></div>';
    if(t.gear.length)h+='<div class="tsec"><b>Key gear</b><div class="mis">'+t.gear.map(mini).join('')+'</div></div>';
    if(t.sets.length)h+='<div class="tsec"><b>Armor</b><div class="mis">'+t.sets.map(mini).join('')+'</div></div>';
    t.gates.forEach(function(g){h+='<div class="gate"><b>Boss gate</b><div class="gflow">'+(g.sum?mini(g.sum):'')+'<span class="arr">&#8595;</span><a class="gb" href="#'+g.r+'">'+esc(g.n)+'<small>'+esc(g.ti)+'</small></a><span class="arr">&#8595;</span><div class="mis">'+g.drops.map(mini).join('')+'</div></div></div>';});
    if(t.wb.length)h+='<div class="tsec"><b>World bosses</b><div class="links">'+t.wb.map(function(w){return '<a class="lk" href="#'+w.r+'">'+esc(w.n)+'</a>';}).join('')+'</div></div>';
    return h+'</div>';}).join('<div class="tarr">&#10148;</div>');
  cols+='<div class="tarr">&#10148;</div><div class="tcol endc"><div class="tch"><span class="px">THE END</span><span class="note">one of each, ever</span></div><div class="tsec"><b>Mythics</b><div class="mis">'+P.end.myth.map(function(m){m.rar='mythic';return mini(m);}).join('')+'</div></div><div class="tsec"><b>Secrets</b><p class="note" style="margin:4px 0 0">'+P.end.secrets+' secret weapons. Secret: ???</p></div></div>';
  return isPhone()?'<div class="tmap vertical">'+cols+'</div>':boardTools()+'<div class="board tall"><div class="canvas tmap">'+cols+'</div></div>';
}
function pGuide(){
  app.innerHTML='<div class="pagehead"><div><h1>Guide</h1><p>How to progress, step by step. Short and practical. Every name is a link.</p></div>'+copyBtn('guide','Copy guide for AI')+'</div>'+
    '<div class="ptabs"><a href="#progression">Upgrade paths</a><a href="#progression/map">Progress map</a><a href="#guide" class="on">Guide</a></div>'+
    '<nav class="gtoc">'+(D.guide||[]).map(function(g,i){return '<a href="#guide" data-gj="g'+i+'">'+esc(g.h)+'</a>';}).join('')+'</nav>'+
    (D.guide||[]).map(function(g,i){return '<section class="gsec" id="g'+i+'"><h2>'+esc(g.h)+'</h2><ol class="tips">'+g.steps.map(function(s){return '<li>'+linkify(s)+'</li>';}).join('')+'</ol></section>';}).join('');
}

// ---------- live numbers (the server posts them to /api/stats about once a minute)
var STATS=null,STATS_AT=0;
function getStats(force){
  if(STATS&&!force&&Date.now()-STATS_AT<20000)return Promise.resolve(STATS);
  return fetch('/api/stats',{cache:'no-store'}).then(function(r){if(!r.ok)throw r.status;return r.json();}).then(function(d){if(!d||!d.players)throw 'empty';STATS=d;STATS_AT=Date.now();return d;});
}
function face(p,s){
  s=s||40;var k=s/8;
  if(!p.skin)return '<span class="face" style="width:'+s+'px;height:'+s+'px;background:#6b8f5a"></span>';
  var u="background-image:url('"+esc(p.skin)+"');background-size:"+(64*k)+'px '+(64*k)+'px;';
  return '<span class="face" style="width:'+s+'px;height:'+s+'px"><i style="'+u+'background-position:-'+(8*k)+'px -'+(8*k)+'px"></i><i style="'+u+'background-position:-'+(40*k)+'px -'+(8*k)+'px"></i></span>';
}
function ago(ms){var m=Math.max(0,Math.round((Date.now()-ms)/60000));return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)===1?'1 day ago':Math.round(m/1440)+' days ago';}
function proute(n){return '#player/'+encodeURIComponent(n);}
function plink(n){return '<a class="plk" href="'+proute(n)+'">'+esc(n)+'</a>';}
function bossName(id){var b=BY['boss/'+id]||BY['wboss/'+id];return b?b.name:cap(String(id).replace(/_/g,' '));}
function drawTop(d){
  var el=document.getElementById('lb');if(!el)return;
  var ps=(d.players||[]).slice(),on=ps.filter(function(p){return p.online;});
  var h='<div class="lbhead"><span class="dot'+(on.length?' live':'')+'"></span>'+(on.length?on.length+' playing now':'Nobody is playing right now')+
    '<span class="note"> &middot; updated '+ago(d.updated||0)+'</span></div>';
  h+='<p class="note" style="margin:-6px 0 12px">Tap a player to see all their numbers. Or open the <a href="#map">world map</a> to see the places everyone has found.</p>';
  h+='<div class="lbplayers">'+ps.sort(function(a,b){return (b.online?1:0)-(a.online?1:0)||(b.seen||0)-(a.seen||0);}).map(function(p){
    return '<a class="lbp" href="'+proute(p.name)+'">'+face(p,48)+'<b>'+esc(p.name)+'</b>'+(p.title?'<span class="ptl">'+esc(p.title)+'</span>':'')+'<small>'+(p.online?'online':'seen '+ago(p.seen||0))+'</small></a>';}).join('')+'</div>';
  h+='<div class="lbgrid">';
  Object.keys(d.boards||{}).forEach(function(k){
    var rows=ps.filter(function(p){return p.stats&&p.stats[k]>0;}).sort(function(a,b){return b.stats[k]-a.stats[k];}).slice(0,6);
    h+='<section class="lbbox"><h3>'+esc(d.boards[k])+'</h3>'+(rows.length?rows.map(function(p,i){
      return '<a class="lbrow r'+(i+1)+'" href="'+proute(p.name)+'"><span class="rk">'+(i+1)+'</span>'+face(p,28)+'<span class="nm">'+esc(p.name)+'</span><span class="v">'+p.stats[k]+'</span></a>';}).join('')
      :'<p class="note">Nobody yet. You could be first!</p>')+'</section>';
  });
  h+='</div>';
  var fs=d.firsts||[];
  h+='<h2 class="lbh2">Hall of Firsts</h2><p class="note">The first player to beat each boss. Forever.</p>'+(fs.length?'<div class="lbgrid">'+fs.map(function(f){
    return '<div class="lbfirst">'+face({skin:f.skin},40)+'<div><b>'+esc(f.boss)+'</b><small>'+plink(f.player)+' &middot; '+ago(f.at||0)+'</small></div></div>';}).join('')+'</div>'
    :'<p class="note">No boss has been beaten yet.</p>');
  el.innerHTML=h;
}
function notLive(el){if(el)el.innerHTML='<div class="empty"><h2>Not live yet</h2><p>The numbers show up here when the server starts sending them. In the game, type <b>/stats</b> to see your own.</p></div>';}
function loadTop(quiet){
  return getStats(true).then(drawTop).catch(function(){if(!quiet)notLive(document.getElementById('lb'));});
}
function pTop(){
  app.innerHTML=head('Leaderboard','Who leads on the server. It updates by itself about every minute while people play.')+'<div id="lb"><p class="note">Loading...</p></div>';
  loadTop(false);
  clearInterval(window._lbT);
  window._lbT=setInterval(function(){if(!document.getElementById('lb')){clearInterval(window._lbT);return;}loadTop(true);},30000);
}

// ---------- player profile
var STAT_HELP={bosses:['bosses','Fight a boss'],worldbosses:['worldbosses','About world bosses'],colosseum:['sys/colosseum','About the Colosseum'],
  mob_kills:['creatures','See the monsters'],places:['map','See the map'],quests:['sys/quests','About quests'],fish:['sys/fishing','How to fish'],
  fish_kinds:['sys/fishing','How to fish'],meals:['sys/cooking','How to cook'],artifact_power:['sys/artifacts','About artifacts']};
function pPlayer(parts){
  var name=parts.slice(1).join('/');
  app.innerHTML='<div class="crumbs"><a href="#start">Start</a> / <a href="#top">Leaderboard</a> / '+esc(name)+'</div><div id="pp"><p class="note">Loading...</p></div>';
  getStats().then(function(d){drawPlayer(d,name);}).catch(function(){notLive(document.getElementById('pp'));});
}
function drawPlayer(d,name){
  var el=document.getElementById('pp');if(!el)return;
  var ps=d.players||[],lc=name.toLowerCase();
  var p=ps.filter(function(x){return String(x.name).toLowerCase()===lc;})[0];
  if(!p){el.innerHTML='<div class="empty"><h2>Player not found</h2><p>Nobody called '+esc(name)+' has played since the leaderboard started. Names show up after their first minute online.</p><p><a href="#top">Back to the leaderboard</a></p></div>';return;}
  var st=p.stats||{},boards=d.boards||{};
  var h='<section class="prof">'+face(p,isPhone()?80:112)+'<div class="pinfo"><h1>'+esc(p.name)+'</h1>'+(p.title?'<span class="ptl big">'+esc(p.title)+'</span>':'')+
    '<p class="pseen"><span class="dot'+(p.online?' live':'')+'"></span>'+(p.online?'Playing right now':'Last seen '+ago(p.seen||0))+(st.hours?' &middot; '+st.hours+' hours played':'')+'</p></div></section>';
  // numbers with bars vs the best player
  h+='<h2>Their numbers</h2><p class="note" style="margin-top:-6px">The bar shows how close they are to the best player on the server.</p><div class="pnums">';
  Object.keys(boards).forEach(function(k){
    var v=st[k]||0,best=0,bp=null,rank=1;
    ps.forEach(function(x){var w=(x.stats||{})[k]||0;if(w>best){best=w;bp=x;}if(w>v)rank++;});
    var pct=best>0?Math.max(v>0?3:0,Math.round(100*v/best)):0,hl=STAT_HELP[k];
    var foot=v<=0?'Not started yet':v>=best?'<b class="gold">Best on the server!</b>':'Number '+rank+' &middot; best is '+plink(bp.name)+' with '+best;
    h+='<div class="pnum"><div class="pnt"><span>'+esc(boards[k])+'</span><b>'+v+'</b></div><div class="bar" style="--c:var(--gold)"><i style="width:'+pct+'%"></i></div>'+
      '<div class="pnf"><span>'+foot+'</span>'+(hl?'<a href="#'+hl[0]+'">'+esc(hl[1])+'</a>':'')+'</div></div>';
  });
  h+='</div>';
  // bosses
  var beaten=(p.beaten||[]).slice(),all=D.bosses.slice().sort(function(a,b){return a.tier-b.tier;});
  var todo=all.filter(function(b){return beaten.indexOf(b.id)<0;});
  h+='<div class="two pfl" style="margin-top:22px"><div class="panel"><h3>Bosses beaten ('+beaten.length+' of '+all.length+')</h3>'+(beaten.length?'<div class="links">'+beaten.map(function(id){var b=BY['boss/'+id];return lk({r:b?b.r:null,n:bossName(id)});}).join('')+'</div>':'<p style="margin:0;color:var(--mut)">No boss beaten yet.</p>')+'</div>';
  var mine=(d.firsts||[]).filter(function(f){return f.player===p.name||(f.uuid&&f.uuid===p.uuid);});
  h+='<div class="panel"><h3>Hall of Firsts</h3>'+(mine.length?'<p style="margin:0 0 8px">'+esc(p.name)+' was the very first to beat:</p><div class="links">'+mine.map(function(f){return '<span class="lk nolink">&#127942; '+esc(f.boss)+'</span>';}).join('')+'</div>':'<p style="margin:0;color:var(--mut)">Not the first to beat any boss yet. Beat a boss nobody has beaten to get in!</p>')+'</div></div>';
  // places
  var found=(d.places||[]).filter(function(x){return x.by===p.name;});
  h+='<div class="panel"><h3>Places they found ('+found.length+')</h3>'+(found.length?'<div class="links">'+groupPlaces(found).map(function(x){var s=BY['struct/'+x.id];return lk({r:s?s.r:null,n:x.name+(x.n>1?' x'+x.n:'')});}).join('')+'</div><p style="margin:10px 0 0"><a class="btn sm" href="#map/'+encodeURIComponent(p.name)+'">Show them on the map</a></p>':'<p style="margin:0;color:var(--mut)">None yet. Walk into a ruin, tower or camp to discover it.</p>')+'</div>';
  // what next
  var nx=[];
  if(todo.length)nx.push('Beat the next boss: '+tl({r:todo[0].r,n:todo[0].name})+'. Its page shows how to call it.');
  if(!st.colosseum)nx.push('Try the <a href="#sys/colosseum">Colosseum</a>: fight waves of enemies and see how far you get.');
  if(!st.fish)nx.push('Catch a fish. <a href="#sys/fishing">Here is how fishing works</a>.');
  if(!st.artifact_power)nx.push('Wear an <a href="#sys/artifacts">artifact</a> (type /artifacts in the game).');
  nx.push('Explore: places nobody has found yet are not on the <a href="#map">map</a>. Be the first!');
  h+='<div class="panel kid-short"><h3>What could '+esc(p.name)+' do next?</h3><ul class="plain">'+nx.slice(0,4).map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul><p class="note" style="margin:10px 0 0">Is this you? Type <b>/stats</b> in the game to see your numbers there too.</p></div>';
  el.innerHTML=h;
}

function groupPlaces(list){var by={},out=[];list.forEach(function(x){if(!by[x.id]){by[x.id]={id:x.id,name:x.name,n:0};out.push(by[x.id]);}by[x.id].n++;});return out;}
// ---------- world map: only places players have discovered (the server never sends the others)
var MAPR=5000;
function placeKind(x){var s=BY['struct/'+x.id];return s&&s.boss?'boss':s&&s.quest?'quest':'place';}
var KINDN={boss:'Boss arena',quest:'Quest place',place:'Place to explore'};
function pMap(parts){
  var who=parts[1]?parts.slice(1).join('/'):'';
  app.innerHTML=head('World map','Every place players have discovered so far. Places nobody has walked into yet stay hidden, so go and find them!')+
    '<div class="mapwrap"><div class="mapmain">'+boardTools()+'<div class="board mapb" id="mapb"><div class="canvas" id="mapc"></div></div></div>'+
    '<aside class="mapside"><div class="panel mapinfo" id="mapinfo"><h3>Tap a marker</h3><p style="margin:0;color:var(--mut)">Tap (or point at) a marker to see what the place is and who found it.</p></div>'+
    '<div class="panel"><h3>Legend</h3><ul class="mleg"><li><span class="lg k-spawn"></span>Spawn (where you start)</li><li><span class="lg k-boss"></span>Boss arena</li><li><span class="lg k-quest"></span>Quest place</li><li><span class="lg k-place"></span>Place to explore</li><li><span class="lg k-border"></span>World border (5,000 blocks out)</li></ul>'+
    '<p class="note" style="margin:8px 0 0">North is up. Each square is 1,000 blocks. Spots are rounded to about 10 blocks.</p></div>'+
    '<div class="panel" id="mapfilter"></div></aside></div><div id="maplist"></div>';
  getStats().then(function(d){drawMap(d,who);}).catch(function(){drawMap({players:[],places:[]},who,true);});
}
function drawMap(d,who,offline){
  var b=document.getElementById('mapb'),c=document.getElementById('mapc');if(!b||!c)return;
  var all=(d.places||[]),over=all.filter(function(x){return x.dim==='overworld';});
  var finders={};all.forEach(function(x){if(x.by)finders[x.by]=(finders[x.by]||0)+1;});
  var shown=who?over.filter(function(x){return x.by===who;}):over;
  var w=Math.max(260,Math.min(b.clientWidth||600,720)),R=MAPR*1.08,u=2*R/w,mr=9*u;
  b.style.height=w+'px';c.style.width=w+'px';c.style.height=w+'px';
  var g='<svg class="wmap" width="'+w+'" height="'+w+'" viewBox="'+(-R)+' '+(-R)+' '+(2*R)+' '+(2*R)+'" role="img" aria-label="World map">';
  g+='<rect x="'+(-MAPR)+'" y="'+(-MAPR)+'" width="'+(2*MAPR)+'" height="'+(2*MAPR)+'" class="mland"/>';
  for(var i=-4;i<=4;i++){var v=i*1000;g+='<line class="mgrid'+(i===0?' ax':'')+'" style="stroke-width:'+u+'" x1="'+v+'" y1="'+(-MAPR)+'" x2="'+v+'" y2="'+MAPR+'"/><line class="mgrid'+(i===0?' ax':'')+'" style="stroke-width:'+u+'" x1="'+(-MAPR)+'" y1="'+v+'" x2="'+MAPR+'" y2="'+v+'"/>';}
  g+='<rect x="'+(-MAPR)+'" y="'+(-MAPR)+'" width="'+(2*MAPR)+'" height="'+(2*MAPR)+'" class="mborder" style="stroke-width:'+(2*u)+';stroke-dasharray:'+(8*u)+' '+(5*u)+'"/>';
  g+='<text class="mlab" x="0" y="'+(-MAPR-2*u)+'" style="font-size:'+(10*u)+'px">N</text>';
  var sp=d.spawn||{x:0,z:0};
  g+='<g transform="translate('+sp.x+' '+sp.z+')"><g class="mk k-spawn" data-i="spawn" tabindex="0"><title>Spawn</title><circle r="'+(mr*1.15)+'" style="stroke-width:'+(1.5*u)+'"/><text style="font-size:'+(12*u)+'px" dy=".35em">&#9733;</text></g></g>';
  shown.forEach(function(x,i){
    var k=placeKind(x),px=Math.max(-MAPR,Math.min(MAPR,x.x)),pz=Math.max(-MAPR,Math.min(MAPR,x.z));
    g+='<g transform="translate('+px+' '+pz+')"><g class="mk k-'+k+'" data-i="'+i+'" tabindex="0"><title>'+esc(x.name)+'</title><circle r="'+mr+'" style="stroke-width:'+(1.5*u)+'"/><text style="font-size:'+(10*u)+'px" dy=".35em">'+(k==='boss'?'&#9760;':k==='quest'?'!':'')+'</text></g></g>';
  });
  g+='</svg>';
  c.innerHTML=g;
  var api=makeBoard(b,c,{min:1,max:8,onzoom:function(s){c.style.setProperty('--ms',String(1/Math.sqrt(s)));}});api.fit=api.reset;wireTools(api);
  var info=document.getElementById('mapinfo');
  function show(key){
    [].forEach.call(c.querySelectorAll('.mk.sel'),function(m){m.classList.remove('sel');});
    var m=c.querySelector('.mk[data-i="'+key+'"]');if(m)m.classList.add('sel');
    if(key==='spawn'){info.innerHTML='<h3>Spawn</h3><p style="margin:0">Where everyone starts, at about '+sp.x+', '+sp.z+'. The border is 5,000 blocks away in every direction.</p>';return;}
    var x=shown[+key];if(!x)return;var s=BY['struct/'+x.id],k=placeKind(x);
    info.innerHTML='<h3>'+esc(x.name)+'</h3><p style="margin:0 0 6px"><span class="chip">'+KINDN[k]+'</span></p>'+
      '<p style="margin:0 0 6px">'+(x.by?(x.first?'First found by ':'Found by ')+plink(x.by)+(x.at&&x.first?' &middot; '+ago(x.at):''):'Found by a player')+'</p>'+
      '<p style="margin:0 0 10px">About <b>'+x.x+', '+x.z+'</b> (x, z).</p>'+(s?'<a class="btn sm" href="#'+s.r+'">What is in there?</a>':'');
  }
  c.addEventListener('click',function(e){var m=e.target.closest('.mk');if(m)show(m.getAttribute('data-i'));});
  c.addEventListener('keydown',function(e){var m=e.target.closest('.mk');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();show(m.getAttribute('data-i'));}});
  if(window.matchMedia('(hover:hover)').matches)c.addEventListener('mouseover',function(e){var m=e.target.closest('.mk');if(m)show(m.getAttribute('data-i'));});
  // filter + lists
  var names=Object.keys(finders).sort();
  document.getElementById('mapfilter').innerHTML='<h3>Found by</h3>'+(offline?'<p class="note" style="margin:0">The map fills in when the server starts sending its numbers.</p>':
    '<div class="filters" style="margin:0"><a class="fbtn'+(who?'':' on')+'" href="#map">Everyone ('+all.length+')</a>'+names.map(function(n){return '<a class="fbtn'+(n===who?' on':'')+'" href="#map/'+encodeURIComponent(n)+'">'+esc(n)+' ('+finders[n]+')</a>';}).join('')+'</div>');
  var other=who?all.filter(function(x){return x.by===who;}):all;
  function rows(list,dim){return list.filter(function(x){return x.dim===dim;}).map(function(x){var s=BY['struct/'+x.id];
    return '<tr><td>'+(s?'<a href="#'+s.r+'">'+esc(x.name)+'</a>':esc(x.name))+'</td><td>'+(x.by?plink(x.by):'')+'</td><td class="num">'+x.x+', '+x.z+'</td></tr>';}).join('');}
  var lh='';
  [['overworld','In the Overworld'],['nether','In the Nether'],['end','In the End']].forEach(function(dd){var r=rows(other,dd[0]);
    if(r)lh+='<div class="panel"><h3>'+dd[1]+'</h3><div class="tblw"><table class="ptab"><tr><th>Place</th><th>Found by</th><th>About (x, z)</th></tr>'+r+'</table></div>'+(dd[0]!=='overworld'?'<p class="note" style="margin:8px 0 0">The map only draws the Overworld.</p>':'')+'</div>';});
  document.getElementById('maplist').innerHTML='<h2>All places found'+(who?' by '+esc(who):'')+'</h2>'+(lh||'<p class="note">No places found yet. Walk into a ruin, tower or camp and it shows up here within a minute.</p>');
}

var LIST={top:pTop,player:pPlayer,map:pMap,next:pNext,progression:pProgression,guide:pGuide,start:pStart,weapons:pWeapons,armor:pArmor,tools:pTools,materials:pMaterials,creatures:pCreatures,bosses:pBosses,worldbosses:pWB,structures:pStructs,systems:pSystems,mythics:pMythics};
var DET={item:pItem,secret:pItem,set:pSet,mat:pMat,ore:pOre,mob:pMob,boss:pBoss,wboss:pWBoss,struct:pStruct,sys:pSys};
var SEC={item:null,secret:'weapons',set:'armor',mat:'materials',ore:'materials',mob:'creatures',boss:'bosses',wboss:'worldbosses',struct:'structures',sys:'systems'};
function route(){
  var h=decodeURIComponent(location.hash.replace(/^#\/?/,''))||'start';
  var parts=h.split('/'),sec=parts[0];
  if(sec!=='search'&&document.activeElement!==q)q.value='';
  if(sec==='search'){var term=parts.slice(1).join('/');q.value=term;var hs=searchHits(term.toLowerCase(),400);
    app.innerHTML=head('Search: '+esc(term),hs.length+' results')+'<div class="sres on" style="position:static;max-height:none;margin-top:16px">'+hs.map(hitHtml).join('')+'</div>';sec='';}
  else if(LIST[sec]&&(parts.length===1||sec==='progression'||sec==='next'||sec==='map'||(sec==='player'&&parts[1]))){LIST[sec](parts);if(sec==='player'){document.title=parts.slice(1).join('/')+' - Eventyr Wiki';sec='top';[].forEach.call(nav.querySelectorAll('a'),function(a){a.classList.toggle('on',a.getAttribute('data-s')==='top');});window.scrollTo(0,0);return;}}
  else if(DET[sec]&&BY[h]){DET[sec](BY[h]);var e=BY[h];sec=SEC[sec]||(e.myth?'mythics':e.cat);}
  else{app.innerHTML='<div class="empty"><h2>Not found</h2><p>That page does not exist. <a href="#start">Back to start</a></p></div>';sec='';}
  var t=BY[h]?BY[h].name:(NAV.filter(function(n){return n[0]===sec;})[0]||['',''])[1];
  document.title=(t&&h!=='start'?t+' - ':'')+'Eventyr Wiki';
  [].forEach.call(nav.querySelectorAll('a'),function(a){a.classList.toggle('on',a.getAttribute('data-s')===sec);});
  var on=nav.querySelector('a.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest',inline:'center'});
  window.scrollTo(0,0);
  fillHolders();
}
var HOLD=null,HOLDAT=0;
function fillHolders(){
  var els=app.querySelectorAll('.holder');if(!els.length)return;
  function put(){[].forEach.call(app.querySelectorAll('.holder'),function(el){var n=HOLD&&HOLD.h?HOLD.h[el.getAttribute('data-m')]:null;el.textContent=HOLD?(n||'Nobody yet - still out in the world'):'unknown right now';});
    var u=app.querySelector('.holdupd');if(u&&HOLD&&HOLD.updated)u.textContent='Updated '+new Date(HOLD.updated).toLocaleString()+'. Refreshes about every 10 minutes.';}
  if(HOLD&&Date.now()-HOLDAT<60000){put();return;}
  fetch('holders.json?'+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(j){HOLD=j;HOLDAT=Date.now();put();}).catch(function(){put();});
}
window.addEventListener('hashchange',route);
route();
})();
