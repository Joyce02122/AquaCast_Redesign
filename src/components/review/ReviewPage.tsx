import React, { useState, useCallback } from 'react';

// ---- Domain types ----
interface MissionRecord {
  id: string; name: string; date: string; device: string;
  status: 'complete' | 'partial'; coords: string;
  avgTemp: number; avgPh: number; avgDo: number; avgCond: number; avgTurb: number;
  surf: number; bot: number; thermo: number;
}
interface ReviewLoc { id: string; label: string; mx: number; my: number; run: number; color: string; time: string; }
interface SensorDef { id: string; label: string; short: string; unit: string; color: string; min: number; max: number; dec: number; }
type MainTab = 'map' | 'table' | 'viz';
type VizMode = 'loc' | 'depth' | 'sensor' | 'mission';

// ---- Static data ----
const MISSIONS: MissionRecord[] = [
  { id:'green',  name:'Green Lake — Dock A',       date:'2026-06-12', device:'AquaCast-023', status:'complete', coords:'47.6803, -122.2620', avgTemp:15.3, avgPh:7.9, avgDo:7.4, avgCond:228, avgTurb:8.3, surf:18.1, bot:12.1, thermo:6.0 },
  { id:'rhine3', name:'Rhine Intake #3',           date:'2026-06-10', device:'AquaCast-009', status:'complete', coords:'47.5596, 7.5886',   avgTemp:12.8, avgPh:8.1, avgDo:8.6, avgCond:305, avgTurb:6.1, surf:14.2, bot:11.0, thermo:4.5 },
  { id:'res',    name:'Reservoir B Deep',          date:'2026-06-08', device:'AquaCast-023', status:'partial',  coords:'45.5152, -122.6784', avgTemp:11.4, avgPh:7.6, avgDo:6.9, avgCond:198, avgTurb:9.8, surf:13.0, bot:9.9,  thermo:7.5 },
  { id:'zurich', name:'Lake Zurich — North Bay',   date:'2026-06-05', device:'AquaCast-017', status:'complete', coords:'47.3667, 8.5500',   avgTemp:14.0, avgPh:8.0, avgDo:8.1, avgCond:252, avgTurb:7.2, surf:16.8, bot:11.7, thermo:5.5 },
];
const DRAFTS = [
  { id:'d1', name:'Lake Union — East',    meta:'Edited 2 days ago · 4 points' },
  { id:'d2', name:'Elliott Bay Transect', meta:'Edited 5 days ago · 3 points' },
];
const LOCS: ReviewLoc[] = [
  { id:'A', label:'Point A', mx:0.30, my:0.30, run:0, color:'#1f6fd4', time:'10:01' },
  { id:'B', label:'Point B', mx:0.66, my:0.46, run:0, color:'#19b0a6', time:'10:09' },
  { id:'C', label:'Point C', mx:0.48, my:0.80, run:1, color:'#ef7d22', time:'10:21' },
];
const SENSORS: SensorDef[] = [
  { id:'temp', label:'Temperature',  short:'Temp', unit:'°C',   color:'#1f6fd4', min:10,  max:20,  dec:1 },
  { id:'ph',   label:'pH',           short:'pH',   unit:'',     color:'#19b0a6', min:6.8, max:8.6, dec:2 },
  { id:'do',   label:'Dissolved O₂', short:'DO',   unit:'mg/L', color:'#1aa06a', min:4,   max:11,  dec:1 },
  { id:'cond', label:'Conductivity', short:'Cond', unit:'µS/cm',color:'#ef7d22', min:190, max:320, dec:0 },
  { id:'turb', label:'Turbidity',    short:'Turb', unit:'NTU',  color:'#8a72ff', min:2,   max:14,  dec:1 },
];
const RUN_COLORS = ['#1f6fd4','#df9620'];
const RUN_NAMES  = ['Run 1','Run 2'];
const DEPTHS = [1, 3, 5];
const ORIGIN = { mx: 0.12, my: 0.9 };

// ---- Computation helpers ----
function findMission(id: string): MissionRecord { return MISSIONS.find(m => m.id === id) || MISSIONS[0]; }
function getSensor(id: string): SensorDef { return SENSORS.find(s => s.id === id) || SENSORS[0]; }
function fmt(v: number, dec: number): string { return dec > 0 ? v.toFixed(dec) : String(Math.round(v)); }

function sampleAt(m: MissionRecord, locId: string, d: number): Record<string,any> {
  const tOff=m.avgTemp-15.3, phOff=m.avgPh-7.9, doOff=m.avgDo-7.4, cOff=m.avgCond-228, tbOff=m.avgTurb-8.3;
  const lt = locId==='A' ? 0 : locId==='B' ? -0.2 : 0.5;
  const temp = +(18.1+tOff-d*0.92+lt).toFixed(1);
  const ph   = +(8.30+phOff-(d-1)*0.05+(locId==='B'?-0.13:locId==='C'?0.04:0)).toFixed(2);
  const dox  = +(9.5+doOff-(d-1)*0.42+(locId==='B'?-2.5:locId==='C'?0.4:0)).toFixed(1);
  const cond = Math.round(212+cOff+(d-1)*5+(locId==='C'?14:0));
  const turb = +(12.4+tbOff-(d-1)*1.0+(locId==='B'?0.5:0)).toFixed(1);
  const loc = LOCS.find(L => L.id === locId)!;
  const mm = (+loc.time.slice(0,2))*60+(+loc.time.slice(3))+DEPTHS.indexOf(d)*2;
  const time = `${String(Math.floor(mm/60)).padStart(2,'0')}:${String(mm%60).padStart(2,'0')}`;
  return { loc:locId, depth:d, temp, ph, do:dox, cond, turb, time };
}

function locAvg(m: MissionRecord, locId: string, sensorId: string): number {
  const vs = DEPTHS.map(d => sampleAt(m, locId, d)[sensorId] as number);
  return vs.reduce((a,b) => a+b, 0) / vs.length;
}

// ---- Chart components ----
function DepthChart({ m, sensorId, w, h }: { m: MissionRecord; sensorId: string; w: number; h: number }) {
  const S = getSensor(sensorId);
  const padL=36, padT=14, padB=22, padR=12, maxD=5;
  const xv = (v: number) => padL+((v-S.min)/(S.max-S.min))*(w-padL-padR);
  const yd = (d: number) => padT+(d/maxD)*(h-padT-padB);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{display:'block'}}>
      {[0,1,2,3,4].map(i=>{const v=S.min+(S.max-S.min)*i/4,xx=xv(v);return(<React.Fragment key={i}><line x1={xx} y1={padT} x2={xx} y2={h-padB} stroke="#eef2f6"/><text x={xx} y={h-8} textAnchor="middle" fontSize={8.5} fill="#a3afbd" fontFamily="Roboto Mono">{fmt(v,S.dec)}</text></React.Fragment>);})}
      {DEPTHS.map(d=>(<React.Fragment key={d}><line x1={padL} y1={yd(d)} x2={w-padR} y2={yd(d)} stroke="#f4f7fa"/><text x={padL-7} y={yd(d)+3} textAnchor="end" fontSize={9} fill="#a3afbd" fontFamily="Roboto Mono">{d}m</text></React.Fragment>))}
      {LOCS.map(L=>{const dp=DEPTHS.map((d,i)=>{const v=sampleAt(m,L.id,d)[sensorId] as number;return`${i?'L':'M'}${xv(v)} ${yd(d)}`;}).join(' ');return(<React.Fragment key={L.id}><path d={dp} fill="none" stroke={L.color} strokeWidth={2}/>{DEPTHS.map((d,i)=>{const v=sampleAt(m,L.id,d)[sensorId] as number;return<circle key={i} cx={xv(v)} cy={yd(d)} r={3} fill={L.color}/>;})}</React.Fragment>);})}
    </svg>
  );
}

function TrendChart({ m, sensorId, w, h }: { m: MissionRecord; sensorId: string; w: number; h: number }) {
  const S = getSensor(sensorId);
  const padL=42, padT=16, padB=30, padR=14;
  const xi = (i: number) => padL+(i/(DEPTHS.length-1))*(w-padL-padR);
  const yv = (v: number) => padT+(1-(v-S.min)/(S.max-S.min))*(h-padT-padB);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{display:'block'}}>
      {[0,1,2,3,4].map(i=>{const v=S.min+(S.max-S.min)*i/4,yy=yv(v);return(<React.Fragment key={i}><line x1={padL} y1={yy} x2={w-padR} y2={yy} stroke="#eef2f6"/><text x={padL-8} y={yy+3} textAnchor="end" fontSize={9} fill="#a3afbd" fontFamily="Roboto Mono">{fmt(v,S.dec)}</text></React.Fragment>);})}
      {DEPTHS.map((d,i)=><text key={d} x={xi(i)} y={h-10} textAnchor="middle" fontSize={9.5} fill="#a3afbd" fontFamily="Roboto Mono">{d} m</text>)}
      {LOCS.map(L=>{const dp=DEPTHS.map((d,i)=>{const v=sampleAt(m,L.id,d)[sensorId] as number;return`${i?'L':'M'}${xi(i)} ${yv(v)}`;}).join(' ');return(<React.Fragment key={L.id}><path d={dp} fill="none" stroke={L.color} strokeWidth={2.4}/>{DEPTHS.map((d,i)=>{const v=sampleAt(m,L.id,d)[sensorId] as number;return<circle key={i} cx={xi(i)} cy={yv(v)} r={3.4} fill={L.color}/>;})}</React.Fragment>);})}
    </svg>
  );
}

function BarChart({ m, sensorId, w, h }: { m: MissionRecord; sensorId: string; w: number; h: number }) {
  const S = getSensor(sensorId);
  const padL=42, padT=18, padB=30, padR=12;
  const vals = LOCS.map(L => locAvg(m, L.id, sensorId));
  const lo=Math.min(S.min,...vals), hi=Math.max(S.max,...vals);
  const yv = (v: number) => padT+(1-(v-lo)/(hi-lo))*(h-padT-padB);
  const bw=(w-padL-padR)/LOCS.length, barW=Math.min(64,bw*0.5);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{display:'block'}}>
      {[0,1,2,3,4].map(i=>{const v=lo+(hi-lo)*i/4,yy=yv(v);return(<React.Fragment key={i}><line x1={padL} y1={yy} x2={w-padR} y2={yy} stroke="#eef2f6"/><text x={padL-8} y={yy+3} textAnchor="end" fontSize={9} fill="#a3afbd" fontFamily="Roboto Mono">{fmt(v,S.dec)}</text></React.Fragment>);})}
      {LOCS.map((L,i)=>{const v=vals[i],cx=padL+bw*i+bw/2,yy=yv(v),y0=yv(lo);return(<React.Fragment key={L.id}><rect x={cx-barW/2} y={yy} width={barW} height={Math.max(0,y0-yy)} rx={6} fill={L.color}/><text x={cx} y={yy-7} textAnchor="middle" fontSize={11} fontWeight={700} fill="#16242e" fontFamily="Roboto Mono">{fmt(v,S.dec)}</text><text x={cx} y={h-10} textAnchor="middle" fontSize={11} fontWeight={600} fill="#566974">{L.label}</text></React.Fragment>);})}
    </svg>
  );
}

function RouteMapSVG() {
  const W=600, H=484;
  const O={x:ORIGIN.mx*W, y:ORIGIN.my*H};
  const runs: Record<number, ReviewLoc[]> = {};
  LOCS.forEach(L=>{(runs[L.run]=runs[L.run]||[]).push(L);});
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{position:'absolute',inset:0}}>
      {Object.entries(runs).map(([ri,locs])=>{
        const col=RUN_COLORS[+ri];
        const pts=[O,...locs.map(L=>({x:L.mx*W,y:L.my*H})),O];
        const d=pts.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
        return<path key={ri} d={d} fill="none" stroke={col} strokeOpacity={0.5} strokeWidth={2.4} strokeDasharray="7 7" strokeLinejoin="round" strokeLinecap="round"/>;
      })}
    </svg>
  );
}

// ---- Glass card shared style ----
const glass: React.CSSProperties = {
  background:'rgba(255,255,255,.94)', border:'1px solid rgba(120,150,165,.22)',
  borderRadius:16, boxShadow:'0 1px 3px rgba(40,80,120,.05)',
};

// ---- Chip helper ----
function chip(active: boolean, label: string, onClick: ()=>void, dotColor?: string): React.ReactNode {
  return (
    <div key={label} onClick={onClick} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,padding:'5px 11px',borderRadius:8,cursor:'pointer',border:`1px solid ${active?'#1f6fd4':'rgba(120,150,165,.25)'}`,background:active?'#eaf2fd':'#fff',color:active?'#1559b0':'#566974',userSelect:'none'}}>
      {dotColor&&<span style={{width:7,height:7,borderRadius:'50%',background:dotColor}}/>}
      {label}
    </div>
  );
}

// ---- Props ----
interface Props {
  justDeployed: boolean;
  onNavigateCreate: () => void;
}

// ---- Main component ----
export function ReviewPage({ justDeployed, onNavigateCreate }: Props) {
  const [stage,    setStage]    = useState<'upload'|'analysis'>(justDeployed ? 'upload' : 'upload');
  const [importing,setImporting]= useState(false);
  const [activeId, setActiveId] = useState('green');
  const [mainTab,  setMainTab]  = useState<MainTab>('map');
  const [vizMode,  setVizMode]  = useState<VizMode>('loc');
  const [selLoc,   setSelLoc]   = useState('A');
  const [vizSensor,setVizSensor]= useState('temp');
  const [filterLoc,setFilterLoc]= useState<string>('all');
  const [filterDepth,setFilterDepth]= useState<'all'|number>('all');
  const [hiddenSensors,setHiddenSensors]= useState<string[]>([]);
  const [sortKey,  setSortKey]  = useState('loc');
  const [sortDir,  setSortDir]  = useState<1|-1>(1);
  const [compareId,setCompareId]= useState('rhine3');
  const [aiOpen,   setAiOpen]   = useState(false);
  const [askText,  setAskText]  = useState('');

  const m = findMission(activeId);
  const vS = getSensor(vizSensor);

  const handleUpload = useCallback(()=>{
    setImporting(true);
    setTimeout(()=>{ setImporting(false); setStage('analysis'); setActiveId('green'); setSelLoc('A'); setMainTab('map'); }, 1300);
  },[]);

  const toggleSensor = useCallback((id: string)=>{
    setHiddenSensors(prev=>{
      const h=[...prev]; const i=h.indexOf(id);
      if(i<0){ if(h.length<SENSORS.length-1) h.push(id); } else h.splice(i,1);
      return h;
    });
  },[]);

  const handleSort = useCallback((key: string)=>{
    setSortKey(prev=>{ setSortDir(p=>prev===key?-p as 1|-1:1); return key; });
  },[]);

  const askAction = useCallback((prompt: string)=>{ setAiOpen(true); setAskText(prompt); },[]);

  // ---- Top chrome bar (shared between landing + analysis) ----
  const NavBar = (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 40px',position:'sticky',top:0,zIndex:40,backdropFilter:'blur(12px)',background:'rgba(244,247,248,.7)',borderBottom:'1px solid rgba(120,150,165,.14)'}}>
      <div style={{display:'flex',alignItems:'center',gap:18}}>
        <div style={{display:'flex',alignItems:'center',gap:11}}>
          <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(155deg,#5ea6e8,#1f6fd4)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3c3.5 4.2 6 7.3 6 10.4A6 6 0 0 1 6 13.4C6 10.3 8.5 7.2 12 3Z" fill="#fff"/></svg>
          </div>
          <span style={{fontWeight:600,fontSize:16,letterSpacing:'-.3px',color:'#16242e'}}>AquaCast</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <span onClick={onNavigateCreate} style={{fontSize:12.5,fontWeight:500,color:'#8aa0ab',padding:'6px 12px',borderRadius:9,cursor:'pointer',textDecoration:'none'}}>Create Mission</span>
          <span style={{fontSize:12.5,fontWeight:600,color:'#16242e',padding:'6px 12px',borderRadius:9,background:'rgba(31,111,212,.1)'}}>Review</span>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 13px',borderRadius:30,background:'rgba(255,255,255,.7)',border:'1px solid rgba(120,150,165,.22)'}}>
        <span style={{width:7,height:7,borderRadius:'50%',background:'#1aa06a'}}/>
        <span style={{fontSize:12,fontWeight:600,color:'#16242e'}}>AquaCast-023</span>
        <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:11.5,color:'#8aa0ab'}}>82%</span>
      </div>
    </div>
  );

  // ---- Landing view ----
  if (stage === 'upload') {
    return (
      <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'radial-gradient(135% 100% at 50% 0%,#ffffff 0%,#f3f6f7 48%,#e7ecee 100%)',fontFamily:"'Manrope',system-ui,sans-serif",color:'#16242e',WebkitFontSmoothing:'antialiased'}}>
        {NavBar}
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'52px 24px 64px'}}>
          <div style={{width:'100%',maxWidth:720}}>
            {justDeployed&&(
              <div style={{display:'flex',gap:11,alignItems:'center',background:'rgba(230,246,238,.8)',border:'1px solid #b7e6cd',borderRadius:13,padding:'13px 16px',fontSize:13,color:'#157a4d',marginBottom:24}}>
                <span style={{fontSize:17}}>✓</span>
                <div><b>Mission deployed.</b> When AquaCast surfaces and you retrieve the SD card, upload its CSV here to explore what it recorded.</div>
              </div>
            )}

            <div style={{fontSize:11,fontWeight:600,letterSpacing:'.26em',color:'#9fb2bc',textTransform:'uppercase'}}>Mission Review</div>
            <h1 style={{margin:'10px 0 8px',fontSize:30,fontWeight:500,letterSpacing:'-.7px',color:'#16242e'}}>Open a mission to explore</h1>
            <p style={{margin:'0 0 28px',color:'#566974',fontSize:14.5,lineHeight:1.55,maxWidth:580}}>Upload the CSV exported from the AquaCast SD card, or reopen a previous mission. Every sensor channel is parsed automatically so you can explore the data spatially, in tables, and through visualizations.</p>

            {/* Upload dropzone */}
            <div onClick={handleUpload} style={{border:'2px dashed rgba(45,110,180,.32)',borderRadius:18,padding:'48px 30px',textAlign:'center',cursor:'pointer',background:'rgba(247,251,255,.7)',transition:'border-color .2s'}}>
              {importing?(
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
                  <div style={{width:34,height:34,border:'3px solid #cfe0f5',borderTopColor:'#1f6fd4',borderRadius:'50%',animation:'acSpin .8s linear infinite'}}/>
                  <div style={{fontSize:14,color:'#1559b0',fontWeight:600}}>Parsing greenlake_docka.csv…</div>
                  <div style={{fontSize:12,color:'#8aa0ab'}}>Detecting columns · validating ranges</div>
                </div>
              ):(
                <>
                  <div style={{fontSize:34,marginBottom:10}}>📄</div>
                  <div style={{fontSize:15,fontWeight:600,color:'#1559b0'}}>Click to select or drop your mission CSV</div>
                  <div style={{fontSize:12.5,color:'#8aa0ab',marginTop:6}}>depth · temperature · pH · dissolved O₂ · conductivity · turbidity</div>
                </>
              )}
            </div>

            {/* Drafts */}
            <div style={{marginTop:40}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <span style={{fontSize:11,fontWeight:600,letterSpacing:'.08em',color:'#9fb2bc',textTransform:'uppercase'}}>Draft analysis</span>
                <div style={{flex:1,height:1,background:'rgba(120,150,165,.2)'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11,marginBottom:30}}>
                {DRAFTS.map(d=>(
                  <div key={d.id} onClick={onNavigateCreate} style={{display:'flex',alignItems:'center',gap:12,...glass,borderRadius:13,padding:'13px 15px',cursor:'pointer'}}>
                    <div style={{width:34,height:34,borderRadius:10,background:'rgba(239,125,34,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>✎</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13.5,color:'#16242e'}}>{d.name}</div>
                      <div style={{fontSize:11.5,color:'#8aa0ab'}}>{d.meta}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,letterSpacing:'.05em',color:'#b65e10',background:'rgba(239,125,34,.12)',borderRadius:6,padding:'3px 7px'}}>DRAFT</span>
                  </div>
                ))}
              </div>

              {/* Mission history */}
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <span style={{fontSize:11,fontWeight:600,letterSpacing:'.08em',color:'#9fb2bc',textTransform:'uppercase'}}>Mission history</span>
                <div style={{flex:1,height:1,background:'rgba(120,150,165,.2)'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
                {MISSIONS.map(mi=>(
                  <div key={mi.id} onClick={()=>{setActiveId(mi.id);setStage('analysis');setSelLoc('A');setMainTab('map');}} style={{display:'flex',alignItems:'center',gap:12,...glass,borderRadius:13,padding:'13px 15px',cursor:'pointer'}}>
                    <span style={{width:9,height:9,borderRadius:'50%',flexShrink:0,background:mi.status==='partial'?'#ef7d22':'#1aa06a'}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13.5,color:'#16242e'}}>{mi.name}</div>
                      <div style={{fontSize:11.5,color:'#8aa0ab'}}>{mi.date} · 9 samples · {mi.device}</div>
                    </div>
                    <span style={{fontSize:14,color:'#c0ccd4'}}>→</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <style>{`@keyframes acSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ---- Analysis view ----
  // Build table rows
  let tableRows = LOCS.flatMap(L => DEPTHS.map(d => sampleAt(m, L.id, d)));
  if (filterLoc !== 'all') tableRows = tableRows.filter(r => r.loc === filterLoc);
  if (filterDepth !== 'all') tableRows = tableRows.filter(r => r.depth === filterDepth);
  const sk = sortKey;
  tableRows.sort((a,b)=>{
    const av = (a as any)[sk], bv = (b as any)[sk];
    if(av<bv) return -1*sortDir; if(av>bv) return 1*sortDir; return 0;
  });
  const visibleSensors = SENSORS.filter(s => !hiddenSensors.includes(s.id));
  const gridCols = `70px 64px ${visibleSensors.map(()=>'1fr').join(' ')} 70px`;

  // Compare section
  const baseM = findMission(compareId === activeId ? (MISSIONS.find(mi => mi.id !== activeId) || MISSIONS[1]).id : compareId);
  const delta = (cur: number, base: number, unit: string, dec: number) => {
    const x = +(cur - base).toFixed(dec);
    return { delta: (x > 0 ? '+' : '') + x.toFixed(dec) + unit, color: x > 0 ? '#b65e10' : x < 0 ? '#1559b0' : '#8aa0ab' };
  };

  // AI data
  const bDo = locAvg(m,'B','do'), acDo = (locAvg(m,'A','do') + locAvg(m,'C','do')) / 2;

  const tabStyle = (id: MainTab): React.CSSProperties => ({
    display:'flex', alignItems:'center', gap:7, whiteSpace:'nowrap',
    padding:'10px 16px', fontSize:13.5, fontWeight:600, cursor:'pointer',
    borderRadius:'10px 10px 0 0', marginBottom:-2,
    color: mainTab===id ? '#1559b0' : '#8aa0ab',
    borderBottom: `2px solid ${mainTab===id ? '#1f6fd4' : 'transparent'}`,
    background: mainTab===id ? 'rgba(234,242,253,.6)' : 'transparent',
  });

  const selL = LOCS.find(L => L.id === selLoc) || LOCS[0];

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'radial-gradient(135% 100% at 50% 0%,#ffffff 0%,#f3f6f7 48%,#e7ecee 100%)',fontFamily:"'Manrope',system-ui,sans-serif",color:'#16242e',WebkitFontSmoothing:'antialiased'}}>
      {NavBar}

      <div style={{flex:1,minWidth:0,padding:'22px 32px 56px',maxWidth:1280,width:'100%',margin:'0 auto'}}>

        {/* Heading row */}
        <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:16,flexWrap:'wrap'}}>
          <button onClick={()=>setStage('upload')} style={{display:'flex',alignItems:'center',gap:6,fontSize:12.5,fontWeight:600,color:'#1559b0',background:'rgba(234,242,253,.8)',border:'none',borderRadius:10,padding:'9px 13px',cursor:'pointer',fontFamily:'inherit'}}>↑ Open another</button>
          <div style={{flex:1,minWidth:0}}>
            <h1 style={{margin:0,fontSize:22,fontWeight:600,letterSpacing:'-.4px'}}>{m.name}</h1>
            <div style={{fontSize:12,color:'#8aa0ab',marginTop:3,fontFamily:"'Roboto Mono',monospace"}}>{m.coords} · {m.date} · 10:01 – 10:25</div>
          </div>
          <button onClick={()=>setAiOpen(v=>!v)} style={{display:'flex',alignItems:'center',gap:7,fontSize:13,fontWeight:600,color:'#5b3fd6',background:'rgba(138,114,255,.12)',border:'1px solid rgba(138,114,255,.3)',borderRadius:10,padding:'9px 14px',cursor:'pointer',fontFamily:'inherit'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z" fill="#6d52f5"/></svg>
            AI insights
          </button>
          <button style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:'#16242e',background:'rgba(255,255,255,.8)',border:'1px solid rgba(120,150,165,.24)',borderRadius:10,padding:'9px 14px',cursor:'pointer',fontFamily:'inherit'}}>↓ Export CSV</button>
        </div>

        {/* Summary stats */}
        <div style={{display:'flex',alignItems:'stretch',borderBottom:'1px solid rgba(120,150,165,.16)',paddingBottom:18,marginBottom:24,flexWrap:'wrap',gap:'0'}}>
          {[
            {label:'Mission',  value:m.name.replace(/ —.*$/,''), sub:m.coords},
            {label:'Collected',value:m.date,                     sub:'10:01 – 10:25'},
            {label:'Locations',value:'3',                         sub:'A · B · C'},
            {label:'Samples',  value:'9',                         sub:'3 depths each'},
            {label:'Runs',     value:'2',                         sub:'6-bottle limit'},
            {label:'Device',   value:m.device,                    sub:m.status==='partial'?'partial recovery':'full mission'},
          ].map((it,i,arr)=>(
            <div key={it.label} style={{flex:1,minWidth:0,padding:i===0?'0 18px 0 0':`0 ${i<arr.length-1?18:0}px`,borderRight:i<arr.length-1?'1px solid rgba(120,150,165,.14)':'none'}}>
              <div style={{fontSize:10,fontWeight:600,letterSpacing:'.07em',color:'#9fb2bc',textTransform:'uppercase'}}>{it.label}</div>
              <div style={{fontSize:16,fontWeight:700,letterSpacing:'-.3px',color:'#16242e',marginTop:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.value}</div>
              <div style={{fontSize:10.5,color:'#a3afbd',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:6,marginBottom:16,borderBottom:'1px solid rgba(120,150,165,.18)',paddingBottom:2}}>
          <div onClick={()=>setMainTab('map')}   style={tabStyle('map')}>   <span style={{fontSize:14}}>🗺</span>Map view</div>
          <div onClick={()=>setMainTab('table')} style={tabStyle('table')}> <span style={{fontSize:14}}>▦</span>Data table</div>
          <div onClick={()=>setMainTab('viz')}   style={tabStyle('viz')}>   <span style={{fontSize:14}}>📈</span>Visualization</div>
        </div>

        {/* ===== MAP VIEW ===== */}
        {mainTab === 'map' && (
          <div style={{display:'flex',gap:16,alignItems:'stretch',animation:'acFade .3s ease'}}>
            {/* Map */}
            <div style={{flex:1,minWidth:0,position:'relative',height:484,borderRadius:16,overflow:'hidden',border:'1px solid rgba(120,150,165,.22)',background:'linear-gradient(135deg,#e9f0f4,#dbe6ed)',boxShadow:'0 1px 3px rgba(40,80,120,.05)'}}>
              <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(120,150,165,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(120,150,165,.09) 1px,transparent 1px)',backgroundSize:'42px 42px'}}/>
              <div style={{position:'absolute',top:14,left:16,fontFamily:"'Roboto Mono',monospace",fontSize:10,letterSpacing:'.1em',color:'#5a7283',textTransform:'uppercase',background:'rgba(255,255,255,.82)',borderRadius:6,padding:'3px 9px',zIndex:6}}>{m.name}</div>
              <div style={{position:'absolute',top:14,right:16,display:'flex',gap:14,zIndex:6,background:'rgba(255,255,255,.82)',borderRadius:8,padding:'6px 11px'}}>
                {RUN_COLORS.map((col,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:14,height:3,borderRadius:2,background:col}}/><span style={{fontSize:11,fontWeight:600,color:'#566974'}}>{RUN_NAMES[i]}</span></div>))}
              </div>
              <RouteMapSVG />
              {/* Origin */}
              <div style={{position:'absolute',left:`${ORIGIN.mx*100}%`,top:`${ORIGIN.my*100}%`,transform:'translate(-50%,-50%)',zIndex:7}}>
                <div style={{width:28,height:28,borderRadius:8,background:'#16242e',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,boxShadow:'0 6px 16px rgba(20,50,90,.35)',border:'2px solid #fff'}}>⌂</div>
                <div style={{position:'absolute',left:'50%',top:31,transform:'translateX(-50%)',fontFamily:"'Roboto Mono',monospace",fontSize:9.5,color:'#3a4f5c',background:'rgba(255,255,255,.92)',borderRadius:6,padding:'1px 6px',whiteSpace:'nowrap'}}>Base</div>
              </div>
              {/* Pins */}
              {LOCS.map(L=>{
                const on=L.id===selLoc;
                const sz=on?44:38;
                return(
                  <div key={L.id} onClick={()=>setSelLoc(L.id)} style={{position:'absolute',left:`${L.mx*100}%`,top:`${L.my*100}%`,transform:'translate(-50%,-50%)',zIndex:on?9:8,cursor:'pointer'}}>
                    <div style={{width:sz,height:sz,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:on?18:16,fontWeight:700,background:L.color,border:'3px solid #fff',boxShadow:`0 8px 20px rgba(20,50,90,.4)${on?`,0 0 0 6px ${L.color}29`:''}`}}>{L.id}</div>
                    <div style={{position:'absolute',left:'50%',top:sz/2+8,transform:'translateX(-50%)',fontFamily:"'Roboto Mono',monospace",fontSize:10,color:'#3a4f5c',background:'rgba(255,255,255,.92)',borderRadius:6,padding:'2px 7px',whiteSpace:'nowrap',fontWeight:on?700:400}}>{L.label}</div>
                  </div>
                );
              })}
              <div style={{position:'absolute',left:16,bottom:14,fontSize:11,color:'#7c8c98',background:'rgba(255,255,255,.82)',borderRadius:7,padding:'5px 10px',zIndex:6}}>Tap a point to inspect its readings</div>
            </div>

            {/* Location detail */}
            <div style={{width:336,flexShrink:0,...glass,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <div style={{padding:'16px 17px',borderBottom:'1px solid rgba(120,150,165,.14)'}}>
                <div style={{display:'flex',alignItems:'center',gap:11}}>
                  <div style={{width:38,height:38,borderRadius:11,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:17,fontWeight:700,background:selL.color}}>{selL.id}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:15,fontWeight:700,color:'#16242e'}}>{selL.label}</span>
                      <span style={{fontSize:10.5,fontWeight:700,color:RUN_COLORS[selL.run],background:RUN_COLORS[selL.run]+'1a',padding:'2px 8px',borderRadius:7}}>{RUN_NAMES[selL.run]}</span>
                    </div>
                    <div style={{fontFamily:"'Roboto Mono',monospace",fontSize:11,color:'#8aa0ab',marginTop:2}}>{m.coords}</div>
                  </div>
                </div>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'16px 18px'}}>
                {DEPTHS.map(d=>{
                  const r=sampleAt(m,selL.id,d);
                  return(
                    <div key={d} style={{marginBottom:18}}>
                      <div style={{display:'flex',alignItems:'baseline',gap:9,marginBottom:10}}>
                        <span style={{fontSize:12.5,fontWeight:700,color:'#16242e'}}>Depth {d} m</span>
                        <div style={{flex:1,height:1,background:'rgba(120,150,165,.13)'}}/>
                        <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:10,color:'#a3afbd'}}>{r.time as string}</span>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'11px 18px'}}>
                        {SENSORS.map(se=>(
                          <div key={se.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            <span style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'#7c8c98'}}><span style={{width:6,height:6,borderRadius:'50%',flexShrink:0,background:se.color}}/>{se.short}</span>
                            <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:12.5,fontWeight:600,color:'#16242e',whiteSpace:'nowrap'}}>
                              {fmt(r[se.id] as number,se.dec)}<span style={{fontSize:9,color:'#a3afbd',fontWeight:400}}> {se.unit}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== DATA TABLE ===== */}
        {mainTab === 'table' && (
          <div style={{animation:'acFade .3s ease'}}>
            {/* Filters row 1 */}
            <div style={{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:11,fontWeight:600,color:'#9fb2bc',textTransform:'uppercase',letterSpacing:'.05em'}}>Location</span>
                {[['all','All'],...LOCS.map(L=>[L.id,L.id])].map(([id,label])=>
                  <React.Fragment key={id}>{chip(filterLoc===id,label,()=>setFilterLoc(id))}</React.Fragment>
                )}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:11,fontWeight:600,color:'#9fb2bc',textTransform:'uppercase',letterSpacing:'.05em'}}>Depth</span>
                {[['all','All'],...DEPTHS.map(d=>[String(d),d+' m'])].map(([id,label])=>
                  <React.Fragment key={id}>{chip(String(filterDepth)===id,label,()=>setFilterDepth(id==='all'?'all':+id))}</React.Fragment>
                )}
              </div>
              <div style={{flex:1}}/>
              <button style={{display:'flex',alignItems:'center',gap:6,fontSize:12.5,fontWeight:600,color:'#16242e',background:'rgba(255,255,255,.8)',border:'1px solid rgba(120,150,165,.24)',borderRadius:9,padding:'7px 13px',cursor:'pointer',fontFamily:'inherit'}}>↓ Export {tableRows.length} rows</button>
            </div>
            {/* Sensor toggle */}
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14,flexWrap:'wrap'}}>
              <span style={{fontSize:11,fontWeight:600,color:'#9fb2bc',textTransform:'uppercase',letterSpacing:'.05em'}}>Sensors</span>
              {SENSORS.map(se=>{
                const on=!hiddenSensors.includes(se.id);
                return(
                  <div key={se.id} onClick={()=>toggleSensor(se.id)} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,padding:'5px 11px',borderRadius:8,cursor:'pointer',border:`1px solid ${on?'rgba(120,150,165,.3)':'rgba(120,150,165,.18)'}`,background:on?'#fff':'rgba(120,150,165,.08)',color:on?'#16242e':'#aab4bb',opacity:on?1:0.6}}>
                    <span style={{width:7,height:7,borderRadius:'50%',background:se.color}}/>{se.short}
                  </div>
                );
              })}
            </div>
            {/* Table */}
            <div style={{...glass,overflow:'hidden'}}>
              {/* Head */}
              <div style={{display:'grid',gridTemplateColumns:gridCols,padding:'14px 20px',fontSize:11,fontWeight:600,color:'#8aa0ab',background:'rgba(120,150,165,.05)',textTransform:'uppercase',letterSpacing:'.05em'}}>
                {[{key:'loc',label:'Point'},{key:'depth',label:'Depth'},...visibleSensors.map(se=>({key:se.id,label:se.short+(se.unit?` (${se.unit})`:'')})),{key:'time',label:'Time'}].map(c=>(
                  <span key={c.key} onClick={()=>handleSort(c.key)} style={{cursor:'pointer',userSelect:'none',color:sk===c.key?'#1559b0':'#8aa0ab',display:'flex',alignItems:'center',gap:4}}>
                    {c.label}{sk===c.key&&<span style={{fontSize:9}}>{sortDir>0?'▲':'▼'}</span>}
                  </span>
                ))}
              </div>
              {/* Body */}
              {tableRows.map((r,i)=>{
                const loc=LOCS.find(L=>L.id===r.loc)!;
                return(
                  <div key={i} style={{display:'grid',gridTemplateColumns:gridCols,padding:'13px 20px',fontSize:12.5,borderTop:'1px solid rgba(120,150,165,.1)',alignItems:'center',fontFamily:"'Roboto Mono',monospace"}}>
                    <span style={{display:'inline-flex',alignItems:'center',gap:7,fontWeight:600,fontFamily:'inherit'}}><span style={{width:8,height:8,borderRadius:'50%',background:loc.color}}/><span>Point {r.loc as string}</span></span>
                    <span>{(r.depth as number).toFixed(0)} m</span>
                    {visibleSensors.map(se=><span key={se.id}>{fmt(r[se.id] as number,se.dec)}</span>)}
                    <span style={{color:'#566974'}}>{r.time as string}:14</span>
                  </div>
                );
              })}
              <div style={{padding:'13px 20px',fontSize:12,color:'#8aa0ab',borderTop:'1px solid rgba(120,150,165,.1)'}}>{tableRows.length} of 9 samples</div>
            </div>
          </div>
        )}

        {/* ===== VISUALIZATION ===== */}
        {mainTab === 'viz' && (
          <div style={{animation:'acFade .3s ease'}}>
            {/* Mode switcher */}
            <div style={{display:'flex',gap:7,marginBottom:18,flexWrap:'wrap'}}>
              {([['loc','Location comparison'],['depth','Depth profile'],['sensor','Sensor trends'],['mission','Mission comparison']] as [VizMode,string][]).map(([id,label])=>(
                <div key={id} onClick={()=>setVizMode(id)} style={{padding:'9px 15px',fontSize:13,fontWeight:600,whiteSpace:'nowrap',cursor:'pointer',borderRadius:10,border:`1px solid ${vizMode===id?'#1f6fd4':'rgba(120,150,165,.22)'}`,color:vizMode===id?'#1559b0':'#8aa0ab',background:vizMode===id?'rgba(234,242,253,.8)':'rgba(255,255,255,.6)'}}>
                  {label}
                </div>
              ))}
            </div>

            {/* Sensor switcher (shared) */}
            {(vizMode==='loc'||vizMode==='sensor')&&(
              <div style={{display:'flex',gap:7,marginBottom:14,flexWrap:'wrap'}}>
                {SENSORS.map(se=>{const sel=vizSensor===se.id;return(
                  <div key={se.id} onClick={()=>setVizSensor(se.id)} style={{fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:9,cursor:'pointer',border:`1px solid ${sel?se.color:'rgba(120,150,165,.25)'}`,background:sel?se.color+'14':'#fff',color:sel?se.color:'#566974'}}>{se.short}</div>
                );})}
              </div>
            )}

            {/* Location comparison */}
            {vizMode==='loc'&&(
              <div style={{...glass,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18,flexWrap:'wrap'}}>
                  <div style={{fontWeight:600,fontSize:14.5}}>Location comparison</div>
                  <div style={{flex:1}}/>
                </div>
                <div style={{display:'flex',gap:22,alignItems:'flex-end',flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:240}}><BarChart m={m} sensorId={vizSensor} w={360} h={220}/></div>
                  <div style={{width:230,flexShrink:0}}>
                    <div style={{fontSize:12,color:'#8aa0ab',lineHeight:1.5,marginBottom:12}}>
                      Average {vS.label.toLowerCase()} across the water column at each point.{' '}
                      {vizSensor==='do'?'Point B is markedly lower — a clear spatial outlier worth investigating.':'Use the sensor switch to compare any channel spatially.'}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {LOCS.map(L=>(
                        <div key={L.id} style={{display:'flex',alignItems:'center',gap:8,fontSize:12.5}}>
                          <span style={{width:10,height:10,borderRadius:3,background:L.color}}/>
                          <span style={{fontWeight:600,color:'#16242e'}}>{L.label}</span>
                          <span style={{flex:1}}/>
                          <span style={{fontFamily:"'Roboto Mono',monospace",color:'#566974'}}>{fmt(locAvg(m,L.id,vizSensor),vS.dec)}{vS.unit?' '+vS.unit:''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Depth profile */}
            {vizMode==='depth'&&(
              <div>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14,flexWrap:'wrap'}}>
                  <span style={{fontSize:12.5,color:'#566974'}}>Profiles overlay all sampling locations:</span>
                  {LOCS.map(L=>(<div key={L.id} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:11,height:3,borderRadius:2,background:L.color}}/><span style={{fontSize:12,fontWeight:600,color:'#16242e'}}>{L.label}</span></div>))}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  {SENSORS.map(se=>(
                    <div key={se.id} style={{...glass,padding:16}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{width:9,height:9,borderRadius:3,background:se.color}}/>
                        <span style={{fontWeight:600,fontSize:13.5}}>{se.label} vs depth</span>
                      </div>
                      <div style={{fontSize:11,color:'#a3afbd',marginBottom:8}}>{se.unit||'value'} (x) · depth m (y)</div>
                      <DepthChart m={m} sensorId={se.id} w={270} h={196}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sensor trends */}
            {vizMode==='sensor'&&(
              <div style={{...glass,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,flexWrap:'wrap'}}>
                  <div style={{fontWeight:600,fontSize:14.5}}>{vS.label} by depth</div>
                  <div style={{flex:1}}/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:8,flexWrap:'wrap'}}>
                  {LOCS.map(L=>(<div key={L.id} style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:11,height:3,borderRadius:2,background:L.color}}/><span style={{fontSize:12,fontWeight:600,color:'#16242e'}}>{L.label}</span></div>))}
                </div>
                <TrendChart m={m} sensorId={vizSensor} w={640} h={260}/>
              </div>
            )}

            {/* Mission comparison */}
            {vizMode==='mission'&&(
              <div style={{...glass,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:16}}>
                  <div style={{fontWeight:600,fontSize:14.5}}>Mission comparison</div>
                  <span style={{fontSize:12,color:'#8aa0ab'}}>Current vs.</span>
                  {MISSIONS.filter(mi=>mi.id!==activeId).map(mi=>{const sel=mi.id===baseM.id;return(
                    <div key={mi.id} onClick={()=>setCompareId(mi.id)} style={{fontSize:12,fontWeight:600,padding:'6px 12px',borderRadius:9,cursor:'pointer',border:`1px solid ${sel?'#1f6fd4':'rgba(120,150,165,.25)'}`,background:sel?'#eaf2fd':'#fff',color:sel?'#1559b0':'#566974'}}>
                      {mi.name.replace(/ —.*$/,'').replace('Intake ','')}
                    </div>
                  );})}
                </div>
                <div style={{border:'1px solid rgba(120,150,165,.2)',borderRadius:12,overflow:'hidden'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr 1fr 0.9fr',padding:'11px 16px',fontSize:11,fontWeight:600,color:'#8aa0ab',background:'rgba(120,150,165,.06)',textTransform:'uppercase',letterSpacing:'.05em'}}>
                    <span>Metric</span><span>This mission</span><span>{baseM.name.replace(/ —.*$/,'').replace('Intake ','')}</span><span>Δ</span>
                  </div>
                  {[
                    {label:'Avg temperature', cur:`${m.avgTemp.toFixed(1)} °C`,  base:`${baseM.avgTemp.toFixed(1)} °C`,  ...delta(m.avgTemp, baseM.avgTemp,' °C',1)},
                    {label:'Avg pH',           cur:m.avgPh.toFixed(1),           base:baseM.avgPh.toFixed(1),           ...delta(m.avgPh, baseM.avgPh,'',1)},
                    {label:'Avg dissolved O₂', cur:`${m.avgDo.toFixed(1)} mg/L`, base:`${baseM.avgDo.toFixed(1)} mg/L`, ...delta(m.avgDo, baseM.avgDo,' mg/L',1)},
                    {label:'Avg turbidity',    cur:`${m.avgTurb.toFixed(1)} NTU`,base:`${baseM.avgTurb.toFixed(1)} NTU`,...delta(m.avgTurb, baseM.avgTurb,' NTU',1)},
                    {label:'Thermocline depth',cur:`${m.thermo.toFixed(1)} m`,   base:`${baseM.thermo.toFixed(1)} m`,   ...delta(m.thermo, baseM.thermo,' m',1)},
                  ].map((row,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'1.6fr 1fr 1fr 0.9fr',padding:'11px 16px',fontSize:13,borderTop:'1px solid rgba(120,150,165,.1)',alignItems:'center'}}>
                      <span style={{color:'#566974'}}>{row.label}</span>
                      <span style={{fontFamily:"'Roboto Mono',monospace",fontWeight:600}}>{row.cur}</span>
                      <span style={{fontFamily:"'Roboto Mono',monospace",color:'#8aa0ab'}}>{row.base}</span>
                      <span style={{fontFamily:"'Roboto Mono',monospace",fontWeight:600,color:row.color}}>{row.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== AI SLIDE-IN PANEL ===== */}
      {aiOpen&&<div onClick={()=>setAiOpen(false)} style={{position:'fixed',inset:0,zIndex:55,background:'rgba(20,40,55,.28)',transition:'opacity .3s ease'}}/>}
      <div style={{position:'fixed',top:0,right:0,height:'100vh',width:392,maxWidth:'92vw',zIndex:56,background:'rgba(250,251,252,.98)',backdropFilter:'blur(14px)',borderLeft:'1px solid rgba(120,150,165,.2)',boxShadow:'-18px 0 50px rgba(40,80,120,.18)',display:'flex',flexDirection:'column',transition:'transform .32s cubic-bezier(.2,.8,.2,1)',transform:`translateX(${aiOpen?'0':'100%'})`}}>
        {/* Panel header */}
        <div style={{display:'flex',alignItems:'center',gap:9,padding:'18px 18px 14px',borderBottom:'1px solid rgba(120,150,165,.14)'}}>
          <div style={{width:28,height:28,borderRadius:9,background:'linear-gradient(150deg,#9b86ff,#6d52f5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z" fill="#fff"/></svg>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:14.5}}>AI insights</div>
            <div style={{fontSize:11,color:'#8aa0ab'}}>Interpretation of {m.name}</div>
          </div>
          <button onClick={()=>setAiOpen(false)} style={{width:30,height:30,border:'none',borderRadius:9,background:'rgba(120,150,165,.12)',color:'#566974',fontSize:15,cursor:'pointer'}}>✕</button>
        </div>

        {/* Panel body */}
        <div style={{flex:1,overflowY:'auto',padding:20}}>
          <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'.09em',color:'#9fb2bc',textTransform:'uppercase',marginBottom:12}}>Potential issues</div>
          <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:24}}>
            {[
              {color:'#d9663f',title:'Low dissolved oxygen at Point B',detail:`B reads ${bDo.toFixed(1)} mg/L versus ${acDo.toFixed(1)} mg/L at neighbouring points — a likely hypoxic zone.`},
              {color:'#df9620',title:'Unusual pH variation at Point B',detail:'B trends 0.1–0.2 below A and C through the water column.'},
              {color:'#1f6fd4',title:'Turbidity above historical range',detail:'Surface turbidity is higher than recent surveys of this site.'},
            ].map((x,i)=>(
              <div key={i} style={{display:'flex',gap:11}}>
                <span style={{width:7,height:7,borderRadius:'50%',marginTop:5,flexShrink:0,background:x.color}}/>
                <div><div style={{fontSize:13,fontWeight:600,color:'#16242e',lineHeight:1.3}}>{x.title}</div><div style={{fontSize:12,color:'#7c8c98',lineHeight:1.5,marginTop:2}}>{x.detail}</div></div>
              </div>
            ))}
          </div>
          <div style={{height:1,background:'rgba(120,150,165,.14)',marginBottom:20}}/>
          <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'.09em',color:'#9fb2bc',textTransform:'uppercase',marginBottom:12}}>Key insights</div>
          <div style={{display:'flex',flexDirection:'column',gap:11,marginBottom:24}}>
            {[
              `Surface water is ${(m.surf-m.bot).toFixed(1)} °C warmer than the bottom layer — strong June stratification.`,
              `Turbidity decreases consistently with depth, clearing below the thermocline near ${m.thermo.toFixed(1)} m.`,
              'Point A and Point C show closely matching profiles across temperature, pH and turbidity.',
            ].map((t,i)=>(
              <div key={i} style={{display:'flex',gap:10,fontSize:12.5,color:'#566974',lineHeight:1.55}}>
                <span style={{color:'#c0ccd4',flexShrink:0}}>—</span><span>{t}</span>
              </div>
            ))}
          </div>
          <div style={{height:1,background:'rgba(120,150,165,.14)',marginBottom:20}}/>
          <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'.09em',color:'#9fb2bc',textTransform:'uppercase',marginBottom:8}}>Suggested next actions</div>
          <div style={{display:'flex',flexDirection:'column',gap:1,margin:'0 -8px'}}>
            {[
              {icon:'⤢',title:'Compare with previous mission',prompt:`Compare this mission with the most recent Green Lake survey and summarize the major differences.`},
              {icon:'◎',title:'Plan next mission',prompt:`Based on this mission's results, what additional sampling locations or depths would you recommend?`},
              {icon:'⚠',title:'Investigate Point B anomaly',prompt:`Help me understand why dissolved oxygen levels at Point B are significantly lower than neighboring locations.`},
              {icon:'〰',title:'Analyze depth profile',prompt:`Summarize the depth profiles across all sampling locations and highlight any notable gradients.`},
            ].map((x,i)=>(
              <div key={i} onClick={()=>askAction(x.prompt)} style={{display:'flex',alignItems:'center',gap:11,padding:'10px 8px',borderRadius:9,cursor:'pointer',fontSize:13,color:'#16242e'}}>
                <span style={{color:'#6d52f5',fontSize:13,width:15,textAlign:'center',flexShrink:0}}>{x.icon}</span>
                <span style={{flex:1}}>{x.title}</span>
                <span style={{color:'#c6cfd6'}}>→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ask AI input */}
        <div style={{padding:'14px 16px',borderTop:'1px solid rgba(120,150,165,.14)'}}>
          <div style={{fontSize:10.5,fontWeight:600,letterSpacing:'.09em',color:'#9fb2bc',textTransform:'uppercase',marginBottom:9}}>Ask AI</div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input value={askText} onChange={e=>setAskText(e.target.value)} placeholder="Ask about this mission…" style={{flex:1,border:'1px solid rgba(120,150,165,.28)',borderRadius:10,padding:'10px 12px',fontSize:12.5,outline:'none',fontFamily:'inherit',background:'#fff'}}/>
            <button style={{width:36,height:36,border:'none',borderRadius:10,background:'linear-gradient(150deg,#9b86ff,#6d52f5)',color:'#fff',cursor:'pointer',flexShrink:0}}>→</button>
          </div>
        </div>
      </div>

      <style>{`@keyframes acFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
