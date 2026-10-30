const express=require("express");
const path=require("path");
const {analyzeBusiness}=require("./agent");
const app=express();const PORT=Number(process.env.PORT||3000);app.use(express.json());app.use(express.static(path.join(__dirname,"public")));
const memory=[];
app.get("/api/health",(_req,res)=>res.json({ok:true,service:"google-profile-agent"}));
app.get("/api/empresas",(_req,res)=>res.json(memory));
app.post("/api/empresas",(req,res)=>{try{const business={id:Date.now().toString(),...req.body,created_at:new Date().toISOString()};const analysis=analyzeBusiness(business);const record={business,analysis,suggestions:[{type:"description",title:"Descrição sugerida",content:analysis.description,status:"pending"},{type:"keywords",title:"Palavras-chave sugeridas",content:analysis.keywords.join(", "),status:"pending"},...analysis.recommendations.map((x)=>({type:"recommendation",title:x.item,content:x.action,status:"pending"}))]};memory.unshift(record);res.status(201).json(record);}catch(e){res.status(400).json({error:e.message});}});
app.get("/api/empresas/:id/analise",(req,res)=>{const x=memory.find((r)=>r.business.id===req.params.id);if(!x)return res.status(404).json({error:"Empresa não encontrada"});res.json(x);});
app.patch("/api/empresas/:id/sugestoes/:index",(req,res)=>{const x=memory.find((r)=>r.business.id===req.params.id);const i=Number(req.params.index);if(!x||!x.suggestions[i])return res.status(404).json({error:"Sugestão não encontrada"});if(!["pending","approved","rejected"].includes(req.body?.status))return res.status(400).json({error:"Status inválido"});x.suggestions[i].status=req.body.status;res.json(x.suggestions[i]);});
module.exports=app;

