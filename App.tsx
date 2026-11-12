import { useState } from 'react';
import { Clapperboard, Image, Mic2, Users, FolderHeart, Sparkles, Download, WandSparkles, LoaderCircle, AlertTriangle, Film, Languages, CircleHelp } from 'lucide-react';
import type { StoryResult } from './types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

const sample = 'एक छोटे से गाँव में मोहन नाम का एक गरीब लड़का रहता था। एक दिन उसे जंगल में एक घायल सफेद खरगोश मिला। मोहन ने उसकी मदद की। कुछ दिनों बाद वही खरगोश मोहन की जान बचाता है। अंत में दोनों अच्छे दोस्त बन जाते हैं।';

export default function App(){
  const [story,setStory]=useState('');
  const [scenes,setScenes]=useState('4');
  const [ratio,setRatio]=useState('9:16');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [result,setResult]=useState<StoryResult|null>(null);
  const [tab,setTab]=useState('movie');
  const [status,setStatus]=useState('');

  async function generate(){
    if(!story.trim()){setError('पहले अपनी कहानी लिखें।');return;}
    if(busy)return;
    setBusy(true);setError('');setResult(null);setStatus('कहानी को Scenes में बदला जा रहा है…');
    try{
      const response=await fetch(`${API_BASE}/api/story`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({story,sceneCount:Number(scenes),language:'hi',aspectRatio:ratio})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || 'कहानी तैयार नहीं हो सकी।');
      setResult(data);setStatus('स्क्रिप्ट तैयार है। अब हर Scene की Image बनाई जा सकती है।');
    }catch(e){setError(e instanceof Error?e.message:'अनजान त्रुटि हुई।');setStatus('');}
    finally{setBusy(false);}
  }

  async function providerStatus(kind:'image'|'video'|'voice'){
    setError('');
    try{const r=await fetch(`${API_BASE}/api/providers/${kind}`);const d=await r.json();setStatus(d.message);}
    catch{setError('Server से संपर्क नहीं हो पाया।');}
  }

  return <div className="app-shell">
    <header className="topbar"><div className="brand-mark"><Clapperboard size={25}/></div><div className="brand"><b>MASTI <span>AI</span> STUDIO</b><small>Story se Movie tak</small></div><button className="language"><Languages size={17}/> हिंदी</button></header>
    <main>
      <section className="hero"><div className="eyebrow"><Sparkles size={15}/> YOUR STORY. YOUR MOVIE.</div><h1>अपनी कहानी को<br/><span>कार्टून मूवी</span> बनाइए</h1><p>पहले कहानी की स्क्रिप्ट और Scenes तैयार करें। फिर असली AI Image, Voice और Video सेवाएँ जोड़कर Movie बनाएं।</p><div className="hero-tags"><span>3D Cartoon</span><span>Hindi Voice</span><span>MP4 Movie</span></div></section>
      <section className="workspace">
        <div className="section-heading"><div><small>CREATE NEW PROJECT</small><h2><WandSparkles size={21}/> मूवी मेकर</h2></div><span className="step">STEP 01 / 04</span></div>
        <label className="field-label" htmlFor="story">अपनी कहानी लिखें</label>
        <textarea id="story" value={story} onChange={e=>setStory(e.target.value)} placeholder="यहाँ अपनी कहानी हिंदी या English में लिखें…" rows={6}/>
        <div className="sample-row"><button className="text-button" onClick={()=>setStory(sample)}>उदाहरण कहानी भरें</button><span>{story.length} characters</span></div>
        <div className="settings-grid"><label>Scene की संख्या<select value={scenes} onChange={e=>setScenes(e.target.value)}><option value="4">4 Scenes</option><option value="8">8 Scenes</option><option value="12">12 Scenes</option></select></label><label>Video Format<select value={ratio} onChange={e=>setRatio(e.target.value)}><option>9:16</option><option>16:9</option><option>1:1</option></select></label></div>
        <button className="primary-button" onClick={generate} disabled={busy}>{busy?<><LoaderCircle className="spin"/> स्क्रिप्ट तैयार हो रही है…</>:<><Sparkles size={19}/> कहानी से Script बनाएं</>}</button>
        {status&&<div className="status"><Sparkles size={16}/>{status}</div>}
        {error&&<div className="error"><AlertTriangle size={17}/>{error}</div>}
      </section>
      {result&&<section className="results"><div className="result-title"><div><small>GENERATED SCRIPT</small><h2>{result.title}</h2></div><button className="icon-button" onClick={()=>navigator.clipboard?.writeText(JSON.stringify(result,null,2))}><Download size={17}/></button></div><p className="summary">{result.summary}</p><h3>मुख्य पात्र</h3><div className="character-list">{result.characters.map((c,i)=><div className="character" key={i}><Users size={18}/><div><b>{c.name}</b><small>{c.description} · आवाज़: {c.voice}</small></div></div>)}</div><h3>आपके Scenes</h3>{result.scenes.map(s=><article className="scene" key={s.sceneNumber}><div className="scene-head"><b>SCENE {s.sceneNumber}</b><span>{s.title}</span></div><p>{s.visualDescription}</p><div className="prompt"><b>IMAGE PROMPT</b><p>{s.imagePrompt}</p></div><div className="prompt"><b>VIDEO PROMPT</b><p>{s.videoPrompt}</p></div><div className="dialogue">“{s.dialogue}”</div><small className="narration">Narration: {s.narration}</small></article>)}</section>}
      <section className="tools"><div className="section-heading"><div><small>NEXT CREATION TOOLS</small><h2>AI Studio</h2></div></div><div className="tool-grid"><button onClick={()=>providerStatus('image')}><Image/><b>3D Cartoon Image</b><small>AI Image Provider</small></button><button onClick={()=>providerStatus('voice')}><Mic2/><b>Hindi Voice</b><small>Text-to-Speech</small></button><button onClick={()=>providerStatus('video')}><Film/><b>AI Video</b><small>Image-to-Video</small></button><button onClick={()=>setTab('projects')}><FolderHeart/><b>My Projects</b><small>Saved scripts</small></button></div></section>
      <section className="honesty"><CircleHelp size={18}/><p><b>स्पष्ट जानकारी:</b> अभी इस शुरुआती Version में Script Generator Gemini API से जुड़ता है। Image, Voice और Video के लिए provider credentials और अलग integration चाहिए। कोई नकली generated media नहीं दिखाया जाएगा।</p></section>
    </main>
    <nav className="bottom-nav"><button className={tab==='movie'?'active':''} onClick={()=>setTab('movie')}><Clapperboard/><span>मूवी मेकर</span></button><button onClick={()=>providerStatus('image')}><Image/><span>3D कार्टून</span></button><button onClick={()=>providerStatus('voice')}><Mic2/><span>आवाज़</span></button><button className={tab==='projects'?'active':''} onClick={()=>setTab('projects')}><FolderHeart/><span>मेरे प्रोजेक्ट</span></button></nav>
  </div>
}
