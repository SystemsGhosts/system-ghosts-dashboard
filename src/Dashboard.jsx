import { useMemo } from "react";

const RAW_CSV = `Caption,Comments,Likes,Reach,Saved,Total Interactions,Media Type,Media Product Type,Permalink,Creation Date,Media Id,Shares,Views,Follows,Profile Activity,Profile Visits
"Day 20 - Normal Sundays.",0,4,27,0,5,VIDEO,REELS,https://www.instagram.com/reel/DX7RF2djxuR/,2026-05-04T18:01:35+0000,17899142331440452,0,47,,,
"Day 19 - WE GOT OUR FIRST REPLY!",0,13,169,1,16,VIDEO,REELS,https://www.instagram.com/reel/DX2HfKsE5X5/,2026-05-02T18:01:30+0000,18076776068209207,1,232,,,
"How often are hitting your claude limits?",0,13,55,1,17,CAROUSEL_ALBUM,FEED,https://www.instagram.com/p/DXzOBwyjCxd/,2026-05-01T15:00:34+0000,18411954700181687,2,172,0,0,3
"Day 18 - Follow for more tips and tricks with claude",0,13,205,1,20,VIDEO,REELS,https://www.instagram.com/reel/DXw95QSCPq2/,2026-04-30T18:01:32+0000,18076056998208578,5,280,,,
"Day 17 - BTS Social Media - This is how we film",0,18,219,2,22,VIDEO,REELS,https://www.instagram.com/reel/DXuZOq2DekT/,2026-04-29T18:02:38+0000,18080476028436748,1,305,,,
"Day 16 - Follow to see how we get on!",0,14,264,1,17,VIDEO,REELS,https://www.instagram.com/reel/DXr0ac7jGOX/,2026-04-28T18:02:26+0000,17875792161453787,1,398,,,
"Day 15 - Want to make mass outreach more personalised?",3,15,298,2,24,VIDEO,REELS,https://www.instagram.com/reel/DXpPqLgD8aM/,2026-04-27T18:02:48+0000,18119744308568317,2,376,,,
"Day 14 - Comment skill for system prompt",0,14,271,1,19,VIDEO,REELS,https://www.instagram.com/reel/DXmqx6JiD8P/,2026-04-26T18:02:05+0000,17979470333843233,2,362,,,
"Day 13 - Why you're getting no response from cold outreach",0,13,194,2,17,VIDEO,REELS,https://www.instagram.com/reel/DXe8cgFCCSv/,2026-04-23T18:02:33+0000,18095380943121957,1,273,,,
"Day 12 - Any decision can be the right decision",0,16,285,1,20,VIDEO,REELS,https://www.instagram.com/reel/DXcXrdiEadZ/,2026-04-22T18:02:43+0000,17905046808408508,1,373,,,
"Day 11 - Are you using Claude for outreach?",1,19,239,3,25,VIDEO,REELS,https://www.instagram.com/reel/DXZy4UeAsKk/,2026-04-21T18:02:51+0000,18099395156049401,1,323,,,
"Day 10 - Skill To Profit Mastermind Recap",1,17,250,2,23,VIDEO,REELS,https://www.instagram.com/reel/DXXN_FZAZ9H/,2026-04-20T18:01:50+0000,18320985694264650,2,349,,,
"Big Thanks to callumcarver for the mastermind",0,12,44,0,12,CAROUSEL_ALBUM,FEED,https://www.instagram.com/p/DXSLN4TAWI5/,2026-04-18T19:01:06+0000,17934860181227854,0,118,0,0,2
"Day 9 - Comment AI and I'll send these resources",2,16,243,1,21,VIDEO,REELS,https://www.instagram.com/reel/DXNBk7TDJZO/,2026-04-16T19:01:04+0000,17874368814584628,1,342,,,
"Day 8 - They can't view your vision",3,20,284,2,27,VIDEO,REELS,https://www.instagram.com/reel/DXKc9FND82-/,2026-04-15T19:02:43+0000,18003416408728182,2,415,,,
"Day 7 - This is how we scraped over 2000 leads",0,10,272,3,16,VIDEO,REELS,https://www.instagram.com/reel/DXH4AP5jp3y/,2026-04-14T19:01:10+0000,18343500166244790,2,437,,,
"Day 6 - Why leave stability?",0,40,1751,1,56,VIDEO,REELS,https://www.instagram.com/reel/DXFTQhcjV51/,2026-04-13T19:01:41+0000,18087055217013213,13,2217,,,
"Day 5 - Even we fell for this trap",0,10,404,2,13,VIDEO,REELS,https://www.instagram.com/reel/DXACwgjDauw/,2026-04-11T18:01:10+0000,18420106999121803,1,571,,,
"Day 4 - Business registered. Bank account approved.",2,20,279,3,26,VIDEO,REELS,https://www.instagram.com/reel/DW65VZ5jKpH/,2026-04-09T18:02:39+0000,18088565492203870,1,436,,,
"Day 3 - My parents think I'm a failure",0,14,401,0,16,VIDEO,REELS,https://www.instagram.com/reel/DW4UhxjAbS0/,2026-04-08T18:02:30+0000,18118125118573908,1,633,,,
"Day 2 - Quit our 9-5s. Trusted our vision.",13,35,508,2,55,VIDEO,REELS,https://www.instagram.com/reel/DW1vkb-DWfB/,2026-04-07T18:01:15+0000,17861481828674685,2,752,,,
"Day 1 - We're done with the 9-5 rat race.",4,23,392,2,30,VIDEO,REELS,https://www.instagram.com/reel/DWzKyVoNf9T/,2026-04-06T18:00:35+0000,17920932426322425,1,589,,,`;

const B = {
  bg:"#F8F9FC",card:"#FFFFFF",accent:"#6C5CE7",accentLt:"#A29BFE",
  green:"#00B894",red:"#E17055",amber:"#FDCB6E",
  text:"#2D3436",textLt:"#636E72",border:"#E8ECF1",
};

function parseData(csv) {
  const lines = csv.trim().split("\n");
  return lines.slice(1).map(line => {
    const match = line.match(/^"([^"]*)",(.*)/);
    if (!match) return null;
    const caption = match[1];
    const rest = match[2].split(",");
    return {
      caption,
      comments: +rest[0] || 0,
      likes: +rest[1] || 0,
      reach: +rest[2] || 0,
      saved: +rest[3] || 0,
      interactions: +rest[4] || 0,
      mediaType: rest[5] || "",
      productType: rest[6] || "",
      permalink: rest[7] || "",
      date: new Date(rest[8]),
      shares: +rest[10] || 0,
      views: +rest[11] || 0,
      follows: +rest[12] || 0,
    };
  }).filter(Boolean);
}

const fmt = n => { if(n>=1e6) return (n/1e6).toFixed(1)+"M"; if(n>=1e3) return (n/1e3).toFixed(1)+"K"; return Math.round(n).toLocaleString(); };
const pct = (c,p) => p>0?((c-p)/p)*100:c>0?100:0;

function Card({label,value,change}) {
  const up = change >= 0;
  return (
    <div style={{background:B.card,borderRadius:16,padding:"18px 14px",flex:"1 1 0",minWidth:130,boxShadow:"0 2px 12px rgba(108,92,231,.07)",border:`1px solid ${B.border}`}}>
      <div style={{fontSize:11,color:B.textLt,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:4}}>{label}</div>
      <div style={{fontSize:24,fontWeight:800,color:B.text,marginBottom:4}}>{value}</div>
      {change!==null&&<div style={{fontSize:11,fontWeight:700,color:up?B.green:B.red}}>{up?"▲":"▼"} {Math.abs(change).toFixed(1)}%</div>}
    </div>
  );
}

function Spark({data,color,w=200,h=40}) {
  if(data.length<2) return null;
  const max=Math.max(...data),min=Math.min(...data),r=max-min||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/r)*(h-6)-3}`).join(" ");
  return <svg width={w} height={h}><polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts}/></svg>;
}

function Chart({daily}) {
  if(daily.length<2) return <div style={{color:B.textLt,fontSize:13}}>Need more data for chart</div>;
  const W=460,H=200,pL=42,pR=42,pT=12,pB=32;
  const iW=W-pL-pR,iH=H-pT-pB;
  const mxV=Math.max(...daily.map(d=>d.views))||1;
  const mxR=Math.max(...daily.map(d=>d.reach))||1;
  const line=(arr,mx,col)=>{
    const p=arr.map((v,i)=>`${pL+(i/Math.max(arr.length-1,1))*iW},${pT+iH-(v/mx)*iH}`).join(" ");
    return <polyline fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={p}/>;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:460}}>
      {[0,.25,.5,.75,1].map(f=><line key={f} x1={pL} x2={W-pR} y1={pT+iH-f*iH} y2={pT+iH-f*iH} stroke={B.border} strokeWidth="1"/>)}
      {[0,.5,1].map(f=><text key={`v${f}`} x={pL-4} y={pT+iH-f*iH+3} textAnchor="end" fontSize="9" fill={B.accent}>{fmt(mxV*f)}</text>)}
      {[0,.5,1].map(f=><text key={`r${f}`} x={W-pR+4} y={pT+iH-f*iH+3} textAnchor="start" fontSize="9" fill={B.green}>{fmt(mxR*f)}</text>)}
      {daily.map((d,i)=>{const x=pL+(i/Math.max(daily.length-1,1))*iW;return i%Math.max(1,Math.floor(daily.length/5))===0?<text key={i} x={x} y={H-4} textAnchor="middle" fontSize="8" fill={B.textLt}>{d.label}</text>:null;})}
      {line(daily.map(d=>d.views),mxV,B.accent)}
      {line(daily.map(d=>d.reach),mxR,B.green)}
      <circle cx={pL+6} cy={H-18} r="3.5" fill={B.accent}/><text x={pL+14} y={H-14} fontSize="9" fill={B.text}>Views</text>
      <circle cx={pL+56} cy={H-18} r="3.5" fill={B.green}/><text x={pL+64} y={H-14} fontSize="9" fill={B.text}>Reach</text>
    </svg>
  );
}

export default function Dashboard() {
  const posts = useMemo(() => parseData(RAW_CSV).sort((a,b)=>b.date-a.date), []);

  const now = new Date();
  const d14 = new Date(now); d14.setDate(d14.getDate()-14);
  const d28 = new Date(now); d28.setDate(d28.getDate()-28);

  const recent = posts.filter(p=>p.date>=d14);
  const older = posts.filter(p=>p.date>=d28&&p.date<d14);

  const sum=(a,k)=>a.reduce((s,p)=>s+p[k],0);
  const avg=(a,k)=>a.length?sum(a,k)/a.length:0;

  const tV=sum(recent,"views"),pV=sum(older,"views");
  const tR=sum(recent,"reach"),pR=sum(older,"reach");
  const tI=sum(recent,"interactions"),pI=sum(older,"interactions");
  const tF=sum(recent,"follows"),pF=sum(older,"follows");
  const tS=sum(recent,"shares"),pS=sum(older,"shares");
  const engR=tR>0?(tI/tR)*100:0;
  const pEngR=pR>0?(pI/pR)*100:0;

  const allPosts = posts;
  const top5=[...allPosts].sort((a,b)=>b.views-a.views).slice(0,5);
  const avgV=avg(allPosts,"views");

  const dailyMap={};
  allPosts.forEach(p=>{
    const k=p.date.toISOString().slice(0,10);
    if(!dailyMap[k]) dailyMap[k]={views:0,reach:0};
    dailyMap[k].views+=p.views;
    dailyMap[k].reach+=p.reach;
  });
  const daily=Object.keys(dailyMap).sort().map(k=>({label:k.slice(5),views:dailyMap[k].views,reach:dailyMap[k].reach}));
  const last7=daily.slice(-7);

  const reels=allPosts.filter(p=>p.productType==="REELS").length;
  const carousels=allPosts.filter(p=>p.productType==="FEED").length;

  const nudges=(()=>{
    const n=[];
    const vc=pct(tV,pV);
    if(vc<-10) n.push("Views down "+Math.abs(vc).toFixed(0)+"% vs last 2 weeks. Test new hooks in your first 1-2 seconds, that opening frame is everything.");
    else if(vc>10) n.push("Views up "+vc.toFixed(0)+"%, the momentum is real. Keep the daily cadence going, it's compounding.");

    if(pct(tR,pR)<-10) n.push("Reach dipped. Try trending audio or a text hook overlay to push into Explore.");

    if(engR>5) n.push("Engagement rate strong at "+engR.toFixed(1)+"%. Perfect time to drop a CTA or lead magnet in your next post.");
    else if(engR<3) n.push("Engagement at "+engR.toFixed(1)+"%, try asking a direct question in captions to spark comments.");

    const bestPost = top5[0];
    if(bestPost && bestPost.views > avgV*2) n.push(`"${bestPost.caption.slice(0,40)}..." crushed it at ${fmt(bestPost.views)} views. Study what made that hook work and replicate the pattern.`);

    const shareRate=tR>0?(tS/tR)*100:0;
    if(shareRate>0.8) n.push("Share rate is healthy, people are forwarding your stuff. Lean into shareable formats.");

    if(!n.length) n.push("Steady performance. Keep the daily posts going, consistency compounds. Maybe try a carousel this week.");
    return n.slice(0,3);
  })();

  return (
    <div style={{background:B.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",padding:"20px 16px",color:B.text}}>
      <div style={{background:B.card,borderRadius:10,padding:"8px 14px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",border:`1px solid ${B.border}`,fontSize:11}}>
        <div><span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:B.green,marginRight:6,animation:"pulse 2s infinite"}}/>Data from Google Drive</div>
        <div style={{color:B.textLt}}>Snapshot: {now.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:B.accent,marginBottom:3}}>System Ghosts</div>
        <h1 style={{margin:0,fontSize:20,fontWeight:800}}>Instagram Morning Brief ☀️</h1>
        <div style={{fontSize:11,color:B.textLt,marginTop:3}}>{allPosts.length} posts · {reels} Reels · {carousels} Carousels · Apr–May 2026</div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <Card label="Views (14d)" value={fmt(tV)} change={pct(tV,pV)}/>
        <Card label="Reach (14d)" value={fmt(tR)} change={pct(tR,pR)}/>
        <Card label="Interactions" value={fmt(tI)} change={pct(tI,pI)}/>
        <Card label="Shares" value={fmt(tS)} change={pct(tS,pS)}/>
        <Card label="Eng. Rate" value={engR.toFixed(1)+"%"} change={engR-pEngR}/>
      </div>

      <div style={{display:"flex",gap:14,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:"1.3 1 320px",background:B.card,borderRadius:14,padding:16,boxShadow:"0 2px 12px rgba(108,92,231,.07)",border:`1px solid ${B.border}`,overflow:"auto"}}>
          <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:800}}>🏆 Top 5 Posts (All Time)</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:`2px solid ${B.border}`}}>
              <th style={{textAlign:"left",padding:"5px 6px",color:B.textLt,fontWeight:700}}>Post</th>
              <th style={{textAlign:"right",padding:"5px 6px",color:B.textLt,fontWeight:700}}>Views</th>
              <th style={{textAlign:"right",padding:"5px 6px",color:B.textLt,fontWeight:700}}>Reach</th>
              <th style={{textAlign:"right",padding:"5px 6px",color:B.textLt,fontWeight:700}}>Eng</th>
              <th style={{textAlign:"right",padding:"5px 6px",color:B.textLt,fontWeight:700}}>Shares</th>
            </tr></thead>
            <tbody>{top5.map((p,i)=>{
              const above=p.views>=avgV;
              const cap=p.caption.slice(0,45)+(p.caption.length>45?"...":"");
              return(
                <tr key={i} style={{borderBottom:`1px solid ${B.border}`}}>
                  <td style={{padding:"8px 6px",maxWidth:180}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:above?B.green:B.amber,flexShrink:0}}/>
                      <div>
                        <div style={{fontWeight:600,lineHeight:1.3,fontSize:11}}>{cap}</div>
                        <div style={{fontSize:9,color:B.textLt,marginTop:1}}>{p.productType} · {p.date.toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{textAlign:"right",padding:"8px 6px",fontWeight:700}}>{fmt(p.views)}</td>
                  <td style={{textAlign:"right",padding:"8px 6px"}}>{fmt(p.reach)}</td>
                  <td style={{textAlign:"right",padding:"8px 6px"}}>{p.reach>0?((p.interactions/p.reach)*100).toFixed(1)+"%":"—"}</td>
                  <td style={{textAlign:"right",padding:"8px 6px"}}>{p.shares}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>

        <div style={{flex:"1 1 280px",background:B.card,borderRadius:14,padding:16,boxShadow:"0 2px 12px rgba(108,92,231,.07)",border:`1px solid ${B.border}`}}>
          <h3 style={{margin:"0 0 3px",fontSize:14,fontWeight:800}}>📈 Daily Trend</h3>
          <div style={{fontSize:10,color:B.textLt,marginBottom:12}}>Views & Reach by day</div>
          <Chart daily={daily}/>
          {last7.length>1&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,color:B.textLt,fontWeight:600,marginBottom:4}}>7-day sparkline (views)</div>
              <Spark data={last7.map(d=>d.views)} color={B.accent}/>
            </div>
          )}
        </div>
      </div>

      <div style={{background:`linear-gradient(135deg,${B.accent}0D,${B.accentLt}0D)`,borderRadius:14,padding:18,border:`1px solid ${B.accent}1A`}}>
        <h3 style={{margin:"0 0 10px",fontSize:14,fontWeight:800,color:B.accent}}>🎯 What to Focus on Today</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {nudges.map((n,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:12,lineHeight:1.5}}>
              <span style={{background:B.accent,color:"#fff",borderRadius:5,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,flexShrink:0,marginTop:1}}>{i+1}</span>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{textAlign:"center",marginTop:16,fontSize:10,color:B.textLt}}>
        Data pulled via Google Drive connector
      </div>
    </div>
  );
}
