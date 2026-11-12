import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app=express();
app.use(cors());
app.use(express.json({limit:'1mb'}));
const __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname,'../dist')));
const port=Number(process.env.PORT||8787);
const requestSchema=z.object({story:z.string().min(20).max(12000),sceneCount:z.number().int().min(4).max(20),language:z.enum(['hi','en']),aspectRatio:z.enum(['9:16','16:9','1:1'])});
app.get('/api/health',(_req,res)=>res.json({ok:true,app:'MASTI AI STUDIO',phase:'story-generator'}));
app.get('/api/providers/:kind',(req,res)=>{
 const kind=req.params.kind;
 if(!['image','video','voice'].includes(kind)) return res.status(404).json({error:'Unknown provider.'});
 const configured=kind==='image'?Boolean(process.env.FAL_KEY&&process.env.FAL_IMAGE_MODEL):kind==='video'?Boolean(process.env.FAL_KEY&&process.env.FAL_VIDEO_MODEL):false;
 res.json({configured,message:configured?`${kind} provider credentials are configured; integration still requires endpoint validation.`:`${kind.toUpperCase()} generation is not enabled yet. Provider credentials and a tested model integration are required. No fake media will be generated.`});
});
app.post('/api/story',async(req,res)=>{
 const parsed=requestSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({error:'कहानी कम से कम 20 अक्षरों की होनी चाहिए और Scene संख्या 4 से 20 के बीच होनी चाहिए।'});
 if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:'Gemini API Key सेट नहीं है। Server की .env फाइल में GEMINI_API_KEY जोड़ें; कोई नकली AI परिणाम नहीं दिखाया जाएगा।'});
 try{
  const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
  const {story,sceneCount,language,aspectRatio}=parsed.data;
  const prompt=`You are a professional 3D animated film screenwriter. Convert the user's story into exactly ${sceneCount} coherent scenes. Language: ${language==='hi'?'Hindi':'English'}. Target video aspect ratio: ${aspectRatio}. Preserve character consistency. Return ONLY valid JSON with this exact shape: {"title":"string","summary":"string","characters":[{"name":"string","description":"string","voice":"string"}],"scenes":[{"sceneNumber":1,"title":"string","visualDescription":"string","imagePrompt":"detailed cinematic 3D cartoon image prompt, no text in image","videoPrompt":"specific motion and camera prompt for image-to-video","dialogue":"short spoken dialogue","narration":"voiceover narration"}]}. The scenes array must contain exactly ${sceneCount} items. Do not include markdown fences. User story:\n${story}`;
  const response=await ai.models.generateContent({model:process.env.GEMINI_TEXT_MODEL||'gemini-2.5-flash',contents:prompt,config:{responseMimeType:'application/json',temperature:0.7}});
  const raw=response.text||'';
  const clean=raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const data=JSON.parse(clean);
  if(!Array.isArray(data.scenes)||data.scenes.length!==sceneCount)throw new Error('AI ने अपेक्षित Scene संख्या नहीं लौटाई। दोबारा कोशिश करें।');
  res.json(data);
 }catch(error){
  console.error('story_generation_error',error);
  const message=error instanceof Error?error.message:'AI सेवा में अनजान त्रुटि हुई।';
  res.status(502).json({error:`कहानी तैयार नहीं हुई: ${message}`});
 }
});
app.get('*splat',(_req,res,next)=>{ if(_req.path.startsWith('/api/')) return next(); res.sendFile(path.resolve(__dirname,'../dist/index.html')); });
app.listen(port,()=>console.log(`MASTI AI STUDIO API listening on ${port}`));
