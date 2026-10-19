"use strict";


/* ---------- constants ---------- */
const CATS=['Groceries','Restaurants & cafés','Delivery','Utilities & home bills','Insurance','Transport & car','Health & pharmacy','Kids & baby','Pets','Shopping & personal care','Home & furniture','Subscriptions & digital','Fitness & sport','Travel','Leisure & events','Lottery','Donations','Fees','Other & transfers','Unclear'];
const PAL=['#2E9E6B','#E8697A','#E59A2F','#4C8DF0','#C94A5E','#9466D1','#D9B21F','#3C7F5E','#2A86B8','#D861A8','#86B83A','#6D55C2','#5BB8DE','#A34560','#E07A45','#7E4F8F','#43AFA8','#B9A54A','#3F5E9E','#A7AEB8'];
const inkOn=h=>{const n=parseInt(h.slice(1),16);const r=n>>16,g=n>>8&255,b=n&255;return (0.299*r+0.587*g+0.114*b)>186?'#323338':'#FFFFFF'};
const catPill=c=>`<span class="cat"><i style="background:${catColor(c)}"></i>${esc(CL(c))}</span>`;
const CL=c=>(S&&S.meta&&S.meta.catLabels&&S.meta.catLabels[c])||c;
function applyExtraCats(){(S.meta.extraCats||[]).forEach(c=>{if(!CATS.includes(c))CATS.splice(CATS.indexOf('Unclear'),0,c)})}
const catColor=c=>PAL[Math.max(0,CATS.indexOf(c))%PAL.length];
const TYPES={regular:'Regular',installment:'Installment',standing:'Standing order',refund:'Refund',foreign:'Foreign currency'};
const FIXED_CATS=['Utilities & home bills','Insurance','Subscriptions & digital','Fees','Donations'];
const NORM=[['Super Yuda','סופר יודה|סופר יהודה'],['Nitzat HaDuvdevan','ניצת הדובדבן'],['AM:PM','AMPM|AM PM|AM-PM|AM:PM|אי\\.אם\\.פי\\.אם'],['Super Pharm','סופר פארם|סופר-פארם'],['Be Drugstores','דראגסטורס'],['Arnona Tel Aviv','ע\\.ת\\.א|עיריית תל אביב'],['Electra Power','אלקטרה'],['IKEA','IKEA|איקאה'],['Mifal HaPais','פיס|ראלי וויס'],['Phoenix','הפניקס'],['Bituach Yashir','ביטוח ישיר'],['Migdal','מגדל ב|מגדל רכב'],['Super Dmati','דמתי'],['Cellcom','סלקום'],['Wolt','^WOLT|^Wolt$|WOLT\\b'],['Kosher Yarkon gym','כושר ירקון'],['El Al','ELAL'],['Netflix','NETFLIX|Netflix'],['Spotify','Spotify|SPOTIFY'],['LinkedIn Premium','LinkedIn|LINKEDIN'],['Apple','APPLE'],['Figma','FIGMA'],['ChatGPT','OPENAI'],['Google One','Google One'],['Maccabi','קרן מכבי'],['Harel health','הראל'],['Chatchos','צ.אצוס'],['La Pane','לה פנה'],['Good Boy Cafe','גוד בוי'],['Hook House of Coffee','הוק האוס'],['Shilav','שילב'],['Zara','זארה|ZARA'],['KSP','KSP|קיי אס פי'],['AliExpress','aliexpress|ALIEXPRESS'],['Rav Pass','רב-פס'],['Hili Laniado (nails)','הילי לניאדו'],['Gilligoli','גיליגולי'],['Building committee','ועד בית'],['Mei Avivim','מי אביבים'],['Golan Telecom','גולן'],['Carrefour','CARREFOUR'],['Rami Levy','רמי לוי'],['Nourish','נוריש|NORISH'],['Anitche',"אניצ'ה|אניצ׳ה"],['Cafe Alma','קפה עלמה'],['Vegantino','ויגנטינו'],['Auto Tel parking','אוטו-תל'],['Lime','LIME\\*'],['Amazon','AMAZON'],['iHerb','IHERB'],['Next','NEXT ONLINE|ONLINE NEXT'],['Bituach Yashir','ישיר'],['Hiyuta pet insurance','חיותא'],['Drachim towing','דרכים'],['Brimag','ברימאג'],['Cut The Bullshit barber','TIHSLLUB'],['Backstage Studio','OIDUTS EGATSKCAB'],['Coffee Express','sserpxE eeffoC'],['Gan Peirot','גן פירות']].map(([n,p])=>[n,new RegExp(p)]);
const DEFAULT_CAT=[
['Fees','דמי כרטיס|ריבית|עמלת'],['Lottery','פיס|ראלי וויס|לוטו'],['Donations','VEGAN ACTIVE|תרומה'],
['Utilities & home bills','ע\\.ת\\.א|עיריית|ארנונה|אלקטרה|חברת החשמל|חשמל|אמישר|גולן טלקום|סלקום|פרטנר|הוט |בזק|^YES$|מי אביבים|ועד בית|מים |אבידר'],
['Insurance','ביטוח|הפניקס|חיותא|מגדל|קרן מכבי|הראל|כללית|מאוחדת|לאומית|כלל |מנורה|פספורטקארד'],
['Subscriptions & digital','APPLE|NETFLIX|Netflix|Spotify|SPOTIFY|DISNEY|FIGMA|FRAMER|LinkedIn|LINKEDIN|OPENAI|ANTHROPIC|Google|KOBO|YOUTUBE|DISNEY|Microsoft|ADOBE'],
['Delivery','WOLT|Wolt|10bis|תן ביס|cibus'],
['Pets','וטרנר|זו קלאב|ג\'אנגו|ספידוג|דמתי|פנסיון הום פט|הגיבורים של יוגב|חיות'],
['Kids & baby','BabyOne|KIDS|אנ דנ דינו|גיליגולי|שילב|אינטרסן|צעצוע|טויס'],
['Travel','ELAL|אל על|Booking|AIRBNB|Airbnb|HOTEL|Hotel|מלונות|AIRALO|Sixt|ASFINAG|Bergbahnen|ISRAIR|ארקיע|WIZZ|RYANAIR'],
['Transport & car','דלק|סונול|פז |דור אלון|תדלוק|רב-פס|רשיונות|דרכים|חניון|חניונים|פנגו|אחוזת|אחוזות|Gett|אוטו-תל|LIME|BIRD|מוביט'],
['Health & pharmacy','פארם|פראם|דראגסטורס|איכילוב|xray|אופטיקה|IHERB|טבע שופס|מרפאה|רופא'],
['Groceries','סופר|AMPM|AM PM|AM-PM|ניצת הדובדבן|גן פירות|ויקטורי|רמי לוי|CARREFOUR|שופרסל|טיב טעם|נאטסטיישן|יוספוב|ארתור|מינימרקט|אבולעפיה|ויגנטינו|פירות וירקות|החישוק|חסיד הירק|יקב'],
['Home & furniture','IKEA|איקאה|הום סנטר|ACE|אייס|זול סטוק|ברימאג|ריהוט|HOME\\.COM'],
['Shopping & personal care','זארה|ZARA|H&M|קסטרו|הודיס|NEXT|SHEIN|aliexpress|AMAZON|KSP|קיי אס פי|נעמן|הילי לניאדו|BROW|TIHSLLUB|מספרה|ציפורניים|גוד פארם'],
['Fitness & sport','כושר|ספייס|קאנטרי|יוגה|פילאטיס|GYM|HOLMES'],
['Leisure & events','קולנוע|סינמה|איוונטר|כרטיסים|מוזיאון|צומת ספרים|סטימצקי|הופעה'],
['Restaurants & cafés','קפה|CAFE|Cafe|COFFEE|Coffee|מסעדה|בייקרי|לה פנה|ביסטרו|בר |פיצה|סושי|שווארמה|פלאפל|גלידה']
].map(([c,p])=>[c,new RegExp(p)]);
const SECTOR_MAP=[[/מסעדות|מזון מהיר/,'Restaurants & cafés'],[/מזון|משקא/,'Groceries'],[/רפואה|מרקחת/,'Health & pharmacy'],[/ביטוח/,'Insurance'],[/אופנה|קוסמטיקה|טיפוח/,'Shopping & personal care'],[/ילדים|חינוך/,'Kids & baby'],[/חיות/,'Pets'],[/תיירות|מלונאות|טיסות/,'Travel'],[/דלק|אנרגיה|תחבורה|רכב/,'Transport & car'],[/שירותי תקשורת/,'Utilities & home bills'],[/תקשורת ומח|חשמל ומחשבים|בתי כלבו/,'Shopping & personal care'],[/עיצוב הבית|ריהוט|ביתי/,'Home & furniture'],[/פנאי|בילוי|ספורט/,'Leisure & events'],[/עירייה|ממשלה/,'Utilities & home bills']];
const DEFAULT_META={v:3,startMonth:'2026-06',people:['Raphael','Shiraz'],
 cards:{'5058':{issuer:'Cal Diners',person:'Raphael'},'1798':{issuer:'Max',person:'Raphael'},'4722':{issuer:'Max',person:'Raphael'},'4943':{issuer:'Max',person:'Raphael'},'5041':{issuer:'Cal Diners Fly Card',person:'Shiraz'},'Leumi':{issuer:'Leumi bank card',person:'Shiraz'}},
 budgets:{'Groceries':2800,'Restaurants & cafés':1400,'Delivery':240,'Utilities & home bills':2350,'Insurance':1750,'Transport & car':1100,'Health & pharmacy':1250,'Kids & baby':1050,'Pets':600,'Shopping & personal care':1100,'Home & furniture':350,'Subscriptions & digital':600,'Fitness & sport':300,'Travel':1000,'Leisure & events':300,'Lottery':60,'Donations':35,'Fees':50,'Other & transfers':300},
 thresholds:{catPct:25,catMin:200,storePct:50,ticketX:3,large:1000,budgetWarn:80},
 rules:{},alertState:{},templates:{},presets:[],theme:'light',catLabels:{},extraCats:[]};

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const r2=x=>Math.round(x*100)/100;
const ils=(x,dec)=>{if(x==null||isNaN(x))return '';const neg=x<0;const v=Math.abs(x);const d=dec??(v<100&&v%1?2:0);return (neg?'−':'')+'₪'+v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})};
const pct=x=>(x>0?'+':'')+Math.round(x)+'%';
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const mLabel=m=>{const[y,mm]=m.split('-');return MN[+mm-1]+' '+y.slice(2)};
const mLong=m=>{const[y,mm]=m.split('-');return ['January','February','March','April','May','June','July','August','September','October','November','December'][+mm-1]+' '+y};
const addM=(m,k)=>{let[y,mm]=m.split('-').map(Number);mm+=k;while(mm>12){mm-=12;y++}while(mm<1){mm+=12;y--}return y+'-'+String(mm).padStart(2,'0')};
const mRange=(a,b)=>{const o=[];let m=a;while(m<=b&&o.length<240){o.push(m);m=addM(m,1)}return o};
const sum=a=>a.reduce((s,x)=>s+x,0);
const median=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);const h=s.length>>1;return s.length%2?s[h]:(s[h-1]+s[h])/2};
const todayISO=()=>new Date().toISOString().slice(0,10);
function toast(t,ms=3200){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),ms)}
function normName(m){for(const[n,re]of NORM)if(re.test(m))return n;return m.replace(/\s+/g,' ').trim()}

/* ---------- state ---------- */
const S={rows:[],bank:[],bankMonth:null,cf:{spread:false,future:false},meta:structuredClone(DEFAULT_META),view:'overview',month:null,F:null,db:null,uid:null,sample:null,downloads:null,store:'local',charts:{},drill:null,storeSel:null,chat:[],lastFilter:null,limits:null,pdfReady:null};
const DIRTY=new Set();
const SHARED='household/ledger';
function statusText(){return 'Encrypted in your Google Drive'}

/* ---------- storage ---------- */
async function boot(){
  applyTheme();
  const use=n=>(window.claude&&window.claude.use)?window.claude.use(n).catch(()=>null):Promise.resolve(null);
  try{
    const [db,user]=await Promise.all([use('db'),use('user')]);
    if(db&&user){S.uid=await user.id().catch(()=>null)}
    if(db&&S.uid){
      S.db=db;S.store='cloud';
      const base=db.doc(SHARED);
      const [ms,qs]=await Promise.all([base.get(),base.collection('tx').get()]);
      if(ms.exists)S.meta=mergeMeta(JSON.parse(JSON.stringify(ms.data())));
      const rows=[];qs.docs.forEach(d=>{const b=d.data();if(b&&Array.isArray(b.rows))rows.push(...JSON.parse(JSON.stringify(b.rows)))});
      S.rows=rows;
      try{const bq=await base.collection('bank').get();const br=[];bq.docs.forEach(d=>{const b=d.data();if(b&&Array.isArray(b.rows))br.push(...JSON.parse(JSON.stringify(b.rows)))});br.forEach(r=>{if(LEGACY_BCAT[r.c])r.c=LEGACY_BCAT[r.c]});S.bank=br;if(br.length)S.view='cashflow'}catch(e){}
      if(!rows.length){
        // one time move from the old private space into the shared household space
        try{const old=db.doc('data/users/'+S.uid+'/ledger');const [om,oq]=await Promise.all([old.get(),old.collection('tx').get()]);
          const orows=[];oq.docs.forEach(d=>{const b=d.data();if(b&&Array.isArray(b.rows))orows.push(...JSON.parse(JSON.stringify(b.rows)))});
          if(orows.length){if(om.exists)S.meta=mergeMeta(JSON.parse(JSON.stringify(om.data())));S.rows=orows;await saveMonths([...new Set(orows.map(r=>r.m))]);saveMeta()}
        }catch(e){}
      }
      try{S.canWrite=user.can?await user.can('data.write'):null}catch(e){S.canWrite=null}
      const fix=restoreEdits();if(fix.length)setTimeout(()=>saveMonths(fix),500);
    }else{
      S.store='local';
      try{const m=localStorage.getItem('hl_meta');if(m)S.meta=mergeMeta(JSON.parse(m));const r=localStorage.getItem('hl_rows');if(r)S.rows=JSON.parse(r);const bk=localStorage.getItem('hl_bank');if(bk){S.bank=JSON.parse(bk);if(S.bank.length)S.view='cashflow'}}catch(e){}
    }
  }catch(e){console.error(e);S.store='local'}
  applyExtraCats();
  $('#storeStatus').textContent=statusText();
  applyTheme();
  initFilters();
  renderAll();
  use('sample').then(s=>{S.sample=s;if(s&&s.limits)s.limits().then(l=>{S.limits=l}).catch(()=>{});if(S.view==='ask'||S.view==='inbox')renderMain()});
  use('downloads').then(d=>{S.downloads=d;renderMain()});
}
function mergeMeta(m){if(m&&(!m.v||m.v<2)){m=Object.assign({},m,{v:2,theme:'light'})}if(m&&m.v<3){m=Object.assign({},m,{v:3,startMonth:'2026-06'})}const d=structuredClone(DEFAULT_META);const o=Object.assign(d,m||{});for(const k of['cards','budgets','thresholds','rules','alertState','templates','catLabels'])o[k]=Object.assign({},DEFAULT_META[k],(m||{})[k]||{});o.people=(m&&m.people)||d.people;return o}
let metaTimer=null;
function saveMeta(){clearTimeout(metaTimer);metaTimer=setTimeout(async()=>{
  if(S.store==='cloud'){try{await S.db.doc(SHARED).set(JSON.parse(JSON.stringify(S.meta)))}catch(e){setStatus('Settings not saved ('+(e.code||e.message)+')',true);toast('Settings could not be saved: '+(e.code||e.message))}try{localStorage.setItem('hl_meta',JSON.stringify(S.meta))}catch(e){}}
  else{try{localStorage.setItem('hl_meta',JSON.stringify(S.meta))}catch(e){}}
},600)}
let saving=Promise.resolve();
function setStatus(t,bad){const el=$('#storeStatus');if(el){el.textContent=t;el.style.color=bad?'var(--red)':''}}
function idleStatus(){setStatus(statusText())}
function backupEdits(){try{const ed={};for(const r of S.rows)if(r.cm||r.cx)ed[r.id]={c:r.c,cm:r.cm||'',cx:!!r.cx};localStorage.setItem('hl_edits',JSON.stringify(ed))}catch(e){}}
function restoreEdits(){let ed;try{ed=JSON.parse(localStorage.getItem('hl_edits')||'{}')}catch(e){ed={}}const ms=new Set();for(const r of S.rows){const e=ed[r.id];if(!e)continue;if((r.cm||'')!==e.cm||r.c!==e.c||!!r.cx!==e.cx){r.c=e.c;if(e.cm)r.cm=e.cm;else delete r.cm;if(e.cx)r.cx=true;ms.add(r.m)}}return[...ms]}
async function writeMonth(base,m){
  const rows=S.rows.filter(r=>r.m===m);const body={month:m,rows:JSON.parse(JSON.stringify(rows))};
  for(let attempt=0;attempt<2;attempt++){
    try{const op=rows.length?base.doc(m).set(body):base.doc(m).delete();await Promise.race([op,new Promise((_,rej)=>setTimeout(()=>rej({code:'timeout'}),15000))]);return true}
    catch(e){const code=(e&&(e.code||e.message))||'error';if(code==='unavailable'||code==='resource_exhausted'){await new Promise(r=>setTimeout(r,800+Math.random()*700));continue}throw Object.assign(new Error(code),{code})}
  }
  throw Object.assign(new Error('unavailable'),{code:'unavailable'});
}
function saveMonths(months){
  months.forEach(m=>DIRTY.add(m));backupEdits();
  saving=saving.catch(()=>{}).then(async()=>{
    const list=[...DIRTY];DIRTY.clear();if(!list.length)return true;
    if(S.store==='cloud'){
      setStatus('Saving…');let failed=null;
      const base=S.db.doc(SHARED).collection('tx');
      for(const m of list){try{await writeMonth(base,m)}catch(e){failed=e.code||e.message;DIRTY.add(m)}}
      if(failed){const why=failed==='conflict'?'the file was changed on another device. Reload the app to get the latest version, then redo your change':failed;setStatus(`Not saved (${why}). Your edits are kept on this device.`,true);toast(`Could not save (${why}). Your change is kept on this device and will be retried.`,6000);return false}
      idleStatus();return true;
    }else{try{localStorage.setItem('hl_rows',JSON.stringify(S.rows))}catch(e){toast('Browser storage is full');return false}idleStatus();return true}
  });
  return saving;
}
function applyTheme(){const t=S.meta.theme;if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme')}

/* ---------- classification ---------- */
function histCat(nn){
  if(!S._hist){S._hist={};for(const r of S.rows){if(r.c==='Unclear')continue;(S._hist[r.nn]||(S._hist[r.nn]={}))[r.c]=((S._hist[r.nn]||{})[r.c]||0)+1}}
  const h=S._hist[nn];if(!h)return null;return Object.entries(h).sort((a,b)=>b[1]-a[1])[0][0];
}
function classify(raw){
  // raw: {date,merchant,amount,oa,oc,type?,inst?,bill?,sector?,note?,card,person,issuer}
  const r={d:raw.date,n:String(raw.merchant||'').trim(),a:r2(+raw.amount),k:String(raw.card||'?'),p:raw.person||'',is:raw.issuer||''};
  if(raw.bill)r.b=raw.bill; if(raw.sector)r.s=raw.sector; if(raw.note)r.no=raw.note;
  const note=(raw.note||'')+' '+(raw.type||'');
  const im=note.match(/תשלום\s*(\d+)\s*מתוך\s*(\d+)/)||String(raw.inst||'').match(/(\d+)\s*\/\s*(\d+)/);
  let t=raw.type&&TYPES[raw.type]?raw.type:null;
  if(!t){t=im||/תשלומים/.test(note)?'installment':/הוראת קבע|standing/i.test(note)?'standing':(r.a<0||/זיכוי|ביטול|refund/i.test(note))?'refund':'regular'}
  if(t==='foreign')t='regular';
  r.t=t; if(im)r.i=im[1]+'/'+im[2];
  if(t==='installment'&&raw.bill){r.m=addM(raw.bill.slice(0,7),-1)}else r.m=r.d.slice(0,7);
  if(raw.bill&&raw.bill>todayISO())r.f=true;
  r.nn=normName(r.n);
  const oc=raw.oc&&String(raw.oc).toUpperCase();
  if(oc&&!['ILS','₪','NIS'].includes(oc)){r.oc=oc;if(raw.oa!=null)r.oa=r2(+raw.oa);r.fx=r2(Math.abs(r.a)*0.025)}
  else if(/חו"ל|חו״ל/.test(note)){r.oc='ILS'}
  if(/כספומט|ATM|משיכת מזומן|cash withdrawal/i.test(r.n+' '+note))r.x=true;
  // category
  let c=S.meta.rules[r.nn]||S.meta.rules[r.n]||histCat(r.nn);
  if(!c){for(const[cc,re]of DEFAULT_CAT)if(re.test(r.n)){c=cc;break}}
  if(!c&&raw.sector){for(const[re,cc]of SECTOR_MAP)if(re.test(raw.sector)){c=cc;break}}
  if(r.nn==='Wolt'&&r.a>0&&r.a<35){r.nn='Wolt+';c='Subscriptions & digital'}
  r.c=c||'Unclear';
  return r;
}
function assignIds(rows){const seen={};for(const r of rows){const base=[r.k,r.d,r.n,r.a.toFixed(2),r.i||''].join('|');seen[base]=(seen[base]||0);r.id=base+'|'+seen[base];seen[base]++}return rows}

/* ---------- filters ---------- */
const START=()=>S.meta.startMonth||'0000-00';
function allMonths(){return [...new Set(S.rows.filter(r=>!r.f).map(r=>r.m))].sort()}
function months(){return allMonths().filter(m=>m>=START())}
function initFilters(){const ms=months();const last=ms[ms.length-1]||todayISO().slice(0,7);
  S.F={exTravel:false,from:ms.length?addM(last,-13)<ms[0]?ms[0]:addM(last,-13):last,to:last,person:[],card:[],cat:[],store:'',q:'',min:'',max:'',type:[]};
  // latest month with meaningful data (skip a tiny partial month)
  let pick=last;const tot=m=>sum(S.rows.filter(r=>r.m===m&&!r.f).map(r=>r.a));
  if(ms.length>1&&tot(last)<0.25*tot(ms[ms.length-2]))pick=ms[ms.length-2];
  S.month=pick;
}
function passFilter(r,F,ignoreDate){
  if(r.f)return false;
  if(cardHidden(r.k))return false;
  if(r.m<START())return false;
  if(!ignoreDate&&(r.m<F.from||r.m>F.to))return false;
  if(F.person.length&&!F.person.includes(cardPerson(r)))return false;
  if(F.card.length&&!F.card.includes(r.k))return false;
  if(F.exTravel&&r.c==='Travel')return false;
  if(F.cat.length&&!F.cat.includes(r.c))return false;
  if(F.store&&r.nn!==F.store)return false;
  if(F.q){const q=F.q.toLowerCase();if(!(r.n.toLowerCase().includes(q)||r.nn.toLowerCase().includes(q)||(r.c||'').toLowerCase().includes(q)||(r.cm||'').toLowerCase().includes(q)))return false}
  if(F.min!==''&&r.a<+F.min)return false;
  if(F.max!==''&&r.a>+F.max)return false;
  if(F.type.length){const ok=F.type.some(t=>t==='foreign'?!!r.oc:r.t===t);if(!ok)return false}
  return true;
}
const cardHidden=k=>!!(S.meta.cards[k]&&S.meta.cards[k].hidden);
function cardPerson(r){return (S.meta.cards[r.k]&&S.meta.cards[r.k].person)||r.p||'Unknown'}
function FR(ignoreDate){return S.rows.filter(r=>passFilter(r,S.F,ignoreDate))}
function inMonth(m,rows){return rows.filter(r=>r.m===m)}
function groupSum(rows,key){const o={};for(const r of rows){const k=typeof key==='function'?key(r):r[key];o[k]=(o[k]||0)+r.a}return o}

/* ---------- recurring detection ---------- */
function detectRecurring(){
  const all=S.rows.filter(r=>!r.f&&r.a>0&&r.m>=START()&&!cardHidden(r.k));const ms=months();if(!ms.length)return[];
  const last=S.month||ms[ms.length-1];const win=mRange(addM(last,-5),last);
  const by={};for(const r of all){(by[r.nn]||(by[r.nn]=[])).push(r)}
  const out=[];
  for(const[nn,rs]of Object.entries(by)){
    const c=rs[rs.length-1].c;
    const inWin=rs.filter(r=>win.includes(r.m));const mset=[...new Set(inWin.map(r=>r.m))];
    const standing=rs.some(r=>r.t==='standing');const subs=['Subscriptions & digital','Insurance','Utilities & home bills','Fitness & sport'].includes(c);
    const freqCats=['Groceries','Restaurants & cafés','Delivery','Health & pharmacy','Shopping & personal care','Transport & car','Travel','Home & furniture','Unclear','Lottery'];
    if(mset.length<2)continue;
    const mt=win.map(m=>sum(inWin.filter(r=>r.m===m).map(r=>r.a)));
    const present=mt.filter(x=>x>0);const avgP=sum(present)/present.length;
    const sd=Math.sqrt(sum(present.map(x=>(x-avgP)**2))/present.length);const cv=avgP?sd/avgP:9;
    const ok=(standing&&mset.length>=2)||(subs&&mset.length>=2)||(!freqCats.includes(c)&&mset.length>=3&&cv<0.4)||(c==='Kids & baby'&&mset.length>=2&&cv<0.4)||(c==='Lottery'&&standing);
    if(!ok)continue;
    const sortedM=[...new Set(rs.map(r=>r.m))].sort();
    const lastM=sortedM.filter(m=>m<=last).pop();const prevM=sortedM.filter(m=>m<lastM).pop();
    const lastAmt=sum(rs.filter(r=>r.m===lastM).map(r=>r.a));const prevAmt=prevM?sum(rs.filter(r=>r.m===prevM).map(r=>r.a)):null;
    const monthly=sum(mt)/win.length;
    const cards=[...new Set(rs.filter(r=>r.m===lastM).map(r=>r.k))];
    const gap=lastM<last&&mset.length>=2&&lastM>=addM(last,-2);
    const dupCards=cards.length>1;
    out.push({nn,c,monthly,yearly:monthly*12,lastAmt,prevAmt,change:prevAmt?((lastAmt-prevAmt)/prevAmt*100):null,lastM,cards,persons:[...new Set(rs.map(cardPerson))],status:(()=>{const sm=mset.sort();const diffs=sm.slice(1).map((m,i)=>mRange(sm[i],m).length-1);const bi=diffs.length&&diffs.every(d=>d===2);if(lastM===last)return bi?'Every 2 months':'Active';if(bi&&lastM===addM(last,-1))return 'Every 2 months';return gap?'Missing this month':'Stopped'})(),dup:dupCards,count:mset.length});
  }
  return out.sort((a,b)=>b.monthly-a.monthly);
}

/* ---------- installments ---------- */
function upcoming(){
  const plans={};
  for(const r of S.rows){if(!r.i||cardHidden(r.k))continue;const[k,N]=r.i.split('/').map(Number);const key=[r.k,r.n,r.d,N].join('|');const p=plans[key]||(plans[key]={k:r.k,n:r.nn,c:r.c,N,amt:r.a,rows:[]});p.rows.push({k,m:r.m,f:!!r.f,a:r.a})}
  const out=[];
  for(const p of Object.values(plans)){
    const maxRow=p.rows.reduce((a,b)=>b.k>a.k?b:a);
    p.rows.filter(x=>x.f).forEach(x=>out.push({m:x.m,n:p.n,k:p.k,a:x.a,no:x.k+'/'+p.N,c:p.c}));
    for(let j=maxRow.k+1;j<=p.N;j++){out.push({m:addM(maxRow.m,j-maxRow.k),n:p.n,k:p.k,a:maxRow.a,no:j+'/'+p.N,c:p.c})}
  }
  return out.sort((a,b)=>a.m.localeCompare(b.m)||b.a-a.a);
}



/* ---------- alerts ---------- */
function computeAlerts(M){
  const T=S.meta.thresholds;const out=[];
  const base=S.rows.filter(r=>!r.f&&passFilter(r,{...S.F,from:'0000',to:'9999'},true));
  const cur=base.filter(r=>r.m===M);if(!cur.length)return out;
  const hist=mRange(addM(M,-6),addM(M,-1));const allMs=months();const histMs=hist.filter(m=>allMs.includes(m));
  const H=base.filter(r=>hist.includes(r.m));
  const add=(type,subject,sev,title,detail,filter,monthly)=>out.push({key:type+'|'+subject+(monthly?'|'+M:''),type,sev,title,detail,filter,M});
  // 1 category spike
  if(histMs.length>=3){
    const cc=groupSum(cur,'c');const hc=groupSum(H,'c');
    for(const[c,v]of Object.entries(cc)){const avg=(hc[c]||0)/histMs.length;
      if(c==='Unclear')continue;
      if(v>avg*(1+T.catPct/100)&&v-avg>=T.catMin){if(avg<50)add('cat',c,'med',`${CL(c)}: ${ils(v)} this month`,`Almost nothing was spent on ${CL(c)} in the previous ${histMs.length} months.`,{cat:[c]});else add('cat',c,v>avg*2?'high':'med',`${CL(c)} is ${pct((v-avg)/avg*100)} above usual`,`${ils(v)} this month vs ${ils(avg)} average over the last ${histMs.length} months.`,{cat:[c]})}}
  }
  // 2 store spike + big ticket
  const cs=groupSum(cur,'nn');const spikes=[];
  for(const[nn,v]of Object.entries(cs)){
    const hr=H.filter(r=>r.nn===nn);const hm=[...new Set(hr.map(r=>r.m))];
    if(hm.length>=2){const usual=sum(hr.map(r=>r.a))/hm.length;if(v>usual*(1+T.storePct/100)&&v-usual>=100&&v>=150){spikes.push({nn,v,usual});continue}}
    if(hr.length>=3){const avgT=sum(hr.map(r=>r.a))/hr.length;for(const r of cur.filter(x=>x.nn===nn))if(r.a>=150&&r.a>avgT*T.ticketX)add('ticket',nn+'|'+r.id,'med',`Unusually large purchase at ${nn}`,`${ils(r.a)} on ${r.d} vs a usual ticket of ${ils(avgT)}.`,{store:nn})}
  }
  spikes.sort((a,b)=>(b.v-b.usual)-(a.v-a.usual)).slice(0,5).forEach(x=>add('store',x.nn,'med',`More than usual at ${x.nn}`,`${ils(x.v)} this month vs ${ils(x.usual)} in a typical month.`,{store:x.nn}));
  // recurring based alerts
  const rec=detectRecurring();
  for(const x of rec){
    const inCur=cur.filter(r=>r.nn===x.nn);const curAmt=sum(inCur.map(r=>r.a));
    const prevM=[...new Set(base.filter(r=>r.nn===x.nn&&r.m<M).map(r=>r.m))].sort().pop();
    const prevAmt=prevM?sum(base.filter(r=>r.nn===x.nn&&r.m===prevM).map(r=>r.a)):0;
    if(inCur.length&&prevAmt>0&&curAmt>prevAmt*1.03&&curAmt-prevAmt>=1&&['Subscriptions & digital','Insurance','Utilities & home bills','Fitness & sport','Kids & baby'].includes(x.c)&&!/Electra|Arnona|Mei Avivim/.test(x.nn))
      add('price',x.nn,'med',`${x.nn} costs more`,`${ils(curAmt,2)} this month vs ${ils(prevAmt,2)} in ${mLabel(prevM)}.`,{store:x.nn});
    const cards=[...new Set(inCur.map(r=>r.k))];
    if(cards.length>1&&['Subscriptions & digital','Insurance'].includes(x.c))add('twocards',x.nn,'med',`${x.nn} billed on ${cards.length} cards`,`Charged on cards ${cards.join(', ')} in the same month. Check whether you pay twice.`,{store:x.nn});
    const before=mRange(addM(M,-3),addM(M,-1));const seenAll=before.every(m=>base.some(r=>r.nn===x.nn&&r.m===m));
    if(!inCur.length&&seenAll&&M===S.month)add('gap',x.nn,'info',`${x.nn} is missing this month`,`It was charged in each of the previous 3 months (about ${ils(x.monthly)} a month). Paid elsewhere, paused or cancelled?`,{store:x.nn});
  }
  // 4 new recurring
  if(histMs.length>=2)for(const r of cur){if((r.t==='standing'||r.c==='Subscriptions & digital')&&!base.some(o=>o.nn===r.nn&&o.m<M))add('new',r.nn,'info',`New recurring charge: ${r.nn}`,`${ils(r.a,2)} first charged on ${r.d}${r.t==='standing'?' as a standing order':''}.`,{store:r.nn})}
  // 5 duplicates same day
  const dk={};for(const r of cur){if(r.a<=0)continue;const k=r.nn+'|'+r.d+'|'+r.a;(dk[k]||(dk[k]=[])).push(r)}
  for(const[k,rs]of Object.entries(dk))if(rs.length>1&&(rs[0].t==='standing'||rs[0].a>=60))add('dup',k,'high',`Possible double charge at ${rs[0].nn}`,`${rs.length} charges of ${ils(rs[0].a,2)} on ${rs[0].d}.`,{store:rs[0].nn});
  // 6 large one off
  const recSet=new Set(rec.map(x=>x.nn));
  for(const r of cur)if(r.a>=T.large&&!['standing','installment'].includes(r.t)&&!recSet.has(r.nn))add('large',r.id,'med',`Large purchase: ${r.nn}`,`${ils(r.a)} on ${r.d} (${CL(r.c)}).`,{store:r.nn});
  // 7 fees
  const fx=cur.filter(r=>r.fx);if(fx.length)add('fx','fx','info',`Foreign currency fees about ${ils(sum(fx.map(r=>r.fx)),0)}`,`${fx.length} foreign charges totalling ${ils(sum(fx.map(r=>r.a)))}; the card adds about 2.5% to each.`,{type:['foreign']},true);
  const cash=cur.filter(r=>r.x);if(cash.length)add('cash','cash','info',`Cash withdrawal ${ils(sum(cash.map(r=>r.a)))}`,`Withdrawals by card usually carry a fee, abroad about 3%.`,{q:''},true);
  for(const r of cur)if(/ריבית|איחור|late|interest/i.test(r.n+' '+(r.no||''))&&r.a>0)add('interest',r.id,'high',`Interest or late charge`,`${r.n}: ${ils(r.a,2)} on ${r.d}.`,{store:r.nn});
  // 8 budget
  const bc=groupSum(cur,'c');const over=[],warn=[];
  for(const[c,b]of Object.entries(S.meta.budgets)){if(!b)continue;const v=bc[c]||0;const p=v/b*100;if(p>100.5)over.push({c,v,b,p});else if(p>=T.budgetWarn)warn.push({c,v,b,p})}
  if(over.length)add('budget100','month','high',over.length===1?`${CL(over[0].c)} is over budget`:`${over.length} categories over budget`,over.sort((a,b)=>(b.v-b.b)-(a.v-a.b)).map(x=>`${CL(x.c)} ${ils(x.v)} of ${ils(x.b)}`).join(', ')+'.',{cat:over.map(x=>x.c)},true);
  if(warn.length)add('budget80','month','info',`${warn.length} categor${warn.length>1?'ies':'y'} close to budget`,warn.map(x=>`${CL(x.c)} ${Math.round(x.p)}%`).join(', ')+'.',{cat:warn.map(x=>x.c)},true);
  const st=S.meta.alertState;
  out.forEach(a=>{a.state=st[a.key]||st[a.key+'|'+M]||'open'});
  const rank={high:0,med:1,info:2};
  return out.sort((a,b)=>rank[a.sev]-rank[b.sev]);
}
function openAlerts(M){return computeAlerts(M).filter(a=>a.state==='open')}

/* ---------- table component ---------- */
const TBL={};
function table(id,cols,rows,opts={}){
  const st=TBL[id]||(TBL[id]={key:opts.sort||null,dir:opts.dir||-1,limit:opts.limit||200});
  if(st.key){const col=cols.find(c=>c.k===st.key);if(col){const g=col.v||(r=>r[col.k]);rows=[...rows].sort((a,b)=>{const x=g(a),y=g(b);return (typeof x==='number'&&typeof y==='number'?x-y:String(x??'').localeCompare(String(y??'')))*st.dir})}}
  TBL[id].rows=rows;TBL[id].cols=cols;TBL[id].name=opts.name||id;
  const shown=rows.slice(0,st.limit);
  const head=cols.map(c=>`<th class="${c.r?'r':''} ${c.cls||''} ${st.key===c.k?'sorted':''}" data-sort="${id}|${c.k}">${esc(c.l)}${st.key===c.k?(st.dir>0?' ▲':' ▼'):''}</th>`).join('');
  const body=shown.map((r,i)=>`<tr class="${opts.click?'click':''}" data-row="${id}|${i}">${cols.map(c=>`<td class="${c.r?'r':''} ${c.cls||''} ${c.wrap?'wrap':''}" ${c.auto?'dir="auto"':''}>${c.h?c.h(r):esc(c.f?c.f(r[c.k],r):r[c.k])}</td>`).join('')}</tr>`).join('');
  const foot=opts.foot?`<tfoot><tr>${cols.map(c=>`<td class="${c.r?'r':''}">${opts.foot[c.k]!=null?esc(opts.foot[c.k]):''}</td>`).join('')}</tr></tfoot>`:'';
  const more=rows.length>shown.length?`<div class="foot" style="justify-content:center"><button class="btn sm" data-more="${id}">Show ${Math.min(200,rows.length-shown.length)} more of ${rows.length-shown.length}</button></div>`:'';
  const exp=S.downloads&&opts.export!==false?`<button class="btn sm" data-export="${id}">Export to Excel</button>`:'';
  return `<div class="tbar"><span class="status">${rows.length.toLocaleString()} rows</span>${exp}</div><div class="tw"><table><thead><tr>${head}</tr></thead><tbody>${body||`<tr><td colspan="${cols.length}" class="empty">Nothing matches these filters.</td></tr>`}</tbody>${foot}</table></div>${more}`;
}
async function exportTable(id){
  const t=TBL[id];if(!t||!S.downloads)return;
  const data=t.rows.map(r=>{const o={};for(const c of t.cols){const v=c.x?c.x(r):c.v?c.v(r):r[c.k];o[c.l]=v}return o});
  const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Data');
  const buf=XLSX.write(wb,{bookType:'xlsx',type:'array'});
  try{await S.downloads.save({filename:(t.name||id).replace(/[^\w\- ]+/g,'').trim()+'.xlsx',data:new Blob([buf])});toast('Saved')}
  catch(e){if(e.code!=='declined')toast('Export failed: '+(e.code||e.message))}
}

/* ---------- charts ---------- */
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim()}
function chart(id,cfg){
  if(S.charts[id]){S.charts[id].destroy();delete S.charts[id]}
  const el=document.getElementById(id);if(!el||!window.Chart)return;
  const ink=css('--muted'),line=css('--line2');
  Chart.defaults.font.family=css('--font')||'sans-serif';Chart.defaults.color=ink;
  cfg.options=Object.assign({responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'index',intersect:false},
    plugins:{legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10,usePointStyle:false,padding:10,font:{size:11.5}}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${ils(c.parsed.y??c.parsed)}`}}},
    scales:cfg.type==='doughnut'?undefined:{x:{stacked:!!cfg.stacked,grid:{display:false},ticks:{maxRotation:0,autoSkipPadding:8}},y:{stacked:!!cfg.stacked,beginAtZero:true,min:0,grid:{color:line},border:{display:false},ticks:{callback:v=>ils(v)}}}},cfg.options||{});
  S.charts[id]=new Chart(el,cfg);
}

/* ---------- shell ---------- */
const BANK_VIEWS=[['cashflow','Overview'],['banktx','Transactions'],['planned','Planned payments']];
const CARD_VIEWS=[['overview','Overview'],['trends','Trends'],['categories','Categories'],['stores','Stores'],['cards','Cards'],['recurring','Recurring'],['budget','Budget'],['alerts','Alerts'],['transactions','Transactions'],['installments','Installments'],['fees','Fees & FX'],['inbox','Unclear']];
const VIEWS=[...BANK_VIEWS,...CARD_VIEWS];
const layerOf=v=>CARD_VIEWS.some(x=>x[0]===v)?'cards':'bank';
function navOf(v){return v==='settings'?'settings':v==='ask'?'':layerOf(v)}
function renderCrumbs(){const v=S.view;const t={ask:'Ask',settings:'Settings'}[v]||(layerOf(v)==='cards'?'Credit cards':'Bank account');$('#title').textContent=t;$('#backBtn').hidden=true;const n=navOf(v);document.querySelectorAll('.side [data-nav]').forEach(b=>{const on=b.dataset.nav===n;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
function renderAll(){const L=layerOf(S.view);document.body.dataset.screen=S.view==='settings'?'settings':S.view==='ask'?'ask':L;const tabbed=v=>[...BANK_VIEWS,...CARD_VIEWS].some(x=>x[0]===v);$('#strip').style.display='none';$('#tabs').style.display=tabbed(S.view)?'':'none';renderCrumbs();renderTabs();renderFilters();renderActionBar();renderMain()}
function filterCount(){if(layerOf(S.view)==='cards'){const F=S.F;return F.person.length+F.card.length+F.cat.length+F.type.length+(F.store?1:0)+((F.min!==''||F.max!=='')?1:0)+(F.exTravel?1:0)+(F.q?1:0)}return (S.cf.spread?1:0)+(S.cf.future?1:0)+Object.keys(S.meta.bankCount||{}).length}
function monthCtx(){const cards=layerOf(S.view)==='cards';if(cards)return{list:months(),M:S.month,note:()=>'',set:m=>{S.month=m;if(m<S.F.from)S.F.from=m;if(m>S.F.to)S.F.to=m}};
  const list=[...bankMonths(),...futureMonths()];if(!S.bankMonth||!list.includes(S.bankMonth))S.bankMonth=defaultBankMonth();return{list,M:S.bankMonth,note:m=>futureMonths().includes(m)?'expected':bankPartial(m)?'partial':'',set:m=>{S.bankMonth=m}}}
function renderActionBar(){const el=$('#abar');if(S.view==='ask'||S.view==='settings'||(layerOf(S.view)==='bank'&&!S.bank.length)){el.style.display='none';return}el.style.display='';
  const c=monthCtx();if(!c.list.length){el.innerHTML='';return}const i=Math.max(0,c.list.indexOf(c.M));
  const lab=(m,sel)=>{if(!m)return '<span class="mopt empty" aria-hidden="true"></span>';const n=c.note(m);const sub=[sel||m.slice(0,4)!==c.M.slice(0,4)?m.slice(0,4):'',n].filter(Boolean).join(', ');return `<button class="mopt ${sel?'on':''}" ${sel?'aria-current="date"':`data-mgo="${m}"`} aria-label="${mLong(m)}${n?', '+n:''}"><span>${MN[+m.slice(5)-1]}</span>${sub?`<small>${sub}</small>`:'<small>&nbsp;</small>'}</button>`};
  const fc=filterCount();
  el.innerHTML=`<div class="mswitch"><button class="iconbtn" data-mnav="-1" ${i<=0?'disabled':''} aria-label="Previous month"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>${lab(c.list[i-1])}${lab(c.list[i],1)}${lab(c.list[i+1])}<button class="iconbtn" data-mnav="1" ${i>=c.list.length-1?'disabled':''} aria-label="Next month"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><button class="fbtn ${fc?'on':''}" id="filterBtn"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Filter${fc?` (${fc})`:''}</span></button>`;
}
function renderTabs(){
  const unclear=new Set(S.rows.filter(r=>r.c==='Unclear'&&!r.f&&!cardHidden(r.k)).map(r=>r.nn)).size;
  const al=S.month?openAlerts(S.month).length:0;
  $('#tabs').innerHTML=(layerOf(S.view)==='cards'?CARD_VIEWS:BANK_VIEWS).map(([k,l])=>`<button class="tab ${S.view===k?'on':''}" data-view="${k}">${l}${k==='inbox'&&unclear?`<span class="badge">${unclear}</span>`:''}${k==='alerts'&&al?`<span class="badge">${al}</span>`:''}</button>`).join('');
}
function renderFilters(){
  const F=S.F;const chips=[];
  chips.push(`<span class="chip">${mLabel(F.from)} to ${mLabel(F.to)}</span>`);
  F.person.forEach(p=>chips.push(`<span class="chip">${esc(p)}<button data-unf="person|${esc(p)}" aria-label="Remove">×</button></span>`));
  F.card.forEach(p=>chips.push(`<span class="chip">Card ${esc(p)}<button data-unf="card|${esc(p)}" aria-label="Remove">×</button></span>`));
  F.cat.forEach(p=>chips.push(`<span class="chip">${esc(CL(p))}<button data-unf="cat|${esc(p)}" aria-label="Remove">×</button></span>`));
  F.type.forEach(p=>chips.push(`<span class="chip">${esc(TYPES[p])}<button data-unf="type|${esc(p)}" aria-label="Remove">×</button></span>`));
  if(F.store)chips.push(`<span class="chip" dir="auto">${esc(F.store)}<button data-unf="store|" aria-label="Remove">×</button></span>`);
  if(F.min!==''||F.max!=='')chips.push(`<span class="chip">${F.min!==''?ils(+F.min):'₪0'} to ${F.max!==''?ils(+F.max):'any'}<button data-unf="amount|" aria-label="Remove">×</button></span>`);
  const any=F.exTravel||F.person.length||F.card.length||F.cat.length||F.type.length||F.store||F.q||F.min!==''||F.max!=='';
  if(F.q)chips.splice(1,0,`<span class="chip" dir="auto">“${esc(F.q)}”<button data-unf="q|" aria-label="Remove">×</button></span>`);
  if(F.exTravel)chips.push(`<span class="chip">Travel excluded<button data-unf="travel|" aria-label="Remove">×</button></span>`);
  const show=layerOf(S.view)==='cards'&&any;
  $('#frow').style.display=show?'':'none';
  $('#frow').innerHTML=show?chips.slice(1).join('')+'<button class="linkbtn" id="clearF">Clear all</button>':'';
}
function setF(patch){Object.assign(S.F,patch);renderAll()}
function renderMain(){
  Object.values(S.charts).forEach(c=>c.destroy());S.charts={};
  const fn=window['view_'+S.view];
  const el=$('#main');
  if(!S.rows.length&&!['settings','ask','cashflow'].includes(S.view)){el.innerHTML=`<div class="panel"><div class="drop" id="drop"><p><b>Upload your first statements</b></p><p>Excel, CSV, PDF or screenshots from any card. Everything is saved for next month.</p><button class="btn pri" data-upload>Upload statements</button></div></div>`;return}
  el.innerHTML=fn?fn():'';
  if(window['after_'+S.view])window['after_'+S.view]();
}



/* ---------- views ---------- */
/* ---------- direction / trend ---------- */
function linreg(ys){const n=ys.length;if(n<2)return{slope:0,icpt:ys[0]||0};const xs=ys.map((_,i)=>i);const mx=sum(xs)/n,my=sum(ys)/n;let a=0,b=0;xs.forEach((x,i)=>{a+=(x-mx)*(ys[i]-my);b+=(x-mx)**2});const slope=b?a/b:0;return{slope,icpt:my-slope*mx}}
function trendBase(){
  const end=S.month&&S.month<S.F.to?S.month:S.F.to;
  const ms=mRange(S.F.from,end<S.F.from?S.F.from:end);
  return{rows:FR(),ms,partial:[],excludedCards:[],o:{}};
}
function trendCalc(rows,ms,key){
  const ys=ms.map(m=>sum(rows.filter(r=>r.m===m&&(!key||key(r))).map(r=>r.a)));
  const avg=ys.length?sum(ys)/ys.length:0;const{slope,icpt}=linreg(ys);
  const mean=(a)=>a.length?sum(a)/a.length:0;
  const l3=mean(ys.slice(-3)),p3=mean(ys.slice(-6,-3)),l6=mean(ys.slice(-6)),p6=mean(ys.slice(-12,-6));
  const ppm=avg?slope/avg*100:0;
  const dir=Math.abs(ppm)<1?'steady':ppm>0?'up':'down';
  return{ys,avg,slope,icpt,ppm,dir,l3,p3,l6,p6,fit:ys.map((_,i)=>r2(icpt+slope*i))};
}
function notesFor(B){return S.F.exTravel?'Travel is excluded (see the filter at the top).':''}
function toggleHTML(B){return ''}
function dirWord(t){return t.dir==='steady'?'holding steady':t.dir==='up'?'going up':'going down'}
function directionPanel(full){
  const B=trendBase();if(B.ms.length<3)return '';
  const t=trendCalc(B.rows,B.ms);
  const cls=t.dir==='up'?'up':t.dir==='down'?'down':'muted';
  const yr=t.slope*12;
  if(B.ms.length<6){const ys=t.ys;const last=ys[ys.length-1],prev=ys[ys.length-2];
    const head0=`<div class="dirv"><div class="dirbig muted">● Too early to call a trend</div><p>${B.ms.length} full months so far (${mLabel(B.ms[0])} to ${mLabel(B.ms[B.ms.length-1])}). A reliable direction needs about 6. Until then, compare month by month: ${mLabel(B.ms[B.ms.length-1])} was <b class="${last>prev?'up':'down'}">${pct((last-prev)/prev*100)}</b> vs ${mLabel(B.ms[B.ms.length-2])}.</p></div>`;
    return `<div class="panel">${head0}<div class="chart"${full?'':' style="height:180px"'}><canvas id="c_dir"></canvas></div>${full?`<p class="note">${notesFor(B)}</p>`+toggleHTML(B):''}</div>`}
  const head=`<div class="dirv"><div class="dirbig ${cls}">${t.dir==='up'?'▲':t.dir==='down'?'▼':'●'} Spending is ${dirWord(t)}</div><p>${t.dir==='steady'?`Within about 1% a month of a flat line over ${B.ms.length} months, around ${ils(t.avg)} a month.`:`The trend line moves about <b>${ils(Math.abs(t.slope))}</b> a month (${Math.abs(t.ppm).toFixed(1)}% of your ${ils(t.avg)} average), roughly ${ils(Math.abs(yr))} ${t.dir==='up'?'more':'less'} per month after a year at this pace.`}</p></div>`;
  const cmp=(a,b,l)=>b?`<div class="kpi"><span>${l}</span><b class="${a>b*1.02?'up':a<b*0.98?'down':''}">${pct((a-b)/b*100)}</b><em>${ils(a)} vs ${ils(b)} a month</em></div>`:'';
  const kp=`<div class="kpis">${cmp(t.l3,t.p3,'Last 3 months vs 3 before')}${cmp(t.l6,t.p6,'Last 6 months vs 6 before')}<div class="kpi"><span>Highest month</span><b>${ils(Math.max(...t.ys))}</b><em>${mLabel(B.ms[t.ys.indexOf(Math.max(...t.ys))])}</em></div><div class="kpi"><span>Lowest month</span><b>${ils(Math.min(...t.ys))}</b><em>${mLabel(B.ms[t.ys.indexOf(Math.min(...t.ys))])}</em></div></div>`;
  const notes=[];
  if(S.F.exTravel)notes.push('travel is excluded with the filter at the top');
  if(B.excludedCards.length)notes.push('cards '+B.excludedCards.join(', ')+' are left out because their data starts later than '+mLabel(B.ms[0]));
  if(B.partial.length)notes.push(B.partial.map(mLabel).join(', ')+' looks incomplete and is not counted');
  const toggles=`<div class="checks" style="margin-top:10px"><label><input type="checkbox" data-topt="lfl" ${B.o.lfl?'checked':''}>Only cards with data for the whole period</label><label><input type="checkbox" data-topt="core" ${B.o.core?'checked':''}>Leave out travel and one-offs</label></div>`;
  if(!full)return `<div class="panel">${head}<div class="chart" style="height:180px"><canvas id="c_dir"></canvas></div><div class="foot" style="justify-content:space-between;align-items:center;margin-top:8px"><span class="status">${notes.length?'Note: '+notes.join('; ')+'.':''}</span><button class="btn sm" data-view="trends">See all trends</button></div></div>`;
  // movers
  const cats=[...new Set(B.rows.map(r=>r.c))].map(c=>{const x=trendCalc(B.rows,B.ms,r=>r.c===c);return{c,slope:x.slope,ppm:x.ppm,avg:x.avg,l3:x.l3,p3:x.p3,dir:x.dir,ys:x.ys}}).filter(x=>x.avg>=30).sort((a,b)=>b.slope-a.slope);
  const row=x=>`<div class="lrow" data-cat="${esc(x.c)}"><span>${catPill(x.c)}</span><span class="num ${x.slope>0?'up':'down'}">${x.slope>0?'+':'−'}${ils(Math.abs(x.slope))}/mo</span><span class="status" style="grid-column:1/-1">${ils(x.avg)} a month on average, trend ${x.ppm>0?'+':'−'}${Math.abs(x.ppm).toFixed(1)}% a month</span></div>`;
  const up=cats.filter(x=>x.slope>5).slice(0,6),down=cats.filter(x=>x.slope<-5).reverse().slice(0,6);
  const st=[...new Set(B.rows.map(r=>r.nn))].map(nn=>{const x=trendCalc(B.rows,B.ms,r=>r.nn===nn);return{nn,slope:x.slope,avg:x.avg}}).filter(x=>x.avg>=40);
  const sUp=st.sort((a,b)=>b.slope-a.slope).slice(0,6).filter(x=>x.slope>3),sDown=[...st].sort((a,b)=>a.slope-b.slope).slice(0,6).filter(x=>x.slope<-3);
  const srow=x=>`<div class="lrow" data-store="${esc(x.nn)}" role="button"><span dir="auto">${esc(x.nn)}</span><span class="num ${x.slope>0?'up':'down'}">${x.slope>0?'+':'−'}${ils(Math.abs(x.slope))}/mo</span></div>`;
  return `<div class="panel">${head}${kp}<div class="chart tall"><canvas id="c_dir"></canvas></div><p class="note">${notes.length?'To show the real direction: '+notes.join('; ')+'.':''}</p>${toggles}</div>
  <div class="grid two"><div class="panel"><h2>Growing <small>categories with the steepest rise</small></h2><div class="list">${up.map(row).join('')||'<p class="note">No category is clearly rising.</p>'}</div></div>
  <div class="panel"><h2>Going down <small>categories with the steepest fall</small></h2><div class="list">${down.map(row).join('')||'<p class="note">No category is clearly falling.</p>'}</div></div>
  <div class="panel"><h2>Stores on the rise</h2><div class="list">${sUp.map(srow).join('')||'<p class="note">Nothing stands out.</p>'}</div></div>
  <div class="panel"><h2>Stores you use less</h2><div class="list">${sDown.map(srow).join('')||'<p class="note">Nothing stands out.</p>'}</div></div></div>`;
}
function drawDir(){
  const B=trendBase();if(B.ms.length<3||!document.getElementById('c_dir'))return;const t=trendCalc(B.rows,B.ms);const P=css('--primary');
  const col=t.dir==='up'?css('--red'):t.dir==='down'?css('--green'):css('--muted');
  chart('c_dir',{type:'line',data:{labels:B.ms.map(mLabel),datasets:[{label:'Spending',data:t.ys.map(r2),borderColor:P,backgroundColor:P+'1F',fill:true,borderWidth:2.5,pointRadius:3,pointBackgroundColor:P,tension:.3}]},options:{plugins:{legend:{display:false}}}});
}

function alertHTML(a,compact){
  return `<div class="alert ${a.sev}"><i></i><div><b>${esc(a.title)}</b><p>${esc(a.detail)}</p></div><div class="acts">${a.state==='open'?`<button class="btn sm" data-afilter="${esc(a.key)}">View</button>${compact?'':`<button class="btn sm ghost" data-aexp="${esc(a.key)}">Expected</button><button class="btn sm ghost" data-adis="${esc(a.key)}">Dismiss</button>`}`:`<span class="tag">${a.state==='expected'?'Expected':'Dismissed'}</span><button class="btn sm ghost" data-aundo="${esc(a.key)}">Undo</button>`}</div></div>`;
}
window.view_overview=function(){
  const M=S.month;const rows=FR(true);const cur=inMonth(M,rows);const prev=inMonth(addM(M,-1),rows);
  const tot=sum(cur.map(r=>r.a)),pt=sum(prev.map(r=>r.a));
  const allM=mRange(S.F.from,S.F.to).filter(m=>months().includes(m));const mt=allM.map(m=>sum(rows.filter(r=>r.m===m).map(r=>r.a)));const medT=median(mt.filter(x=>x>0));const h6=allM.filter((m,i)=>!(mt[i]<0.35*medT&&i>=allM.length-2));const avg6=h6.length?sum(rows.filter(r=>h6.includes(r.m)).map(r=>r.a))/h6.length:0;
  const fixed=sum(cur.filter(r=>FIXED_CATS.includes(r.c)||['standing','installment'].includes(r.t)).map(r=>r.a));
  const als=openAlerts(M);
  const byCat=Object.entries(groupSum(cur,'c')).sort((a,b)=>b[1]-a[1]);const mxc=Math.max(1,...byCat.map(x=>x[1]));
  const byP=groupSum(cur,cardPerson);
  const tt=Math.max(1,tot);const sh=v=>v/tt<.01?'<1%':Math.round(v/tt*100)+'%';
  return `<section class="hero2"><p class="lbl">Spent on cards</p><p class="bignum num">${ils(tot)}</p>
    <p class="deltas">${pt?`<span class="${tot>pt?'neg':'pos'}">${tot>pt?'▲':'▼'} ${Math.abs(Math.round((tot-pt)/pt*100))}%</span> vs ${mLabel(addM(M,-1))}`:''}${avg6?`<span class="${tot>avg6?'neg':'pos'}">${tot>avg6?'▲':'▼'} ${Math.abs(Math.round((tot-avg6)/avg6*100))}%</span> vs monthly average`:''}</p>
    <div class="facts"><div><small>Monthly average</small><b class="num">${ils(avg6)}</b></div><div><small>Fixed costs</small><b class="num">${ils(fixed)}</b></div>${Object.entries(byP).slice(0,2).map(([p,v])=>`<div><small>${esc(p)}</small><b class="num">${ils(v)}</b></div>`).join('')}</div></section>
  ${als.length?`<section class="sec"><div class="subhead"><h2>Worth a look</h2>${als.length>3?`<button class="linkbtn" data-view="alerts">All ${als.length} alerts</button>`:''}</div>${als.slice(0,3).map(a=>alertHTML(a,false)).join('')}</section>`:''}
  <div class="cols">
   <section class="sec"><h2>Spent by category</h2><div class="rows">${byCat.map(([c,v])=>`<div class="row" data-cat="${esc(c)}" role="button" tabindex="0"><i style="background:${catColor(c)}"></i><span class="nm">${esc(CL(c))}</span><span class="sh num">${sh(v)}</span><b class="num">${ils(v)}</b><span class="chev" aria-hidden="true">›</span></div>`).join('')}</div></section>
   <section class="sec"><h2>Spending by month</h2><div class="chart"><canvas id="c_trend"></canvas></div>${directionPanel(false).replace(/<div class="chart"[^>]*><canvas id="c_dir"><\/canvas><\/div>/,'')}</section>
  </div>
  <section class="sec"><h2>Categories by month</h2><div class="chart tall"><canvas id="c_stack"></canvas></div></section>`;
};
window.after_overview=function(){drawDir();
  const rows=FR();const ms=mRange(S.F.from,S.F.to);const people=[...new Set(rows.map(cardPerson))];
  const pc=['#4C8DF0','#D861A8','#2E9E6B','#E59A2F'];
  chart('c_trend',{type:'bar',stacked:true,data:{labels:ms.map(mLabel),datasets:people.map((p,i)=>({label:p,data:ms.map(m=>r2(sum(rows.filter(r=>r.m===m&&cardPerson(r)===p).map(r=>r.a)))),backgroundColor:pc[i%4],borderRadius:3}))}});
  const top=Object.entries(groupSum(rows,'c')).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);const keep=top.slice(0,9);
  const ds=keep.map(c=>({label:CL(c),data:ms.map(m=>r2(sum(rows.filter(r=>r.m===m&&r.c===c).map(r=>r.a)))),backgroundColor:catColor(c)}));
  if(top.length>9)ds.push({label:'Everything else',data:ms.map(m=>r2(sum(rows.filter(r=>r.m===m&&!keep.includes(r.c)).map(r=>r.a)))),backgroundColor:'#A9B4BE'});
  chart('c_stack',{type:'bar',stacked:true,data:{labels:ms.map(mLabel),datasets:ds}});
};
function spark(vals,color){const w=160,h=38,mx=Math.max(1,...vals),n=vals.length;if(n<2)return '';const pts=vals.map((v,i)=>[(i/(n-1))*w,h-3-(v/mx)*(h-6)]);const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');const last=pts[n-1];return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L${w} ${h} L0 ${h} Z" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.6" fill="${color}"/></svg>`}
function movAvg(a,k){return a.map((_,i)=>{const s=a.slice(Math.max(0,i-k+1),i+1);return r2(sum(s)/s.length)})}
window.view_trends=function(){
  const rows=FR();const ms=mRange(S.F.from,S.F.to);
  const cats=Object.entries(groupSum(rows,'c')).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  if(!S.trendCats)S.trendCats=cats.slice(0,5);
  const tiles=cats.map(c=>{const vals=ms.map(m=>sum(rows.filter(r=>r.c===c&&r.m===m).map(r=>r.a)));const last=vals[vals.length-1];const prev=vals.slice(-7,-1).filter((_,i)=>true);const avg=prev.length?sum(prev)/prev.length:0;const ch=avg?((last-avg)/avg*100):0;
    return `<div class="sp" data-cat="${esc(c)}" role="button" tabindex="0"><div class="t"><span class="dot" style="background:${catColor(c)}"></span>${esc(CL(c))}</div><div class="v"><span>${ils(sum(vals)/ms.length)}<small class="muted"> /mo</small></span>${avg?`<small class="${ch>5?'up':ch<-5?'down':'muted'}">${Math.abs(ch)<5?'steady':pct(ch)}</small>`:''}</div>${spark(vals,catColor(c))}</div>`}).join('');
  const stores=Object.entries(groupSum(rows,'nn')).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);
  const stiles=stores.map(nn=>{const vals=ms.map(m=>sum(rows.filter(r=>r.nn===nn&&r.m===m).map(r=>r.a)));return `<div class="sp" data-store="${esc(nn)}" role="button" tabindex="0"><div class="t" dir="auto">${esc(nn)}</div><div class="v"><span>${ils(sum(vals)/ms.length)}<small class="muted"> /mo</small></span></div>${spark(vals,css('--primary'))}</div>`}).join('');
  return directionPanel(true)+`
  <div class="panel"><h2>Every category at a glance <small>${mLabel(ms[0])} to ${mLabel(ms[ms.length-1])}, change compares the last month with the 6 before it</small></h2><div class="spark">${tiles}</div></div>
  <div class="panel"><div class="phead"><h2>Compare categories</h2></div><div class="checks" style="margin-bottom:10px">${cats.map(c=>`<label><input type="checkbox" data-tcat="${esc(c)}" ${S.trendCats.includes(c)?'checked':''}><span class="dot" style="background:${catColor(c)};margin-right:0"></span>${esc(CL(c))}</label>`).join('')}</div><div class="chart tall"><canvas id="c_catlines"></canvas></div></div>
  <div class="grid two">
    <div class="panel"><h2>Fixed vs variable</h2><div class="chart"><canvas id="c_fixed"></canvas></div></div>
    <div class="panel"><h2>Per person</h2><div class="chart"><canvas id="c_person"></canvas></div></div>
    <div class="panel"><h2>Transactions and average ticket</h2><div class="chart"><canvas id="c_ticket"></canvas></div></div>
    <div class="panel"><h2>This month's pace <small>cumulative spending by day</small></h2><div class="chart"><canvas id="c_pace"></canvas></div></div>
    <div class="panel"><h2>By day of week <small>average per week, regular purchases only</small></h2><div class="chart"><canvas id="c_wd"></canvas></div></div>
    <div class="panel"><h2>Cafés, delivery and lottery <small>your savings targets</small></h2><div class="chart"><canvas id="c_targets"></canvas></div></div>
  </div>
  <div class="panel"><h2>By day of the month <small>average spent on each day, ${mLabel(ms[0])} to ${mLabel(ms[ms.length-1])}, with ${mLabel(S.month)} on top. Installments left out</small></h2><div class="chart tall"><canvas id="c_dom"></canvas></div><p class="status" id="dom_note" style="margin-top:8px"></p></div>
  <div class="panel"><h2>Top stores <small>tap one for its history</small></h2><div class="spark">${stiles}</div></div>`;
};
window.after_trends=function(){drawDir();
  const rows=FR();const ms=mRange(S.F.from,S.F.to);const L=ms.map(mLabel);const P=css('--primary');
  const tot=ms.map(m=>r2(sum(rows.filter(r=>r.m===m).map(r=>r.a))));
  const cl=S.trendCats.map(c=>({label:CL(c),data:ms.map(m=>r2(sum(rows.filter(r=>r.c===c&&r.m===m).map(r=>r.a)))),borderColor:catColor(c),backgroundColor:catColor(c),borderWidth:2,pointRadius:2,tension:.25}));
  chart('c_catlines',{type:'line',data:{labels:L,datasets:cl}});
  const isFixed=r=>FIXED_CATS.includes(r.c)||['standing','installment'].includes(r.t);
  chart('c_fixed',{type:'bar',stacked:true,data:{labels:L,datasets:[{label:'Fixed',data:ms.map(m=>r2(sum(rows.filter(r=>r.m===m&&isFixed(r)).map(r=>r.a)))),backgroundColor:P},{label:'Variable',data:ms.map(m=>r2(sum(rows.filter(r=>r.m===m&&!isFixed(r)).map(r=>r.a)))),backgroundColor:'#A9BEC4'}]}});
  const people=[...new Set(rows.map(cardPerson))];const pc=['#4C8DF0','#D861A8','#2E9E6B','#E59A2F'];
  chart('c_person',{type:'line',data:{labels:L,datasets:people.map((p,i)=>({label:p,data:ms.map(m=>{const v=sum(rows.filter(r=>r.m===m&&cardPerson(r)===p).map(r=>r.a));return v?r2(v):null}),borderColor:pc[i%4],backgroundColor:pc[i%4],borderWidth:2,pointRadius:2,tension:.25,spanGaps:false}))}});
  const pos=rows.filter(r=>r.a>0&&r.t==='regular');
  chart('c_ticket',{type:'bar',data:{labels:L,datasets:[{type:'line',label:'Average ticket',data:ms.map(m=>{const x=pos.filter(r=>r.m===m);return x.length?r2(sum(x.map(r=>r.a))/x.length):null}),borderColor:'#D08A2C',backgroundColor:'#D08A2C',borderWidth:2,pointRadius:2,yAxisID:'y'},{label:'Transactions',data:ms.map(m=>pos.filter(r=>r.m===m).length),backgroundColor:'#A9BEC4',borderRadius:3,yAxisID:'y1'}]},
    options:{plugins:{tooltip:{callbacks:{label:c=>c.dataset.yAxisID==='y1'?`${c.dataset.label}: ${c.parsed.y}`:`${c.dataset.label}: ${ils(c.parsed.y)}`}}},scales:{x:{grid:{display:false}},y:{position:'left',grid:{color:css('--line2')},ticks:{callback:v=>ils(v)}},y1:{position:'right',grid:{display:false}}}}});
  const M=S.month;const days=Array.from({length:31},(_,i)=>i+1);const cum=m=>{let c=0;return days.map(d=>{c+=sum(rows.filter(r=>r.m===m&&+r.d.slice(8,10)===d).map(r=>r.a));return r2(c)})};
  const h6=mRange(addM(M,-6),addM(M,-1)).filter(m=>months().includes(m));const avgC=days.map((_,i)=>h6.length?r2(sum(h6.map(m=>cum(m)[i]))/h6.length):null);
  const cm=cum(M);const lastDay=Math.max(0,...rows.filter(r=>r.m===M).map(r=>+r.d.slice(8,10)));
  chart('c_pace',{type:'line',data:{labels:days,datasets:[{label:mLabel(M),data:cm.map((v,i)=>i<lastDay?v:null),borderColor:P,backgroundColor:P,borderWidth:2.5,pointRadius:0},{label:mLabel(addM(M,-1)),data:cum(addM(M,-1)),borderColor:'#A9BEC4',borderWidth:1.5,pointRadius:0},{label:'6 month average',data:avgC,borderColor:'#D08A2C',borderDash:[5,4],borderWidth:1.5,pointRadius:0}]}});
  const WDN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];const weeks=Math.max(1,ms.length*4.345);
  const reg=rows.filter(r=>r.t==='regular'&&r.a>0&&!['Travel'].includes(r.c));
  chart('c_wd',{type:'bar',data:{labels:WDN,datasets:[{label:'Per week',data:WDN.map((_,i)=>r2(sum(reg.filter(r=>new Date(r.d+'T12:00:00').getDay()===i).map(r=>r.a))/weeks)),backgroundColor:WDN.map((_,i)=>i===5||i===6?'#D08A2C':P),borderRadius:3}]},options:{plugins:{legend:{display:false}}}});
  // by day of the month
  const D31=Array.from({length:31},(_,i)=>i+1);const dim=m=>new Date(+m.slice(0,4),+m.slice(5,7),0).getDate();
  const domR=rows.filter(r=>r.a>0&&r.t!=='installment');const dayOf=r=>+r.d.slice(8,10);
  const domAvg=D31.map(d=>{const mm=ms.filter(m=>dim(m)>=d);return mm.length?r2(sum(domR.filter(r=>mm.includes(r.m)&&dayOf(r)===d).map(r=>r.a))/mm.length):0});
  const domCur=D31.map(d=>{if(d>dim(M))return null;const v=sum(domR.filter(r=>r.m===M&&dayOf(r)===d).map(r=>r.a));return d>lastDay?null:r2(v)});
  const third=[sum(domAvg.slice(0,10)),sum(domAvg.slice(10,20)),sum(domAvg.slice(20))];const tt=sum(third)||1;
  const top=domAvg.map((v,i)=>[i+1,v]).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  const dn=document.getElementById('dom_note');if(dn)dn.innerHTML=`Days 1 to 10: <b>${Math.round(third[0]/tt*100)}%</b> of the month's spending, days 11 to 20: <b>${Math.round(third[1]/tt*100)}%</b>, day 21 to the end: <b>${Math.round(third[2]/tt*100)}%</b>. Biggest days on average: ${top.map(d=>'the '+d+(d%10===1&&d!==11?'st':d%10===2&&d!==12?'nd':d%10===3&&d!==13?'rd':'th')).join(', ')}.`;
  chart('c_dom',{type:'bar',data:{labels:D31,datasets:[
    {label:'Average month',data:domAvg,backgroundColor:'#A9BEC4',borderRadius:3,order:2},
    {label:mLabel(M),data:domCur,backgroundColor:P,borderRadius:3,order:1}]},
    options:{plugins:{legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10,padding:10,font:{size:11.5}}},tooltip:{callbacks:{title:c=>'Day '+c[0].label,label:c=>c.parsed.y==null?'':`${c.dataset.label}: ${ils(c.parsed.y)}`}}},
      scales:{x:{grid:{display:false},ticks:{maxRotation:0,autoSkip:false,callback:(v,i)=>(i%5===0||i===30)?D31[i]:''}},y:{beginAtZero:true,grid:{color:css('--line2')},border:{display:false},ticks:{callback:v=>ils(v)}}}}});
  const tg=[['Restaurants & cafés',null],['Delivery',240],['Lottery',60]];
  chart('c_targets',{type:'line',data:{labels:L,datasets:tg.map(([c])=>({label:CL(c),data:ms.map(m=>r2(sum(rows.filter(r=>r.c===c&&r.m===m).map(r=>r.a)))),borderColor:catColor(c),backgroundColor:catColor(c),borderWidth:2,pointRadius:2,tension:.25}))}});
};
window.view_categories=function(){
  const rows=FR();const ms=mRange(S.F.from,S.F.to);const total=sum(rows.map(r=>r.a));
  const cats=Object.entries(groupSum(rows,'c')).sort((a,b)=>b[1]-a[1]);
  const data=cats.map(([c,v])=>{const o={c,total:v,pct:total?v/total*100:0,avg:v/ms.length};ms.forEach(m=>o[m]=sum(rows.filter(r=>r.c===c&&r.m===m).map(r=>r.a)));return o});
  const cols=[{k:'c',l:'Category',h:r=>`${catPill(r.c)}`},...ms.map(m=>({k:m,l:mLabel(m),r:1,f:v=>v?ils(v):''})),{k:'total',l:'Total',r:1,f:v=>ils(v)},{k:'avg',l:'Per month',r:1,f:v=>ils(v)},{k:'pct',l:'%',r:1,f:v=>v.toFixed(1)}];
  const foot={c:'Total',total:ils(total),avg:ils(total/ms.length),pct:'100'};ms.forEach(m=>foot[m]=ils(sum(rows.filter(r=>r.m===m).map(r=>r.a))));
  let drill='';
  if(S.drill){const dr=rows.filter(r=>r.c===S.drill);const st=Object.entries(groupSum(dr,'nn')).sort((a,b)=>b[1]-a[1]).map(([nn,v])=>({nn,v,n:dr.filter(r=>r.nn===nn).length}));
    drill=`<div class="panel"><div class="phead"><h2>${esc(CL(S.drill))} <small>${ils(sum(dr.map(r=>r.a)))} in range</small></h2><button class="btn sm ghost" data-drillclose>Close</button></div><div class="chart"><canvas id="c_drill"></canvas></div>${table('drill',[{k:'nn',l:'Store',auto:1},{k:'n',l:'Visits',r:1},{k:'v',l:'Total',r:1,f:v=>ils(v)}],st,{sort:'v',click:1,name:S.drill+' by store'})}</div>`}
  return `<div class="panel"><div class="phead"><h2>Spending by category and month <small>tap a row to drill down</small></h2></div>${table('cats',cols,data,{sort:'total',click:1,foot,name:'Categories by month'})}</div>${drill}`;
};
window.after_categories=function(){if(!S.drill)return;const rows=FR().filter(r=>r.c===S.drill);const ms=mRange(S.F.from,S.F.to);chart('c_drill',{type:'bar',data:{labels:ms.map(mLabel),datasets:[{label:CL(S.drill),data:ms.map(m=>r2(sum(rows.filter(r=>r.m===m).map(r=>r.a)))),backgroundColor:catColor(S.drill),borderRadius:3}]},options:{plugins:{legend:{display:false}}}})};
window.view_stores=function(){
  const rows=FR();const by={};for(const r of rows){const o=by[r.nn]||(by[r.nn]={nn:r.nn,c:r.c,n:0,v:0,last:'',cards:new Set()});o.n++;o.v+=r.a;if(r.d>o.last)o.last=r.d;o.cards.add(r.k)}
  const data=Object.values(by).map(o=>({...o,avg:o.v/o.n,cards:[...o.cards].join(', ')}));
  let det='';
  if(S.storeSel){const sr=rows.filter(r=>r.nn===S.storeSel);const ms=mRange(S.F.from,S.F.to);const t=sum(sr.map(r=>r.a));
    const weeks=Math.max(1,ms.length*4.345);
    det=`<div class="panel"><div class="phead"><h2 dir="auto">${esc(S.storeSel)}</h2><button class="btn sm ghost" data-storeclose>Close</button></div>
    <div class="kpis"><div class="kpi"><span>Total</span><b>${ils(t)}</b></div><div class="kpi"><span>Visits</span><b>${sr.length}</b><em>${(sr.length/weeks).toFixed(1)} a week</em></div><div class="kpi"><span>Average ticket</span><b>${ils(sr.length?t/sr.length:0)}</b></div><div class="kpi"><span>Per month</span><b>${ils(t/ms.length)}</b></div></div>
    <div class="chart"><canvas id="c_store"></canvas></div>${txTable('storetx',sr,S.storeSel)}</div>`}
  return det+`<div class="panel"><div class="phead"><h2>Stores <small>ranked by spending</small></h2></div>${table('stores',[{k:'nn',l:'Store',auto:1},{k:'c',l:'Category',h:r=>catPill(r.c),x:r=>CL(r.c)},{k:'n',l:'Visits',r:1},{k:'v',l:'Total',r:1,f:v=>ils(v)},{k:'avg',l:'Avg ticket',r:1,f:v=>ils(v)},{k:'last',l:'Last visit'},{k:'cards',l:'Cards'}],data,{sort:'v',click:1,name:'Stores'})}</div>`;
};
window.after_stores=function(){if(!S.storeSel)return;const sr=FR().filter(r=>r.nn===S.storeSel);const ms=mRange(S.F.from,S.F.to);chart('c_store',{type:'bar',data:{labels:ms.map(mLabel),datasets:[{label:S.storeSel,data:ms.map(m=>r2(sum(sr.filter(r=>r.m===m).map(r=>r.a)))),backgroundColor:css('--primary'),borderRadius:3}]},options:{plugins:{legend:{display:false}}}})};
function txCols(){return [{k:'d',l:'Date'},{k:'n',l:'Store',auto:1,h:r=>`<span dir="auto">${esc(r.nn)}</span>${r.nn!==r.n?`<br><span class="muted" dir="auto" style="font-size:12px">${esc(r.n)}</span>`:''}`,x:r=>r.nn},{k:'a',l:'Amount',r:1,f:(v,r)=>ils(v,2)+(r.oc&&r.oa?` (${r.oa} ${r.oc})`:'')},{k:'c',l:'Category',h:r=>`${catPill(r.c)}`,x:r=>CL(r.c)},{k:'cm',l:'Comment',h:r=>r.cm?`<span dir="auto" style="white-space:normal;display:inline-block;min-width:120px;max-width:260px">${esc(r.cm)}</span>`:'<span class="muted" style="font-size:12px">Add</span>',x:r=>r.cm||'',v:r=>r.cm||''},{k:'t',l:'Type',f:(v,r)=>TYPES[v]+(r.i?' '+r.i:'')+(r.oc?' · FX':'')},{k:'k',l:'Card'},{k:'p',l:'Person',v:r=>cardPerson(r)},{k:'n0',l:'Original name',v:r=>r.n,h:r=>`<span dir="auto" class="muted">${esc(r.n)}</span>`}]}
function txTable(id,rows,name){return table(id,txCols().filter(c=>c.k!=='n0'),rows,{sort:'d',click:1,name:name||'Transactions'})}
window.view_transactions=function(){const rows=FR();return `<div class="panel"><div class="phead"><h2>Transactions <small>${ils(sum(rows.map(r=>r.a)))} total, tap any expense to add a comment or move it to another category</small></h2></div>${table('tx',txCols(),rows,{sort:'d',click:1,name:'Transactions'})}</div>`};
window.view_cards=function(){
  const rows=FR();const ms=mRange(S.F.from,S.F.to);const M=S.month;
  const by={};for(const r of rows){const o=by[r.k]||(by[r.k]={k:r.k,is:(S.meta.cards[r.k]||{}).issuer||r.is,p:cardPerson(r),v:0,n:0,cur:0,from:r.m,to:r.m});o.v+=r.a;o.n++;if(r.m===M)o.cur+=r.a;if(r.m<o.from)o.from=r.m;if(r.m>o.to)o.to=r.m}
  const data=Object.values(by).map(o=>({...o,avg:o.v/mRange(o.from,o.to).length}));
  const pp=groupSum(rows,cardPerson);const span={};data.forEach(o=>{const s=span[o.p]||(span[o.p]={from:o.from,to:o.to});if(o.from<s.from)s.from=o.from;if(o.to>s.to)s.to=o.to});
  return `<div class="kpis">${Object.entries(pp).map(([p,v])=>`<div class="kpi"><span>${esc(p)}</span><b>${ils(v/mRange(span[p].from,span[p].to).length)}</b><em>per month, data from ${mLabel(span[p].from)} to ${mLabel(span[p].to)}</em></div>`).join('')}</div>
  <div class="panel"><h2>Spending per card</h2><div class="chart"><canvas id="c_cards"></canvas></div></div>
  <div class="panel">${table('cards',[{k:'k',l:'Card'},{k:'is',l:'Issuer'},{k:'p',l:'Person'},{k:'n',l:'Transactions',r:1},{k:'v',l:'Total',r:1,f:v=>ils(v)},{k:'avg',l:'Per month',r:1,f:v=>ils(v)},{k:'from',l:'From',f:v=>mLabel(v)},{k:'to',l:'To',f:v=>mLabel(v)},{k:'cur',l:mLabel(M),r:1,f:v=>ils(v)}],data,{sort:'v',click:1,name:'Cards'})}</div>`;
};
window.after_cards=function(){const rows=FR();const ms=mRange(S.F.from,S.F.to);const cards=[...new Set(rows.map(r=>r.k))];chart('c_cards',{type:'bar',stacked:true,data:{labels:ms.map(mLabel),datasets:cards.map((k,i)=>({label:k+' '+cardPerson({k}),data:ms.map(m=>r2(sum(rows.filter(r=>r.k===k&&r.m===m).map(r=>r.a)))),backgroundColor:PAL[(i*3)%PAL.length]}))}})};
window.view_recurring=function(){
  const rec=detectRecurring().filter(x=>!S.F.cat.length||S.F.cat.includes(x.c));const tot=sum(rec.filter(x=>x.status!=='Stopped').map(x=>x.monthly));
  return `<div class="kpis"><div class="kpi"><span>Recurring per month</span><b>${ils(tot)}</b></div><div class="kpi"><span>Per year</span><b>${ils(tot*12)}</b></div><div class="kpi"><span>Price went up</span><b>${rec.filter(x=>x.change>2).length}</b></div><div class="kpi"><span>On two cards or missing</span><b>${rec.filter(x=>x.dup||x.status==='Missing this month').length}</b></div></div>
  <div class="panel"><div class="phead"><h2>Subscriptions and standing orders <small>detected from the 6 months up to ${mLabel(S.month)}</small></h2></div>${table('rec',[{k:'nn',l:'Name',auto:1},{k:'c',l:'Category',h:r=>catPill(r.c),x:r=>CL(r.c)},{k:'monthly',l:'Per month',r:1,f:v=>ils(v)},{k:'yearly',l:'Per year',r:1,f:v=>ils(v)},{k:'lastAmt',l:'Last charge',r:1,f:v=>ils(v,2)},{k:'change',l:'Change',r:1,h:r=>r.change==null?'':`<span class="${r.change>1?'up':r.change<-1?'down':''}">${Math.abs(r.change)<1?'same':pct(r.change)}</span>`,v:r=>r.change??0},{k:'status',l:'Status',h:r=>`${esc(r.status)}${r.dup?' <span class="tag">2 cards</span>':''}`},{k:'cards',l:'Cards',f:v=>v.join(', '),v:r=>r.cards.join(', ')},{k:'lastM',l:'Last month',f:v=>mLabel(v)}],rec,{sort:'monthly',click:1,name:'Recurring'})}<p class="note">Per card averages only count the months that card has data. Monthly cost is the average over the last 6 months, so items charged every two months (like arnona) show their true monthly cost.</p></div>`;
};
window.view_budget=function(){
  const M=S.month;const rows=FR(true);const cur=groupSum(inMonth(M,rows),'c');
  const h6=mRange(addM(M,-6),addM(M,-1)).filter(m=>months().includes(m));const hist=groupSum(rows.filter(r=>h6.includes(r.m)),'c');
  const tgt={'Groceries':0.9,'Restaurants & cafés':0.85};
  const data=CATS.filter(c=>c!=='Unclear').map(c=>{const b=S.meta.budgets[c]||0;const v=cur[c]||0;const avg=(hist[c]||0)/Math.max(1,h6.length);return{c,b,v,avg,p:b?v/b*100:0,target:tgt[c]?avg*tgt[c]:null}}).filter(x=>x.b||x.v);
  const tb=sum(data.map(x=>x.b)),tv=sum(data.map(x=>x.v));
  return `<div class="kpis"><div class="kpi"><span>Budget</span><b>${ils(tb)}</b></div><div class="kpi"><span>Spent in ${mLabel(M)}</span><b>${ils(tv)}</b></div><div class="kpi"><span>Left</span><b class="${tb-tv<0?'up':''}">${ils(tb-tv)}</b></div><div class="kpi"><span>Over budget</span><b>${data.filter(x=>x.p>100).length} categories</b></div></div>
  <div class="panel"><h2>Budget vs actual <small>edit any budget, it saves automatically</small></h2><div class="tw"><table><thead><tr><th>Category</th><th class="r">Budget</th><th class="r">${mLabel(M)}</th><th>Used</th><th class="r">Average before</th><th class="r">Savings target</th></tr></thead><tbody>${data.map(x=>`<tr><td>${catPill(x.c)}</td><td class="r"><input class="inp num" style="width:90px;text-align:right;padding:4px 6px" inputmode="numeric" data-budget="${esc(x.c)}" value="${x.b||''}"></td><td class="r">${ils(x.v)}</td><td style="min-width:120px"><div class="hbar"><span style="width:${Math.min(100,x.p)}%;background:${x.p>100?css('--red'):x.p>=S.meta.thresholds.budgetWarn?css('--amber'):css('--green')}"></span></div><span class="status">${x.b?Math.round(x.p)+'%':''}</span></td><td class="r">${ils(x.avg)}</td><td class="r">${x.target?ils(x.target):x.c==='Lottery'?'₪60':x.c==='Delivery'?'₪240':''}</td></tr>`).join('')}</tbody></table></div>
  <p class="note">Savings targets: lottery 60, delivery 240, groceries 10% and cafés 15% below your average of the previous months (up to 6).</p></div>`;
};
window.view_alerts=function(){
  const M=S.month;const all=computeAlerts(M);const open=all.filter(a=>a.state==='open'),closed=all.filter(a=>a.state!=='open');
  return `<div class="panel"><div class="phead"><h2>Alerts for ${mLong(M)} <small>pick another month in the strip above</small></h2></div>${open.length?open.map(a=>alertHTML(a)).join(''):'<p class="empty">No open alerts this month.</p>'}</div>
  ${closed.length?`<div class="panel"><h2>Expected or dismissed</h2>${closed.map(a=>alertHTML(a)).join('')}</div>`:''}
  <div class="panel"><h2>How alerts work</h2><p class="note">Category more than ${S.meta.thresholds.catPct}% above its 6 month average (and ${ils(S.meta.thresholds.catMin)} more), a store ${S.meta.thresholds.storePct}% above its usual month, a purchase ${S.meta.thresholds.ticketX} times the usual ticket, price increases, new recurring charges, possible double charges, purchases above ${ils(S.meta.thresholds.large)}, fees, budgets at ${S.meta.thresholds.budgetWarn}% and 100%, and regular charges that went missing. "Expected" hides an alert for this month only; "Dismiss" stops that alert for good. Change thresholds in Settings.</p></div>`;
};
window.view_installments=function(){
  const up=upcoming();const byM=groupSum(up,'m');
  return `<div class="kpis"><div class="kpi"><span>Still committed</span><b>${ils(sum(up.map(x=>x.a)),2)}</b></div><div class="kpi"><span>Payments left</span><b>${up.length}</b></div><div class="kpi"><span>Next month</span><b>${ils(byM[Object.keys(byM).sort()[0]]||0,2)}</b><em>${Object.keys(byM).length?mLabel(Object.keys(byM).sort()[0]):''}</em></div><div class="kpi"><span>Last payment</span><b>${Object.keys(byM).length?mLabel(Object.keys(byM).sort().pop()):'None'}</b></div></div>
  <div class="panel"><h2>Upcoming by month</h2><div class="chart"><canvas id="c_inst"></canvas></div></div>
  <div class="panel">${table('inst',[{k:'m',l:'Month',f:v=>mLabel(v)},{k:'n',l:'Store',auto:1},{k:'no',l:'Payment'},{k:'a',l:'Amount',r:1,f:v=>ils(v,2)},{k:'k',l:'Card'},{k:'c',l:'Category',h:r=>catPill(r.c),x:r=>CL(r.c)}],up,{sort:'m',dir:1,name:'Upcoming installments'})}<p class="note">Based on the last installment seen on each statement. Upload the next statements and paid installments move out of this list.</p></div>`;
};
window.after_installments=function(){const up=upcoming();const ms=[...new Set(up.map(x=>x.m))].sort();chart('c_inst',{type:'bar',data:{labels:ms.map(mLabel),datasets:[{label:'Installments',data:ms.map(m=>r2(sum(up.filter(x=>x.m===m).map(x=>x.a)))),backgroundColor:css('--primary'),borderRadius:3}]},options:{plugins:{legend:{display:false}}}})};
window.view_fees=function(){
  const rows=FR();const fees=rows.filter(r=>r.c==='Fees');const fx=rows.filter(r=>r.oc);const cash=rows.filter(r=>r.x);
  const fxSum=sum(fx.map(r=>r.fx||0));
  return `<div class="kpis"><div class="kpi"><span>Card fees</span><b>${ils(sum(fees.map(r=>r.a)),2)}</b><em>net of refunds</em></div><div class="kpi"><span>FX fees, estimated</span><b>${ils(fxSum,0)}</b><em>${fx.length} foreign charges</em></div><div class="kpi"><span>Foreign spending</span><b>${ils(sum(fx.map(r=>r.a)))}</b></div><div class="kpi"><span>Cash withdrawals</span><b>${ils(sum(cash.map(r=>r.a)))}</b></div></div>
  <div class="panel"><h2>Card fees</h2>${table('fees',[{k:'d',l:'Date'},{k:'n',l:'Charge',auto:1},{k:'a',l:'Amount',r:1,f:v=>ils(v,2)},{k:'k',l:'Card'},{k:'p',l:'Person',v:r=>cardPerson(r)}],fees,{sort:'d',name:'Card fees'})}</div>
  <div class="panel"><h2>Foreign currency charges <small>Cal shows 3% minus a small discount, about 2.5% net</small></h2>${table('fx',[{k:'d',l:'Date'},{k:'nn',l:'Store',auto:1},{k:'oa',l:'Original',r:1,f:(v,r)=>v?v+' '+(r.oc||''):(r.oc==='ILS'?'billed in ₪ abroad':'')},{k:'a',l:'Charged',r:1,f:v=>ils(v,2)},{k:'fx',l:'Est. fee',r:1,f:v=>v?ils(v,2):''},{k:'k',l:'Card'}],fx,{sort:'d',name:'Foreign charges'})}</div>
  ${cash.length?`<div class="panel"><h2>Cash withdrawals</h2>${table('cash',[{k:'d',l:'Date'},{k:'n',l:'Where',auto:1},{k:'a',l:'Amount',r:1,f:v=>ils(v,2)},{k:'k',l:'Card'}],cash,{sort:'d',name:'Cash withdrawals'})}</div>`:''}`;
};
window.view_inbox=function(){
  const un=S.rows.filter(r=>r.c==='Unclear'&&!r.f&&!cardHidden(r.k));const by={};for(const r of un){const o=by[r.nn]||(by[r.nn]={nn:r.nn,n:0,v:0,s:r.s||'',d:r.d,cards:new Set()});o.n++;o.v+=r.a;o.cards.add(r.k);if(r.d>o.d)o.d=r.d}
  const list=Object.values(by).sort((a,b)=>b.v-a.v);
  if(!list.length)return `<div class="panel"><p class="empty">Every transaction has a category.</p></div>`;
  const sug=S.suggest||{};
  return `<div class="panel"><div class="phead"><h2>Unclear stores <small>pick a category once, it applies to every past and future charge</small></h2>${S.sample?`<button class="btn sm" id="suggestBtn">Suggest categories with Claude</button>`:''}</div>
  <div class="tw"><table><thead><tr><th>Store</th><th class="r">Charges</th><th class="r">Total</th><th>Last</th><th>Category</th><th></th></tr></thead><tbody>${list.map(o=>`<tr><td dir="auto">${esc(o.nn)}${o.s?`<br><span class="muted" style="font-size:12px">${esc(o.s)}</span>`:''}${sug[o.nn]?`<br><span class="status">Claude: ${esc(sug[o.nn].why||'')}</span>`:''}</td><td class="r">${o.n}</td><td class="r">${ils(o.v)}</td><td>${o.d}</td><td><select class="inp" data-inboxcat="${esc(o.nn)}">${CATS.map(c=>`<option value="${esc(c)}" ${c===(sug[o.nn]?.cat||'Unclear')?'selected':''}>${esc(CL(c))}</option>`).join('')}</select></td><td><button class="btn sm pri" data-inboxapply="${esc(o.nn)}">Apply</button></td></tr>`).join('')}</tbody></table></div></div>`;
};
window.view_ask=function(){
  const sugs=['How much did we spend on Wolt this summer?','Which subscriptions went up in price?','How many times a week do I go to a café?','Why is this month higher than usual?','Compare my spending with Shiraz by category'];
  return `<div class="panel"><h2>Ask about your spending</h2>${S.sample?'':'<p class="note">Asking Claude is not available in this view.</p>'}
  <div class="chat" id="chat">${S.chat.map(m=>`<div class="msg ${m.role==='user'?'u':'a'}">${esc(m.content)}</div>`).join('')}</div>
  ${S.lastFilter?`<div class="foot" style="justify-content:flex-start"><button class="btn sm" id="showMatch">Show matching transactions</button></div>`:''}
  <div class="ask"><textarea id="askIn" placeholder="Ask anything about your cards, stores or categories" ${S.sample?'':'disabled'}></textarea><button class="btn pri" id="askBtn" ${S.sample?'':'disabled'}>Ask</button></div>
  ${S.chat.length?'':`<div class="sugs">${sugs.map(s=>`<button class="btn sm" data-sug="${esc(s)}">${esc(s)}</button>`).join('')}</div>`}
  <p class="note">Answers are computed from your saved transactions using the filters you pick, and each call uses your Claude plan.</p></div>`;
};

async function loadHousehold(){
  const H=window.LedgerGate&&window.LedgerGate.household;const el=$('#hhList');if(!el)return;
  if(!H){el.innerHTML='<p class="hint">Not available.</p>';return}
  try{
    const [me,list,owner]=await Promise.all([H.me(),H.list(),H.isOwner()]);
    const mine=(me.emailAddress||'').toLowerCase();
    list.sort((a,b)=>(a.role==='owner'?-1:0)-(b.role==='owner'?-1:0));
    el.innerHTML=`<div class="hhlist">${list.map(p=>{const you=p.email.toLowerCase()===mine;return `<div class="hhrow"><span class="hhav" aria-hidden="true">${esc((p.name||p.email||'?').trim()[0].toUpperCase())}</span><div><b>${esc(p.name||p.email)}${you?' <small>(you)</small>':''}</b><small>${esc(p.email)} · ${p.role==='owner'?'Owner':'Can see and edit'}</small></div>${p.role!=='owner'&&!you&&owner?`<button class="linkbtn danger" data-hhrm="${esc(p.id)}" data-hhname="${esc(p.name||p.email)}">Remove</button>`:''}</div>`}).join('')}</div>`;
    if(!owner){const f=$('#hhForm');if(f)f.style.display='none';$('#hhNote').textContent='Only the owner can add or remove people.'}
  }catch(e){el.innerHTML=`<p class="badline">Could not load the household (${esc(e.code||e.message)}).</p>`}
}
window.after_settings=function(){
  loadHousehold();
  const f=$('#hhForm');if(f)f.onsubmit=async e=>{e.preventDefault();const email=$('#hhEmail').value.trim();const b=$('#hhAdd');b.disabled=true;b.textContent='Adding…';
    try{await window.LedgerGate.household.add(email);$('#hhEmail').value='';$('#hhNote').innerHTML=`Added <b>${esc(email)}</b>. Google emailed them a link to the folder. Next: add them as a test user in Google Cloud, then tell them the passphrase in person.`;loadHousehold()}
    catch(x){toast('Could not add: '+(x.message||x.code),6000)}finally{b.disabled=false;b.textContent='Add person'}};
};
window.view_settings=function(){
  const cards=Object.entries(S.meta.cards);const T=S.meta.thresholds;
  return `<div class="panel" id="hhPanel"><h2>Household</h2><p class="hint">People who see and edit the same ledger, each with their own Google account. They also need the passphrase, which you tell them in person.</p><div id="hhList"><p class="hint">Loading…</p></div>
    <form class="hhadd" id="hhForm"><input class="inp" id="hhEmail" type="email" placeholder="Their Gmail address" autocomplete="off" required><button class="btn pri" type="submit" id="hhAdd">Add person</button></form><p class="hint" id="hhNote"></p></div>
  <div class="panel"><h2>People and cards</h2><p class="hint">Switch a card off to hide it everywhere, including its bills in Cash flow.</p><div class="cardlist">${cards.map(([k,c])=>`<div class="cardrow ${c.hidden?'off':''}"><label class="switch" aria-label="Show card ${esc(k)}"><input type="checkbox" data-cardshow="${esc(k)}" ${c.hidden?'':'checked'}><span></span></label><div class="cn"><input class="inp ghostinp" data-cardis="${esc(k)}" value="${esc(c.issuer)}" aria-label="Name for card ${esc(k)}"><small>Card ${esc(k)}, ${S.rows.filter(r=>r.k===k).length} transactions</small></div><select class="inp" data-cardp="${esc(k)}" aria-label="Who uses card ${esc(k)}">${S.meta.people.map(p=>`<option ${p===c.person?'selected':''}>${esc(p)}</option>`).join('')}</select></div>`).join('')}</div>
  <div class="field"><label>People (comma separated)</label><input class="inp" id="peopleIn" value="${esc(S.meta.people.join(', '))}"></div></div>
  <div class="panel"><h2>Alert thresholds</h2><div class="row2">
  ${[['catPct','Category above 6 month average (%)'],['catMin','and at least (₪)'],['storePct','Store above its usual month (%)'],['ticketX','Purchase vs usual ticket (times)'],['large','Large purchase from (₪)'],['budgetWarn','Budget warning at (%)']].map(([k,l])=>`<div class="field"><label>${l}</label><input class="inp" inputmode="numeric" data-thr="${k}" value="${T[k]}"></div>`).join('')}</div></div>
  <div class="panel"><h2>Categories <small>rename any category or add your own; transactions keep their category</small></h2>
  <div class="grid two"><div><h3 style="font-size:14px;margin:4px 0 8px">Card spending</h3><div class="catlist">${CATS.map(c=>{const n=S.rows.filter(r=>r.c===c).length;return `<div class="catrow"><i style="background:${catColor(c)}"></i><input class="inp" data-catlabel="${esc(c)}" value="${esc(CL(c))}" dir="auto" aria-label="Name for ${esc(c)}"><span class="status">${n}</span></div>`}).join('')}</div>
    <div class="foot" style="justify-content:flex-start"><input class="inp" id="newCardCat" placeholder="New card category" dir="auto" style="max-width:220px"><button class="btn" id="addCardCat">Add</button></div></div>
  <div><h3 style="font-size:14px;margin:4px 0 8px">Bank account</h3><div class="catlist">${bankCats().map(c=>{const n=S.bank.filter(r=>r.c===c).length;return `<div class="catrow"><i style="background:${bColor(c)}"></i><input class="inp" data-catlabel="${esc(c)}" value="${esc(CL(c))}" dir="auto" aria-label="Name for ${esc(c)}"><span class="status">${n}${isSav(c)?', savings':''}</span></div>`}).join('')}</div>
    <div class="foot" style="justify-content:flex-start;flex-wrap:wrap"><input class="inp" id="newBankCat" placeholder="New bank category" dir="auto" style="max-width:220px"><label class="note" style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" id="newBankSav">Savings</label><button class="btn" id="addBankCat">Add</button></div></div></div>
  <p class="note">Names are shared by you and Shiraz. Clearing a name brings back the original one.</p></div>
  <div class="panel"><h2>Period</h2><div class="field"><label>Show data from</label><select class="inp" id="startSel" style="max-width:260px"><option value="">All months (${mLabel(allMonths()[0]||todayISO().slice(0,7))} onward)</option>${allMonths().map(m=>`<option value="${m}" ${S.meta.startMonth===m?'selected':''}>${mLong(m)}</option>`).join('')}</select></div><p class="note">Earlier months stay saved and come back if you pick an earlier start. June 2026 is the first month with every card in the household.</p></div>
  <div class="panel"><h2>Appearance</h2><div class="seg">${['light','dark','auto'].map(t=>`<button class="${S.meta.theme===t?'on':''}" data-theme="${t}">${t==='auto'?'Match device':t==='light'?'White':'Dark'}</button>`).join('')}</div></div>
  <div class="panel"><h2>Data</h2><p class="note">${S.rows.length.toLocaleString()} transactions across ${months().length} months, saved encrypted in your Google Drive. ${Object.keys(S.meta.rules).length} category rules learned.</p>
  <div class="foot" style="justify-content:flex-start">${S.downloads?'<button class="btn" id="exportAll">Export all transactions</button>':''}<button class="btn" data-upload>Upload statements</button><button class="btn" id="backupBtn">Download unencrypted backup</button><button class="btn" id="lockBtn">Lock and sign out on this device</button></div></div>`;
};



/* ---------- bank account layer ---------- */
const BANK_BASE=['Transfers','Cheque deposits','Child allowance','Card bills','Mortgage','Standing orders','Bank fees','Savings & investments','Other'];
const LEGACY_BCAT={'Transfers in':'Transfers','Transfers out':'Transfers','Other income':'Other','Other payments':'Other','Saved & invested':'Savings & investments','From savings & investments':'Savings & investments','From investments':'Savings & investments'};
const BCOL={'Transfers':'#2E9E6B','Cheque deposits':'#86B83A','Child allowance':'#43AFA8','Card bills':'#4C8DF0','Mortgage':'#9466D1','Standing orders':'#E59A2F','Bank fees':'#C94A5E','Savings & investments':'#2A86B8','Other':'#A7AEB8'};
const EXTRA_COL=['#D861A8','#E07A45','#7E4F8F','#B9A54A','#3F5E9E','#A34560'];
function bankCats(){return [...BANK_BASE,...(S.meta.bankCats||[]).map(x=>x.name).filter(n=>!BANK_BASE.includes(n))]}
function isSavDefault(c){return c==='Savings & investments'||(S.meta.bankCats||[]).some(x=>x.name===c&&x.savings)}
function isSav(c){const o=(S.meta.bankCount||{})[c];return o===undefined?isSavDefault(c):!o}
function bColor(c){if(BCOL[c])return BCOL[c];const i=(S.meta.bankCats||[]).findIndex(x=>x.name===c);return EXTRA_COL[(i<0?0:i)%EXTRA_COL.length]}
function bankCat(ds,a){
  if(/דיינרס|כאל|מקס|ישראכרט|מאסטרקרד|ויזה|אמריקן/.test(ds))return 'Card bills';
  if(/משכנת/.test(ds))return 'Mortgage';
  if(/הוראת קבע/.test(ds))return 'Standing orders';
  if(/עמל/.test(ds))return 'Bank fees';
  if(/קצבת ילדים|ביטוח לאומי/.test(ds))return a>0?'Child allowance':'Other';
  if(/מיטב|טרייד|פסגות|אקסלנס|אלטשולר|IBI|חיסכון|פיקדון|קופת גמל|השתלמות/.test(ds))return 'Savings & investments';
  if(/הפקדת שיק/.test(ds))return 'Cheque deposits';
  if(/העברה|הע\./.test(ds))return a<=-5000?'Savings & investments':'Transfers';
  return 'Other';
}
const bPill=c=>`<span class="cat"><i style="background:${bColor(c)}"></i>${esc(CL(c))}</span>`;
function bankMonths(){return [...new Set(S.bank.map(r=>r.m))].sort()}
function bankPartial(m){const ms=bankMonths();const rs=S.bank.filter(r=>r.m===m);const days=rs.map(r=>+r.d.slice(8,10));if(!rs.length)return true;if(m===ms[ms.length-1]&&Math.max(...days)<25)return true;if(m===ms[0]&&Math.min(...days)>2)return true;return false}
function defaultBankMonth(){const ms=bankMonths();for(let i=ms.length-1;i>=0;i--)if(!bankPartial(ms[i]))return ms[i];return ms[ms.length-1]}
function endBalance(m){const rs=S.bank.filter(r=>r.m===m&&r.bal!=null).sort((a,b)=>a.d.localeCompare(b.d)||(a.o||0)-(b.o||0));return rs.length?rs[rs.length-1].bal:null}
function billOf(r){if(r.b)return r.b;const c=S.meta.cards[r.k]||{};return addM(r.m,1)+'-'+String(c.billDay||'02').padStart(2,'0')}
function issuerGroup(s){s=s||'';if(/Cal|Diners|כאל|דיינרס/i.test(s))return 'cal';if(/Max|מקס/i.test(s))return 'max';if(/Isracard|ישראכרט/i.test(s))return 'isracard';if(/Leumi|לאומי|מאסטרקרד/i.test(s))return 'leumi';return 'other'}
function cardStatements(){const t={};for(const r of S.rows){const b=billOf(r);const key=r.k+'|'+b;const o=t[key]||(t[key]={key,k:r.k,b,g:issuerGroup((S.meta.cards[r.k]||{}).issuer||r.is),total:0,n:0,m:r.t==='installment'?r.m:r.m});o.total+=r.a;o.n++}return Object.values(t).map(x=>({...x,total:r2(x.total)}))}
const dayDiff=(a,b)=>Math.abs((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
function matchBills(){
  const st=cardStatements();const used=new Set();const res={};
  const bills=S.bank.filter(r=>r.c==='Card bills'&&r.a<0);
  const cands=r=>st.filter(s=>s.g===issuerGroup(r.ds)&&dayDiff(s.b,r.d)<=4&&!used.has(s.key));
  for(const r of bills){const m=cands(r).find(s=>Math.abs(s.total+r.a)<0.6);if(m){used.add(m.key);res[r.id]={status:'matched',st:[m]}}}
  for(const r of bills){if(res[r.id])continue;const c=cands(r);const all=sum(c.map(s=>s.total));if(c.length>1&&Math.abs(all+r.a)<0.6){c.forEach(s=>used.add(s.key));res[r.id]={status:'matched',st:c}}}
  for(const r of bills){if(res[r.id])continue;const c=cands(r);const all=r2(sum(c.map(s=>s.total)));res[r.id]=c.length?{status:'partial',st:c,have:all}:{status:'missing',st:[]}}
  return res;
}
function cardName(k){const c=S.meta.cards[k]||{};return `${c.issuer||'Card'} ${k}`}
function matchHTML(r,mt){
  const x=mt[r.id];if(!x)return '';
  if(x.status==='matched'){const pm=addM(x.st[0].b.slice(0,7),-1);return `<button class="mstat ok" data-billgo="${esc(JSON.stringify({cards:x.st.map(s=>s.k),m:pm}))}">Matched to ${mLabel(pm)} purchases</button>`}
  if(x.status==='partial')return `<span class="mstat warn">Only ${ils(x.have,2)} of it uploaded</span>`;
  return `<span class="mstat warn">Statement not uploaded</span>`;
}
function billName(r,mt){const x=mt[r.id];if(x&&x.st&&x.st.length)return x.st.map(s=>cardName(s.k)).join(' + ');const g=issuerGroup(r.ds);return {cal:'Cal (Diners)',max:'Max',isracard:'Isracard',leumi:'Leumi Mastercard'}[g]||r.ds}
const DEFAULT_PLANNED=[{id:'rent',name:'Rent',c:'Rent',amount:29400,every:3,next:'2026-11-02'}];
function planned(){return S.meta.planned||DEFAULT_PLANNED}
const isPlanPay=(r,p)=>r.c===p.c&&r.a<0&&Math.abs(-r.a-p.amount)<=p.amount*0.05;
function hiddenBillIds(){const ids=new Set();if(!Object.values(S.meta.cards).some(c=>c.hidden))return ids;const mt=matchBills();for(const[id,x]of Object.entries(mt))if(x.st&&x.st.length&&x.st.every(st=>cardHidden(st.k)))ids.add(id);return ids}
function cfRows(){
  const hb=hiddenBillIds();const base=hb.size?S.bank.filter(r=>!hb.has(r.id)):S.bank;
  if(!S.cf.spread)return base;const ps=planned().filter(p=>p.every>1);if(!ps.length)return base;
  const out=[];const ms=bankMonths();const cov={};
  for(const r of base){const p=ps.find(p=>isPlanPay(r,p));if(!p){out.push(r);continue}
    for(let i=0;i<p.every;i++){const m=addM(r.m,i);out.push({...r,id:r.id+'#'+i,m,a:r2(r.a/p.every),v:true,ds:`${r.ds} (${i+1} of ${p.every})`});(cov[p.id]||(cov[p.id]=new Set())).add(m)}}
  for(const p of ps)for(const m of ms)if(!(cov[p.id]&&cov[p.id].has(m)))out.push({id:'est|'+p.id+'|'+m,d:m+'-01',m,ds:`${p.name} (estimated, paid in another period)`,a:-r2(p.amount/p.every),c:p.c,v:true,est:true});
  return out;
}
function fullMonths(){return bankMonths().filter(m=>!bankPartial(m))}
function futureMonths(){return []}
function planDates(p){const last=S.bank.filter(r=>isPlanPay(r,p)).map(r=>r.d).sort().pop();let d=last?addM(last.slice(0,7),p.every)+last.slice(7):p.next;const out=[];const end=addM(bankMonths().slice(-1)[0],6);while(d&&d.slice(0,7)<=end&&out.length<24){out.push(d);d=addM(d.slice(0,7),p.every)+d.slice(7)}return out}
function forecast(m){
  const fm=fullMonths().slice(-3);const B=cfRows();const pc=planned().map(p=>p.c);
  const avg=f=>fm.length?sum(fm.map(mm=>sum(B.filter(r=>r.m===mm&&f(r)).map(r=>Math.abs(r.a)))))/fm.length:0;
  const earned=avg(r=>r.a>0&&!isSav(r.c));const other=avg(r=>r.a<0&&!isSav(r.c)&&!pc.includes(r.c));
  const items=[{label:`Everything else (card bills, mortgage, Gan…), average of ${fm.map(mLabel).join(' and ')}`,amount:other}];
  for(const p of planned()){if(S.cf.spread&&p.every>1){items.push({label:`${p.name}, spread: ${ils(p.amount/p.every)} a month`,amount:p.amount/p.every});continue}
    planDates(p).filter(d=>d.slice(0,7)===m).forEach(d=>items.push({label:`${p.name} due ${+d.slice(8,10)} ${MN[+d.slice(5,7)-1]}`,amount:p.amount}))}
  return{earned,spent:sum(items.map(i=>i.amount)),items,fm};
}
function forecastHTML(M,chips,toggles){
  const f=forecast(M);const left=f.earned-f.spent;
  return `<section class="hero2"><p class="lbl">Expected left over after spending</p><p class="bignum num ${left>=0?'pos':'neg'}">${left>=0?'+':'−'}${ils(Math.abs(left))}</p><p class="hint">Expected earned ${ils(f.earned)}, expected spent ${ils(f.spent)}.</p></section>
  <section class="sec"><h2>What this estimate is made of</h2><div class="list">
  <div class="lrow" style="cursor:default"><span>${bPill('Transfers')} Earned, average of ${f.fm.map(mLabel).join(' and ')}</span><span class="num down">${ils(f.earned)}</span></div>
  ${f.items.map(i=>`<div class="lrow" style="cursor:default"><span>${esc(i.label)}</span><span class="num">${ils(i.amount)}</span></div>`).join('')}</div>
  <p class="note">An estimate, not a promise: it repeats your recent full months and adds the planned payments below when they fall due. It gets better with every statement you upload.</p></section>
  <div class="cols"><section class="sec"><h2>Earned and spent, actual and expected</h2><div class="chart"><canvas id="c_inout"></canvas></div></section><section class="sec"><h2>Account balance, actual then expected</h2><div class="chart"><canvas id="c_bal"></canvas></div></section></div>${plannedPanel()}`;
}
function plannedPanel(){
  const ps=planned();
  return `<section class="sec"><div class="subhead"><h2>Planned payments</h2><button class="linkbtn" id="planAdd">Add</button></div><p class="hint">Payments that cover several months. Used to spread rent and to estimate expected months.</p>
  <div class="rows">${ps.map((p,i)=>`<div class="row" data-planedit="${i}" role="button" tabindex="0"><i style="background:${bColor(p.c)}"></i><span class="nm">${esc(p.name)}<small>${ils(p.amount)} every ${p.every} month${p.every>1?'s':''}${planDates(p)[0]?`, next ${+planDates(p)[0].slice(8,10)} ${MN[+planDates(p)[0].slice(5,7)-1]}`:''}</small></span><span class="sh num">${ils(p.amount/p.every)} a month</span><b></b><span class="chev">›</span></div>`).join('')||'<p class="hint">None yet.</p>'}</div></section>`;
}
function openPlanSheet(i){
  const ps=JSON.parse(JSON.stringify(planned()));const isNew=i<0;const p=isNew?{id:'p'+Date.now(),name:'',c:'Other',amount:'',every:1,next:addM(todayISO().slice(0,7),1)+'-01'}:ps[i];
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="plCancel">Cancel</button><b>${isNew?'New planned payment':'Planned payment'}</b><button type="button" class="btn pri sm" id="plSave">Save</button></div>
  <div class="field"><label for="plName">Name</label><input class="inp" id="plName" value="${esc(p.name)}" dir="auto" placeholder="e.g. Rent, yearly insurance"></div>
  <div class="row2"><div class="field"><label for="plAmt">Each payment (₪)</label><input class="inp num" id="plAmt" inputmode="decimal" value="${p.amount}"></div><div class="field"><label for="plEvery">Every (months)</label><input class="inp num" id="plEvery" inputmode="numeric" value="${p.every}"></div></div>
  <div class="row2"><div class="field"><label for="plNext">Next payment</label><input class="inp" id="plNext" type="date" value="${p.next||''}"></div><div class="field"><label for="plCat">Bank category</label><select class="inp" id="plCat">${bankCats().map(c=>`<option value="${esc(c)}" ${c===p.c?'selected':''}>${esc(CL(c))}</option>`).join('')}</select></div></div>
  ${isNew?'':'<div class="foot" style="justify-content:flex-start"><button class="btn ghost" id="plDel" style="color:var(--neg)">Remove this planned payment</button></div>'}`);
  $('#plCancel').onclick=closeSheet;
  if(!isNew)$('#plDel').onclick=()=>{ps.splice(i,1);S.meta.planned=ps;saveMeta();closeSheet();renderMain()};
  $('#plSave').onclick=()=>{const amount=parseAmt($('#plAmt').value),every=Math.round(parseAmt($('#plEvery').value)||0),name=$('#plName').value.trim();
    if(!name){toast('Give the payment a name');return}if(!(amount>0)||!(every>=1)){toast('Enter an amount and how often it is paid');return}
    const np={...p,name,amount,every,next:$('#plNext').value||p.next,c:$('#plCat').value};if(isNew)ps.push(np);else ps[i]=np;S.meta.planned=ps;saveMeta();closeSheet();renderMain();toast('Saved')};
}
function cfMonthNav(M,list){const i=list.indexOf(M);const fut=futureMonths().includes(M);const note=fut?'Expected':bankPartial(M)?'Partial month':'';
  return `<div class="mstep"><button class="iconbtn" data-bstep="-1" ${i<=0?'disabled':''} aria-label="Previous month"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="mlabel"><b>${mLong(M)}</b>${note?`<small>${note}</small>`:''}</div><button class="iconbtn" data-bstep="1" ${i>=list.length-1?'disabled':''} aria-label="Next month"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`}
function cfOptionsLine(){const on=[];if(S.cf.spread)on.push('rent spread monthly');if(S.cf.future)on.push('expected months shown');const ex=bankCats().filter(isSav).filter(c=>c!=='Savings & investments');if(ex.length)on.push(ex.map(CL).join(', ')+' not counted');const hid=Object.entries(S.meta.cards).filter(([k,c])=>c.hidden).map(([k])=>k);if(hid.length)on.push('cards '+hid.join(', ')+' hidden');
  return `<div class="optline"><button class="linkbtn" id="cfOpts">View options</button>${on.length?`<span>${esc(on.join(', '))}</span>`:''}</div>`}
function openCfOptions(){
  sheet(`<div class="shead"><span></span><b>View options</b><button type="button" class="btn pri sm" id="optDone">Done</button></div>
  <div class="optlist">
  <label class="opt"><input type="checkbox" data-cfopt="spread" ${S.cf.spread?'checked':''}><span><b>Spread rent per month</b><small>Show 9,800 ₪ every month instead of one payment every three months.</small></span></label>
  <button class="opt optbtn" id="cfCount"><span><b>What counts as earned and spent</b><small>Currently not counted: ${esc(bankCats().filter(isSav).map(CL).join(', ')||'nothing')}</small></span><span aria-hidden="true">›</span></button>
  </div>`);
  $('#optDone').onclick=closeSheet;
}
const cleanDs=d=>String(d||'').replace(/\s*ב?-י$/,'').trim();
function bankMonthData(M){
  const B=cfRows();const rows=B.filter(r=>r.m===M);
  const earned=sum(rows.filter(r=>r.a>0&&!isSav(r.c)).map(r=>r.a)),spent=-sum(rows.filter(r=>r.a<0&&!isSav(r.c)).map(r=>r.a));
  const savedOut=-sum(rows.filter(r=>r.a<0&&isSav(r.c)).map(r=>r.a)),savedBack=sum(rows.filter(r=>r.a>0&&isSav(r.c)).map(r=>r.a));
  const grp=(sav,sign)=>{const g={};rows.filter(r=>(sign>0?r.a>0:r.a<0)&&isSav(r.c)===sav).forEach(r=>g[r.c]=(g[r.c]||0)+Math.abs(r.a));return Object.entries(g).sort((a,b)=>b[1]-a[1])};
  return{rows,earned,spent,savedOut,savedBack,left:earned-spent,outs:grp(false,-1),ins:grp(false,1)};
}
function openBankFilter(){
  const cats=bankCats();const n=c=>S.bank.filter(r=>r.c===c).length;
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="bfCancel">Cancel</button><b>Filter</b><button type="button" class="btn pri sm" id="bfApply">Apply</button></div>
  <h3 class="sh3">View</h3>
  <label class="opt"><input type="checkbox" id="bfSpread" ${S.cf.spread?'checked':''}><span><b>Spread rent per month</b><small>Show the rent as a monthly amount instead of one payment every few months.</small></span></label>
  <h3 class="sh3">Counted as earned and spent</h3><p class="hint">Untick money that is only moving, like savings, investments or paying down the mortgage.</p>
  <div class="catlist">${cats.map(c=>`<label class="catrow" style="grid-template-columns:auto 10px minmax(0,1fr) auto;cursor:pointer"><input type="checkbox" data-ct="${esc(c)}" ${isSav(c)?'':'checked'}><i style="background:${bColor(c)}"></i><span>${esc(CL(c))}</span><span class="status">${n(c)}</span></label>`).join('')}</div>`);
  $('#bfCancel').onclick=closeSheet;
  $('#bfApply').onclick=()=>{S.cf.spread=$('#bfSpread').checked;S.cf.future=false;const o={};document.querySelectorAll('[data-ct]').forEach(i=>{const c=i.dataset.ct;if(i.checked!==!isSavDefault(c))o[c]=i.checked});S.meta.bankCount=o;saveMeta();closeSheet();S.bankMonth=null;renderAll()};
}
function evsHTML(D){
  const E=D.earned,Sp=D.spent,max=Math.max(E,Sp,1);const pct=v=>(v/max*100).toFixed(2)+'%';
  const over=Sp>E;const diff=Math.abs(E-Sp);const ratio=E?Math.round(Sp/E*100):null;
  const spentBar=over?`<span class="evs-fill sp joined" style="width:${pct(E)}"></span><span class="evs-fill neg" style="left:${pct(E)};width:${pct(Sp-E)}"></span>`:`<span class="evs-fill sp${E-Sp>0.5?' joined':''}" style="width:${pct(Sp)}"></span><span class="evs-gap" style="left:${pct(Sp)};width:${pct(E-Sp)}"></span>`;
  return `<section class="sec evs box"><div class="evs-head"><div><h2>Earned vs spent</h2><p class="hint">${ratio==null?'Nothing earned this month.':`You spent <b>${ratio}%</b> of what you earned.`}</p></div>
    <div class="evs-result ${over?'neg':'pos'}"><small>${over?'Overspent':'Left over'}</small><b class="num">${over?'−':'+'}${ils(diff)}</b></div></div>
    <div class="evs-bars" role="img" aria-label="Earned ${ils(E)}, spent ${ils(Sp)}, ${over?'overspent':'left over'} ${ils(diff)}">
      <div class="evs-row"><span class="evs-l">Earned</span><span class="evs-track"><span class="evs-fill pos" style="width:${pct(E)}"></span>${over?`<span class="evs-mark" style="left:${pct(E)}"></span>`:''}</span><b class="num">${ils(E)}</b></div>
      <div class="evs-row"><span class="evs-l">Spent</span><span class="evs-track">${spentBar}${over?`<span class="evs-mark" style="left:${pct(E)}"></span>`:''}</span><b class="num ${over?'neg':''}">${ils(Sp)}</b></div>
    </div>
    <div class="evs-key">${over?`<span><i class="k-neg"></i>Spent beyond what you earned</span>`:`<span><i class="k-gap"></i>Not spent, left over</span>`}</div>
    <div class="facts"><div><small>Saved and invested</small><b class="num">${ils(D.savedOut-D.savedBack)}</b></div><div><small>End balance</small><b class="num">${D.eb!=null?ils(D.eb):'None'}</b></div></div></section>`;
}
function cardWidgetData(M){
  const mt=matchBills();const all=cardStatements();
  const matched=new Set();Object.values(mt).forEach(x=>{if(x.status==='matched')x.st.forEach(s=>matched.add(s.key))});
  const per=(m)=>{const o={};all.filter(s=>s.b.slice(0,7)===m&&!cardHidden(s.k)).forEach(s=>{const c=o[s.k]||(o[s.k]={k:s.k,total:0,keys:[]});c.total=r2(c.total+s.total);c.keys.push(s.key)});return o};
  const cur=per(M),prev=per(addM(M,-1));
  const rows=Object.values(cur).map(c=>({k:c.k,name:cardName(c.k),person:(S.meta.cards[c.k]||{}).person||'',total:c.total,prev:prev[c.k]?prev[c.k].total:null,status:c.keys.every(k=>matched.has(k))?'ok':'nobank',m:addM(M,-1)}));
  const hb=hiddenBillIds();
  S.bank.filter(r=>r.m===M&&r.c==='Card bills'&&r.a<0&&!hb.has(r.id)).forEach(r=>{const x=mt[r.id];if(x&&x.status!=='matched')rows.push({k:null,name:billName(r,mt),person:'',total:-r.a,prev:null,status:x.status==='partial'?'partial':'missing',have:x.have})});
  return rows.sort((a,b)=>b.total-a.total);
}
function cardWidgetHTML(M){
  const rows=cardWidgetData(M);
  if(!rows.length)return `<section class="sec ccw box"><div class="subhead"><h2>Credit cards</h2><button class="linkbtn" data-layer="cards" data-cm="${addM(M,-1)}">Open cards</button></div><p class="hint">No card statements for ${mLong(M)} yet. Upload them to see each card here.</p></section>`;
  const max=Math.max(...rows.map(r=>r.total),1);const tot=r2(sum(rows.map(r=>r.total)));
  const st=r=>r.status==='ok'?'<span class="mstat ok">Matches the bank charge</span>':r.status==='nobank'?'<span class="mstat mute">Not charged to this account</span>':r.status==='partial'?`<span class="mstat warn">Statement covers ${ils(r.have,2)} of it</span>`:'<span class="mstat warn">Statement missing</span>';
  const ch=r=>{if(r.prev==null)return '';const d=r2(r.total-r.prev);if(Math.abs(d)<1)return '<span class="muted">same as last month</span>';return `<span class="${d>0?'up':'down'}">${d>0?'▲':'▼'} ${ils(Math.abs(d))}</span>`};
  return `<section class="sec ccw box"><div class="subhead"><h2>Credit cards</h2><button class="linkbtn" data-layer="cards" data-cm="${addM(M,-1)}">Open cards</button></div><p class="hint">What each card charged in ${mLong(M)}, for purchases made in ${mLong(addM(M,-1))}.</p>
  <div class="ccw-list">${rows.map(r=>`<div class="ccw-row" ${r.k?`data-billgo="${esc(JSON.stringify({cards:[r.k],m:r.m}))}" role="button" tabindex="0"`:''}>
    <div class="ccw-name"><b dir="auto">${esc(r.name)}</b><small>${esc(r.person||'')}${r.person?' · ':''}${ch(r)}</small></div>
    <div class="ccw-bar"><span style="width:${(r.total/max*100).toFixed(1)}%"></span></div>
    <b class="num ccw-amt">${ils(r.total,2)}</b>
    <div class="ccw-st">${st(r)}</div></div>`).join('')}
  </div><div class="ccw-total"><span>Total</span><b class="num">${ils(tot,2)}</b></div></section>`;
}
window.view_cashflow=function(){
  if(!S.bank.length)return `<section class="empty-state"><h2>Add your bank account</h2><p>Upload a bank statement (PDF or Excel) to see what you earn, what you spend, and how each card bill matches its statement.</p><button class="btn pri" data-upload>Upload bank statement</button></section>`;
  const M=monthCtx().M;
  const D=bankMonthData(M);D.eb=endBalance(M);
  const tot=Math.max(1,D.spent),itot=Math.max(1,D.earned);const sh=(v,t)=>v/t<.01?'<1%':Math.round(v/t*100)+'%';
  const row=(c,v,share)=>`<div class="row" ${c==='Card bills'?`data-layer="cards" data-cm="${addM(M,-1)}" role="button" tabindex="0"`:`data-bcat="${esc(c)}" role="button" tabindex="0"`}><i style="background:${bColor(c)}"></i><span class="nm">${esc(CL(c))}</span><span class="sh num">${share}</span><b class="num">${ils(v)}</b><span class="chev" aria-hidden="true">›</span></div>`;
  const savRows=D.rows.filter(r=>isSav(r.c));
  const savHTML=[...new Set(savRows.map(r=>r.c))].map(c=>{const pi=-sum(savRows.filter(r=>r.c===c&&r.a<0).map(r=>r.a)),to=sum(savRows.filter(r=>r.c===c&&r.a>0).map(r=>r.a));return `<div class="row" data-bcat="${esc(c)}" role="button" tabindex="0"><i style="background:${bColor(c)}"></i><span class="nm">${esc(CL(c))}<small>${ils(pi)} put in${to?`, ${ils(to)} taken out`:''}</small></span><span class="sh"></span><b class="num">${ils(pi-to)}</b><span class="chev" aria-hidden="true">›</span></div>`}).join('');
  return `${evsHTML(D)}
  <section class="sec box"><h2>Spent by category</h2>
    <div class="catwrap"><div class="rows">${D.outs.map(([c,v])=>row(c,v,sh(v,tot))).join('')||'<p class="hint">Nothing spent this month.</p>'}</div>
    ${D.outs.length?`<div class="donut"><canvas id="c_spentpie" aria-label="Spent by category chart"></canvas><div class="donut-c"><small>Spent</small><b class="num">${ils(D.spent)}</b></div></div>`:''}</div></section>
  <div class="pair">
    ${cardWidgetHTML(M)}
    <section class="sec box"><h2>Earned by category</h2><div class="rows">${D.ins.map(([c,v])=>row(c,v,sh(v,itot))).join('')||'<p class="hint">Nothing earned this month.</p>'}</div>
      ${savHTML?`<h3 class="h2b">Not counted</h3><p class="hint">Savings, investments and anything you excluded in Filter.</p><div class="rows">${savHTML}</div>`:''}</section>
  </div>
  <div class="pair">
    <section class="sec box"><h2>Earned and spent by month</h2><div class="chart"><canvas id="c_inout"></canvas></div></section>
    <section class="sec box"><h2>Account balance</h2><div class="chart"><canvas id="c_bal"></canvas></div></section>
  </div>`;
};
window.view_banktx=function(){
  if(!S.bank.length)return window.view_cashflow();
  const M=monthCtx().M;if(futureMonths().includes(M))return `<section class="empty-state"><h2>${mLong(M)} has not happened yet</h2><p>Expected months have no transactions. Pick a past month above.</p></section>`;
  const rows=cfRows().filter(r=>r.m===M&&(!S.bcat||r.c===S.bcat));const mt=matchBills();
  const cols=[{k:'d',l:'Date',f:v=>`${+v.slice(8,10)} ${MN[+v.slice(5,7)-1]}`},
   {k:'ds',l:'Description',wrap:1,h:r=>`<span class="tdmain" dir="auto">${esc(r.cm||(r.c==='Card bills'&&r.a<0?billName(r,mt):cleanDs(r.ds)))}</span>${(r.cm||r.c==='Card bills')?`<span class="tdsub" dir="auto">${esc(cleanDs(r.ds))}</span>`:''}<span class="tdsub show-sm">${bPill(r.c)}</span>${r.c==='Card bills'&&r.a<0?`<span class="tdsub">${matchHTML(r,mt)}</span>`:''}`,x:r=>r.ds},
   {k:'c',l:'Category',cls:'hide-sm',h:r=>bPill(r.c),x:r=>CL(r.c)},
   {k:'a',l:'Amount',r:1,h:r=>`<span class="${r.a>0?'pos':''}">${r.a>0?'+':'−'}${ils(Math.abs(r.a),2)}</span>`,x:r=>r.a},
   {k:'bal',l:'Balance',r:1,cls:'hide-sm',f:v=>v!=null?ils(v,2):''},
   {k:'cm',l:'Comment',cls:'hide-all',x:r=>r.cm||'',h:()=>''}];
  const inn=sum(rows.filter(r=>r.a>0).map(r=>r.a)),out=-sum(rows.filter(r=>r.a<0).map(r=>r.a));
  return `<section class="sec" style="margin-top:16px"><p class="hint" style="margin:0 0 4px">${rows.length} transactions in ${mLong(M)}: <b class="pos">${ils(inn)}</b> in, <b>${ils(out)}</b> out. Tap a row to change its category or add a comment.</p>
  ${S.bcat?`<div class="frow2"><span class="chip">${esc(CL(S.bcat))}<button data-bcatclear aria-label="Remove">×</button></span></div>`:''}
  ${table('bank',cols,rows.slice().sort((a,b)=>b.d.localeCompare(a.d)||(b.o||0)-(a.o||0)),{click:1,name:'Bank '+mLabel(M),sort:null})}</section>`;
};
window.view_planned=function(){return plannedPanel()};
window.after_cashflow=function(){
  if(!S.bank.length)return;{const M=monthCtx().M;}const ms=bankMonths();const fut=futureMonths();const all=[...ms,...fut];const B=cfRows();
  const L=all.map(m=>mLabel(m)+(fut.includes(m)?' (exp.)':bankPartial(m)?'*':''));
  const by=(m,sav,sign)=>r2(Math.abs(sum(B.filter(r=>r.m===m&&isSav(r.c)===sav&&(sign>0?r.a>0:r.a<0)).map(r=>r.a))));
  const G=css('--green'),R=css('--red');const F=fut.map(m=>forecast(m));
  const ds=[{label:'Earned',data:all.map(m=>fut.includes(m)?null:by(m,false,1)),backgroundColor:G,borderRadius:3},{label:'Spent',data:all.map(m=>fut.includes(m)?null:by(m,false,-1)),backgroundColor:R,borderRadius:3},{label:'Saved and invested (net)',data:all.map(m=>fut.includes(m)?null:r2(by(m,true,-1)-by(m,true,1))),backgroundColor:'#2A86B8',borderRadius:3}];
  if(fut.length){ds.push({label:'Expected earned',data:all.map(m=>{const i=fut.indexOf(m);return i<0?null:r2(F[i].earned)}),backgroundColor:G+'66',borderColor:G,borderWidth:1,borderRadius:3},{label:'Expected spent',data:all.map(m=>{const i=fut.indexOf(m);return i<0?null:r2(F[i].spent)}),backgroundColor:R+'66',borderColor:R,borderWidth:1,borderRadius:3})}
  chart('c_inout',{type:'bar',data:{labels:L,datasets:ds}});
  {const D=bankMonthData(monthCtx().M);if(D.outs.length)chart('c_spentpie',{type:'doughnut',data:{labels:D.outs.map(([c])=>CL(c)),datasets:[{data:D.outs.map(([,v])=>r2(v)),backgroundColor:D.outs.map(([c])=>bColor(c)),borderColor:css('--surface'),borderWidth:2,hoverOffset:4}]},
    options:{cutout:'68%',interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${ils(c.parsed)} (${Math.round(c.parsed/Math.max(1,D.spent)*100)}%)`}}},
      onClick:(e,els)=>{if(!els.length)return;const c=D.outs[els[0].index][0];if(c==='Card bills'){S.view='overview';S.month=addM(monthCtx().M,-1)}else{S.bcat=c;S.view='banktx'}renderAll();scrollTo(0,0)},
      onHover:(e,els)=>{e.native.target.style.cursor=els.length?'pointer':'default'}}})}
  const bal=ms.map(m=>endBalance(m));let run=bal[bal.length-1];const exp=fut.map((m,i)=>{run=r2(run+F[i].earned-F[i].spent);return run});
  const P=css('--primary');
  chart('c_bal',{type:'line',data:{labels:L,datasets:[{label:'Balance',data:[...bal,...fut.map(()=>null)],borderColor:P,backgroundColor:P+'1F',fill:true,borderWidth:2.5,pointRadius:3,tension:.3},...(fut.length?[{label:'Expected balance (before savings)',data:[...bal.map((v,i)=>i===bal.length-1?v:null),...exp],borderColor:P,borderDash:[6,4],borderWidth:2,pointRadius:3,tension:.3}]:[])]},options:{plugins:{legend:{display:!!fut.length}}}});
};

function openCountSheet(){
  const cats=bankCats();const n=c=>S.bank.filter(r=>r.c===c).length;
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="ctCancel">Cancel</button><b>What counts</b><button type="button" class="btn pri" id="ctSave">Apply</button></div>
  <p class="note">Ticked categories count as earned (money in) or spent (money out). Untick anything that is really moving money, like savings, investments or paying down the mortgage.</p>
  <div class="catlist" style="margin-top:10px">${cats.map(c=>`<label class="catrow" style="grid-template-columns:auto 10px minmax(0,1fr) auto;cursor:pointer"><input type="checkbox" data-ct="${esc(c)}" ${isSav(c)?'':'checked'}><i style="background:${bColor(c)}"></i><span>${esc(CL(c))}</span><span class="status">${n(c)}</span></label>`).join('')}</div>`);
  $('#ctCancel').onclick=closeSheet;
  $('#ctSave').onclick=()=>{const o={};document.querySelectorAll('[data-ct]').forEach(i=>{const c=i.dataset.ct;const counted=i.checked;if(counted!==!isSavDefault(c))o[c]=counted});S.meta.bankCount=o;saveMeta();closeSheet();renderMain();toast('Updated what counts as earned and spent')};
}
function openBankSheet(r){
  const cats=bankCats();
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="bkCancel">Cancel</button><b>Edit bank transaction</b><button type="button" class="btn pri" id="bkSave">Save</button></div>
  <h3 dir="auto">${esc(r.ds)}</h3><p class="note">${r.d}, ${r.a>0?'money in':'money out'} ${ils(Math.abs(r.a),2)}${r.bal!=null?`, balance after ${ils(r.bal,2)}`:''}</p>
  <div class="field"><label for="bkCm">Comment or reason</label><textarea class="inp" id="bkCm" rows="2" dir="auto" placeholder="e.g. salary Raphael, rent from tenant, transfer to savings">${esc(r.cm||'')}</textarea></div>
  <div class="field"><label for="bkCat">Category</label><select class="inp" id="bkCat">${cats.map(c=>`<option value="${esc(c)}" ${c===r.c?'selected':''}>${esc(CL(c))}</option>`).join('')}<option value="__new">+ New category…</option></select></div>
  <div class="field" id="bkNewWrap" hidden><label for="bkNew">New category name</label><input class="inp" id="bkNew" dir="auto" placeholder="e.g. Salary, Rent, Childcare"><label class="note" style="display:flex;gap:8px;align-items:center;margin-top:6px"><input type="checkbox" id="bkNewSav"> Savings or investments (not counted as earned or spent)</label></div>
  <label class="note" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="bkAll"> Also apply to every "${esc(r.ds)}" ${r.a>0?'income':'payment'} with the same amount</label>`);
  $('#bkCancel').onclick=closeSheet;
  $('#bkCat').onchange=e=>{$('#bkNewWrap').hidden=e.target.value!=='__new';if(e.target.value==='__new')$('#bkNew').focus()};
  $('#bkSave').onclick=async()=>{const b=$('#bkSave');if(b.disabled)return;let c=$('#bkCat').value;const cm=$('#bkCm').value.trim();
    if(c==='__new'){const nm=$('#bkNew').value.trim();if(!nm){toast('Name the new category');return}S.meta.bankCats=(S.meta.bankCats||[]).filter(x=>x.name!==nm);if(!BANK_BASE.includes(nm))S.meta.bankCats.push({name:nm,savings:$('#bkNewSav').checked});saveMeta();c=nm}const ms=new Set([r.m]);
    if(cm)r.cm=cm;else delete r.cm;r.c=c;
    if($('#bkAll').checked)S.bank.forEach(x=>{if(x.ds===r.ds&&x.a===r.a){x.c=c;ms.add(x.m)}});
    b.disabled=true;b.textContent='Saving…';const ok=await saveBank([...ms]);renderAll();
    if(ok){closeSheet();toast('Saved')}else{b.disabled=false;b.textContent='Try again'}};
}
let bankSaving=Promise.resolve();
function saveBank(months){
  bankSaving=bankSaving.catch(()=>{}).then(async()=>{
    if(S.store!=='cloud'){try{localStorage.setItem('hl_bank',JSON.stringify(S.bank))}catch(e){toast('Browser storage is full');return false}return true}
    const base=S.db.doc(SHARED).collection('bank');let failed=null;setStatus('Saving…');
    for(const m of months){const rows=S.bank.filter(r=>r.m===m);try{const op=rows.length?base.doc(m).set({month:m,rows:JSON.parse(JSON.stringify(rows))}):base.doc(m).delete();await Promise.race([op,new Promise((_,rej)=>setTimeout(()=>rej({code:'timeout'}),15000))])}catch(e){failed=e.code||e.message}}
    if(failed){setStatus('Bank data not saved ('+failed+')',true);toast('Could not save bank data ('+failed+')',6000);return false}
    idleStatus();return true;
  });return bankSaving;
}
function bankRowsFromAoa(aoa,hi){
  const h=aoa[hi].map(hnorm);const col=re=>h.findIndex(x=>re.test(x));
  const cd=col(/^תאריך$|תאריך ערך|תאריך|date/i),cs=col(/סוג תנועה|תיאור|פרטים|description/i),cc=col(/זכות|credit/i),cdb=col(/חובה|debit/i),cb=col(/יתרה|balance/i);
  const out=[];for(let i=hi+1;i<aoa.length;i++){const r=aoa[i];const d=parseDate(r[cd]);if(!d)continue;const cr=parseAmt(r[cc])||0,db=parseAmt(r[cdb])||0;if(!cr&&!db)continue;out.push({date:d,ds:hnorm(r[cs]),a:r2(cr-Math.abs(db)),bal:cb>=0?parseAmt(r[cb]):null})}
  return out;
}
function prepBank(st){
  const acct=st.acct||'bank';const newestFirst=st.rows.length>1&&st.rows[0].date>st.rows[st.rows.length-1].date;
  const seen={};const have=new Set(S.bank.map(r=>r.id));const fuzzy={};S.bank.forEach(r=>{const f=r.acct+'|'+r.d+'|'+r.a.toFixed(2);fuzzy[f]=(fuzzy[f]||0)+1});const seenF={};
  const n=st.rows.length;const fresh=[];let dup=0;
  st.rows.forEach((x,i)=>{const base=[acct,x.date,x.ds,x.a.toFixed(2)].join('|');seen[base]=(seen[base]||0);const id=base+'|'+seen[base];seen[base]++;
    const f=acct+'|'+x.date+'|'+x.a.toFixed(2);seenF[f]=(seenF[f]||0)+1;
    if(have.has(id)||seenF[f]<=(fuzzy[f]||0)){dup++;return}
    fresh.push({id,d:x.date,m:x.date.slice(0,7),ds:x.ds,a:x.a,bal:x.bal,acct,o:newestFirst?n-i:i+1,c:bankCat(x.ds,x.a)})});
  return{fresh,dup};
}
function bankReviewBlock(st){
  const p=prepBank(st);const inn=sum(st.rows.filter(r=>r.a>0).map(r=>r.a)),out=-sum(st.rows.filter(r=>r.a<0).map(r=>r.a));
  const sorted=st.rows.slice();const newestFirst=sorted.length>1&&sorted[0].date>sorted[sorted.length-1].date;if(newestFirst)sorted.reverse();
  let breaks=0;for(let i=1;i<sorted.length;i++){if(sorted[i].bal!=null&&sorted[i-1].bal!=null&&Math.abs(sorted[i-1].bal+sorted[i].a-sorted[i].bal)>0.02)breaks++}
  const chk=sorted.some(r=>r.bal!=null)?(breaks?`<span class="badline">${breaks} rows don't add up with the running balance, check them</span>`:`<span class="okline">Every row adds up with the running balance</span>`):'';
  return `<div class="panel"><div class="phead"><h2>${esc(st.file)} <small>bank account ${esc(st.acct||'')}</small></h2></div><p class="note">${st.rows.length} rows: ${ils(inn)} in, ${ils(out)} out. ${chk}</p><p class="note"><b>${p.fresh.length}</b> new transactions${p.dup?`, ${p.dup} already saved and skipped`:''}.</p>
  <div class="tw"><table><thead><tr><th>Date</th><th>Description</th><th class="r">Amount</th><th>Category</th></tr></thead><tbody>${p.fresh.slice(0,8).map(r=>`<tr><td>${r.d}</td><td dir="auto">${esc(r.ds)}</td><td class="r ${r.a>0?'down':''}">${r.a>0?'+':'−'}${ils(Math.abs(r.a),2)}</td><td>${bPill(r.c)}</td></tr>`).join('')}${p.fresh.length>8?`<tr><td colspan="4" class="muted">and ${p.fresh.length-8} more</td></tr>`:''}</tbody></table></div></div>`;
}
const BANK_SPEC=`Reply with only JSON: {"account":"838-04588290"|null,"bank":string|null,"transactions":[{"date":"YYYY-MM-DD","description":string,"credit":number|null,"debit":number|null,"balance":number|null}]}. Keep rows in the order printed. credit is money in (זכות), debit is money out (חובה), both positive numbers. Use the running balance column (יתרה) to decide which column an amount belongs to: balance after a row = previous balance + credit − debit. Dates like 04.10.2026 are day.month.year.`;
async function parseBankText(f,text,progress){
  progress&&progress('Claude is reading the bank statement '+f.name);
  const j=await S.sample.json(`Extract every transaction from this bank account statement (Hebrew RTL text may appear reversed).\n${BANK_SPEC}\n\nSTATEMENT TEXT:\n${text}`,{modelTier:'default'});
  return [{file:f.name,bank:true,kind:'Bank PDF',acct:j.account||'bank',rows:(j.transactions||[]).map(t=>({date:t.date,ds:String(t.description||'').trim(),a:r2((+t.credit||0)-(+t.debit||0)),bal:t.balance!=null?+t.balance:null})).filter(r=>r.date&&r.a)}];
}



/* ---------- sheets ---------- */
function sheet(html){closeSheet();const bg=document.createElement('div');bg.className='sheet-bg';bg.id='sheetBg';bg.innerHTML=`<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;bg.addEventListener('click',e=>{if(e.target===bg)closeSheet()});document.body.appendChild(bg);return bg}
function closeSheet(){const b=$('#sheetBg');if(b)b.remove()}
function openFilterSheet(){
  const ms=months();const F=S.F;const cards=[...new Set(S.rows.map(r=>r.k))].filter(k=>!cardHidden(k));const stores=[...new Set(S.rows.map(r=>r.nn))].sort();
  const chk=(name,vals,sel,lab)=>`<div class="checks">${vals.map(v=>`<label><input type="checkbox" name="${name}" value="${esc(v)}" ${sel.includes(v)?'checked':''}>${esc(lab?lab(v):v)}</label>`).join('')}</div>`;
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="fCancel">Cancel</button><b>Filter</b><button type="button" class="btn pri sm" id="fApply2">Apply</button></div>
  <div class="field"><label for="fQ">Search</label><input class="inp" id="fQ" type="search" dir="auto" value="${esc(F.q)}" placeholder="Store, category or comment"></div>
  <div class="row2"><div class="field"><label>From</label><select class="inp" id="fFrom">${ms.map(m=>`<option value="${m}" ${m===F.from?'selected':''}>${mLong(m)}</option>`).join('')}</select></div><div class="field"><label>To</label><select class="inp" id="fTo">${ms.map(m=>`<option value="${m}" ${m===F.to?'selected':''}>${mLong(m)}</option>`).join('')}</select></div></div>
  <div class="field"><label>Person</label>${chk('fp',S.meta.people,F.person)}</div>
  <div class="field"><label>Card</label>${chk('fc',cards,F.card,k=>k+' '+((S.meta.cards[k]||{}).person||''))}</div>
  <div class="field"><label>Travel</label><div class="checks"><label><input type="checkbox" id="fExT" ${F.exTravel?'checked':''}>Exclude travel (flights, hotels, spending abroad)</label></div></div>
  <div class="field"><label>Category</label>${chk('fcat',CATS,F.cat,CL)}</div>
  <div class="field"><label>Type</label>${chk('ft',Object.keys(TYPES),F.type,k=>TYPES[k])}</div>
  <div class="field"><label>Store</label><input class="inp" id="fStore" list="storeList" value="${esc(F.store)}" placeholder="Any store" dir="auto"><datalist id="storeList">${stores.map(s=>`<option value="${esc(s)}">`).join('')}</datalist></div>
  <div class="row2"><div class="field"><label>Min amount (₪)</label><input class="inp" id="fMin" inputmode="decimal" value="${esc(F.min)}"></div><div class="field"><label>Max amount (₪)</label><input class="inp" id="fMax" inputmode="decimal" value="${esc(F.max)}"></div></div>
  <div class="field"><label>Save these filters as</label><div style="display:flex;gap:6px"><input class="inp" id="fName" placeholder="e.g. Shiraz eating out"><button class="btn" id="fSave">Save</button></div></div>
  <div class="foot"><button class="btn ghost" id="fReset">Reset</button><button class="btn pri" id="fApply">Apply filters</button></div>`);
  const read=()=>{const g=n=>[...document.querySelectorAll(`input[name=${n}]:checked`)].map(i=>i.value);let from=$('#fFrom').value,to=$('#fTo').value;if(from>to)[from,to]=[to,from];return{from,to,person:g('fp'),card:g('fc'),cat:g('fcat'),type:g('ft'),store:$('#fStore').value.trim(),min:$('#fMin').value.trim(),max:$('#fMax').value.trim(),q:$('#fQ').value.trim(),exTravel:$('#fExT').checked}};
  $('#fApply').onclick=()=>{S.F=read();closeSheet();renderAll()};
  $('#fApply2').onclick=()=>$('#fApply').click();$('#fCancel').onclick=closeSheet;
  $('#fReset').onclick=()=>{const q=S.F.q;initFilters();S.F.q=q;closeSheet();renderAll()};
  $('#fSave').onclick=()=>{const name=$('#fName').value.trim();if(!name){toast('Give the filter a name');return}S.meta.presets.push({name,F:read()});saveMeta();S.F=read();closeSheet();renderAll();toast('Saved filter "'+name+'"')};
}
function openTxSheet(r){
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="txCancel">Cancel</button><b>Edit expense</b><button type="button" class="btn pri" id="txSave">Save</button></div><h3 dir="auto">${esc(r.nn)}</h3><p class="note" dir="auto">${esc(r.n)}</p>
  <div class="kpis" style="margin:10px 0"><div class="kpi"><span>Amount</span><b>${ils(r.a,2)}</b>${r.oc&&r.oa?`<em>${r.oa} ${r.oc}</em>`:''}</div><div class="kpi"><span>Date</span><b style="font-size:16px">${r.d}</b><em>counted in ${mLabel(r.m)}</em></div><div class="kpi"><span>Card</span><b style="font-size:16px">${esc(r.k)}</b><em>${esc(cardPerson(r))}</em></div><div class="kpi"><span>Type</span><b style="font-size:16px">${TYPES[r.t]}${r.i?' '+r.i:''}</b></div></div>
  ${r.s||r.no?`<p class="note">${esc([r.s,r.no].filter(Boolean).join('. '))}</p>`:''}
  <div class="field"><label for="txCm">Comment or reason</label><textarea class="inp" id="txCm" rows="2" dir="auto" placeholder="e.g. birthday gift for mom, work lunch, one time repair">${esc(r.cm||'')}</textarea></div>
  <div class="field"><label for="txCat">Category</label><select class="inp" id="txCat">${CATS.map(c=>`<option value="${esc(c)}" ${c===r.c?'selected':''}>${esc(CL(c))}</option>`).join('')}</select></div>
  <label class="note" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="txAll"> Also move every other ${esc(r.nn)} transaction, including future uploads</label>
  <div class="foot"><button type="button" class="btn ghost" id="txStore">See this store</button><button type="button" class="btn pri" id="txSave2">Save</button></div>`);
  $('#txCancel').onclick=closeSheet;
  const doSave=async()=>{
    if(doSave.busy)return;doSave.busy=true;const btns=[$('#txSave'),$('#txSave2')];const btn={set disabled(v){btns.forEach(b=>b&&(b.disabled=v))},set textContent(v){btns.forEach(b=>b&&(b.textContent=v))},closest:()=>$('#txSave2').closest('.foot')};const c=$('#txCat').value;const cm=$('#txCm').value.trim();const all=$('#txAll').checked;
    const before={c:r.c,cm:r.cm||''};
    if(cm)r.cm=cm;else delete r.cm;
    const months=new Set([r.m]);
    if(c!==before.c){r.c=c;r.cx=true;S._hist=null}
    if(all){S.meta.rules[r.nn]=c;for(const x of S.rows)if(x.nn===r.nn&&x.c!==c){x.c=c;months.add(x.m)}S._hist=null;saveMeta()}
    if(before.c===r.c&&before.cm===(r.cm||'')&&!all){doSave.busy=false;closeSheet();toast('Nothing changed');return}
    btn.disabled=true;btn.textContent='Saving…';
    const ok=await saveMonths([...months]);
    renderAll();
    if(ok){closeSheet();toast(all&&c!==before.c?`Saved. Every ${r.nn} expense is now ${CL(c)}`:'Saved')}
    else{doSave.busy=false;btn.disabled=false;btn.textContent='Try again';const p=document.createElement('p');p.className='badline';p.textContent='Kept on this device, but not saved to the ledger yet. '+($('#storeStatus').textContent||'');btn.closest('.foot').before(p)}
  };
  $('#txSave').addEventListener('click',doSave);$('#txSave2').addEventListener('click',doSave);
  $('#txStore').onclick=()=>{closeSheet();S.storeSel=r.nn;S.view='stores';renderAll();scrollTo(0,0)};
}
function applyRule(nn,c,force){
  S.meta.rules[nn]=c;const ms=new Set();for(const r of S.rows)if(r.nn===nn&&(force||!r.cx)&&r.c!==c){r.c=c;ms.add(r.m)}
  if(force)S.rows.forEach(r=>{if(r.nn===nn&&r.c===c&&r.cx)ms.add(r.m)});
  S._hist=null;saveMeta();renderAll();if(ms.size)saveMonths([...ms]).then(ok=>{if(ok)toast(`${nn} is now ${CL(c)}`)});else toast(`${nn} is now ${CL(c)}`);
}

/* ---------- parsing ---------- */
const FIELDS=[['date','Transaction date',/תאריך עסקה|תאריך העסקה|תאריך רכישה|^תאריך$|transaction date|^date$|trans\.? date/i],['bill','Billing date',/תאריך חיוב|billing date|posting date|charge date/i],['merchant','Merchant',/שם בית|בית עסק|merchant|description|^תיאור|payee|^פירוט$/i],['orig','Original amount',/סכום עסקה|סכום העסקה|original amount|transaction amount/i],['charged','Charged amount',/סכום חיוב|סכום לחיוב|charged|debit|amount charged|^amount$|^סכום$/i],['ocur','Original currency',/מטבע עסקה|מטבע מקור|original currency|^currency$/i],['type','Type',/סוג עסקה|^type$|transaction type/i],['card','Card',/4 ספרות|ספרות אחרונות|card/i],['sector','Sector',/ענף|קטגוריה|category|sector/i],['note','Notes',/הערות|notes|memo|details/i]];
const hnorm=c=>String(c??'').replace(/\s+/g,' ').trim();
function mapHeader(row){const map={};row.forEach((c,i)=>{const h=hnorm(c);if(!h)return;for(const[f,,re]of FIELDS){if(map[f]==null&&re.test(h)){if(f==='charged'&&/מקורי|original/i.test(h))continue;if(f==='date'&&/חיוב/.test(h))continue;map[f]=i;break}}});if(map.charged==null&&map.orig!=null){map.charged=map.orig;delete map.orig}return map}
function parseDate(v,fmt){
  if(v==null||v==='')return null;
  if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Math.round((v-25569)*86400000));return d.toISOString().slice(0,10)}
  if(v instanceof Date)return v.toISOString().slice(0,10);
  const s=String(v).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m=s.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);if(!m)return null;let[_,a,b,y]=m;if(y.length===2)y='20'+y;if(fmt==='MDY')[a,b]=[b,a];
  if(+b>12&&+a<=12)[a,b]=[b,a];return `${y}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`;
}
function parseAmt(v){if(typeof v==='number')return v;if(v==null)return null;let s=String(v).replace(/[₪$€£,\s\u200e\u200f]/g,'').replace(/[−–]/g,'-');if(/-$/.test(s))s='-'+s.slice(0,-1);s=s.replace(/[^\d.\-]/g,'');const x=parseFloat(s);return isNaN(x)?null:x}
function curOf(v){const s=String(v??'');if(/₪|ש"ח|ILS|NIS/.test(s))return 'ILS';if(/\$|USD/.test(s))return 'USD';if(/€|EUR|EU\b/.test(s))return 'EUR';if(/£|GBP/.test(s))return 'GBP';if(/CHF/.test(s))return 'CHF';return s.trim()||null}
function rowsFromAoa(aoa,map,from,ctx){
  const out=[];let bill=ctx.bill||null;
  for(let i=from;i<aoa.length;i++){const row=aoa[i];const txt=row.map(hnorm).join(' ');
    const bm=txt.match(/לחיוב ב-?\s*(\d{1,2}\/\d{1,2}\/\d{4})/);if(bm){bill=parseDate(bm[1]);continue}
    if(/סך הכל|סה"כ|total/i.test(txt)&&!parseDate(row[map.date]))continue;
    const d=parseDate(row[map.date],ctx.fmt);const a=parseAmt(row[map.charged]);
    if(!d||a==null||!hnorm(row[map.merchant]))continue;
    const r={date:d,merchant:hnorm(row[map.merchant]),amount:a};
    if(map.orig!=null){const oa=parseAmt(row[map.orig]);const oc=map.ocur!=null?curOf(row[map.ocur]):curOf(row[map.orig]);if(oa!=null&&oc&&oc!=='ILS'){r.oa=oa;r.oc=oc}else if(oa!=null&&map.ocur==null&&Math.abs(oa-a)>0.01&&!/תשלום/.test(hnorm(row[map.note]||''))){r.oa=oa;r.oc=guessCur(oa,a)}}
    if(map.type!=null)r.type=hnorm(row[map.type]);
    if(map.note!=null)r.note=hnorm(row[map.note]);
    if(map.sector!=null)r.sector=hnorm(row[map.sector]);
    if(map.card!=null){const c=String(row[map.card]).replace(/\D/g,'');if(c)r.card=c.slice(-4)}
    if(map.bill!=null){const b=parseDate(row[map.bill],ctx.fmt);if(b)r.bill=b}else if(bill)r.bill=bill;
    // Cal Excel: type column carries the hebrew type; put it in note for classification
    if(r.type&&!['regular','installment','standing','refund'].includes(r.type)){r.note=[r.note,r.type].filter(Boolean).join(' ');delete r.type}
    out.push(r);
  }
  return out;
}
function guessCur(oa,a){const r=a/oa;if(r>2.6&&r<3.25)return 'USD';if(r>=3.25&&r<3.75)return 'EUR';if(r>=3.75&&r<4.8)return 'GBP';return 'FX'}
async function parseSheetFile(f){
  let wb;const buf=await f.arrayBuffer();
  if(/\.csv$/i.test(f.name)){let t=new TextDecoder('utf-8').decode(buf);if(t.includes('\uFFFD'))t=new TextDecoder('windows-1255').decode(buf);wb=XLSX.read(t,{type:'string',raw:true})}
  else wb=XLSX.read(buf,{type:'array'});
  const out=[];
  for(const sn of wb.SheetNames){
    const aoa=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:true,defval:''});if(!aoa.length)continue;
    const top=aoa.slice(0,12).map(r=>r.map(hnorm).join(' ')).join(' ')+' '+f.name;
    {let bh=-1;for(let i=0;i<Math.min(aoa.length,40);i++){const t=aoa[i].map(hnorm).join('|');if(/זכות|credit/i.test(t)&&/חובה|debit/i.test(t)){bh=i;break}}
     if(bh>=0){const rows=bankRowsFromAoa(aoa,bh);const am=top.match(/(\d{2,3}-\d{5,9}(?:\/\d+)?)/);if(rows.length){out.push({file:f.name,bank:true,kind:'Bank Excel',acct:am?am[1]:'bank',rows});continue}}}
    let hi=-1,map=null;for(let i=0;i<Math.min(aoa.length,40);i++){const m=mapHeader(aoa[i]);if(m.date!=null&&m.merchant!=null&&m.charged!=null){hi=i;map=m;break}}
    const sig=hi>=0?aoa[hi].map(hnorm).filter(Boolean).join('|'):null;
    let kind='Excel';if(/לחיוב ב/.test(top))kind='Cal Excel';else if(map&&map.card!=null&&/4 ספרות/.test(sig||''))kind='Max Excel';else if(/\.csv$/i.test(f.name))kind='CSV';
    const totM=top.match(/לחיוב ב-?\s*\d{1,2}\/\d{1,2}\/\d{4}\s*:\s*([\d,\.]+)/);
    let total=totM?parseAmt(totM[1]):null;
    if(kind==='Max Excel'){for(let i=0;i<aoa.length;i++){if(/סך הכל/.test(aoa[i].map(hnorm).join(' '))){const nx=(aoa[i+1]||[]).map(hnorm).join(' ')||aoa[i].map(hnorm).join(' ');const v=parseAmt(nx.replace(/סך הכל/,''));if(v)total=v}}}
    const cardM=top.match(/המסתיים ב-?\s*(\d{4})/)||f.name.match(/כרטיס[^0-9]*?(\d{4})/);
    let tpl=null;if(!map){/* try saved templates */for(const[k,t]of Object.entries(S.meta.templates)){for(let i=0;i<Math.min(aoa.length,40);i++){if(aoa[i].map(hnorm).filter(Boolean).join('|')===k){tpl=t;hi=i;map=t.map;break}}if(tpl)break}}
    if(!map){out.push({file:f.name+(wb.SheetNames.length>1?' / '+sn:''),kind,needsMap:true,aoa,card:cardM?cardM[1]:null});continue}
    if(sig&&S.meta.templates[sig])map=S.meta.templates[sig].map;
    const billTop=(top.match(/לחיוב ב-?\s*(\d{1,2}\/\d{1,2}\/\d{4})/)||[])[1];
    const rows=rowsFromAoa(aoa,map,hi+1,{fmt:(tpl||{}).fmt,bill:billTop?parseDate(billTop):null});
    if(!rows.length)continue;
    out.push({file:f.name+(wb.SheetNames.length>1?' / '+sn:''),kind,rows,total,card:cardM?cardM[1]:null,aoa,map,hi,sig,bill:rows.find(r=>r.bill)?.bill});
  }
  if(!out.length)throw new Error('No transactions found in this file');
  return out;
}
async function claudeMap(st){
  if(!S.sample)throw new Error('Could not recognise the columns in this file. Tell the developer which bank or card it comes from so a format can be added.');
  const sample=st.aoa.slice(0,25).map((r,i)=>i+': '+r.map(c=>String(c).slice(0,40)).join(' | ')).join('\n');
  const j=await S.sample.json(`These are the first rows of a credit card statement spreadsheet (row index: cells separated by |). Find the header row and which column index holds each field. Reply with only JSON like {"headerRow":3,"date":0,"merchant":1,"charged":3,"orig":2,"ocur":null,"type":4,"card":null,"bill":null,"sector":5,"note":6,"dateFormat":"DMY"}. Use null when a field does not exist. "charged" is the amount billed in shekels.\n\n${sample}`,{modelTier:'quick'});
  const map={};for(const[f]of FIELDS)if(j[f]!=null&&j[f]!=='')map[f]=+j[f];
  st.map=map;st.hi=+j.headerRow;st.fmt=j.dateFormat;st.sig=st.aoa[st.hi].map(hnorm).filter(Boolean).join('|');
  st.rows=rowsFromAoa(st.aoa,map,st.hi+1,{fmt:st.fmt});st.needsMap=false;st.mapped='Claude';
}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('Could not load '+src));document.head.appendChild(s)})}
async function pdfLib(){
  if(!window.pdfjsLib){await loadScript('vendor/pdfjs/pdf.min.js');window.pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdfjs/pdf.worker.min.js'}
  return window.pdfjsLib;
}
function nameHelpers(){
  const cnt={};for(const r of S.rows)cnt[r.n]=(cnt[r.n]||0)+1;
  const names=Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]);const set=new Set(names);
  const byLetters={};for(const n of names){const k=LedgerPDF.letters(n);if(!byLetters[k])byLetters[k]=n}
  return{knownName:n=>set.has(n),sameLetters:n=>byLetters[LedgerPDF.letters(n)]||null,knownPrefix:p=>names.find(n=>n!==p&&n.startsWith(p))||null};
}
async function parsePDF(f,progress){
  progress&&progress('Reading '+f.name+' on this device');
  const lib=await pdfLib();
  const sts=await LedgerPDF.parse(lib,new Uint8Array(await f.arrayBuffer()),nameHelpers());
  return sts.map(st=>({file:f.name,kind:'PDF',card:st.card,cardholder:st.cardholder,issuer:st.issuer,total:st.total,bill:st.bill,rows:st.rows}));
}
async function parseImages(files,progress){
  if(!S.sample||!(S.limits&&S.limits.images))throw new Error('Screenshots cannot be read in the offline app. Export the statement as Excel instead.');
  const max=S.limits.images.maxCount||5;const all=[];let month=null,hint=null;
  for(let i=0;i<files.length;i+=max){const batch=files.slice(i,i+max);progress&&progress(`Claude is reading screenshots ${i+1} to ${i+batch.length} of ${files.length}`);
    const j=await S.sample.json(`These are phone screenshots of card transactions from a banking or card app, possibly overlapping (a row visible in two screenshots must be listed once). The highlighted month tab is the billing month. Dates like 05.08.26 are day.month.year. Reply with only JSON: {"billing_month":"YYYY-MM"|null,"card_hint":string|null,"transactions":[{"date":"YYYY-MM-DD","merchant":string,"charged":number,"billing_month":"YYYY-MM"|null}]}. Keep Hebrew names as shown.`,{images:batch,modelTier:'default'});
    month=month||j.billing_month;hint=hint||j.card_hint;(j.transactions||[]).forEach(t=>all.push(t))}
  const seen=new Set();const rows=[];for(const t of all){const k=t.date+'|'+t.merchant+'|'+t.charged;if(seen.has(k))continue;seen.add(k);rows.push({date:t.date,merchant:t.merchant,amount:+t.charged})}
  return [{file:files.length+' screenshot'+(files.length>1?'s':''),kind:'Screenshots',card:null,cardHint:hint,bill:month?month+'-02':null,rows,total:null}];
}

/* ---------- upload review ---------- */
let PENDING=[];
async function handleFiles(list){
  const files=[...list];if(!files.length)return;
  const bg=sheet(`<h3>Reading ${files.length} file${files.length>1?'s':''}</h3><p class="note" id="prog">Starting…</p>`);
  const prog=t=>{const p=$('#prog');if(p)p.textContent=t};
  const out=[];const imgs=files.filter(f=>/^image\//.test(f.type));
  for(const f of files.filter(f=>!/^image\//.test(f.type))){const _b=out.length;
    try{prog('Reading '+f.name);if(/\.pdf$/i.test(f.name))out.push(...await parsePDF(f,prog));else{const r=await parseSheetFile(f);for(const st of r){if(st.needsMap){prog('Claude is working out the columns of '+f.name);try{await claudeMap(st)}catch(e){st.error=e.message||e.code}}out.push(st)}}}
    catch(e){out.push({file:f.name,error:(e&&(e.message||e.code))||String(e)})}
    for(let i=_b;i<out.length;i++)if(f.driveId)out[i].driveId=f.driveId;
  }
  if(imgs.length){try{out.push(...await parseImages(imgs,prog))}catch(e){out.push({file:imgs.length+' screenshots',error:e.message||e.code})}}
  PENDING=out;renderReview();
}
function prepStatement(st){
  const cardFor=raw=>raw.card||st.card||st.cardSel||null;
  const rows=st.rows.map(raw=>{const k=cardFor(raw)||'?';const meta=S.meta.cards[k]||{};return classify({...raw,card:k,person:meta.person||st.personSel||'',issuer:meta.issuer||st.issuer||st.kind})});
  // ids per card
  const byCard={};rows.forEach(r=>(byCard[r.k]||(byCard[r.k]=[])).push(r));Object.values(byCard).forEach(assignIds);
  const have=new Set(S.rows.map(r=>r.id));const fuzzy={};S.rows.forEach(r=>{const f=r.k+'|'+r.d+'|'+r.a.toFixed(2)+'|'+(r.i||'');fuzzy[f]=(fuzzy[f]||0)+1});
  const seenF={};const fresh=[];let dup=0;
  for(const r of rows){const f=r.k+'|'+r.d+'|'+r.a.toFixed(2)+'|'+(r.i||'');seenF[f]=(seenF[f]||0)+1;if(have.has(r.id)||seenF[f]<=(fuzzy[f]||0)){dup++;continue}fresh.push(r)}
  return{rows,fresh,dup};
}
function renderReview(){
  const known=Object.entries(S.meta.cards);
  const blocks=PENDING.map((st,i)=>{
    if(st.bank&&!st.error)return bankReviewBlock(st);
    if(st.error)return `<div class="panel"><b>${esc(st.file)}</b><p class="badline">${esc(st.error)}</p></div>`;
    if(st.needsMap)return `<div class="panel"><b>${esc(st.file)}</b><p class="badline">Could not find the columns in this file.</p></div>`;
    const needCard=st.rows.some(r=>!r.card)&&!st.card;
    const newCard=st.card&&!S.meta.cards[st.card];
    const p=(!needCard||st.cardSel)?prepStatement(st):null;
    const parsed=sum(st.rows.map(r=>r.amount));
    const check=st.total!=null?(Math.abs(parsed-st.total)<0.6?`<span class="okline">Matches the statement total ${ils(st.total,2)}</span>`:`<span class="badline">Parsed ${ils(parsed,2)} but the statement says ${ils(st.total,2)}</span>`):`<span class="muted">Parsed total ${ils(parsed,2)} (no statement total to compare)</span>`;
    const cards=[...new Set(st.rows.map(r=>r.card).filter(Boolean))];if(st.card)cards.push(st.card);
    const unknownCards=[...new Set(cards)].filter(c=>!S.meta.cards[c]);
    return `<div class="panel"><div class="phead"><h2>${esc(st.file)} <small>${esc(st.kind)}${st.mapped?', columns found by Claude':''}</small></h2></div>
    <p class="note">${st.rows.length} rows. ${check}${st.bill?`. Billing date ${st.bill}`:''}</p>
    ${needCard?`<div class="row2"><div class="field"><label>Which card is this?</label><select class="inp" data-cardsel="${i}"><option value="">Choose…</option>${known.map(([k,c])=>`<option value="${esc(k)}" ${st.cardSel===k?'selected':''}>${esc(k)} ${esc(c.issuer)} (${esc(c.person)})</option>`).join('')}<option value="__new">New card…</option></select>${st.cardHint?`<span class="status">Hint from the image: ${esc(st.cardHint)}</span>`:''}</div></div>`:''}
    ${(unknownCards.length||st.cardSel==='__new')?`<div class="field"><label>New card${unknownCards.length?' '+unknownCards.join(', '):''}: who does it belong to?</label><div class="row2">${st.cardSel==='__new'?`<input class="inp" data-newlast="${i}" placeholder="Last 4 digits or a name">`:''}<select class="inp" data-newperson="${i}">${S.meta.people.map(p=>`<option>${esc(p)}</option>`).join('')}</select></div></div>`:''}
    ${p?`<p class="note"><b>${p.fresh.length}</b> new transactions${p.dup?`, ${p.dup} already saved and skipped`:''}${p.fresh.filter(r=>r.c==='Unclear').length?`, ${p.fresh.filter(r=>r.c==='Unclear').length} will go to Unclear`:''}.</p>
    <div class="tw"><table><thead><tr><th>Date</th><th>Store</th><th class="r">Amount</th><th>Category</th><th>Card</th></tr></thead><tbody>${p.fresh.slice(0,8).map(r=>`<tr><td>${r.d}</td><td dir="auto">${esc(r.nn)}</td><td class="r">${ils(r.a,2)}</td><td>${esc(CL(r.c))}</td><td>${esc(r.k)}</td></tr>`).join('')}${p.fresh.length>8?`<tr><td colspan="5" class="muted">and ${p.fresh.length-8} more</td></tr>`:''}</tbody></table></div>`:''}
    </div>`}).join('');
  const ok=PENDING.some(st=>!st.error&&!st.needsMap);
  sheet(`<h3>Check before saving</h3><p class="note">Nothing is saved until you press Save. Already saved transactions are skipped, so uploading a statement twice is safe.</p>${blocks}<div class="foot"><button class="btn ghost" id="revCancel">Cancel</button>${ok?'<button class="btn pri" id="revSave">Save to ledger</button>':''}</div>`);
  $('#revCancel').onclick=closeSheet;
  if($('#revSave'))$('#revSave').onclick=commitReview;
}
async function commitReview(){
  let added=0,skipped=0;const touched=new Set();let newest=null;const touchedB=new Set();let bankAdded=0;
  for(const st of PENDING){
    if(st.error||st.needsMap)continue;
    if(st.bank){const p=prepBank(st);p.fresh.forEach(r=>{S.bank.push(r);touchedB.add(r.m)});bankAdded+=p.fresh.length;skipped+=p.dup;continue}
    if(st.cardSel==='__new'){const v=(document.querySelector(`[data-newlast="${PENDING.indexOf(st)}"]`)||{}).value;if(!v){toast('Name the new card first');return}st.cardSel=v.trim()}
    const personSel=(document.querySelector(`[data-newperson="${PENDING.indexOf(st)}"]`)||{}).value;
    const cards=new Set(st.rows.map(r=>r.card||st.card||st.cardSel).filter(Boolean));
    if(st.rows.some(r=>!r.card)&&!st.card&&!st.cardSel){toast('Choose the card for '+st.file);return}
    for(const c of cards)if(!S.meta.cards[c]){S.meta.cards[c]={issuer:st.issuer||st.kind,person:personSel||S.meta.people[0]}}
    if(st.sig&&st.map&&st.mapped)S.meta.templates[st.sig]={map:st.map,fmt:st.fmt||'DMY'};
    const p=prepStatement(st);
    for(const r of p.fresh){S.rows.push(r);touched.add(r.m);if(!r.f&&(!newest||r.m>newest))newest=r.m}
    added+=p.fresh.length;skipped+=p.dup;
  }
  {const imp=S.meta.importedFiles||(S.meta.importedFiles={});for(const st of PENDING)if(st.driveId&&!st.error&&!st.needsMap)imp[st.driveId]={n:st.file,at:todayISO()};}
  S._hist=null;saveMeta();closeSheet();updateUploadBadge();
  if(touched.size){await saveMonths([...touched])}
  if(touchedB.size){await saveBank([...touchedB]);S.bankMonth=null}
  const ms=months();if(newest){const last=ms[ms.length-1];if(S.F.to<last)S.F.to=last;S.month=newest}
  renderAll();
  const al=newest?openAlerts(newest).length:0;
  toast(`Saved ${added} card and ${bankAdded} bank transactions${skipped?`, skipped ${skipped} already saved`:''}${al?`. ${al} alerts for ${mLabel(newest)}`:''}`,5000);
  if(bankAdded&&!added){S.view='cashflow';renderAll()}else if(al){S.view='alerts';renderAll()}
}

/* ---------- statements from Google Drive ---------- */
const newInbox=()=>(S.inbox||[]).filter(f=>!(S.meta.importedFiles||{})[f.id]&&(f.kind==='sheet'||f.kind==='gsheet'||f.kind==='pdf'));
function updateUploadBadge(){const b=$('#uploadBtn'),g=$('#uploadBadge');if(!b)return;const n=newInbox().length;if(g){g.textContent=n;g.hidden=!n}b.setAttribute('aria-label',n?`Upload statements, ${n} new in Google Drive`:'Upload statements')}
async function refreshInbox(announce){try{S.inbox=await window.LedgerGate.inbox.list()}catch(e){S.inbox=null}updateUploadBadge();const n=newInbox().length;if(announce&&n)toast(`${n} new statement${n>1?'s':''} in Google Drive. Tap Upload to import.`,6000)}
function openUploadSheet(){
  const L=window.LedgerGate;const inb=S.inbox;const imp=S.meta.importedFiles||{};
  const fresh=(inb||[]).filter(f=>!imp[f.id]),done=(inb||[]).filter(f=>imp[f.id]);
  const note=f=>f.kind==='other'?'Not an Excel, CSV or PDF file.':'';
  const when=f=>new Date(f.modified).toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  sheet(`<div class="shead"><button type="button" class="btn ghost" id="upClose">Close</button><b>Add statements</b><span style="width:56px"></span></div>
  <h3 class="sh3">From Google Drive</h3><p class="hint">Upload Excel, CSV or PDF statements to <b>${esc(L.inbox.folderName())}</b> from the Drive app on your phone or computer. New files appear here.</p>
  ${inb===null?'<p class="badline">Could not reach Google Drive. Check your connection and try again.</p>':''}
  <div class="inblist">${fresh.map(f=>`<div class="inbrow"><input type="checkbox" id="inb_${esc(f.id)}" data-inb="${esc(f.id)}" ${note(f)?'disabled':'checked'}><label for="inb_${esc(f.id)}"><span dir="auto">${esc(f.name)}</span><small>${when(f)}${note(f)?'. '+note(f):''}</small></label><button type="button" class="linkbtn" data-inbskip="${esc(f.id)}">Skip</button></div>`).join('')||(inb?'<p class="hint">No new statements in the folder.</p>':'')}</div>
  <div class="foot" style="justify-content:space-between;align-items:center"><button type="button" class="linkbtn" id="upRefresh">Check again</button>${fresh.some(f=>!note(f))?'<button type="button" class="btn pri" id="upImport">Import selected</button>':''}</div>
  ${done.length?`<details class="inbdone"><summary>${done.length} already imported or skipped</summary>${done.map(f=>`<p dir="auto">${esc(f.name)}<small> ${imp[f.id].skipped?'skipped':'imported '+esc(imp[f.id].at||'')}</small></p>`).join('')}</details>`:''}
  <h3 class="sh3">From this device</h3><button type="button" class="btn" id="upLocal">Choose files…</button>`);
  $('#upClose').onclick=closeSheet;
  $('#upLocal').onclick=()=>{closeSheet();$('#fileIn').click()};
  $('#upRefresh').onclick=async e=>{e.target.textContent='Checking…';await refreshInbox();openUploadSheet()};
  document.querySelectorAll('[data-inbskip]').forEach(b=>b.onclick=()=>{const f=fresh.find(x=>x.id===b.dataset.inbskip);(S.meta.importedFiles||(S.meta.importedFiles={}))[f.id]={n:f.name,at:todayISO(),skipped:true};saveMeta();updateUploadBadge();openUploadSheet()});
  const ib=$('#upImport');if(ib)ib.onclick=async()=>{
    const sel=[...document.querySelectorAll('[data-inb]:checked')].map(i=>fresh.find(f=>f.id===i.dataset.inb));if(!sel.length){toast('Pick at least one file');return}
    ib.disabled=true;const got=[];
    for(const [i,f] of sel.entries()){ib.textContent=`Downloading ${i+1} of ${sel.length}…`;try{got.push(await L.inbox.download(f))}catch(e){toast(`Could not download ${f.name}: ${e.code||e.message}`,6000)}}
    if(got.length)handleFiles(got);else{ib.disabled=false;ib.textContent='Import selected'}
  };
}

/* ---------- ask ---------- */
function toolFilter(inp){
  const ms=months();const F={from:inp.from||ms[0],to:inp.to||ms[ms.length-1],person:inp.person?[inp.person]:[],card:inp.card?[String(inp.card)]:[],cat:inp.category?[inp.category]:[],store:'',q:inp.search||inp.store||'',min:inp.min??'',max:inp.max??'',type:inp.type?[inp.type]:[]};
  if(F.person.length)F.person=F.person.map(p=>S.meta.people.find(x=>x.toLowerCase()===p.toLowerCase())||p);
  if(F.cat.length)F.cat=F.cat.map(c=>CATS.find(x=>x.toLowerCase()===c.toLowerCase()||CL(x).toLowerCase()===c.toLowerCase())||c);
  return F;
}
function qRows(F){return S.rows.filter(r=>passFilter(r,F))}
const WD=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
async function ask(q){
  if(!S.sample||!q.trim())return;
  S.chat.push({role:'user',content:q.trim()});S.chat.push({role:'assistant',content:'Thinking…'});renderMain();
  const ms=months();const topStores=Object.entries(groupSum(S.rows.filter(r=>!r.f),'nn')).sort((a,b)=>b[1]-a[1]).slice(0,60).map(x=>x[0]);
  const ctx=`You are a careful household finance assistant inside a spending dashboard. Today is ${todayISO()}. Currency is ILS (₪). Data covers ${ms[0]} to ${ms[ms.length-1]} (months are purchase months). People: ${S.meta.people.join(', ')}. Cards: ${Object.entries(S.meta.cards).map(([k,c])=>`${k} (${c.issuer}, ${c.person})`).join('; ')}. Categories: ${CATS.map(CL).join(', ')}. Frequent stores: ${topStores.join(', ')}. The user is currently looking at ${mLong(S.month)}.
Answer only from numbers you computed with the tools. Show the key numbers you used and how you got them, keep it short and plain, no markdown tables, no dashes as punctuation. If data is missing, say so.`;
  const lim=S.limits||{};let tools;
  if(lim.tools){tools=[
    {name:'summarize',description:'Sum spending with filters, optionally grouped. Returns total, count and up to 40 groups sorted by amount.',inputSchema:{type:'object',properties:{from:{type:'string',description:'YYYY-MM'},to:{type:'string',description:'YYYY-MM'},person:{type:'string'},card:{type:'string'},category:{type:'string'},search:{type:'string',description:'substring of the store name (Hebrew or English)'},type:{type:'string',enum:['regular','installment','standing','refund','foreign']},groupBy:{type:'string',enum:['none','month','category','store','card','person','weekday']}}},
     execute:inp=>{const F=toolFilter(inp);S.lastFilter=F;const rows=qRows(F);const g=inp.groupBy&&inp.groupBy!=='none'?groupSum(rows,{month:'m',category:'c',store:'nn',card:'k',person:cardPerson,weekday:r=>WD[new Date(r.d+'T12:00:00').getDay()]}[inp.groupBy]):null;
       const cnt={};if(g)rows.forEach(r=>{const k={month:r.m,category:r.c,store:r.nn,card:r.k,person:cardPerson(r),weekday:WD[new Date(r.d+'T12:00:00').getDay()]}[inp.groupBy];cnt[k]=(cnt[k]||0)+1});
       return{from:F.from,to:F.to,months:mRange(F.from,F.to).length,total:r2(sum(rows.map(r=>r.a))),count:rows.length,groups:g?Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>({key:k,total:r2(v),count:cnt[k]})):undefined}}},
    {name:'list_transactions',description:'List matching transactions (date, store, amount, category, card, person), newest first, at most 60.',inputSchema:{type:'object',properties:{from:{type:'string'},to:{type:'string'},person:{type:'string'},card:{type:'string'},category:{type:'string'},search:{type:'string'},min:{type:'number'},max:{type:'number'},limit:{type:'number'}}},
     execute:inp=>{const F=toolFilter(inp);S.lastFilter=F;return qRows(F).sort((a,b)=>b.d.localeCompare(a.d)).slice(0,Math.min(60,inp.limit||40)).map(r=>({date:r.d,store:r.nn,amount:r.a,category:r.c,card:r.k,person:cardPerson(r),type:r.t}))}},
    {name:'recurring_charges',description:'Detected subscriptions and standing orders with monthly cost and last price change.',inputSchema:{type:'object',properties:{}},execute:()=>detectRecurring().slice(0,40).map(x=>({name:x.nn,category:x.c,monthly:r2(x.monthly),last:r2(x.lastAmt),previous:x.prevAmt&&r2(x.prevAmt),status:x.status,cards:x.cards}))}
  ].slice(0,lim.tools.maxCount||3)}
  let prompt=ctx;
  if(!tools){const sm={};S.rows.filter(r=>!r.f).forEach(r=>{(sm[r.m]||(sm[r.m]={}))[r.c]=r2(((sm[r.m]||{})[r.c]||0)+r.a)});prompt+=`\nMonthly spending by category: ${JSON.stringify(sm)}\nTop stores total: ${JSON.stringify(Object.fromEntries(Object.entries(groupSum(S.rows.filter(r=>!r.f),'nn')).sort((a,b)=>b[1]-a[1]).slice(0,80).map(([k,v])=>[k,r2(v)])))}`}
  const turns=[{role:'user',content:prompt},{role:'assistant',content:'Understood. Ask me anything about the household spending.'},...S.chat.slice(0,-1).slice(-8)];
  const idx=S.chat.length-1;
  try{const res=await S.sample(turns,{cache:false,tools,onText:({text})=>{S.chat[idx].content=text;const c=$('#chat');if(c&&c.lastElementChild)c.lastElementChild.textContent=text}});S.chat[idx].content=res.text}
  catch(e){S.chat[idx].content=e.text||({not_granted:'Asking Claude was not allowed in this view.',rate_limited:'Too many questions at once. Try again in a minute.'}[e.code]||'Something went wrong: '+(e.message||e.code))}
  if(S.view==='ask')renderMain();
}
async function suggestCats(){
  const un=S.rows.filter(r=>r.c==='Unclear'&&!r.f&&!cardHidden(r.k));const by={};un.forEach(r=>{const o=by[r.nn]||(by[r.nn]={store:r.nn,sector:r.s||'',total:0,count:0,examples:[]});o.total=r2(o.total+r.a);o.count++;if(o.examples.length<3)o.examples.push(r.n+' '+r.a)});
  toast('Asking Claude…');
  try{const j=await S.sample.json(`Assign each Israeli card merchant to one category from: ${CATS.filter(c=>c!=='Unclear').join(', ')}. Reply with only JSON {"<store>":{"cat":"<category>","why":"<5 to 10 words>"}}. Use "Unclear" if you really cannot tell.\n${JSON.stringify(Object.values(by))}`,{modelTier:'quick'});S.suggest=j;renderMain();toast('Suggestions ready. Check them and press Apply.')}
  catch(e){toast('Could not get suggestions: '+(e.code||e.message))}
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button,th,tr,[data-cat],[data-month],[data-store],[data-layer],[data-row],[data-planedit],[data-bcat]');if(!t)return;const d=t.dataset;
  if(t.id==='uploadBtn'||d.upload!==undefined){openUploadSheet();return}
  if(d.nav){S.bcat=null;S.view=d.nav==='bank'?'cashflow':d.nav==='cards'?'overview':'settings';renderAll();scrollTo(0,0);return}
  if(d.view){if(d.view!=='banktx')S.bcat=null;S.view=d.view;renderAll();scrollTo(0,0);return}
  if(d.month){S.month=d.month;renderAll();return}
  if(d.sort){const[id,k]=d.sort.split('|');const st=TBL[id];if(st.key===k)st.dir*=-1;else{st.key=k;st.dir=-1}renderMain();return}
  if(d.more){TBL[d.more].limit+=200;renderMain();return}
  if(d.export){exportTable(d.export);return}
  if(d.layer){if(d.layer==='cards'){S.view='overview';if(d.cm){S.month=d.cm}}else S.view='cashflow';renderAll();scrollTo(0,0);return}
  if(d.mgo){monthCtx().set(d.mgo);renderAll();return}
  if(d.mnav){const c=monthCtx();const i=c.list.indexOf(c.M)+(+d.mnav);if(c.list[i]){c.set(c.list[i]);renderAll()}return}
  if(t.id==='filterBtn'){if(layerOf(S.view)==='cards')openFilterSheet();else openBankFilter();return}
  if(d.bcat){S.bcat=d.bcat;S.view='banktx';renderAll();scrollTo(0,0);return}
  if(d.bcatclear!==undefined){S.bcat=null;renderMain();return}
  if(d.bstep){const list=[...bankMonths(),...futureMonths()];const i=list.indexOf(S.bankMonth)+(+d.bstep);if(list[i]){S.bankMonth=list[i];renderMain()}return}
  if(t.id==='cfOpts'){openCfOptions();return}
  if(d.bmonth){S.bankMonth=d.bmonth;renderMain();return}
  if(d.billgo){const g=JSON.parse(d.billgo);S.F.card=g.cards;S.F.from=S.F.to=g.m;S.month=g.m;S.view='transactions';renderAll();scrollTo(0,0);return}
  if(d.row&&d.row.startsWith('bank|')){const r=TBL.bank.rows[+d.row.split('|')[1]];if(r&&r.v){toast('This row is part of the spread view. Untick "Spread rent per month" to edit the real payment.');return}if(r)openBankSheet(r);return}
  if(d.row){const[id,i]=d.row.split('|');const r=TBL[id].rows[+i];if(!r)return;
    if(id==='cats'){S.drill=r.c;renderMain();setTimeout(()=>document.getElementById('c_drill')?.scrollIntoView({block:'center'}),30)}
    else if(id==='stores'||id==='drill'||id==='rec'){S.storeSel=r.nn;S.view='stores';renderAll();scrollTo(0,0)}
    else if(id==='tx'||id==='storetx'){openTxSheet(r)}
    else if(id==='cards'){S.F.card=[r.k];S.view='transactions';renderAll()}
    return}
  if(d.cat&&(t.classList.contains('lrow')||t.classList.contains('sp')||t.classList.contains('row'))){S.drill=d.cat;S.view='categories';renderAll();scrollTo(0,0);return}
  if(d.store&&(t.classList.contains('sp')||t.classList.contains('lrow'))){S.storeSel=d.store;S.view='stores';renderAll();scrollTo(0,0);return}
  if(d.unf){const[k,v]=d.unf.split('|');if(k==='q')S.F.q='';else if(k==='travel')S.F.exTravel=false;else if(k==='store')S.F.store='';else if(k==='amount'){S.F.min='';S.F.max=''}else S.F[k]=S.F[k].filter(x=>x!==v);renderAll();return}
  if(t.id==='travelT'){S.F.exTravel=!S.F.exTravel;renderAll();return}
  if(t.id==='filtBtn'){openFilterSheet();return}
  if(t.id==='clearF'){initFilters();renderAll();return}
  if(d.drillclose!==undefined){S.drill=null;renderMain();return}
  if(d.storeclose!==undefined){S.storeSel=null;renderMain();return}
  if(d.afilter){const a=computeAlerts(S.month).find(x=>x.key===d.afilter);if(!a)return;S.F.from=S.F.to=a.M;Object.assign(S.F,{store:'',cat:[],type:[],q:''},a.filter);S.view='transactions';renderAll();scrollTo(0,0);return}
  if(d.aexp){S.meta.alertState[d.aexp+'|'+S.month]='expected';saveMeta();renderAll();return}
  if(d.adis){S.meta.alertState[d.adis]='dismissed';saveMeta();renderAll();return}
  if(d.aundo){delete S.meta.alertState[d.aundo];delete S.meta.alertState[d.aundo+'|'+S.month];saveMeta();renderAll();return}
  if(d.inboxapply){const sel=document.querySelector(`[data-inboxcat="${CSS.escape(d.inboxapply)}"]`);if(sel&&sel.value!=='Unclear')applyRule(d.inboxapply,sel.value);else toast('Pick a category first');return}
  if(t.id==='suggestBtn'){suggestCats();return}
  if(d.theme){S.meta.theme=d.theme;applyTheme();saveMeta();renderMain();return}
  if(t.id==='exportAll'){TBL.all={rows:S.rows.filter(r=>!r.f),cols:txCols().concat([{k:'m',l:'Month'},{k:'is',l:'Issuer'},{k:'oc',l:'Original currency'},{k:'oa',l:'Original amount'},{k:'fx',l:'Est FX fee'}]),name:'All transactions'};exportTable('all');return}
  if(d.plandel!==undefined){const ps=JSON.parse(JSON.stringify(planned()));ps.splice(+d.plandel,1);S.meta.planned=ps;saveMeta();renderMain();return}
  if(t.id==='cfCount'){closeSheet();openCountSheet();return}
  if(d.planedit!==undefined){openPlanSheet(+d.planedit);return}
  if(t.id==='backupBtn'){t.disabled=true;window.LedgerGate.backup().then(()=>toast('Backup downloaded. It is not encrypted, so keep it somewhere safe.',6000)).catch(e=>toast('Backup failed: '+(e.code||e.message))).finally(()=>t.disabled=false);return}
  if(t.id==='lockBtn'){window.LedgerGate.lock();return}
  if(d.hhrm){if(t.dataset.confirm!=='1'){t.dataset.confirm='1';t.textContent='Tap again to remove';setTimeout(()=>{if(t.isConnected){t.dataset.confirm='';t.textContent='Remove'}},4000);return}
    t.disabled=true;window.LedgerGate.household.remove(d.hhrm).then(()=>{toast(`${d.hhname} no longer has access to the ledger folder.`,5000);loadHousehold()}).catch(x=>{t.disabled=false;toast('Could not remove: '+(x.message||x.code))});return}

  if(t.id==='planAdd'){openPlanSheet(-1);return}
  if(t.id==='planAddOld'){const ps=JSON.parse(JSON.stringify(planned()));let n=1;while(ps.some(p=>p.id==='p'+n))n++;ps.push({id:'p'+n,name:'New payment',c:'Other',amount:1000,every:1,next:addM(todayISO().slice(0,7),1)+'-01'});S.meta.planned=ps;saveMeta();renderMain();return}
  if(t.id==='addCardCat'){const v=$('#newCardCat').value.trim();if(!v){toast('Type a name first');return}if(CATS.includes(v)||Object.values(S.meta.catLabels||{}).includes(v)){toast('That category already exists');return}S.meta.extraCats=[...(S.meta.extraCats||[]),v];applyExtraCats();saveMeta();renderMain();toast(`Added ${v}`);return}
  if(t.id==='addBankCat'){const v=$('#newBankCat').value.trim();if(!v){toast('Type a name first');return}if(bankCats().includes(v)){toast('That category already exists');return}S.meta.bankCats=[...(S.meta.bankCats||[]),{name:v,savings:$('#newBankSav').checked}];saveMeta();renderMain();toast(`Added ${v}`);return}
  if(t.id==='askBtn'){const v=$('#askIn').value;ask(v);return}
  if(d.sug){ask(d.sug);return}
  if(t.id==='showMatch'&&S.lastFilter){S.F=structuredClone(S.lastFilter);S.view='transactions';renderAll();scrollTo(0,0);return}
});
document.addEventListener('change',e=>{
  const t=e.target;const d=t.dataset;
  if(t.id==='fileIn'){handleFiles(t.files);t.value='';return}
  if(d.budget){const v=parseAmt(t.value);S.meta.budgets[d.budget]=v||0;saveMeta();renderMain();return}
  if(d.cardshow){const c=S.meta.cards[d.cardshow];if(c){if(t.checked)delete c.hidden;else c.hidden=true;saveMeta();renderAll();toast(t.checked?`Card ${d.cardshow} is shown`:`Card ${d.cardshow} is hidden`)}return}
  if(d.cardp){S.meta.cards[d.cardp].person=t.value;saveMeta();renderAll();return}
  if(d.cardis){S.meta.cards[d.cardis].issuer=t.value;saveMeta();return}
  if(t.id==='peopleIn'){const p=t.value.split(',').map(x=>x.trim()).filter(Boolean);if(p.length){S.meta.people=p;saveMeta();renderMain()}return}
  if(d.catlabel!==undefined){const c=d.catlabel,v=t.value.trim();S.meta.catLabels=S.meta.catLabels||{};if(!v||v===c)delete S.meta.catLabels[c];else S.meta.catLabels[c]=v;saveMeta();toast(v&&v!==c?`Renamed to ${v}`:`Back to ${c}`);renderTabs();renderFilters();return}
  if(d.cfopt){S.cf[d.cfopt]=t.checked;if(d.cfopt==='future'&&!t.checked&&futureMonths().length===0)S.bankMonth=null;renderMain();return}
  if(d.plan){const[i,k]=d.plan.split('|');const ps=JSON.parse(JSON.stringify(planned()));const v=k==='name'?t.value.trim():parseAmt(t.value);if(k!=='name'&&!(v>0)){toast('Enter a number above 0');return}ps[+i][k]=v;if(k==='name'){ps[+i].c=v||ps[+i].c}S.meta.planned=ps;if(k==='name'&&v&&!bankCats().includes(v)){S.meta.bankCats=[...(S.meta.bankCats||[]),{name:v,savings:false}]}saveMeta();renderMain();return}
  if(d.thr){const v=parseAmt(t.value);if(v!=null){S.meta.thresholds[d.thr]=v;saveMeta();renderTabs()}return}
  if(t.id==='startSel'){S.meta.startMonth=t.value||null;saveMeta();initFilters();renderAll();toast(t.value?'Showing data from '+mLong(t.value):'Showing all months');return}
  if(t.id==='presetSel'&&t.value!==''){const p=S.meta.presets[+t.value];if(p){S.F=structuredClone(p.F);renderAll()}return}
  if(d.topt){(S.trendOpts||(S.trendOpts={lfl:true,core:true}))[d.topt]=t.checked;renderMain();return}
  if(d.tcat){const c=d.tcat;S.trendCats=t.checked?[...new Set([...(S.trendCats||[]),c])]:(S.trendCats||[]).filter(x=>x!==c);renderMain();return}
  if(d.cardsel!==undefined){PENDING[+d.cardsel].cardSel=t.value;renderReview();return}
});
let qT=null;
document.addEventListener('input',e=>{if(e.target.id==='q'){clearTimeout(qT);qT=setTimeout(()=>{S.F.q=e.target.value.trim();renderStrip();renderMain()},200)}});
document.addEventListener('keydown',e=>{if(e.target.id==='askIn'&&e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(e.target.value)}if(e.key==='Escape')closeSheet()});
document.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files')){e.preventDefault();$('#drop')?.classList.add('over')}});
document.addEventListener('drop',e=>{if(e.dataTransfer.files.length){e.preventDefault();handleFiles(e.dataTransfer.files)}});
window.addEventListener('DOMContentLoaded',()=>{});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(S.meta.theme==='auto')renderMain()});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.getAttribute&&e.target.getAttribute('role')==='button'&&e.target.tagName!=='BUTTON'){e.preventDefault();e.target.click()}});
window.addEventListener('error',e=>{try{toast('Something went wrong: '+(e.message||'error'),6000)}catch(_){}});
window.addEventListener('unhandledrejection',e=>{try{const r=e.reason||{};toast('Something went wrong: '+(r.code||r.message||'error'),6000)}catch(_){}});
window.LedgerGate.ready().then(boot).then(()=>refreshInbox(true));