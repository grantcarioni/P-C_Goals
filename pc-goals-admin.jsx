import { useState, useEffect, useRef } from "react";

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
const SK="ni-pc-v4";
async function load(){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):null;}catch{return null;}}
async function save(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){console.error(e);}}
function makeDefaults(pillars){
  const s={},c={},p={};
  pillars.forEach(pl=>pl.goals.forEach(g=>{s[g.id]=s[g.id]||[];c[g.id]=c[g.id]||[];p[g.id]=p[g.id]??g.progress;}));
  return {signups:s,comments:c,progress:p,userName:"",pillars,isAdmin:false};
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
  const[confirmDelete,setConfirmDelete]=useState(false);
  const isNew=!goal;
  const canSave=text.trim()&&metric.trim()&&owner.trim();
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
          <Btn onClick={()=>onSave({id:goal?.id||`g_${Date.now()}`,text:text.trim(),metric:metric.trim(),q,owner:owner.trim(),progress:goal?.progress||0})} disabled={!canSave}>
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

// ── DELIVERABLE CARD (Staff view) ──
function DeliverableCard({goal,pillar,appData,setAppData,userName,index,isAdmin}){
  const[expanded,setExpanded]=useState(false);
  const[commentText,setCommentText]=useState("");
  const[justJoined,setJustJoined]=useState(false);
  const signups=appData.signups[goal.id]||[];
  const comments=appData.comments[goal.id]||[];
  const prog=appData.progress[goal.id]??goal.progress;
  const isMember=signups.includes(userName);
  const update=(fn)=>{const next={...appData};fn(next);setAppData(next);save(next);};
  const toggleSignup=()=>{if(!userName)return;update(n=>{if(isMember){n.signups[goal.id]=signups.filter(x=>x!==userName);}else{n.signups[goal.id]=[...signups,userName];setJustJoined(true);setTimeout(()=>setJustJoined(false),3000);}});};
  const postComment=()=>{if(!commentText.trim()||!userName)return;update(n=>{n.comments[goal.id]=[...comments,{a:userName,t:commentText.trim(),d:new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short"})}];});setCommentText("");};
  const setProgress=(v)=>update(n=>{n.progress[goal.id]=v;});
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
              <div style={{padding:"8px 12px",background:B.g1,borderRadius:10}}><div style={{fontSize:9,fontWeight:600,color:B.g3,textTransform:"uppercase",letterSpacing:".06em"}}>Due</div><div style={{fontFamily:"'DM Serif Display',serif",fontSize:14,color:B.charcoal,marginTop:1}}>{goal.q}</div></div>
            </div>
          </div>
          <div style={{padding:"0 18px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,fontWeight:600,color:B.g4,textTransform:"uppercase",letterSpacing:".05em"}}>Progress</span><span style={{fontSize:12,fontWeight:700,color:pillar.color}}>{prog}%</span></div>
            <div style={{height:7,background:B.g2,borderRadius:4,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${prog}%`,background:pillar.gradient,borderRadius:4,transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/></div>
            <input type="range" min="0" max="100" value={prog} onChange={e=>setProgress(Number(e.target.value))} style={{width:"100%",accentColor:pillar.color,cursor:"pointer"}}/>
          </div>
          <div style={{padding:"14px 18px",background:B.cream,borderTop:`1px solid ${B.g2}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:10.5,fontWeight:700,color:B.charcoal,textTransform:"uppercase",letterSpacing:".05em"}}>Working Group<span style={{fontWeight:500,color:B.g3,textTransform:"none",marginLeft:6}}>{signups.length}</span></div>
              {userName&&<Btn onClick={e=>{e.stopPropagation();toggleSignup();}} variant={isMember?"secondary":{color:pillar.color}} size="sm">{isMember?"Leave":"Join Group"}</Btn>}
            </div>
            {justJoined&&<div className="fade-up" style={{fontSize:12,color:B.success,background:B.successLight,borderRadius:8,padding:"7px 12px",marginBottom:8,border:`1px solid ${B.success}33`,fontWeight:500}}>Welcome to the working group!</div>}
            {signups.length>0?<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{signups.map((n,i)=><span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px 3px 3px",background:B.white,borderRadius:20,border:`1px solid ${B.g2}`,fontSize:11,fontWeight:500,color:B.charcoal}}><Initials name={n} size={20} bg={pillar.color+"22"} color={pillar.color}/>{n}</span>)}</div>
            :<div style={{fontSize:12,color:B.g3,fontStyle:"italic"}}>No members yet — be the first to join.</div>}
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

// ── ADMIN PANEL ──
function AdminPanel({pillars,appData,setAppData,onUpdatePillars}){
  const[editPillarIdx,setEditPillarIdx]=useState(null);
  const[editGoal,setEditGoal]=useState(null); // {pillarIdx, goalId} or {pillarIdx, new:true}
  const[toast,setToast]=useState(null);

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
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:B.g3}}>Manage pillars, deliverables, and assign owners</div>
          </div>
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

// ── MAIN APP ──
export default function App(){
  const[active,setActive]=useState(0);
  const[view,setView]=useState("pillars"); // pillars | alignment | admin
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[showWelcome,setShowWelcome]=useState(false);
  const[showLogin,setShowLogin]=useState(false);
  const[nameInput,setNameInput]=useState("");

  useEffect(()=>{
    load().then(d=>{
      if(d&&d.pillars){
        const merged={...makeDefaults(d.pillars),...d};
        // ensure all goals have storage entries
        merged.pillars.forEach(p=>p.goals.forEach(g=>{
          if(!merged.signups[g.id])merged.signups[g.id]=[];
          if(!merged.comments[g.id])merged.comments[g.id]=[];
          if(merged.progress[g.id]===undefined)merged.progress[g.id]=g.progress;
        }));
        setData(merged);
      } else {
        setData(makeDefaults(DEFAULT_PILLARS));
      }
      setLoading(false);
      if(!d?.userName)setShowWelcome(true);
    });
  },[]);

  const setName=()=>{if(!nameInput.trim())return;const next={...data,userName:nameInput.trim()};setData(next);save(next);setShowWelcome(false);};
  const handleAdminLogin=()=>{const next={...data,isAdmin:true};setData(next);save(next);setView("admin");};
  const handleLogout=()=>{const next={...data,isAdmin:false};setData(next);save(next);setView("pillars");};
  const updatePillars=(newP)=>{const next={...data,pillars:newP};setData(next);save(next);};

  const pillars=data?.pillars||DEFAULT_PILLARS;
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
              {data.isAdmin&&<span style={{fontSize:10,fontWeight:700,color:B.gold,background:`${B.gold}18`,padding:"3px 10px",borderRadius:6,textTransform:"uppercase",letterSpacing:".06em"}}>Admin</span>}
              {data.userName&&(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Initials name={data.userName} size={28} bg={data.isAdmin?B.gold:B.carmine}/>
                  <div><div style={{fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,.85)"}}>{data.userName}</div><button onClick={()=>setShowWelcome(true)} style={{fontSize:9.5,color:B.g3,background:"none",border:"none",cursor:"pointer",padding:0,textDecoration:"underline"}}>Switch</button></div>
                </div>
              )}
            </div>
          </div>
          <div className="fade-up">
            <span style={{display:"inline-block",padding:"3px 12px",borderRadius:4,background:B.carmine,color:"#fff",fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>FY 2026/27</span>
            <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:30,fontWeight:400,color:"#fff",lineHeight:1.1,margin:"0 0 6px"}}>People & Culture Goals</h1>
            <p style={{fontSize:12.5,color:"rgba(255,255,255,.5)",maxWidth:420,margin:0,lineHeight:1.55}}>Explore pillars, track deliverables, join working groups, and share progress.</p>
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
          {[{k:"pillars",l:"Goal Pillars"},{k:"alignment",l:"IC2 Alignment"}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{padding:"10px 18px",border:"none",borderBottom:view===v.k?`3px solid ${B.carmine}`:"3px solid transparent",background:"transparent",fontSize:12,fontWeight:view===v.k?700:500,color:view===v.k?B.carmine:B.g4,cursor:"pointer",marginBottom:-2,transition:"all .2s"}}>{v.l}</button>
          ))}
          <div style={{flex:1}}/>
          {data.isAdmin?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>setView("admin")} style={{padding:"7px 14px",border:"none",borderBottom:view==="admin"?`3px solid ${B.gold}`:"3px solid transparent",background:"transparent",fontSize:12,fontWeight:view==="admin"?700:500,color:view==="admin"?B.goldDark:B.g4,cursor:"pointer",marginBottom:-2,display:"flex",alignItems:"center",gap:5}}>
                <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12.9 4.1a2.1 2.1 0 013 3L8 15l-4 1 1-4z"/></svg>
                Admin
              </button>
              <button onClick={handleLogout} style={{padding:"7px 12px",border:"none",background:"transparent",fontSize:11,color:B.g3,cursor:"pointer",marginBottom:-2,textDecoration:"underline"}}>Logout</button>
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
        {view==="admin"?(
          <AdminPanel pillars={pillars} appData={data} setAppData={setData} onUpdatePillars={updatePillars}/>
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
              {pillar.goals.map((g,i)=><DeliverableCard key={g.id} goal={g} pillar={pillar} appData={data} setAppData={setData} userName={data.userName} index={i} isAdmin={data.isAdmin}/>)}
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
