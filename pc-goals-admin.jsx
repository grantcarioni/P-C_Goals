import { useState, useEffect, useRef } from "react";
import { ref, set, onValue } from "firebase/database";
import { db, DB_PATH } from "./src/firebaseConfig.js";

/* ═══════════════════════════════════════════════════════════════
   NUTRITION INTERNATIONAL — People & Culture Goals Dashboard
   FY 2026/27 · IC2 Strategy Enablement
   With Admin panel: auth, goal CRUD, owner assignment
   ═══════════════════════════════════════════════════════════════ */

const B = {
  charcoal:"#253746", carmine:"#A4343A", carmineLight:"#c4636a",
  white:"#ffffff", cream:"#FAFAF7", sand:"#F2F0EB",
  g1:"#f6f7f9", g2:"#e8eaed", g3:"#98A4AE", g4:"#5a6872",
  gold:"#FFB81C", goldDark:"#CC8A00",
  success:"#00A88A", successLight:"#E8F8F3",
  danger:"#D14124", dangerLight:"#FDEEEB",
};

const ADMIN_CREDS = { userId: "pcadmin", password: "NI2026!" };

const DEFAULT_PILLARS = [
  {
    id:"thriving", title:"Thriving Workforce", color:"#003087", gradient:"linear-gradient(135deg,#003087,#307FE2)",
    tagline:"Build the talent engine that powers IC2 delivery",
    ic2:"Without the right people in the right places, ISG2, NOURISH, and Child Survival programs cannot scale.",
    risk:"Organizational Effectiveness Risk · Scored 16",
    goals:[
      {id:"t1",text:"Complete skills inventory across all geographies",metric:"100% coverage",q:"Q2",owner:"Amina Dayo",progress:35},
      {id:"t2",text:"Strategic workforce plan aligned to IC2 delivery",metric:"Plan approved",q:"Q2",owner:"James Ochieng",progress:20},
      {id:"t3",text:"Enhanced Workable ATS with live reporting",metric:"Dashboard live",q:"Q3",owner:"Priya Sharma",progress:45},
      {id:"t4",text:"95% critical positions filled within 90 days",metric:"95% fill rate",q:"Ongoing",owner:"Fatima El-Amin",progress:68},
      {id:"t5",text:"Structured 90-day onboarding program launched",metric:"Program live",q:"Q3",owner:"Carlos Mendez",progress:15},
      {id:"t6",text:"100% EMC & CD succession plans by Q4 2026",metric:"100% complete",q:"Q4",owner:"Sarah Kimani",progress:10},
    ],
    tips:["Complete your skills profile when the inventory launches","Refer strong candidates through recruitment","Mentor a new hire through their 90-day onboarding","Flag critical role gaps in your team early","Participate in succession planning conversations"],
  },
  {
    id:"performance", title:"High Performance Culture", color:"#572C5F", gradient:"linear-gradient(135deg,#572C5F,#8031A7)",
    tagline:"Align every person's work to what matters most",
    ic2:"IC2 success depends on focused execution. Individual objectives connected to KRAs means every team member pulls in the same direction.",
    risk:"Donor Credibility · Strategic Priority",
    goals:[
      {id:"p1",text:"Align individual objectives with BU work plans & KRAs",metric:"100% alignment",q:"Q2",owner:"David Okafor",progress:50},
      {id:"p2",text:"Enhanced recognition programs for global workforce",metric:"Program launched",q:"Q3",owner:"Nadia Benali",progress:25},
      {id:"p3",text:"Position NI as a top-tier investment partner",metric:"Donor feedback",q:"Ongoing",owner:"Rachel Nguyen",progress:40},
    ],
    tips:["Set objectives using the IC2 KRA framework","Nominate a colleague for recognition","Share a success story demonstrating NI's impact","Provide constructive feedback during performance cycles","Champion the culture of excellence daily"],
  },
  {
    id:"data", title:"Data-Driven People Management", color:"#005844", gradient:"linear-gradient(135deg,#005844,#00A88A)",
    tagline:"Turn people data into strategic decisions",
    ic2:"NICOR digital transformation requires integrated people data. Real-time dashboards keep programs staffed and compliant.",
    risk:"NICOR Digital Transformation · Enabler",
    goals:[
      {id:"d1",text:"Assess HRIS capabilities & integrate with NICOR",metric:"Assessment done",q:"Q2",owner:"Michael Tran",progress:60},
      {id:"d2",text:"Launch pilot people dashboard with real-time metrics",metric:"Dashboard live",q:"Q3",owner:"Aisha Mwangi",progress:30},
      {id:"d3",text:"Investment in AI and AI learning initiatives",metric:"Program launched",q:"Q3",owner:"Luis Herrera",progress:15},
      {id:"d4",text:"Renewed focus on data quality across P&C systems",metric:"Quality audit",q:"Q2",owner:"Sophie Martin",progress:45},
    ],
    tips:["Keep your HR records accurate and up to date","Flag data quality issues when you spot them","Engage with AI learning opportunities","Feedback on dashboard metrics that matter to your role","Advocate for evidence-based people decisions"],
  },
  {
    id:"leadership", title:"Leadership Excellence", color:"#B94700", gradient:"linear-gradient(135deg,#B94700,#D14124)",
    tagline:"Equip every manager to lead with confidence",
    ic2:"ISG2 execution depends on strong frontline management. Underdeveloped management capacity is a named enterprise risk.",
    risk:"Management Capacity Risk · Named Risk",
    goals:[
      {id:"l1",text:"Refine leadership competency model",metric:"Model approved",q:"Q2",owner:"Patricia Ndung'u",progress:55},
      {id:"l2",text:"Launch Management Development Program (MDP)",metric:"Cohort 1 starts",q:"Q3",owner:"Ahmed Hassan",progress:20},
      {id:"l3",text:"Roll out SLII for all frontline managers",metric:"100% trained",q:"Q4",owner:"Karen Lim",progress:10},
      {id:"l4",text:"First 360° feedback cycle within Programs",metric:"Cycle complete",q:"Q4",owner:"Daniel Abebe",progress:5},
    ],
    tips:["Participate fully in SLII training","Embrace 360° feedback — give honest input","Apply MDP learnings daily","Coach someone on your team this quarter","Share leadership challenges openly"],
  },
  {
    id:"wellbeing", title:"Employee Experience & Wellbeing", color:"#AE2573", gradient:"linear-gradient(135deg,#872651,#AE2573)",
    tagline:"Every person safe, heard, and supported",
    ic2:"Safe teams are effective teams. Security, safeguarding, and engagement are preconditions for delivering where NI operates.",
    risk:"Safety & Security Risk · Scored 12",
    goals:[
      {id:"w1",text:"Finalize Global Safety & Security Policy",metric:"Policy approved",q:"Q2",owner:"Ingrid Johansson",progress:70},
      {id:"w2",text:"Security audits for new geographies",metric:"100% audited",q:"Q3",owner:"Omar Diallo",progress:35},
      {id:"w3",text:"Enhanced RED, post-travel & safety training metrics",metric:"Tracking live",q:"Q3",owner:"Mei Lin",progress:20},
      {id:"w4",text:"Security Risk Assessments in recruitment & onboarding",metric:"Embedded",q:"Q3",owner:"Grace Adeyemi",progress:15},
      {id:"w5",text:"Engagement survey ≥75% target score",metric:"≥75% score",q:"Q2",owner:"Thomas Müller",progress:80},
      {id:"w6",text:"Strengthened safeguarding across employee lifecycle",metric:"Framework live",q:"Ongoing",owner:"Rebecca Njeri",progress:30},
    ],
    tips:["Complete the engagement survey honestly","Update your emergency data (RED) records","Complete mandatory safety training on time","Provide post-travel feedback after field visits","Speak up about safeguarding concerns"],
  },
];

const CROSS_CUTTING = [
  {priority:"ISG2 / NOURISH multi-country delivery",enabler:"Field workforce capacity",del:"Skills audit · Regional TA officers · 95% critical fill rate"},
  {priority:"NICOR digital transformation",enabler:"People data infrastructure",del:"HRIS–NICOR integration · People dashboard"},
  {priority:"Safeguarding framework rollout",enabler:"Duty of care & accountability",del:"Safety policy · EAP · Security audit"},
  {priority:"Organizational effectiveness risk",enabler:"Succession & leadership pipeline",del:"100% EMC/CD succession plans · SLII · 360° feedback"},
  {priority:"P&G donor credibility",enabler:"Engagement & employer brand",del:"Engagement survey · Recognition programs · Safeguarding"},
  {priority:"MDL MEAL & learning ecosystem",enabler:"Performance management",del:"IC2 KRA alignment · MDP · AI Learning"},
];

// ── STORAGE ──
// Personal (per-browser) keys — not shared
const LS_NAME="ni-pc-name";
const LS_ADMIN="ni-pc-isAdmin";

// Shared state lives in Firebase. Strip personal fields before writing.
function toShared(d){
  const {userName,isAdmin,...shared}=d;
  return shared;
}

// Write shared state to Firebase (debounced by React batching)
async function save(d){
  try{
    const shared=toShared(d);
    await set(ref(db,DB_PATH),shared);
    // Persist personal fields locally only
    if(d.userName!==undefined)localStorage.setItem(LS_NAME,d.userName);
    if(d.isAdmin!==undefined)localStorage.setItem(LS_ADMIN,d.isAdmin?"1":"");
  }catch(e){console.error("Firebase write error:",e);}
}

function makeDefaults(pillars){
  const s={},c={},p={};
  pillars.forEach(pl=>pl.goals.forEach(g=>{s[g.id]=s[g.id]||[];c[g.id]=c[g.id]||[];p[g.id]=p[g.id]??g.progress;}));
  return {signups:s,comments:c,progress:p,pillars,admins:[],surveyActions:[]};
}

const FONTS=`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');`;
const ANIM=`
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}
.fade-up{animation:fadeUp .5s ease both}.fade-in{animation:fadeIn .4s ease both}.slide-in{animation:slideIn .4s ease both}
.hover-lift{transition:transform .25s,box-shadow .25s}.hover-lift:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(37,55,70,.12)}
.shake{animation:shake .4s ease}
input[type="range"]{-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;background:${B.g2};outline:none}
input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;cursor:pointer;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.2)}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${B.g3};border-radius:4px}
`;

// ── COMPONENTS ──
function Initials({name,size=30,bg,color="#fff",style:sx={}}){
  const i=(name||"?").split(" ").map(n=>n[0]).join("").slice(0,2);
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg||B.carmine,display:"flex",alignItems:"center",justifyContent:"center",color,fontFamily:"'DM Sans',sans-serif",fontSize:size*.38,fontWeight:700,flexShrink:0,...sx}}>{i}</div>;
}

function ProgressRing({value,size=46,stroke=3.5,color,children}){
  const r=(size-stroke)/2,c=2*Math.PI*r,o=c-(value/100)*c;
  return(
    <div style={{position:"relative",width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={B.g2} strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" style={{transition:"stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)"}}/></svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>
    </div>
  );
}

function TextInput({label,value,onChange,placeholder,type="text",style:sx={}}){
  return(
    <div style={{marginBottom:12,...sx}}>
      {label&&<label style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:5}}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"10px 14px",border:`1.5px solid ${B.g2}`,borderRadius:8,outline:"none",color:B.charcoal,boxSizing:"border-box",transition:"border-color .2s",background:B.white}}
        onFocus={e=>e.target.style.borderColor=B.carmine} onBlur={e=>e.target.style.borderColor=B.g2}/>
    </div>
  );
}

function SelectInput({label,value,onChange,options}){
  return(
    <div style={{marginBottom:12}}>
      {label&&<label style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:5}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"10px 14px",border:`1.5px solid ${B.g2}`,borderRadius:8,outline:"none",color:B.charcoal,boxSizing:"border-box",background:B.white,cursor:"pointer"}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({children,onClick,variant="primary",size="md",disabled,style:sx={}}){
  const base={fontFamily:"'DM Sans',sans-serif",fontWeight:700,border:"none",cursor:disabled?"default":"pointer",borderRadius:8,transition:"all .2s",letterSpacing:".02em",opacity:disabled?.5:1};
  const sizes={sm:{fontSize:11,padding:"6px 14px"},md:{fontSize:12.5,padding:"9px 20px"},lg:{fontSize:14,padding:"12px 24px"}};
  const variants={
    primary:{background:B.carmine,color:"#fff"},
    secondary:{background:B.white,color:B.charcoal,boxShadow:`inset 0 0 0 1.5px ${B.g2}`},
    danger:{background:B.danger,color:"#fff"},
    success:{background:B.success,color:"#fff"},
    ghost:{background:"transparent",color:B.carmine},
    pillar:(c)=>({background:c,color:"#fff"}),
  };
  const v=typeof variant==="object"?variants.pillar(variant.color):variants[variant];
  return <button onClick={onClick} disabled={disabled} style={{...base,...sizes[size],...v,...sx}}>{children}</button>;
}

// ── ADMIN LOGIN MODAL ──
function AdminLogin({onLogin,onClose}){
  const[uid,setUid]=useState("");
  const[pwd,setPwd]=useState("");
  const[err,setErr]=useState(false);
  const[showPwd,setShowPwd]=useState(false);
  const attempt=()=>{
    if(uid===ADMIN_CREDS.userId&&pwd===ADMIN_CREDS.password){onLogin();onClose();}
    else{setErr(true);setTimeout(()=>setErr(false),2000);}
  };
  return(
    <div className="fade-in" style={{position:"fixed",inset:0,background:"rgba(37,55,70,.75)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className={`fade-up${err?" shake":""}`} style={{background:B.white,borderRadius:20,maxWidth:400,width:"100%",overflow:"hidden",boxShadow:"0 24px 64px rgba(37,55,70,.3)"}}>
        <div style={{background:B.charcoal,padding:"24px 28px 20px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-16,right:-16,width:60,height:60,borderRadius:"50%",border:`3px solid ${B.carmine}44`}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={B.carmine} strokeWidth="2" strokeLinecap="round"><rect x="3" y="9" width="14" height="9" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/></svg>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:B.carmine,textTransform:"uppercase",letterSpacing:".1em"}}>Admin Access</span>
          </div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:B.white}}>Sign in to manage goals</div>
        </div>
        <div style={{padding:"24px 28px 28px"}}>
          {err&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:B.danger,background:B.dangerLight,borderRadius:8,padding:"8px 14px",marginBottom:14,fontWeight:500,border:`1px solid ${B.danger}22`}}>Invalid credentials. Please try again.</div>}
          <TextInput label="User ID" value={uid} onChange={setUid} placeholder="Enter admin user ID"/>
          <div style={{marginBottom:12}}>
            <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:5}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPwd?"text":"password"} value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Enter password"
                onKeyDown={e=>e.key==="Enter"&&attempt()}
                style={{width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"10px 42px 10px 14px",border:`1.5px solid ${B.g2}`,borderRadius:8,outline:"none",color:B.charcoal,boxSizing:"border-box",background:B.white}}
                onFocus={e=>e.target.style.borderColor=B.carmine} onBlur={e=>e.target.style.borderColor=B.g2}/>
              <button onClick={()=>setShowPwd(!showPwd)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:B.g3,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600}}>{showPwd?"Hide":"Show"}</button>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <Btn onClick={onClose} variant="secondary" style={{flex:1}}>Cancel</Btn>
            <Btn onClick={attempt} disabled={!uid||!pwd} style={{flex:1}}>Sign In</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN GOAL EDITOR ──
function GoalEditor({goal,pillarId,pillars,onSave,onDelete,onCancel}){
  const[text,setText]=useState(goal?.text||"");
  const[metric,setMetric]=useState(goal?.metric||"");
  const[q,setQ]=useState(goal?.q||"Q2");
  const[owner,setOwner]=useState(goal?.owner||"");
  const[progress,setProgress]=useState(goal?.progress??0);
  const[confirmDelete,setConfirmDelete]=useState(false);
  const isNew=!goal;
  const canSave=text.trim()&&metric.trim()&&owner.trim();
  const pillar=pillars?.find(p=>p.id===pillarId)||pillars?.[0];
  const accentColor=pillar?.color||B.carmine;
  const sc=progress>=75?B.success:progress>=40?B.gold:progress>=20?"#FF6A13":B.g3;
  const sl=progress>=75?"On Track":progress>=40?"In Progress":progress>=20?"Early Stage":"Not Started";
  return(
    <div className="fade-in" style={{background:B.white,borderRadius:14,border:`2px solid ${B.carmine}33`,padding:"20px 22px",marginBottom:10,boxShadow:`0 4px 20px ${B.carmine}10`}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:B.carmine,textTransform:"uppercase",letterSpacing:".06em",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={B.carmine} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4v12h12v-7"/><path d="M15.5 2.5a2.1 2.1 0 013 3L10 14l-4 1 1-4z"/></svg>
        {isNew?"Add New Deliverable":"Edit Deliverable"}
      </div>
      <TextInput label="Deliverable Description" value={text} onChange={setText} placeholder="What will be delivered?"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <TextInput label="Success Metric" value={metric} onChange={setMetric} placeholder="e.g. 100% complete"/>
        <SelectInput label="Target Quarter" value={q} onChange={setQ} options={[{value:"Q1",label:"Q1"},{value:"Q2",label:"Q2"},{value:"Q3",label:"Q3"},{value:"Q4",label:"Q4"},{value:"Ongoing",label:"Ongoing"}]}/>
      </div>
      <TextInput label="Deliverable Owner" value={owner} onChange={setOwner} placeholder="Full name of the owner"/>
      {/* Progress Control */}
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".06em"}}>Progress</label>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,fontWeight:600,padding:"2px 8px",borderRadius:4,background:sc+"18",color:sc,textTransform:"uppercase",letterSpacing:".04em"}}>{sl}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:accentColor,minWidth:36,textAlign:"right"}}>{progress}%</span>
          </div>
        </div>
        <div style={{height:6,background:B.g2,borderRadius:3,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${progress}%`,background:pillar?.gradient||accentColor,borderRadius:3,transition:"width .3s ease"}}/>
        </div>
        <input type="range" min="0" max="100" value={progress} onChange={e=>setProgress(Number(e.target.value))}
          style={{width:"100%",accentColor,cursor:"pointer"}}/>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:4}}>
        <div>
          {!isNew&&!confirmDelete&&<Btn onClick={()=>setConfirmDelete(true)} variant="ghost" size="sm">Delete</Btn>}
          {confirmDelete&&(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:B.danger,fontWeight:500}}>Are you sure?</span>
              <Btn onClick={onDelete} variant="danger" size="sm">Yes, Delete</Btn>
              <Btn onClick={()=>setConfirmDelete(false)} variant="secondary" size="sm">No</Btn>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onCancel} variant="secondary">Cancel</Btn>
          <Btn onClick={()=>onSave({id:goal?.id||`g_${Date.now()}`,text:text.trim(),metric:metric.trim(),q,owner:owner.trim(),progress})} disabled={!canSave}>
            {isNew?"Add Deliverable":"Save Changes"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PILLAR EDITOR ──
function PillarEditor({pillar,onSave,onCancel}){
  const[title,setTitle]=useState(pillar.title);
  const[tagline,setTagline]=useState(pillar.tagline);
  const[ic2,setIc2]=useState(pillar.ic2);
  const[risk,setRisk]=useState(pillar.risk);
  return(
    <div className="fade-in" style={{background:B.white,borderRadius:14,border:`2px solid ${pillar.color}33`,padding:"20px 22px",marginBottom:16,boxShadow:`0 4px 20px ${pillar.color}10`}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,color:pillar.color,textTransform:"uppercase",letterSpacing:".06em",marginBottom:14}}>Edit Pillar</div>
      <TextInput label="Pillar Title" value={title} onChange={setTitle}/>
      <TextInput label="Tagline" value={tagline} onChange={setTagline}/>
      <div style={{marginBottom:12}}>
        <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".06em",display:"block",marginBottom:5}}>IC2 Strategy Connection</label>
        <textarea value={ic2} onChange={e=>setIc2(e.target.value)} rows={3}
          style={{width:"100%",fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"10px 14px",border:`1.5px solid ${B.g2}`,borderRadius:8,outline:"none",color:B.charcoal,boxSizing:"border-box",resize:"vertical",background:B.white}}/>
      </div>
      <TextInput label="Risk Register Entry" value={risk} onChange={setRisk}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={onCancel} variant="secondary">Cancel</Btn>
        <Btn onClick={()=>onSave({...pillar,title,tagline,ic2,risk})} variant={{color:pillar.color}}>Save Pillar</Btn>
      </div>
    </div>
  );
}

// ── TIME HELPERS ──
function timeLeft(q){
  const now=new Date();
  const yr=now.getFullYear();
  const qDates={Q1:new Date(yr,2,31,23,59,59),Q2:new Date(yr,5,30,23,59,59),Q3:new Date(yr,8,30,23,59,59),Q4:new Date(yr,11,31,23,59,59),Ongoing:new Date(yr,11,31,23,59,59)};
  const due=qDates[q]||qDates["Ongoing"];
  const ms=due-now;
  if(ms<0)return{label:"Overdue",short:"Overdue",color:B.danger,bg:B.dangerLight};
  const days=Math.ceil(ms/864e5);
  if(days<=14)return{label:`${days} day${days!==1?"s":""} left`,short:`${days}d left`,color:B.danger,bg:B.dangerLight};
  if(days<=60){const wk=Math.ceil(days/7);return{label:`${wk} week${wk!==1?"s":""} left`,short:`${wk}wk left`,color:B.goldDark,bg:"#FFF6DC"};}
  const mo=Math.floor(days/30.4);
  return{label:`${mo} month${mo!==1?"s":""} left`,short:`${mo}mo left`,color:B.success,bg:B.successLight};
}
function yearProgress(){
  const now=new Date();const yr=now.getFullYear();
  return Math.round(((now-new Date(yr,0,1))/(new Date(yr,11,31,23,59,59)-new Date(yr,0,1)))*100);
}

// ── DELIVERABLE CARD (Staff view) ──
function DeliverableCard({goal,pillar,appData,setAppData,userName,index,isAdmin}){
  const[expanded,setExpanded]=useState(false);
  const[commentText,setCommentText]=useState("");
  const[justJoined,setJustJoined]=useState(false);
  const[addName,setAddName]=useState("");
  const signups=appData.signups[goal.id]||[];
  const comments=appData.comments[goal.id]||[];
  const prog=appData.progress[goal.id]??goal.progress;
  const isMember=signups.includes(userName);
  const update=(fn)=>{const next={...appData};fn(next);setAppData(next);save(next);};
  const toggleSignup=()=>{if(!userName)return;update(n=>{if(isMember){n.signups[goal.id]=signups.filter(x=>x!==userName);}else{n.signups[goal.id]=[...signups,userName];setJustJoined(true);setTimeout(()=>setJustJoined(false),3000);}});};
  const postComment=()=>{if(!commentText.trim()||!userName)return;update(n=>{n.comments[goal.id]=[...comments,{a:userName,t:commentText.trim(),d:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"})}];});setCommentText("");};
  const setProgress=(v)=>update(n=>{n.progress[goal.id]=v;});
  const removeMember=(name)=>update(n=>{n.signups[goal.id]=signups.filter(x=>x!==name);});
  const addMember=()=>{const name=addName.trim();if(!name||signups.includes(name))return;update(n=>{n.signups[goal.id]=[...signups,name];});setAddName("");};
  const isOwner=userName===goal.owner;
  const updateDue=(newQ)=>update(n=>{n.pillars=n.pillars.map(p=>p.id!==pillar.id?p:{...p,goals:p.goals.map(g=>g.id!==goal.id?g:{...g,q:newQ})});});
  const sc=prog>=75?B.success:prog>=40?B.gold:prog>=20?"#FF6A13":B.g3;
  const sl=prog>=75?"On Track":prog>=40?"In Progress":prog>=20?"Early Stage":"Not Started";
  return(
    <div className="slide-in hover-lift" style={{background:B.white,borderRadius:14,overflow:"hidden",border:`1px solid ${expanded?pillar.color+"33":B.g2}`,boxShadow:expanded?`0 8px 32px ${pillar.color}12`:`0 1px 4px ${B.charcoal}06`,transition:"all .3s",animationDelay:`${index*.06}s`,marginBottom:10}}>
      <div onClick={()=>setExpanded(!expanded)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",gap:14,alignItems:"center"}}>
        <ProgressRing value={prog} size={44} stroke={3.5} color={pillar.color}><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,fontWeight:700,color:pillar.color}}>{prog}%</span></ProgressRing>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:B.charcoal,lineHeight:1.4,marginBottom:4}}>{goal.text}</div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,fontWeight:600,padding:"2px 7px",borderRadius:4,background:sc+"18",color:sc,textTransform:"uppercase",letterSpacing:".04em"}}>{sl}</span>
            <span style={{fontSize:10,color:B.g3}}>{goal.q}</span>
            {(()=>{const tl=timeLeft(goal.q);return <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:tl.bg,color:tl.color,letterSpacing:".03em"}}>{tl.short}</span>;})()}
            <span style={{fontSize:10,color:B.g3}}>·</span>
            <span style={{fontSize:10,fontWeight:500,color:B.g4}}>{goal.owner}</span>
            {signups.length>0&&<><span style={{fontSize:10,color:B.g3}}>·</span><span style={{fontSize:10,fontWeight:600,color:pillar.color}}>{signups.length} in group</span></>}
            {comments.length>0&&<><span style={{fontSize:10,color:B.g3}}>·</span><span style={{fontSize:10,color:B.g4}}>{comments.length} update{comments.length>1?"s":""}</span></>}
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={B.g3} strokeWidth="2" strokeLinecap="round" style={{transform:expanded?"rotate(180deg)":"",transition:"transform .3s",flexShrink:0}}><path d="M5 8l5 5 5-5"/></svg>
      </div>
      {expanded&&(
        <div className="fade-in" style={{borderTop:`1px solid ${B.g2}`}}>
          <div style={{padding:"14px 18px",display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:`${pillar.color}08`,borderRadius:10,border:`1px solid ${pillar.color}15`}}>
              <Initials name={goal.owner} size={32} bg={pillar.color}/>
              <div><div style={{fontSize:9,fontWeight:600,color:B.g3,textTransform:"uppercase",letterSpacing:".08em"}}>Owner</div><div style={{fontSize:13,fontWeight:700,color:B.charcoal}}>{goal.owner}</div></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div style={{padding:"8px 12px",background:B.g1,borderRadius:10}}><div style={{fontSize:9,fontWeight:600,color:B.g3,textTransform:"uppercase",letterSpacing:".06em"}}>Target</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,color:B.charcoal,marginTop:1}}>{goal.metric}</div></div>
              {(()=>{const tl=timeLeft(goal.q);const yp=yearProgress();return(
                <div style={{padding:"8px 12px",background:B.g1,borderRadius:10,minWidth:130}}>
                  <div style={{fontSize:9,fontWeight:600,color:B.g3,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>Due · Time Left</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:6}}>
                    {(isOwner||isAdmin)
                      ?<select value={goal.q} onChange={e=>{e.stopPropagation();updateDue(e.target.value);}} onClick={e=>e.stopPropagation()} style={{fontFamily:"'DM Serif Display',serif",fontSize:14,color:B.charcoal,border:`1.5px solid ${pillar.color}55`,borderRadius:6,padding:"2px 6px",background:B.white,cursor:"pointer",outline:"none"}}>
                          {["Q1","Q2","Q3","Q4","Ongoing"].map(q=><option key={q} value={q}>{q}</option>)}
                        </select>
                      :<div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,color:B.charcoal}}>{goal.q}</div>
                    }
                    <span style={{fontSize:10.5,fontWeight:700,color:tl.color}}>{tl.label}</span>
                  </div>
                  <div style={{height:4,background:B.g2,borderRadius:2,overflow:"hidden",marginBottom:3}}>
                    <div style={{height:"100%",width:`${yp}%`,background:`linear-gradient(90deg,${tl.color}99,${tl.color})`,borderRadius:2,transition:"width .5s"}}/>
                  </div>
                  <div style={{fontSize:8.5,color:B.g3}}>{yp}% of {new Date().getFullYear()} elapsed</div>
                </div>
              );})()}
            </div>
          </div>
          <div style={{padding:"0 18px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontSize:10,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".05em"}}>Progress</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                {!isMember&&!isAdmin&&userName&&<span style={{fontSize:9.5,color:B.g3,fontStyle:"italic"}}>Join group to update</span>}
                <span style={{fontSize:12,fontWeight:700,color:pillar.color}}>{prog}%</span>
              </div>
            </div>
            <div style={{height:7,background:B.g2,borderRadius:4,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${prog}%`,background:pillar.gradient,borderRadius:4,transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/></div>
            {(isMember||isAdmin)
              ?<input type="range" min="0" max="100" value={prog} onChange={e=>setProgress(Number(e.target.value))} style={{width:"100%",accentColor:pillar.color,cursor:"pointer"}}/>
              :<div style={{height:18}}/>}
          </div>
          <div style={{padding:"14px 18px",background:B.cream,borderTop:`1px solid ${B.g2}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:10.5,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".05em"}}>Working Group<span style={{fontWeight:500,color:B.g3,textTransform:"none",marginLeft:6}}>{signups.length}</span></div>
              {userName&&<Btn onClick={e=>{e.stopPropagation();toggleSignup();}} variant={isMember?"secondary":{color:pillar.color}} size="sm">{isMember?"Leave":"Join Group"}</Btn>}
            </div>
            {justJoined&&<div className="fade-up" style={{fontSize:12,color:B.success,background:B.successLight,borderRadius:8,padding:"7px 12px",marginBottom:8,border:`1px solid ${B.success}33`,fontWeight:500}}>Welcome to the working group!</div>}
            {signups.length>0?<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{signups.map((n,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 6px 3px 3px",background:B.white,borderRadius:20,border:`1px solid ${B.g2}`,fontSize:11,fontWeight:500,color:B.charcoal}}><Initials name={n} size={20} bg={pillar.color+"22"} color={pillar.color}/>{n}{isAdmin&&<button onClick={e=>{e.stopPropagation();removeMember(n);}} title={`Remove ${n}`} style={{marginLeft:2,background:"none",border:"none",cursor:"pointer",color:B.g3,fontSize:14,lineHeight:1,padding:"0 2px",borderRadius:"50%",display:"flex",alignItems:"center"}} onMouseOver={e=>e.currentTarget.style.color=B.danger} onMouseOut={e=>e.currentTarget.style.color=B.g3}>×</button>}</span>)}</div>
            :<div style={{fontSize:12,color:B.g3,fontStyle:"italic"}}>{isAdmin?"No members yet — add one below.":"No members yet — be the first to join."}</div>}
            {isAdmin&&<div style={{display:"flex",gap:5,marginTop:8,background:B.white,borderRadius:10,padding:"3px 3px 3px 12px",border:`1px solid ${B.g2}`}}><input type="text" placeholder="Add member by name…" value={addName} onChange={e=>setAddName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMember()} style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:12,border:"none",outline:"none",background:"transparent",color:B.charcoal,padding:"5px 0"}}/><Btn onClick={addMember} disabled={!addName.trim()||signups.includes(addName.trim())} variant={{color:pillar.color}} size="sm">Add</Btn></div>}
          </div>
          <div style={{padding:"14px 18px",borderTop:`1px solid ${B.g2}`}}>
            <div style={{fontSize:10.5,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Progress Updates{comments.length>0&&<span style={{fontWeight:500,color:B.g3,textTransform:"none",marginLeft:6}}>{comments.length}</span>}</div>
            {comments.length>0&&<div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:10,maxHeight:200,overflowY:"auto",paddingRight:4}}>{comments.slice().reverse().map((c,i)=><div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}><Initials name={c.a} size={26} bg={pillar.color+"18"} color={pillar.color} style={{marginTop:2}}/><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11.5,fontWeight:700,color:B.charcoal}}>{c.a}</span><span style={{fontSize:10,color:B.g3}}>{c.d}</span></div><div style={{fontSize:12,color:B.g4,lineHeight:1.5,marginTop:2}}>{c.t}</div></div></div>)}</div>}
            {userName&&<div style={{display:"flex",gap:7,alignItems:"center"}}><Initials name={userName} size={26} bg={B.carmine}/><div style={{flex:1,display:"flex",gap:5,background:B.g1,borderRadius:10,padding:"3px 3px 3px 12px",border:`1px solid ${B.g2}`}}><input type="text" placeholder="Share a progress update..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&postComment()} style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:12,border:"none",outline:"none",background:"transparent",color:B.charcoal,padding:"5px 0"}}/><Btn onClick={postComment} disabled={!commentText.trim()} variant={{color:pillar.color}} size="sm">Post</Btn></div></div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── SURVEY DATA (Q2 FY27 · P&C Team Engagement Survey) ──
const SURVEY_DATA={
  periods:["Q1 FY26","Q2 FY26","Q4 FY26","Q2 FY27"],
  overall:[4.31,4.01,3.95,4.11],
  questions:[
    {q:"Engagement with unit activities",     s:[4.5,4.0,3.9,4.1],d:+0.2},
    {q:"Communication within the unit",       s:[3.9,3.8,3.9,4.0],d:+0.1},
    {q:"Support from colleagues",             s:[4.6,4.3,4.8,4.3],d:-0.4},
    {q:"Leadership support & guidance",       s:[4.6,4.2,4.1,4.4],d:+0.3},
    {q:"Overall work environment",            s:[4.4,3.9,3.9,4.1],d:+0.2},
    {q:"Professional growth opportunities",   s:[4.1,3.5,3.4,3.6],d:+0.2},
    {q:"Recognition & appreciation",          s:[4.3,4.3,3.9,4.2],d:+0.3},
    {q:"Comfort sharing feedback",            s:[4.1,4.1,3.9,4.2],d:+0.4},
  ],
  themes:[
    {c:"#253746",name:"Collaboration & silos",desc:"Some feel more siloed — want cross-team engagement, monthly knowledge-sharing, and unity across locations"},
    {c:"#2E75B6",name:"Efficiency",desc:"Automate manual and physical work to be more efficient"},
    {c:"#B94700",name:"Workload pacing",desc:"Heavy workload concentrated at the start of the year"},
    {c:"#005844",name:"Feedback & connection",desc:"Want timely feedback; an in-person team meet-up would add value"},
    {c:"#00A88A",name:"Positive notes",desc:"“Pleasure working for this team”, “awesome team”, “wonderful experience”, “keep up the teamwork”"},
  ],
  takeaways:[
    {h:"Engagement recovered in Q2 FY27",b:"(4.11), up +0.15 from Q4 FY26 and near the Q1 FY26 high (4.31), with gains in almost every area."},
    {h:"Leadership support (4.4) and colleague support (4.3) remain the strongest drivers",b:"though colleague support dipped −0.4 vs Q4 — worth watching."},
    {h:"Professional growth (3.6) is consistently the weakest area",b:"across all quarters despite a modest rebound — the clearest priority for action."},
    {h:"Collaboration & silos is the dominant qualitative theme",b:"cross-team engagement and knowledge-sharing across locations would address it directly."},
  ]
};
function scoreC(v){
  if(v>=4.5)return{bg:"#EAF7F3",c:"#005844"};
  if(v>=4.2)return{bg:"#EBF5E6",c:"#2D6A0F"};
  if(v>=4.0)return{bg:"#F2F9E8",c:"#3D7A15"};
  if(v>=3.7)return{bg:"#FFF8E6",c:"#7A4C00"};
  return{bg:"#FFF0EE",c:"#9B1C1C"};
}

// ── SURVEY VIEW ──
const SURVEY_THEMES=[
  {key:"collaboration",label:"Collaboration & Silos",color:"#253746"},
  {key:"efficiency",label:"Efficiency",color:"#2E75B6"},
  {key:"workload",label:"Workload Pacing",color:"#B94700"},
  {key:"feedback",label:"Feedback & Connection",color:"#005844"},
  {key:"growth",label:"Professional Growth",color:"#AE2573"},
  {key:"other",label:"Other",color:"#5a6872"},
];
const STATUS_META={
  todo:{label:"To Do",bg:"#F2F0EB",color:B.g4},
  inprogress:{label:"In Progress",bg:"#FFF6DC",color:B.goldDark},
  done:{label:"Done",bg:B.successLight,color:B.success},
};

function SurveyView({appData,setAppData,userName,isAdmin}){
  const[showForm,setShowForm]=useState(false);
  const[actionText,setActionText]=useState("");
  const[actionTheme,setActionTheme]=useState("collaboration");
  const[actionOwner,setActionOwner]=useState("");
  const[filterTheme,setFilterTheme]=useState("all");

  // Edit state
  const[editingId,setEditingId]=useState(null);
  const[editText,setEditText]=useState("");
  const[editTheme,setEditTheme]=useState("collaboration");
  const[editOwner,setEditOwner]=useState("");

  // Attachment state
  const[attachingId,setAttachingId]=useState(null);
  const[urlInput,setUrlInput]=useState("");
  const docInputRef=useRef(null);
  const[docAttachId,setDocAttachId]=useState(null);

  const actions=appData?.surveyActions||[];
  const update=(fn)=>{const next={...appData};fn(next);setAppData(next);save(next);};
  const addAction=()=>{
    const text=actionText.trim();if(!text)return;
    const id="sa_"+Date.now();
    const d=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    update(n=>{n.surveyActions=[...actions,{id,text,theme:actionTheme,owner:actionOwner.trim(),status:"todo",author:userName,date:d}];});
    setActionText("");setActionOwner("");setActionTheme("collaboration");setShowForm(false);
  };
  const deleteAction=(id)=>update(n=>{n.surveyActions=actions.filter(a=>a.id!==id);});
  const cycleStatus=(id)=>update(n=>{
    const order=["todo","inprogress","done"];
    n.surveyActions=actions.map(a=>{if(a.id!==id)return a;const idx=order.indexOf(a.status);return{...a,status:order[(idx+1)%3]};});
  });

  // Edit helpers
  const startEdit=(a)=>{setEditingId(a.id);setEditText(a.text);setEditTheme(a.theme||"collaboration");setEditOwner(a.owner||"");};
  const saveEdit=()=>{
    if(!editText.trim())return;
    update(n=>{n.surveyActions=actions.map(a=>a.id===editingId?{...a,text:editText.trim(),theme:editTheme,owner:editOwner.trim()}:a);});
    setEditingId(null);
  };

  // Attachment helpers
  const addUrlAttachment=(id)=>{
    const url=urlInput.trim();if(!url)return;
    let label=url;try{label=new URL(url).hostname;}catch(_){}
    update(n=>{n.surveyActions=actions.map(a=>a.id===id?{...a,attachments:[...(a.attachments||[]),{type:"url",url,label}]}:a);});
    setUrlInput("");setAttachingId(null);
  };
  const handleDocFile=(e)=>{
    const file=e.target.files[0];if(!file||!docAttachId)return;
    if(file.size>2*1024*1024){alert("File too large — maximum 2 MB.");return;}
    const reader=new FileReader();
    reader.onload=(ev)=>{
      update(n=>{n.surveyActions=actions.map(a=>a.id===docAttachId?{...a,attachments:[...(a.attachments||[]),{type:"file",name:file.name,mime:file.type,dataUrl:ev.target.result}]}:a);});
      setDocAttachId(null);setAttachingId(null);
    };
    reader.readAsDataURL(file);
  };
  const removeAttachment=(actionId,idx)=>update(n=>{n.surveyActions=actions.map(a=>a.id===actionId?{...a,attachments:(a.attachments||[]).filter((_,i)=>i!==idx)}:a);});
  const triggerDocUpload=(id)=>{setDocAttachId(id);docInputRef.current.value="";docInputRef.current.click();};

  const shown=filterTheme==="all"?actions:actions.filter(a=>a.theme===filterTheme);

  // Photo upload
  const photoInputRef=useRef(null);
  const [uploadingId,setUploadingId]=useState(null);
  const [lightboxPhoto,setLightboxPhoto]=useState(null);
  const triggerPhotoUpload=(id)=>{setUploadingId(id);photoInputRef.current.value="";photoInputRef.current.click();};
  const handlePhotoFile=(e)=>{
    const file=e.target.files[0];if(!file||!uploadingId)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const img=new Image();
      img.onload=()=>{
        const canvas=document.createElement("canvas");
        const maxW=800,ratio=Math.min(1,maxW/img.width);
        canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        const dataUrl=canvas.toDataURL("image/jpeg",0.78);
        update(n=>{n.surveyActions=actions.map(a=>a.id===uploadingId?{...a,photo:dataUrl}:a);});
        setUploadingId(null);
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  const removePhoto=(id)=>update(n=>{n.surveyActions=actions.map(a=>a.id===id?{...a,photo:null}:a);});

  // Trend chart geometry
  const W=440,H=136,PL=52,PR=18,PT=22,PB=24;
  const gW=W-PL-PR,gH=H-PT-PB;
  const tX=(i)=>PL+i*(gW/(SURVEY_DATA.overall.length-1));
  const tY=(v)=>PT+gH*(1-(v-3.5));
  const tPts=SURVEY_DATA.overall.map((v,i)=>`${tX(i).toFixed(1)},${tY(v).toFixed(1)}`).join(" ");
  const lastX=tX(SURVEY_DATA.overall.length-1).toFixed(1);
  const baseY=(PT+gH).toFixed(1);
  const tArea=`M ${tX(0).toFixed(1)},${tY(SURVEY_DATA.overall[0]).toFixed(1)} `+
    SURVEY_DATA.overall.slice(1).map((v,i)=>`L ${tX(i+1).toFixed(1)},${tY(v).toFixed(1)}`).join(" ")+
    ` L ${lastX},${baseY} L ${tX(0).toFixed(1)},${baseY} Z`;

  // Bar chart geometry
  const BW=440,BH=224,BPL=190,BPR=46,BPT=8;
  const bgW=BW-BPL-BPR;
  const rowH=Math.floor((BH-BPT*2)/SURVEY_DATA.questions.length);

  return(<>
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* ── Hero header ── */}
      <div style={{background:B.charcoal,borderRadius:16,padding:"28px 32px",color:"#fff",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-56,right:-56,width:200,height:200,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.04)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-32,right:88,width:120,height:120,borderRadius:"50%",border:"1.5px solid rgba(164,52,58,.18)",pointerEvents:"none"}}/>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".14em",color:"rgba(255,255,255,.4)",marginBottom:12}}>People & Culture · Quarterly Engagement Survey</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:28,flexWrap:"wrap",marginBottom:18}}>
          <div>
            <div style={{fontSize:52,fontWeight:800,lineHeight:1,color:"#fff",fontVariantNumeric:"tabular-nums",letterSpacing:"-.01em"}}>{SURVEY_DATA.overall[3].toFixed(2)}</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,.45)",marginTop:5,letterSpacing:".01em"}}>Overall score &nbsp;·&nbsp; Q2 FY27 &nbsp;·&nbsp; Scale 1–5</div>
          </div>
          <div style={{paddingBottom:4}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:24,background:"rgba(0,168,138,.16)",border:"1px solid rgba(0,168,138,.28)"}}>
              <svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,9 6,3 10,9" fill="none" stroke="#00A88A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{fontSize:13,fontWeight:700,color:"#00A88A",fontVariantNumeric:"tabular-nums"}}>+0.15 vs Q4 FY26</span>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.34)",marginTop:6,paddingLeft:2}}>13 team members responded</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          {SURVEY_DATA.periods.map((p,i)=>{
            const cur=i===SURVEY_DATA.periods.length-1;
            return(
              <span key={p} style={{display:"inline-flex",alignItems:"center",gap:4}}>
                <span style={{padding:"4px 11px",borderRadius:20,background:cur?"rgba(164,52,58,.42)":"rgba(255,255,255,.07)",fontSize:11,fontWeight:cur?700:400,color:cur?"#fff":"rgba(255,255,255,.38)",fontVariantNumeric:"tabular-nums"}}>
                  {p}&ensp;{SURVEY_DATA.overall[i].toFixed(2)}
                </span>
                {i<SURVEY_DATA.periods.length-1&&<span style={{color:"rgba(255,255,255,.16)",fontSize:11}}>›</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
        {[
          {n:"4.4",l:"Leadership",note:"Highest this quarter",ac:B.success},
          {n:"4.3",l:"Colleague support",note:"Strong · watch trend",ac:"#3D7A15"},
          {n:"4.2",l:"Recognition",note:"Up +0.3 vs Q4",ac:B.charcoal},
          {n:"4.2",l:"Feedback comfort",note:"Up +0.4 vs Q4",ac:B.charcoal},
          {n:"3.6",l:"Prof. growth",note:"Lowest · priority",ac:B.danger},
        ].map((k,i)=>(
          <div key={i} style={{background:B.white,borderRadius:12,padding:"14px 16px",border:`1px solid ${B.g2}`,borderTop:`3px solid ${k.ac}`}}>
            <div style={{fontSize:28,fontWeight:800,color:k.ac,fontVariantNumeric:"tabular-nums",lineHeight:1,marginBottom:4}}>{k.n}</div>
            <div style={{fontSize:11.5,fontWeight:700,color:B.charcoal,lineHeight:1.25,marginBottom:2}}>{k.l}</div>
            <div style={{fontSize:10,color:B.g3,lineHeight:1.3}}>{k.note}</div>
          </div>
        ))}
      </div>

      {/* ── Score table ── */}
      <div style={{background:B.white,borderRadius:14,border:`1px solid ${B.g2}`,overflow:"hidden"}}>
        <div style={{padding:"14px 20px 10px",borderBottom:`1px solid ${B.g2}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:B.g3}}>Score by question — all survey periods</div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontVariantNumeric:"tabular-nums"}}>
            <thead>
              <tr style={{background:B.cream}}>
                <th style={{padding:"9px 20px",textAlign:"left",fontSize:10.5,fontWeight:700,color:B.g4,borderBottom:`1px solid ${B.g2}`,minWidth:200,whiteSpace:"nowrap"}}>Question</th>
                {SURVEY_DATA.periods.map((p,i)=>{
                  const cur=i===SURVEY_DATA.periods.length-1;
                  return(
                    <th key={p} style={{padding:"9px 14px",textAlign:"center",fontSize:10.5,fontWeight:700,color:cur?B.charcoal:B.g3,borderBottom:`1px solid ${B.g2}`,width:72,background:cur?"#F8F9FB":"transparent"}}>
                      {cur?<span style={{borderBottom:`2px solid ${B.carmine}`,paddingBottom:2}}>{p}</span>:p}
                    </th>
                  );
                })}
                <th style={{padding:"9px 14px",textAlign:"center",fontSize:10.5,fontWeight:700,color:B.g3,borderBottom:`1px solid ${B.g2}`,width:62}}>Δ vs Q4</th>
              </tr>
            </thead>
            <tbody>
              {SURVEY_DATA.questions.map((row,ri)=>(
                <tr key={ri} style={{borderBottom:ri<SURVEY_DATA.questions.length-1?`1px solid ${B.g2}`:"none"}}>
                  <td style={{padding:"9px 20px",fontSize:12.5,color:B.charcoal,lineHeight:1.3}}>{row.q}</td>
                  {row.s.map((s,j)=>{
                    const cur=j===row.s.length-1;
                    const {bg,c}=scoreC(s);
                    return(
                      <td key={j} style={{padding:"9px 14px",textAlign:"center",fontSize:13,fontWeight:cur?700:400,background:cur?bg:"transparent",color:cur?c:B.g3}}>
                        {s.toFixed(1)}
                      </td>
                    );
                  })}
                  <td style={{padding:"9px 14px",textAlign:"center",fontSize:12,fontWeight:600,color:row.d>0?B.success:row.d<0?B.danger:B.g3}}>
                    {row.d>0?`▲ +${row.d.toFixed(1)}`:row.d<0?`▼ ${row.d.toFixed(1)}`:"—"}
                  </td>
                </tr>
              ))}
              <tr style={{background:B.cream,borderTop:`2px solid ${B.g2}`}}>
                <td style={{padding:"10px 20px",fontSize:12.5,fontWeight:700,color:B.charcoal}}>Overall average</td>
                {SURVEY_DATA.overall.map((v,j)=>{
                  const cur=j===SURVEY_DATA.overall.length-1;
                  const {bg,c}=scoreC(v);
                  return(
                    <td key={j} style={{padding:"10px 14px",textAlign:"center",fontSize:13,fontWeight:700,background:cur?bg:"transparent",color:cur?c:B.charcoal}}>
                      {v.toFixed(2)}
                    </td>
                  );
                })}
                <td style={{padding:"10px 14px",textAlign:"center",fontSize:12,fontWeight:700,color:B.success}}>▲ +0.16</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Charts ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:B.white,borderRadius:14,border:`1px solid ${B.g2}`,padding:"16px 18px 10px"}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:B.g3,marginBottom:10}}>Overall engagement trend</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block",overflow:"visible"}}>
            {[3.5,3.75,4.0,4.25,4.5].map(gv=>(
              <g key={gv}>
                <line x1={PL} y1={tY(gv).toFixed(1)} x2={W-PR} y2={tY(gv).toFixed(1)} stroke="#E3E7EB" strokeWidth="1"/>
                <text x={PL-6} y={(tY(gv)+4).toFixed(1)} fontSize="9" fill="#98A4AE" textAnchor="end" fontFamily="Arial">{gv.toFixed(2)}</text>
              </g>
            ))}
            <path d={tArea} fill={`${B.carmine}0C`}/>
            <polyline points={tPts} fill="none" stroke={B.carmine} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
            {SURVEY_DATA.overall.map((v,i)=>(
              <g key={i}>
                <circle cx={tX(i).toFixed(1)} cy={tY(v).toFixed(1)} r="4.5" fill={B.carmine} stroke="#fff" strokeWidth="2"/>
                <text x={tX(i).toFixed(1)} y={(tY(v)-10).toFixed(1)} fontSize="10.5" fill={B.charcoal} textAnchor="middle" fontFamily="Arial" fontWeight="700">{v.toFixed(2)}</text>
                <text x={tX(i).toFixed(1)} y={(H-1).toFixed(1)} fontSize="9" fill="#98A4AE" textAnchor="middle" fontFamily="Arial">{SURVEY_DATA.periods[i]}</text>
              </g>
            ))}
          </svg>
        </div>
        <div style={{background:B.white,borderRadius:14,border:`1px solid ${B.g2}`,padding:"16px 18px 10px"}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:B.g3,marginBottom:10}}>Q2 FY27 — scores by question</div>
          <svg viewBox={`0 0 ${BW} ${BH}`} width="100%" style={{display:"block"}}>
            {SURVEY_DATA.questions.map((row,i)=>{
              const v=row.s[3];
              const {bg,c}=scoreC(v);
              const y=BPT+i*rowH;
              const bW=(v/5)*bgW;
              const words=row.q.split(" ");
              const label=words.slice(0,3).join(" ")+(words.length>3?"…":"");
              return(
                <g key={i}>
                  <text x={BPL-8} y={y+rowH/2+4} fontSize="10" fill={B.g4} textAnchor="end" fontFamily="Arial">{label}</text>
                  <rect x={BPL} y={y+4} width={bgW} height={rowH-9} fill="#F4F5F8" rx="3"/>
                  <rect x={BPL} y={y+4} width={bW} height={rowH-9} fill={bg} rx="3"/>
                  <text x={BPL+bW+5} y={y+rowH/2+4} fontSize="11" fill={c} fontWeight="700" fontFamily="Arial">{v.toFixed(1)}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Comment themes ── */}
      <div style={{background:B.white,borderRadius:14,border:`1px solid ${B.g2}`,overflow:"hidden"}}>
        <div style={{padding:"14px 20px 10px",borderBottom:`1px solid ${B.g2}`}}>
          <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:B.g3}}>Comment themes · Q2 FY27</div>
        </div>
        {SURVEY_DATA.themes.map((t,i)=>(
          <div key={i} style={{display:"flex",gap:16,padding:"13px 20px",borderBottom:i<SURVEY_DATA.themes.length-1?`1px solid ${B.g2}`:"none",alignItems:"flex-start"}}>
            <div style={{width:3,borderRadius:2,background:t.c,flexShrink:0,alignSelf:"stretch",minHeight:24}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:B.charcoal,marginBottom:2}}>{t.name}</div>
              <div style={{fontSize:12.5,color:B.g4,lineHeight:1.45}}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Key takeaways ── */}
      <div style={{background:B.carmine,borderRadius:14,padding:"22px 26px"}}>
        <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".14em",color:"rgba(255,255,255,.52)",marginBottom:14}}>Key takeaways</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {SURVEY_DATA.takeaways.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(255,255,255,.14)",border:"1px solid rgba(255,255,255,.2)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:700,color:"rgba(255,255,255,.85)",marginTop:2}}>{i+1}</div>
              <div style={{fontSize:13.5,color:"rgba(255,255,255,.95)",lineHeight:1.55}}>
                <strong style={{fontWeight:700}}>{t.h}</strong> — {t.b}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Improvement Actions ── */}
      <div style={{background:B.white,borderRadius:14,border:`1px solid ${B.g2}`,overflow:"hidden"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${B.g2}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:B.g3,marginBottom:3}}>Survey follow-up</div>
            <div style={{fontSize:16,fontWeight:700,color:B.charcoal}}>Improvement Actions</div>
          </div>
          <button onClick={()=>setShowForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:showForm?B.g1:B.carmine,border:`1px solid ${showForm?B.g2:"transparent"}`,borderRadius:8,color:showForm?B.g4:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/></svg>
            {showForm?"Cancel":"Add Action"}
          </button>
        </div>

        {showForm&&(
          <div style={{padding:"16px 22px",borderBottom:`1px solid ${B.g2}`,background:B.cream}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,marginBottom:10}}>
              <textarea value={actionText} onChange={e=>setActionText(e.target.value)} placeholder="Describe the improvement action…" rows={2}
                style={{width:"100%",padding:"10px 12px",fontSize:13,border:`1.5px solid ${B.g2}`,borderRadius:8,resize:"vertical",fontFamily:"Arial,sans-serif",outline:"none",color:B.charcoal,background:B.white}}/>
              <button onClick={addAction} disabled={!actionText.trim()||!userName}
                style={{padding:"0 18px",background:B.carmine,color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:actionText.trim()&&userName?"pointer":"not-allowed",opacity:actionText.trim()&&userName?1:.5,whiteSpace:"nowrap",alignSelf:"stretch"}}>
                Save
              </button>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <select value={actionTheme} onChange={e=>setActionTheme(e.target.value)}
                style={{padding:"7px 10px",fontSize:12,border:`1px solid ${B.g2}`,borderRadius:7,color:B.charcoal,background:"#fff",flex:"1 1 160px"}}>
                {SURVEY_THEMES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              <input value={actionOwner} onChange={e=>setActionOwner(e.target.value)} placeholder="Owner (optional)"
                style={{padding:"7px 10px",fontSize:12,border:`1px solid ${B.g2}`,borderRadius:7,color:B.charcoal,flex:"1 1 160px",outline:"none"}}/>
            </div>
            {!userName&&<p style={{margin:"8px 0 0",fontSize:12,color:B.danger}}>Set your name at the top of the page before saving.</p>}
          </div>
        )}

        {actions.length>0&&(
          <div style={{padding:"10px 22px",borderBottom:`1px solid ${B.g2}`,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",background:B.cream}}>
            <span style={{fontSize:11,color:B.g4,marginRight:2}}>Filter:</span>
            {["all",...SURVEY_THEMES.map(t=>t.key)].map(k=>{
              const t=SURVEY_THEMES.find(x=>x.key===k);
              const active=filterTheme===k;
              const cnt=k==="all"?actions.length:actions.filter(a=>a.theme===k).length;
              if(k!=="all"&&cnt===0)return null;
              return(
                <button key={k} onClick={()=>setFilterTheme(k)}
                  style={{padding:"4px 10px",borderRadius:20,border:`1.5px solid ${active?(t?t.color:B.charcoal):B.g2}`,background:active?(t?t.color+"18":B.g2):"transparent",color:active?(t?t.color:B.charcoal):B.g4,fontSize:11,fontWeight:active?700:500,cursor:"pointer",transition:"all .15s"}}>
                  {k==="all"?"All":t?.label} ({cnt})
                </button>
              );
            })}
          </div>
        )}

        <div>
          {shown.length===0?(
            <div style={{textAlign:"center",padding:"32px 0",color:B.g3}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{display:"block",margin:"0 auto 8px",opacity:.35}}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              <div style={{fontSize:13}}>{filterTheme==="all"?"No actions yet — add the first one above.":"No actions for this theme."}</div>
            </div>
          ):shown.map((a,i)=>{
            const tm=SURVEY_THEMES.find(t=>t.key===a.theme)||SURVEY_THEMES[5];
            const sm=STATUS_META[a.status]||STATUS_META.todo;
            const canEdit=isAdmin||a.author===userName;
            return(
              <div key={a.id} style={{borderBottom:i<shown.length-1?`1px solid ${B.g2}`:"none"}}>
                {/* ── Main row ── */}
                <div style={{padding:"13px 22px",display:"flex",gap:12,alignItems:"flex-start"}}>
                  <button onClick={()=>canEdit&&cycleStatus(a.id)} title={canEdit?"Advance status":sm.label}
                    style={{marginTop:editingId===a.id?10:3,width:18,height:18,borderRadius:"50%",border:`2px solid ${sm.color}`,background:a.status==="done"?sm.color:"transparent",cursor:canEdit?"pointer":"default",flexShrink:0,transition:"all .2s",padding:0}}>
                    {a.status==="done"&&<svg viewBox="0 0 10 10" width="10" height="10" style={{display:"block",margin:"auto"}}><polyline points="2,5 4.5,7.5 8,3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </button>

                  {/* ── Text area: edit form or read view ── */}
                  <div style={{flex:1,minWidth:0}}>
                    {editingId===a.id?(
                      <div>
                        <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={2} autoFocus
                          style={{width:"100%",padding:"8px 10px",fontSize:13,border:`1.5px solid ${B.carmine}`,borderRadius:7,resize:"vertical",fontFamily:"Arial,sans-serif",outline:"none",color:B.charcoal,background:"#fff",boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6,alignItems:"center"}}>
                          <select value={editTheme} onChange={e=>setEditTheme(e.target.value)}
                            style={{padding:"5px 8px",fontSize:11,border:`1px solid ${B.g2}`,borderRadius:6,color:B.charcoal,background:"#fff",flex:"1 1 130px"}}>
                            {SURVEY_THEMES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
                          </select>
                          <input value={editOwner} onChange={e=>setEditOwner(e.target.value)} placeholder="Owner (optional)"
                            style={{padding:"5px 8px",fontSize:11,border:`1px solid ${B.g2}`,borderRadius:6,color:B.charcoal,flex:"1 1 130px",outline:"none"}}/>
                          <button onClick={saveEdit} disabled={!editText.trim()}
                            style={{padding:"5px 14px",background:B.carmine,color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:editText.trim()?"pointer":"not-allowed",opacity:editText.trim()?1:.5}}>Save</button>
                          <button onClick={()=>setEditingId(null)}
                            style={{padding:"5px 10px",background:"transparent",color:B.g4,border:`1px solid ${B.g2}`,borderRadius:6,fontSize:12,cursor:"pointer"}}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <>
                        <div style={{fontSize:13,color:a.status==="done"?B.g3:B.charcoal,textDecoration:a.status==="done"?"line-through":"none",lineHeight:1.4,marginBottom:5}}>{a.text}</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                          <span style={{padding:"2px 8px",borderRadius:12,background:tm.color+"18",color:tm.color,fontSize:10.5,fontWeight:600}}>{tm.label}</span>
                          <span style={{padding:"2px 8px",borderRadius:12,background:sm.bg,color:sm.color,fontSize:10.5,fontWeight:600,cursor:canEdit?"pointer":"default"}} onClick={()=>canEdit&&cycleStatus(a.id)}>{sm.label}</span>
                          {a.owner&&<span style={{fontSize:11,color:B.g4}}>Owner: <b>{a.owner}</b></span>}
                          <span style={{fontSize:11,color:B.g3,marginLeft:"auto"}}>{a.author} · {a.date}</span>
                          {canEdit&&<>
                            <button onClick={()=>startEdit(a)} title="Edit action"
                              style={{padding:3,background:"transparent",border:"none",cursor:"pointer",color:B.g3,lineHeight:0}}
                              onMouseEnter={e=>e.currentTarget.style.color=B.charcoal} onMouseLeave={e=>e.currentTarget.style.color=B.g3}>
                              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 13v3h3l8-8-3-3-8 8z"/><path d="M14.5 4.5l1 1"/></svg>
                            </button>
                            <button onClick={()=>setAttachingId(attachingId===a.id?null:a.id)} title="Add attachment"
                              style={{padding:3,background:"transparent",border:"none",cursor:"pointer",color:attachingId===a.id?B.carmine:B.g3,lineHeight:0}}
                              onMouseEnter={e=>e.currentTarget.style.color=B.carmine} onMouseLeave={e=>e.currentTarget.style.color=attachingId===a.id?B.carmine:B.g3}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                            </button>
                          </>}
                        </div>
                        {/* Attachment chips */}
                        {(a.attachments||[]).length>0&&(
                          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:7}}>
                            {(a.attachments||[]).map((att,idx)=>{
                              const isPdf=att.mime==="application/pdf"||att.name?.endsWith(".pdf");
                              const isXls=att.mime?.includes("spreadsheet")||att.name?.match(/\.xlsx?$/i);
                              const icon=att.type==="url"?"🔗":isPdf?"📄":isXls?"📊":"📎";
                              const label=att.type==="url"?att.label:att.name;
                              return(
                                <div key={idx} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,background:B.g1,border:`1px solid ${B.g2}`,fontSize:11,maxWidth:220}}>
                                  <span>{icon}</span>
                                  {att.type==="url"?(
                                    <a href={att.url} target="_blank" rel="noreferrer" style={{color:B.charcoal,textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</a>
                                  ):(
                                    <a href={att.dataUrl} download={att.name} style={{color:B.charcoal,textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</a>
                                  )}
                                  {canEdit&&<button onClick={()=>removeAttachment(a.id,idx)}
                                    style={{padding:0,background:"transparent",border:"none",cursor:"pointer",color:B.g3,lineHeight:0,flexShrink:0,marginLeft:2}}
                                    onMouseEnter={e=>e.currentTarget.style.color=B.carmine} onMouseLeave={e=>e.currentTarget.style.color=B.g3}>
                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
                                  </button>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Photo thumbnail / upload */}
                  {editingId!==a.id&&(
                    <div style={{flexShrink:0,position:"relative",alignSelf:"center"}}>
                      {a.photo?(
                        <div style={{position:"relative",display:"inline-block"}}>
                          <img src={a.photo} alt="achievement" onClick={()=>setLightboxPhoto(a.photo)}
                            style={{width:72,height:72,objectFit:"cover",borderRadius:8,border:`2px solid ${B.g2}`,cursor:"pointer",display:"block"}}/>
                          {canEdit&&(
                            <div style={{position:"absolute",inset:0,borderRadius:8,background:"rgba(0,0,0,0)",display:"flex",gap:3,alignItems:"center",justifyContent:"center",opacity:0,transition:"all .15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,.45)";e.currentTarget.style.opacity="1";}}
                              onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0)";e.currentTarget.style.opacity="0";}}>
                              <button onClick={e=>{e.stopPropagation();triggerPhotoUpload(a.id);}} title="Replace photo"
                                style={{background:"rgba(255,255,255,.85)",border:"none",borderRadius:5,padding:"3px 5px",cursor:"pointer",lineHeight:0}}>
                                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke={B.charcoal} strokeWidth="2" strokeLinecap="round"><path d="M4 13v3h3l8-8-3-3-8 8z"/><path d="M14.5 4.5l1 1"/></svg>
                              </button>
                              <button onClick={e=>{e.stopPropagation();removePhoto(a.id);}} title="Remove photo"
                                style={{background:"rgba(255,255,255,.85)",border:"none",borderRadius:5,padding:"3px 5px",cursor:"pointer",lineHeight:0}}>
                                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke={B.carmine} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ):canEdit?(
                        <button onClick={()=>triggerPhotoUpload(a.id)} title="Add achievement photo"
                          style={{width:72,height:72,borderRadius:8,border:`1.5px dashed ${B.g2}`,background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,color:B.g3,transition:"all .15s",padding:0}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=B.carmine;e.currentTarget.style.color=B.carmine;e.currentTarget.style.background=B.carmine+"0a";}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=B.g2;e.currentTarget.style.color=B.g3;e.currentTarget.style.background="transparent";}}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          <span style={{fontSize:9,fontWeight:600,letterSpacing:".03em",lineHeight:1.2,textAlign:"center"}}>Add<br/>photo</span>
                        </button>
                      ):null}
                    </div>
                  )}

                  {canEdit&&(
                    <button onClick={()=>deleteAction(a.id)} title="Delete action"
                      style={{padding:4,background:"transparent",border:"none",cursor:"pointer",color:B.g3,flexShrink:0,lineHeight:0,alignSelf:"flex-start",marginTop:2}}
                      onMouseEnter={e=>e.currentTarget.style.color=B.carmine} onMouseLeave={e=>e.currentTarget.style.color=B.g3}>
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
                    </button>
                  )}
                </div>

                {/* ── Attachment panel ── */}
                {attachingId===a.id&&(
                  <div style={{margin:"0 22px 12px",padding:"12px 14px",background:B.cream,borderRadius:8,border:`1px solid ${B.g2}`}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:B.g4,marginBottom:8}}>Add attachment</div>
                    <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                      <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="Paste a URL (SharePoint, OneDrive, web link…)"
                        onKeyDown={e=>e.key==="Enter"&&addUrlAttachment(a.id)}
                        style={{flex:1,padding:"7px 10px",fontSize:12,border:`1px solid ${B.g2}`,borderRadius:6,outline:"none",color:B.charcoal}}/>
                      <button onClick={()=>addUrlAttachment(a.id)} disabled={!urlInput.trim()}
                        style={{padding:"7px 14px",background:B.charcoal,color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:urlInput.trim()?"pointer":"not-allowed",opacity:urlInput.trim()?1:.45,whiteSpace:"nowrap"}}>Add link</button>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button onClick={()=>triggerDocUpload(a.id)}
                        style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#fff",border:`1px solid ${B.g2}`,borderRadius:6,fontSize:12,color:B.charcoal,cursor:"pointer",fontWeight:500}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload PDF / XLS
                      </button>
                      <span style={{fontSize:11,color:B.g3}}>Max 2 MB</span>
                      <button onClick={()=>setAttachingId(null)} style={{marginLeft:"auto",padding:"7px 12px",background:"transparent",border:`1px solid ${B.g2}`,borderRadius:6,fontSize:12,color:B.g4,cursor:"pointer"}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {actions.length>0&&(
          <div style={{padding:"10px 22px",borderTop:`1px solid ${B.g2}`,background:B.cream,display:"flex",gap:16,flexWrap:"wrap"}}>
            {Object.entries(STATUS_META).map(([k,m])=>{
              const cnt=actions.filter(a=>a.status===k).length;
              return cnt>0&&<span key={k} style={{fontSize:11,color:m.color,fontWeight:600}}>{cnt} {m.label}</span>;
            })}
            <span style={{fontSize:11,color:B.g3,marginLeft:"auto"}}>{actions.length} action{actions.length!==1?"s":""} total</span>
          </div>
        )}
      </div>
    </div>

    {/* Hidden inputs */}
    <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoFile}/>
    <input ref={docInputRef} type="file" accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style={{display:"none"}} onChange={handleDocFile}/>

    {/* Lightbox — click backdrop to close, image click is neutral */}
    {lightboxPhoto&&(
      <div onClick={()=>setLightboxPhoto(null)}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box"}}>
        <img src={lightboxPhoto} alt="achievement" onClick={e=>e.stopPropagation()}
          style={{maxWidth:"100%",maxHeight:"100%",width:"auto",height:"auto",borderRadius:10,boxShadow:"0 12px 60px rgba(0,0,0,.6)",objectFit:"contain",display:"block"}}/>
        <button onClick={()=>setLightboxPhoto(null)}
          style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.25)",borderRadius:"50%",width:38,height:38,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",backdropFilter:"blur(4px)"}}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
        </button>
      </div>
    )}
  </>);
}

// ── ADMIN PANEL ──
function AdminPanel({pillars,appData,setAppData,onUpdatePillars,isRootAdmin}){
  const[editPillarIdx,setEditPillarIdx]=useState(null);
  const[editGoal,setEditGoal]=useState(null); // {pillarIdx, goalId} or {pillarIdx, new:true}
  const[toast,setToast]=useState(null);
  const[newAdminName,setNewAdminName]=useState("");
  const admins=appData.admins||[];
  const saveAdmins=(list)=>{const nd={...appData,admins:list};setAppData(nd);save(nd);};
  const addAdmin=()=>{const n=newAdminName.trim();if(!n||admins.includes(n))return;saveAdmins([...admins,n]);setNewAdminName("");showToast(`${n} is now an admin`);};
  const removeAdmin=(n)=>{saveAdmins(admins.filter(a=>a!==n));showToast(`${n} removed from admins`);};

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),2500);};

  const savePillar=(updated)=>{
    const next=[...pillars];next[editPillarIdx]={...next[editPillarIdx],...updated};
    const nd={...appData,pillars:next};
    setAppData(nd);save(nd);setEditPillarIdx(null);showToast("Pillar updated successfully");
  };

  const saveGoal=(pillarIdx,goalData)=>{
    const next=JSON.parse(JSON.stringify(pillars));
    const pi=next[pillarIdx];
    const existIdx=pi.goals.findIndex(g=>g.id===goalData.id);
    if(existIdx>=0){pi.goals[existIdx]={...pi.goals[existIdx],...goalData};}
    else{pi.goals.push(goalData);}
    // Single atomic update — pillars + storage entries in one state write
    const nd={...appData,pillars:next};
    if(!nd.signups[goalData.id])nd.signups[goalData.id]=[];
    if(!nd.comments[goalData.id])nd.comments[goalData.id]=[];
    nd.progress[goalData.id]=goalData.progress??nd.progress[goalData.id]??0;
    setAppData(nd);save(nd);setEditGoal(null);showToast(existIdx>=0?"Deliverable updated":"New deliverable added");
  };

  const deleteGoal=(pillarIdx,goalId)=>{
    const next=JSON.parse(JSON.stringify(pillars));
    next[pillarIdx].goals=next[pillarIdx].goals.filter(g=>g.id!==goalId);
    const nd={...appData,pillars:next};
    setAppData(nd);save(nd);setEditGoal(null);showToast("Deliverable deleted");
  };

  return(
    <div className="fade-up">
      {toast&&<div className="fade-in" style={{position:"fixed",top:20,right:20,zIndex:999,background:B.success,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,padding:"10px 20px",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,.15)"}}>{toast}</div>}

      <div style={{background:B.white,borderRadius:16,border:`2px solid ${B.carmine}22`,padding:"24px",marginBottom:20,boxShadow:`0 4px 24px ${B.carmine}08`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{width:36,height:36,borderRadius:10,background:`${B.carmine}12`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={B.carmine} strokeWidth="2" strokeLinecap="round"><path d="M12.9 4.1a2.1 2.1 0 013 3L8 15l-4 1 1-4z"/><path d="M11 6l3 3"/></svg>
          </div>
          <div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:B.charcoal}}>Admin Panel</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:B.g3}}>Manage pillars, deliverables, assign owners, and admin access</div>
          </div>
        </div>

        {/* Team Admins */}
        <div style={{marginBottom:24,padding:"16px 18px",background:B.cream,borderRadius:12,border:`1px solid ${B.g2}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={B.charcoal} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".06em"}}>Team Admins</span>
            {!isRootAdmin&&<span style={{fontSize:10,color:B.g3,fontStyle:"italic",fontWeight:400,textTransform:"none",letterSpacing:0}}>— managed by root admin</span>}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:isRootAdmin?10:0}}>
            {admins.length===0&&<span style={{fontSize:12,color:B.g3,fontStyle:"italic"}}>No delegated admins yet.</span>}
            {admins.map(n=>(
              <span key={n} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px 4px 4px",background:B.white,borderRadius:20,border:`1px solid ${B.g2}`,fontSize:11,fontWeight:500,color:B.charcoal}}>
                <Initials name={n} size={22} bg={B.goldDark+"33"} color={B.goldDark}/>
                {n}
                {isRootAdmin&&<button onClick={()=>removeAdmin(n)} title={`Remove ${n}`} style={{marginLeft:2,background:"none",border:"none",cursor:"pointer",color:B.g3,fontSize:14,lineHeight:1,padding:"0 2px",borderRadius:"50%"}} onMouseOver={e=>e.currentTarget.style.color=B.danger} onMouseOut={e=>e.currentTarget.style.color=B.g3}>×</button>}
              </span>
            ))}
          </div>
          {isRootAdmin&&(
            <div style={{display:"flex",gap:6,background:B.white,borderRadius:10,padding:"3px 3px 3px 12px",border:`1px solid ${B.g2}`}}>
              <input type="text" placeholder="Add admin by name (must match their login name)…" value={newAdminName} onChange={e=>setNewAdminName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addAdmin()} style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:12,border:"none",outline:"none",background:"transparent",color:B.charcoal,padding:"5px 0"}}/>
              <Btn onClick={addAdmin} disabled={!newAdminName.trim()||admins.includes(newAdminName.trim())} variant={{color:B.goldDark}} size="sm">Grant Admin</Btn>
            </div>
          )}
        </div>

        {pillars.map((p,pi)=>(
          <div key={p.id} style={{marginBottom:16,borderRadius:12,border:`1px solid ${B.g2}`,overflow:"hidden"}}>
            <div style={{background:p.gradient,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"#fff"}}>{p.title}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,.7)"}}>{p.goals.length} deliverable{p.goals.length!==1?"s":""}</div>
              </div>
              <Btn onClick={()=>setEditPillarIdx(editPillarIdx===pi?null:pi)} variant="secondary" size="sm" style={{background:"rgba(255,255,255,.15)",color:"#fff",boxShadow:"none",border:"1px solid rgba(255,255,255,.25)"}}>{editPillarIdx===pi?"Close":"Edit Pillar"}</Btn>
            </div>
            {editPillarIdx===pi&&<div style={{padding:16}}><PillarEditor pillar={p} onSave={savePillar} onCancel={()=>setEditPillarIdx(null)}/></div>}
            <div style={{padding:"10px 14px"}}>
              {p.goals.map((g,gi)=>(
                <div key={g.id}>
                  {editGoal&&editGoal.pillarIdx===pi&&editGoal.goalId===g.id?(
                    <GoalEditor goal={g} pillarId={p.id} pillars={pillars} onSave={(d)=>saveGoal(pi,d)} onDelete={()=>deleteGoal(pi,g.id)} onCancel={()=>setEditGoal(null)}/>
                  ):(
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,marginBottom:4,background:B.g1,transition:"background .2s",cursor:"default"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12.5,fontWeight:600,color:B.charcoal,lineHeight:1.35}}>{g.text}</div>
                        <div style={{fontSize:10.5,color:B.g3,marginTop:2}}>Owner: <strong style={{color:B.g4}}>{g.owner}</strong> · {g.q} · {g.metric}</div>
                      </div>
                      <Btn onClick={()=>setEditGoal({pillarIdx:pi,goalId:g.id})} variant="ghost" size="sm">Edit</Btn>
                    </div>
                  )}
                </div>
              ))}
              {editGoal&&editGoal.pillarIdx===pi&&editGoal.new?(
                <GoalEditor goal={null} pillarId={p.id} pillars={pillars} onSave={(d)=>saveGoal(pi,d)} onDelete={()=>{}} onCancel={()=>setEditGoal(null)}/>
              ):(
                <button onClick={()=>setEditGoal({pillarIdx:pi,new:true})} style={{width:"100%",padding:"10px",borderRadius:8,border:`2px dashed ${B.g2}`,background:"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:B.g3,marginTop:4,transition:"all .2s"}}
                  onMouseEnter={e=>{e.target.style.borderColor=p.color;e.target.style.color=p.color;}} onMouseLeave={e=>{e.target.style.borderColor=B.g2;e.target.style.color=B.g3;}}>
                  + Add Deliverable
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── QUARTERLY SURVEY REPORT (HTML embedded from P&C Team Engagement Survey Q4 workbook) ──
const SURVEY_HTML = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>P&amp;C Team Engagement Survey &mdash; Report</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f6fa;color:#222;line-height:1.45}
.wrap{max-width:960px;margin:0 auto;padding:32px 24px 60px}
header{background:#1F3864;color:#fff;border-radius:12px;padding:28px 32px;margin-bottom:24px}
header h1{margin:0 0 6px;font-size:24px}
header p{margin:0;opacity:.85;font-size:14px}
.kpis{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:28px}
.kpi{flex:1;min-width:160px;background:#fff;border-radius:10px;padding:18px 20px;box-shadow:0 1px 3px rgba(0,0,0,.08);border-top:3px solid #1F3864}
.kpi .n{font-size:26px;font-weight:700;color:#1F3864}
.kpi .l{font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
.card{background:#fff;border-radius:12px;padding:24px 28px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.card h2{margin:0 0 16px;font-size:17px;color:#1F3864;border-bottom:2px solid #eef1f6;padding-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#1F3864;color:#fff;padding:9px 8px;text-align:center;font-weight:600}
th:first-child{text-align:left}
td{padding:8px;border-bottom:1px solid #eef1f6}
td.q{text-align:left;color:#333}
td.score{text-align:center;font-weight:600;width:74px;color:#222}
td.tr{text-align:center;width:70px;font-weight:600}
tr.overall td{font-weight:700;background:#eef1f6}
tr.overall td.score.ovr{background:#dbe3f1}
.up{color:#2e7d32}.down{color:#c62828}.flat{color:#888}
.ax{font-size:10px;fill:#888}.val{font-size:11px;fill:#333;font-weight:600}.qlab{font-size:11px;fill:#333}
.theme{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #f0f0f0;align-items:flex-start}
.theme:last-child{border-bottom:none}
.tdot{width:12px;height:12px;border-radius:50%;margin-top:4px;flex:none}
.tname{font-weight:700;color:#1F3864;font-size:14px}
.tdesc{font-size:13px;color:#555}
.two{display:grid;grid-template-columns:1fr 1fr;gap:24px}
@media(max-width:720px){.two{grid-template-columns:1fr}}
ul.take{margin:0;padding-left:20px}ul.take li{margin:7px 0;font-size:14px}
.foot{text-align:center;color:#999;font-size:12px;margin-top:8px}
</style></head>
<body><div class="wrap">
<header>
<h1>P&amp;C Team Engagement Survey</h1>
<p>Quarterly results &amp; analysis &mdash; Q1 FY26 &rarr; Q2 FY26 &rarr; Q4 FY26 &rarr; Q2 FY27 &nbsp;|&nbsp; Scores on a 1&ndash;5 scale</p>
</header>

<div class="kpis">
<div class="kpi"><div class="n">4.11</div><div class="l">Overall score (Q2 FY27)</div></div>
<div class="kpi"><div class="n">+0.15</div><div class="l">Change vs Q4 FY26</div></div>
<div class="kpi"><div class="n">13</div><div class="l">Responses (Q2 FY27)</div></div>
<div class="kpi"><div class="n">4.4</div><div class="l">Top area: Leadership</div></div>
<div class="kpi"><div class="n">3.6</div><div class="l">Lowest: Prof. growth</div></div>
</div>

<div class="card"><h2>Scores by question, all quarters</h2>
<table><thead><tr><th>Question</th><th>Q1 FY26</th><th>Q2 FY26</th><th>Q4 FY26</th><th>Q2 FY27</th><th>&Delta; vs Q4</th></tr></thead>
<tbody><tr><td class="q">Engagement with unit activities</td><td class="score" style="background:rgb(177,212,127)">4.5</td><td class="score" style="background:rgb(255,235,132)">4.0</td><td class="score" style="background:rgb(254,218,128)">3.9</td><td class="score" style="background:rgb(243,231,131)">4.1</td><td class="tr"><span class="up">&#9650; +0.2</span></td></tr><tr><td class="q">Communication within the unit</td><td class="score" style="background:rgb(254,222,129)">3.9</td><td class="score" style="background:rgb(253,208,127)">3.8</td><td class="score" style="background:rgb(254,218,128)">3.9</td><td class="score" style="background:rgb(255,235,132)">4.0</td><td class="tr"><span class="up">&#9650; +0.1</span></td></tr><tr><td class="q">Support from colleagues</td><td class="score" style="background:rgb(161,208,126)">4.6</td><td class="score" style="background:rgb(208,221,129)">4.3</td><td class="score" style="background:rgb(138,201,125)">4.8</td><td class="score" style="background:rgb(206,221,129)">4.3</td><td class="tr"><span class="down">&#9660; -0.4</span></td></tr><tr><td class="q">Leadership support &amp; guidance</td><td class="score" style="background:rgb(161,208,126)">4.6</td><td class="score" style="background:rgb(223,226,130)">4.2</td><td class="score" style="background:rgb(235,229,130)">4.1</td><td class="score" style="background:rgb(195,217,128)">4.4</td><td class="tr"><span class="up">&#9650; +0.3</span></td></tr><tr><td class="q">Overall work environment</td><td class="score" style="background:rgb(192,217,128)">4.4</td><td class="score" style="background:rgb(254,222,129)">3.9</td><td class="score" style="background:rgb(254,218,128)">3.9</td><td class="score" style="background:rgb(243,231,131)">4.1</td><td class="tr"><span class="up">&#9650; +0.2</span></td></tr><tr><td class="q">Professional growth opportunities</td><td class="score" style="background:rgb(239,230,131)">4.1</td><td class="score" style="background:rgb(251,170,119)">3.5</td><td class="score" style="background:rgb(250,153,116)">3.4</td><td class="score" style="background:rgb(252,185,122)">3.6</td><td class="tr"><span class="up">&#9650; +0.2</span></td></tr><tr><td class="q">Recognition &amp; appreciation</td><td class="score" style="background:rgb(208,221,129)">4.3</td><td class="score" style="background:rgb(208,221,129)">4.3</td><td class="score" style="background:rgb(254,218,128)">3.9</td><td class="score" style="background:rgb(231,228,130)">4.2</td><td class="tr"><span class="up">&#9650; +0.3</span></td></tr><tr><td class="q">Comfort sharing feedback</td><td class="score" style="background:rgb(239,230,131)">4.1</td><td class="score" style="background:rgb(239,230,131)">4.1</td><td class="score" style="background:rgb(254,218,128)">3.9</td><td class="score" style="background:rgb(218,224,129)">4.2</td><td class="tr"><span class="up">&#9650; +0.4</span></td></tr><tr class="overall"><td class="q">Overall average</td><td class="score ovr">4.3</td><td class="score ovr">4.0</td><td class="score ovr">4.0</td><td class="score ovr">4.1</td><td class="tr"><span class="up">&#9650; +0.2</span></td></tr></tbody></table></div>

<div class="two">
<div class="card"><h2>Overall engagement trend</h2><svg viewBox="0 0 520 240" width="100%" ><line x1="45" y1="205.0" x2="500" y2="205.0" stroke="#eee"/><text x="37" y="209.0" class="ax" text-anchor="end">3.50</text><line x1="45" y1="158.8" x2="500" y2="158.8" stroke="#eee"/><text x="37" y="162.8" class="ax" text-anchor="end">3.75</text><line x1="45" y1="112.5" x2="500" y2="112.5" stroke="#eee"/><text x="37" y="116.5" class="ax" text-anchor="end">4.00</text><line x1="45" y1="66.2" x2="500" y2="66.2" stroke="#eee"/><text x="37" y="70.2" class="ax" text-anchor="end">4.25</text><line x1="45" y1="20.0" x2="500" y2="20.0" stroke="#eee"/><text x="37" y="24.0" class="ax" text-anchor="end">4.50</text><polyline points="45.0,54.7 196.7,110.2 348.3,121.2 500.0,92.9" fill="none" stroke="#1F3864" stroke-width="2.5"/><circle cx="45.0" cy="54.7" r="4" fill="#1F3864"/><text x="45.0" y="44.7" class="val" text-anchor="middle">4.31</text><circle cx="196.7" cy="110.2" r="4" fill="#1F3864"/><text x="196.7" y="100.2" class="val" text-anchor="middle">4.01</text><circle cx="348.3" cy="121.2" r="4" fill="#1F3864"/><text x="348.3" y="111.2" class="val" text-anchor="middle">3.95</text><circle cx="500.0" cy="92.9" r="4" fill="#1F3864"/><text x="500.0" y="82.9" class="val" text-anchor="middle">4.11</text><text x="45.0" y="230" class="ax" text-anchor="middle">Q1 FY26</text><text x="196.7" y="230" class="ax" text-anchor="middle">Q2 FY26</text><text x="348.3" y="230" class="ax" text-anchor="middle">Q4 FY26</text><text x="500.0" y="230" class="ax" text-anchor="middle">Q2 FY27</text></svg></div>
<div class="card"><h2>Q2 FY27 scores by question</h2><svg viewBox="0 0 560 287" width="100%"><text x="240" y="27" class="qlab" text-anchor="end">Engagement with unit activities</text><rect x="250" y="14" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="14" width="216.1" height="20" fill="rgb(243,231,131)" rx="3"/><text x="472.1" y="29" class="val">4.1</text><text x="240" y="61" class="qlab" text-anchor="end">Communication within the unit</text><rect x="250" y="48" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="48" width="212.0" height="20" fill="rgb(255,235,132)" rx="3"/><text x="468.0" y="63" class="val">4.0</text><text x="240" y="95" class="qlab" text-anchor="end">Support from colleagues</text><rect x="250" y="82" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="82" width="228.3" height="20" fill="rgb(206,221,129)" rx="3"/><text x="484.3" y="97" class="val">4.3</text><text x="240" y="129" class="qlab" text-anchor="end">Leadership support &amp; guidance</text><rect x="250" y="116" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="116" width="232.4" height="20" fill="rgb(195,217,128)" rx="3"/><text x="488.4" y="131" class="val">4.4</text><text x="240" y="163" class="qlab" text-anchor="end">Overall work environment</text><rect x="250" y="150" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="150" width="216.1" height="20" fill="rgb(243,231,131)" rx="3"/><text x="472.1" y="165" class="val">4.1</text><text x="240" y="197" class="qlab" text-anchor="end">Professional growth opportunities</text><rect x="250" y="184" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="184" width="191.6" height="20" fill="rgb(252,185,122)" rx="3"/><text x="447.6" y="199" class="val">3.6</text><text x="240" y="231" class="qlab" text-anchor="end">Recognition &amp; appreciation</text><rect x="250" y="218" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="218" width="220.2" height="20" fill="rgb(231,228,130)" rx="3"/><text x="476.2" y="233" class="val">4.2</text><text x="240" y="265" class="qlab" text-anchor="end">Comfort sharing feedback</text><rect x="250" y="252" width="265" height="20" fill="#f0f0f0" rx="3"/><rect x="250" y="252" width="224.2" height="20" fill="rgb(218,224,129)" rx="3"/><text x="480.2" y="267" class="val">4.2</text></svg></div>
</div>

<div class="card"><h2>Comment themes (Q2 FY27)</h2>
<p style="font-size:13px;color:#375623;background:#eaf3e3;padding:10px 14px;border-radius:8px;margin-top:0">Overall sentiment is largely positive &mdash; strong gratitude for a supportive, collaborative team and a &ldquo;safe space&rdquo; with less tension. Suggestions cluster around a few clear themes:</p>
<div class="theme"><div class="tdot" style="background:#1F3864"></div><div><div class="tname">Collaboration &amp; silos</div><div class="tdesc">Some feel more siloed &mdash; want cross-team engagement, monthly knowledge-sharing, and unity across locations</div></div></div><div class="theme"><div class="tdot" style="background:#2E75B6"></div><div><div class="tname">Efficiency</div><div class="tdesc">Automate manual and physical work to be more efficient</div></div></div><div class="theme"><div class="tdot" style="background:#2E75B6"></div><div><div class="tname">Workload pacing</div><div class="tdesc">Heavy workload concentrated at the start of the year</div></div></div><div class="theme"><div class="tdot" style="background:#2E75B6"></div><div><div class="tname">Feedback &amp; connection</div><div class="tdesc">Want timely feedback; an in-person team meet-up would add value</div></div></div><div class="theme"><div class="tdot" style="background:#548235"></div><div><div class="tname">Positive notes</div><div class="tdesc">&ldquo;Pleasure working for this team&rdquo;, &ldquo;awesome team&rdquo;, &ldquo;wonderful experience&rdquo;, &ldquo;keep up the teamwork&rdquo;</div></div></div></div>

<div class="card"><h2>Key takeaways</h2>
<ul class="take">
<li><b>Engagement recovered in Q2 FY27</b> (4.11), up +0.15 from Q4 FY26 and near the Q1 FY26 high (4.31), with gains in almost every area.</li>
<li><b>Leadership support (4.4) and colleague support (4.3)</b> remain the strongest drivers, though colleague support dipped &minus;0.4 vs Q4 &mdash; worth watching.</li>
<li><b>Professional growth (3.6) is consistently the weakest area</b> across all quarters despite a modest rebound &mdash; the clearest priority for action.</li>
<li><b>Collaboration &amp; silos</b> is the dominant qualitative theme; cross-team engagement and knowledge-sharing across locations would address it directly.</li>
</ul></div>

<div class="foot">Generated from the P&amp;C Team Engagement Survey workbook &middot; 4 survey periods</div>
</div></body></html>`;

// ── TEAMS VIEW ──

function TeamsView(){
  const [active,setActive]=useState("safety");
  const teams=[
    {k:"safety",l:"Safety & Security",c:"#1E3A52"},
    {k:"hr",l:"Human Resources",c:B.carmine},
    {k:"ld",l:"Learning & Development",c:"#005844"},
  ];
  const info={
    safety:{fig:"Figure 1",title:"Safety & Security Ecosystem",lead:"Paula Eyzaguirre · Manager, Global Safety & Security",desc:"The Safety & Security function governs NI's duty of care framework, ensuring staff operate safely across 60+ countries through six interconnected areas of operational security.",purview:["Governance: Global policy, risk thresholds & accountability framework","Crisis Management: CMT, procedures & After-Action Reviews","Resources: Funding, staffing, travel coordination & memberships","Learning: PSS, HEAT, First Aid, fire safety & driver training","Operational Security (OpSec): SRAs, SMPs, SOPs & ISOS integration","Communication: Procedures, equipment provision & information security"]},
    hr:{fig:"Figure 2",title:"The Employee Life Cycle",lead:"Grant Carioni · Sr. Director, People & Culture",desc:"HR operations are anchored in the Employee Experience concept — ensuring engagement, accountability, and compliance across every stage of the staff journey from recruitment to exit.",purview:["Recruitment & selection: From hiring intake through reference & background checks","Contract management: Offers, extensions and exits","Cyclical initiatives: Awards programs, compensation planning, reporting cycles","Employee engagement: Survey development, analysis & action planning","Health & safety: Inspections, regulatory compliance & meetings","Absence management: Annual, sick, parental & LTD leave","Employee relations: Conflict management & organizational change support"]},
    ld:{fig:"Figure 3",title:"Continuous Learning Culture",lead:"Arif Pyarali · Manager, Global Learning & Development",desc:"L&D builds NI's capacity for sustained excellence by fostering a continuous learning culture anchored in shared consciousness — upskilling and retooling staff in alignment with values and IC2 priorities.",purview:["Compliance training & mandatory certification programs","Leadership development: MDP, SLII & executive coaching","Mentoring & action learning opportunities","Technical & behavioural skill development pathways","Knowledge management systems & IC2 e-learning modules","Linking learning outcomes directly to performance & IC2 strategy"]},
  };
  const t=info[active],ac=teams.find(x=>x.k===active)?.c||B.charcoal;
  return(
    <div className="fade-up" style={{paddingBottom:40}}>
      <div style={{background:B.charcoal,borderRadius:12,padding:"24px 28px",marginBottom:20,color:"#fff"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,.4)",marginBottom:5}}>People & Culture</div>
        <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>How Our Teams Operate</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.6,maxWidth:540}}>
          Three specialist teams form the People & Culture function, each operating a distinct service model to deliver NI's 2025–2031 People Strategy.
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {teams.map(tm=>(
          <button key={tm.k} onClick={()=>setActive(tm.k)} style={{flex:1,padding:"10px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Arial,sans-serif",transition:"all .2s",background:active===tm.k?tm.c:"#F2F0EB",color:active===tm.k?"#fff":B.charcoal}}>
            {tm.l}
          </button>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:12,border:`1.5px solid ${ac}25`,overflow:"hidden"}}>
        <div style={{background:ac,padding:"16px 24px",color:"#fff"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",opacity:.55,marginBottom:4}}>{t.fig} · Operational Model</div>
          <div style={{fontSize:18,fontWeight:700}}>{t.title}</div>
          <div style={{fontSize:11,opacity:.7,marginTop:3}}>{t.lead}</div>
        </div>
        <div style={{padding:"20px 24px"}}>
          <p style={{margin:"0 0 14px",fontSize:13,color:B.charcoal,lineHeight:1.65}}>{t.desc}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px 16px",marginBottom:20}}>
            {t.purview.map((p,i)=>(
              <div key={i} style={{fontSize:11.5,color:B.charcoal,lineHeight:1.5,display:"flex",gap:7,alignItems:"flex-start"}}>
                <span style={{color:ac,fontWeight:700,flexShrink:0,lineHeight:1.5}}>›</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${ac}20`,paddingTop:18}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"#6B7C8A",marginBottom:12}}>{t.fig} — {t.title}</div>
            <img src={active==="safety"?"/figure1.png":active==="hr"?"/figure2.png":"/figure3.png"} alt={t.title} style={{width:"100%",borderRadius:4,display:"block"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function App(){
  const[active,setActive]=useState(0);
  const[view,setView]=useState("pillars"); // pillars | alignment | admin
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[showWelcome,setShowWelcome]=useState(false);
  const[showLogin,setShowLogin]=useState(false);
  const[nameInput,setNameInput]=useState("");
  const[staffPreview,setStaffPreview]=useState(false); // admin toggling to staff view

  // ── Real-time Firebase listener ──
  // Fires once on mount (initial load) and again whenever ANY client writes to
  // the database — so all browsers stay in sync automatically.
  useEffect(()=>{
    const dbRef=ref(db,DB_PATH);
    // Read personal fields from localStorage (they're not in Firebase)
    const storedName=localStorage.getItem(LS_NAME)||""; 
    const storedAdmin=localStorage.getItem(LS_ADMIN)==="1";

    const unsub=onValue(dbRef,(snapshot)=>{
      const remote=snapshot.val();
      let shared;
      if(remote&&remote.pillars){
        shared={...makeDefaults(remote.pillars),...remote};
        // ensure all goals have storage entries
        shared.pillars.forEach(p=>p.goals.forEach(g=>{
          if(!shared.signups[g.id])shared.signups[g.id]=[];
          if(!shared.comments[g.id])shared.comments[g.id]=[];
          if(shared.progress[g.id]===undefined)shared.progress[g.id]=g.progress;
        }));
        if(!shared.surveyActions)shared.surveyActions=[];
      } else {
        // First-ever load — seed from code defaults and push to Firebase
        shared=makeDefaults(DEFAULT_PILLARS);
        set(dbRef,shared).catch(console.error);
      }
      // Merge personal fields back in
      setData(d=>({...shared,userName:d?.userName||storedName,isAdmin:d?.isAdmin||storedAdmin}));
      setLoading(false);
      // Show name prompt only if no stored name
      if(!storedName)setShowWelcome(true);
    },(err)=>{
      console.error("Firebase read error:",err);
      // Fallback: seed locally if Firebase is unreachable
      setData({...makeDefaults(DEFAULT_PILLARS),userName:storedName,isAdmin:storedAdmin});
      setLoading(false);
      if(!storedName)setShowWelcome(true);
    });

    return ()=>unsub(); // unsubscribe on unmount
  },[]);

  const setName=()=>{
    if(!nameInput.trim())return;
    localStorage.setItem(LS_NAME,nameInput.trim());
    setData(d=>({...d,userName:nameInput.trim()}));
    setShowWelcome(false);
  };
  const handleAdminLogin=()=>{
    localStorage.setItem(LS_ADMIN,"1");
    setData(d=>({...d,isAdmin:true}));
    setStaffPreview(false);setView("admin");
  };
  const handleSignOut=()=>{
    localStorage.setItem(LS_ADMIN,"");
    setData(d=>({...d,isAdmin:false}));
    setStaffPreview(false);setView("pillars");
  };
  const handleTogglePreview=()=>{
    const entering=!staffPreview;
    setStaffPreview(entering);
    if(entering&&view==="admin")setView("pillars");
  };
  const updatePillars=(newP)=>{const next={...data,pillars:newP};setData(next);save(next);};

  const pillars=data?.pillars||DEFAULT_PILLARS;
  const isDelegatedAdmin=(data?.admins||[]).includes(data?.userName||"");
  const isAdminActive=(data?.isAdmin||isDelegatedAdmin)&&!staffPreview;
  const pillar=pillars[active]||pillars[0];
  const avgProg=(p)=>{if(!p.goals.length)return 0;const ps=p.goals.map(g=>data?.progress[g.id]??g.progress);return ps.reduce((a,b)=>a+b,0)/ps.length;};
  const totalGoals=pillars.reduce((a,p)=>a+p.goals.length,0);
  const totalMembers=data?new Set(pillars.flatMap(p=>p.goals.flatMap(g=>data.signups[g.id]||[]))).size:0;
  const totalComments=data?pillars.reduce((a,p)=>a+p.goals.reduce((b,g)=>b+(data.comments[g.id]||[]).length,0),0):0;
  const overallProg=pillars.length?pillars.reduce((a,p)=>a+avgProg(p),0)/pillars.length:0;

  if(loading||!data)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:B.charcoal}}>
      <div style={{textAlign:"center"}}><div style={{width:44,height:44,borderRadius:"50%",border:`3px solid ${B.carmine}`,borderTopColor:"transparent",animation:"spin .8s linear infinite",margin:"0 auto"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:B.g3,marginTop:14}}>Loading goals...</div></div>
    </div>
  );

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:B.cream,minHeight:"100vh",color:B.charcoal}}>
      <style>{FONTS}{ANIM}</style>

      {showWelcome&&(
        <div className="fade-in" style={{position:"fixed",inset:0,background:"rgba(37,55,70,.7)",backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div className="fade-up" style={{background:B.white,borderRadius:20,maxWidth:420,width:"100%",overflow:"hidden",boxShadow:"0 24px 64px rgba(37,55,70,.25)"}}>
            <div style={{background:B.charcoal,padding:"28px 28px 24px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",border:`3px solid ${B.carmine}44`}}/>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:B.white,lineHeight:1.2}}>Welcome to<br/>People & Culture Goals</div>
              <div style={{fontSize:13,color:B.g3,marginTop:8,lineHeight:1.5}}>Enter your name to join working groups and post updates.</div>
            </div>
            <div style={{padding:"24px 28px 28px"}}>
              <TextInput label="Your Full Name" value={nameInput} onChange={setNameInput} placeholder="e.g. Amina Dayo"/>
              <Btn onClick={setName} disabled={!nameInput.trim()} style={{width:"100%"}} size="lg">Get Started</Btn>
            </div>
          </div>
        </div>
      )}

      {showLogin&&<AdminLogin onLogin={handleAdminLogin} onClose={()=>setShowLogin(false)}/>}

      {/* HEADER */}
      <div style={{background:B.charcoal,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-40,width:200,height:200,borderRadius:"50%",border:`4px solid ${B.carmine}30`}}/>
        <div style={{position:"absolute",top:30,right:60,width:80,height:80,borderRadius:12,border:`3px solid ${B.carmine}18`}}/>
        <div style={{position:"absolute",bottom:-30,left:-20,width:100,height:100,borderRadius:12,border:`3px solid rgba(255,255,255,.04)`}}/>

        <div style={{maxWidth:920,margin:"0 auto",padding:"24px 24px 22px",position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none"><circle cx="24" cy="8" r="5" fill={B.carmine}/><rect x="4" y="14" width="22" height="22" rx="3" fill={B.carmine} opacity=".9"/><circle cx="15" cy="25" r="6" fill="white"/></svg>
              <div><div style={{fontSize:10,fontWeight:700,color:B.carmine,textTransform:"uppercase",letterSpacing:".12em"}}>Nutrition International</div><div style={{fontSize:9,color:"rgba(255,255,255,.4)",fontStyle:"italic"}}>Nourish Life</div></div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {isAdminActive&&<span style={{fontSize:10,fontWeight:700,color:B.gold,background:`${B.gold}18`,padding:"3px 10px",borderRadius:6,textTransform:"uppercase",letterSpacing:".06em"}}>Admin</span>}
              {staffPreview&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:"rgba(255,255,255,.12)",padding:"3px 10px",borderRadius:6,textTransform:"uppercase",letterSpacing:".06em",border:"1px solid rgba(255,255,255,.2)"}}>Staff Preview</span>}
              {data.userName&&(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Initials name={data.userName} size={28} bg={isAdminActive?B.gold:B.carmine}/>
                  <div><div style={{fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.85)"}}>{data.userName}</div><button onClick={()=>setShowWelcome(true)} style={{fontSize:9.5,color:B.g3,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Switch</button></div>
                </div>
              )}
            </div>
          </div>
          <div className="fade-up">
            <span style={{display:"inline-block",padding:"3px 12px",borderRadius:4,background:B.carmine,color:"#fff",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>FY 2026/27</span>
            <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:30,fontWeight:400,color:"#fff",lineHeight:1.1,margin:"0 0 6px"}}>People & Culture Goals</h1>
            <p style={{fontSize:12.5,color:"rgba(255,255,255,.5)",maxWidth:420,margin:0,lineHeight:1.55}}>Explore pillars, track deliverables, join working groups, and share progress.</p>
            <div style={{marginTop:14}}>
              <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".12em",color:"rgba(255,255,255,.3)",marginBottom:6}}>Key Documents</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[
                  {href:"https://nutritionintl.sharepoint.com/:w:/r/sites/M365_NI-ISG2/_layouts/15/Doc.aspx?sourcedoc=%7B8D0C8810-2D29-403F-91E0-23F3F6EAA2A4%7D&file=ISG%202-%20Inception%20Report%20-%20Template%20-%20People%20%26%20Culture.docx&action=default&mobileredirect=true&CID=6bee80c3-a1dd-089c-42cf-0b85fefdf553",label:"IC2 Inception Report",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
                  {href:"/people-purpose-performance.pdf",label:"People Purpose & Performance",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>},
                  {href:"https://nutritionintl.org/case/",label:"Second Investment Case",icon:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>},
                ].map(d=>(
                  <a key={d.href} href={d.href} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,.16)",background:"rgba(255,255,255,.06)",color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:600,textDecoration:"none",transition:"all .2s"}}>
                    {d.icon}{d.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="fade-up" style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap",animationDelay:".12s"}}>
            {[{l:"Progress",v:`${Math.round(overallProg)}%`,s:"overall"},{l:"Deliverables",v:totalGoals,s:"outcomes"},{l:"Working Group",v:totalMembers,s:"active"},{l:"Updates",v:totalComments,s:"posted"}].map((s,i)=>(
              <div key={i} style={{padding:"10px 14px",background:"rgba(255,255,255,.06)",borderRadius:10,border:"1px solid rgba(255,255,255,.08)",minWidth:90,flex:1}}>
                <div style={{fontSize:9,fontWeight:600,color:B.g3,textTransform:"uppercase",letterSpacing:".08em"}}>{s.l}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#fff",marginTop:1}}>{s.v}</div>
                <div style={{fontSize:9.5,color:"rgba(255,255,255,.3)",marginTop:1}}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{maxWidth:920,margin:"0 auto",padding:"0 24px"}}>
        <div style={{display:"flex",gap:0,marginTop:20,marginBottom:20,borderBottom:`2px solid ${B.g2}`,alignItems:"center"}}>
          {[{k:"pillars",l:"Goal Pillars"},{k:"alignment",l:"IC2 Alignment"},{k:"survey",l:"Team Survey"},{k:"teams",l:"Our Teams"}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{padding:"10px 18px",border:"none",borderBottom:view===v.k?`3px solid ${B.carmine}`:"3px solid transparent",background:"transparent",fontSize:12,fontWeight:view===v.k?700:500,color:view===v.k?B.carmine:B.g4,cursor:"pointer",marginBottom:-2,transition:"all .2s"}}>{v.l}</button>
          ))}
          <div style={{flex:1}}/>
          {(data.isAdmin||isDelegatedAdmin)?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {isAdminActive&&(
                <button onClick={()=>setView("admin")} style={{padding:"7px 14px",border:"none",borderBottom:view==="admin"?`3px solid ${B.gold}`:"3px solid transparent",background:"transparent",fontSize:12,fontWeight:view==="admin"?700:500,color:view==="admin"?B.goldDark:B.g4,cursor:"pointer",marginBottom:-2,display:"flex",alignItems:"center",gap:5}}>
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12.9 4.1a2.1 2.1 0 013 3L8 15l-4 1 1-4z"/></svg>
                  Admin
                </button>
              )}
              <button onClick={handleTogglePreview} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",border:`1px solid ${staffPreview?B.carmine:B.g2}`,borderRadius:7,background:staffPreview?`${B.carmine}12`:"transparent",fontSize:11,fontWeight:600,color:staffPreview?B.carmine:B.g4,cursor:"pointer",transition:"all .2s"}}>
                {staffPreview?(
                  <><svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12.9 4.1a2.1 2.1 0 013 3L8 15l-4 1 1-4z"/></svg>Admin Mode</>
                ):(
                  <><svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z"/><circle cx="10" cy="12" r="3"/></svg>Staff View</>
                )}
              </button>
              {data.isAdmin&&<button onClick={handleSignOut} style={{padding:"7px 12px",border:"none",background:"transparent",fontSize:11,color:B.g3,cursor:"pointer",marginBottom:0,textDecoration:"underline"}}>Sign Out</button>}
            </div>
          ):(
            <button onClick={()=>setShowLogin(true)} style={{padding:"7px 14px",border:"none",background:"transparent",fontSize:11,color:B.g3,cursor:"pointer",marginBottom:-2,display:"flex",alignItems:"center",gap:5}}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke={B.g3} strokeWidth="2" strokeLinecap="round"><rect x="3" y="9" width="14" height="9" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/></svg>
              Admin
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:920,margin:"0 auto",padding:"0 24px 48px"}}>
        {view==="admin"&&isAdminActive?(
          <AdminPanel pillars={pillars} appData={data} setAppData={setData} onUpdatePillars={updatePillars} isRootAdmin={!!data.isAdmin}/>
        ):view==="alignment"?(
          <div className="fade-up" style={{background:B.white,borderRadius:14,overflow:"hidden",border:`1px solid ${B.g2}`}}>
            <div style={{background:B.charcoal,padding:"20px 22px",color:"#fff",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",bottom:-14,right:-14,width:55,height:55,borderRadius:"50%",border:`3px solid ${B.carmine}33`}}/>
              <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",opacity:.6,marginBottom:5}}>Cross-Cutting Alignment</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,lineHeight:1.4}}>Every P&C deliverable maps to an organizational priority</div>
            </div>
            <div style={{padding:"14px 18px",overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 4px",fontSize:12.5}}>
                <thead><tr>{["Organizational Priority","P&C Enabler","FY2026/27 Deliverable"].map((h,i)=><th key={i} style={{textAlign:"left",padding:"9px 14px",fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:".06em",color:B.g3,borderBottom:`2px solid ${B.carmine}`}}>{h}</th>)}</tr></thead>
                <tbody>{CROSS_CUTTING.map((r,i)=><tr key={i} style={{background:i%2===0?B.cream:B.white}}><td style={{padding:"11px 14px",fontWeight:600,color:B.charcoal,borderRadius:"8px 0 0 8px"}}>{r.priority}</td><td style={{padding:"11px 14px",color:B.g4,fontStyle:"italic"}}>{r.enabler}</td><td style={{padding:"11px 14px",color:B.charcoal,borderRadius:"0 8px 8px 0"}}>{r.del}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        ):view==="teams"?(
          <TeamsView/>
        ):view==="survey"?(
          <SurveyView appData={data} setAppData={setData} userName={data?.userName||""} isAdmin={isAdminActive}/>
        ):(
          <>
            {/* Pillar Selector */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(150px, 1fr))",gap:10,marginBottom:22}}>
              {pillars.map((p,i)=>{const a=i===active,avg=avgProg(p);return(
                <div key={p.id} className="hover-lift fade-up" onClick={()=>setActive(i)} style={{cursor:"pointer",borderRadius:14,padding:"16px 14px",position:"relative",overflow:"hidden",background:a?p.gradient:B.white,border:`1.5px solid ${a?"transparent":B.g2}`,boxShadow:a?`0 8px 28px ${p.color}28`:`0 1px 3px ${B.charcoal}06`,transition:"all .3s",animationDelay:`${i*.06}s`}}>
                  <div style={{position:"absolute",top:-10,right:-10,width:36,height:36,borderRadius:"50%",border:`2.5px solid ${a?"rgba(255,255,255,.15)":p.color+"12"}`}}/>
                  <div style={{fontSize:12,fontWeight:700,color:a?"#fff":B.charcoal,lineHeight:1.3,marginBottom:3}}>{p.title}</div>
                  <div style={{fontSize:10.5,color:a?"rgba(255,255,255,.7)":B.g4,lineHeight:1.35,marginBottom:10}}>{p.tagline}</div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{flex:1,height:4,background:a?"rgba(255,255,255,.2)":B.g2,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${avg}%`,background:a?"rgba(255,255,255,.8)":p.color,borderRadius:2,transition:"width .5s"}}/></div>
                    <span style={{fontSize:10,fontWeight:700,color:a?"rgba(255,255,255,.85)":p.color}}>{Math.round(avg)}%</span>
                  </div>
                </div>
              );})}
            </div>

            {/* IC2 Banner */}
            <div className="fade-up" style={{background:pillar.gradient,borderRadius:16,padding:"20px 22px",color:"#fff",marginBottom:12,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-24,right:-24,width:90,height:90,borderRadius:"50%",border:"3px solid rgba(255,255,255,.1)"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14}}>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",opacity:.7,marginBottom:5}}>IC2 Strategy Connection</div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,lineHeight:1.5}}>{pillar.ic2}</div>
                </div>
                <div style={{padding:"7px 12px",background:"rgba(255,255,255,.12)",borderRadius:8}}>
                  <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",opacity:.7,marginBottom:2}}>Risk Register</div>
                  <div style={{fontSize:11,fontWeight:600}}>{pillar.risk}</div>
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Key Deliverables<span style={{fontWeight:500,color:B.g3,textTransform:"none"}}> · {pillar.goals.length} outcomes</span></div>
              {pillar.goals.map((g,i)=><DeliverableCard key={g.id} goal={g} pillar={pillar} appData={data} setAppData={setData} userName={data.userName} index={i} isAdmin={isAdminActive}/>)}
            </div>

            {/* Tips */}
            <div className="fade-up" style={{background:B.white,borderRadius:14,padding:"18px 20px",border:`1px solid ${B.g2}`}}>
              <div style={{fontSize:11,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Other Ways to Contribute</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))",gap:5}}>
                {pillar.tips.map((t,i)=><div key={i} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"7px 10px",borderRadius:7,background:B.cream}}><div style={{width:5,height:5,borderRadius:"50%",background:pillar.color,marginTop:5,flexShrink:0,opacity:.45}}/><span style={{fontSize:12,color:B.g4,lineHeight:1.45}}>{t}</span></div>)}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:32,paddingTop:20,borderTop:`1px solid ${B.g2}`}}>
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none"><circle cx="24" cy="8" r="5" fill={B.carmine}/><rect x="4" y="14" width="22" height="22" rx="3" fill={B.carmine} opacity=".9"/><circle cx="15" cy="25" r="6" fill="white"/></svg>
          <div style={{fontSize:10,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".1em",marginTop:5}}>Nutrition International</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:11,color:B.carmine,fontStyle:"italic",marginTop:2}}>Nourish Life</div>
          <div style={{fontSize:9.5,color:B.g3,marginTop:6}}>People & Culture · Section 8.2 · FY 2026/27</div>
        </div>
      </div>
    </div>
  );
}
