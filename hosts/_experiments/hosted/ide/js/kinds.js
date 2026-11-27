/* The kinds of item a solution holds: label, icon, colour, stored form, tool. WORD says what each tool is called. */
'use strict';

const K={
solution:['Solution','cube','blue'],area:['Area','folder','muted'],group:['Group','folder','muted'],
source:['Data source','plug','teal','.source.yaml','form'],
pipeline:['Data pipeline','flow','green',['pipeline.did','mapping.yaml','transform.sql'],'flow'],
schema:['Schema','braces','yellow','.schema.json','schema'],
entity:['Entity type','shapes','purple','@','entity'],
ontology:['Ontology model','graph','purple',['model.did','shapes.ttl'],'onto'],
vocabulary:['Vocabulary','list','purple','.skos.ttl','code'],
model:['AI model','chip','orange',['model.ded','evaluation.yaml'],'form'],
prompt:['Prompt','chat','orange','.prompt.md','code'],
agent:['Agent','bot','orange',['agent.ded','instructions.md','tools.yaml'],'form'],
evalset:['Evaluation set','beaker','orange','.eval.jsonl','check'],
dashboard:['Analysis view','chart','blue',['view.ded','queries.sql'],'dash'],
notebook:['Notebook','notebook','blue','.ipynb','code'],
page:['Web page','window','teal',['page.ded','page.html','page.css'],'page'],
theme:['Theme','palette','teal','.theme.json','form'],
component:['Component','puzzle','purple',['component.ded','component.tsx','component.css'],'form'],
release:['Release pipeline','rocket','red',['pipeline.did','stages.yaml'],'flow'],
environment:['Environment','server','red','.env.yaml','form'],
testsuite:['Test suite','check','green',['suite.yaml','cases.jsonl'],'check'],
procedure:['Validation procedure','clipboard','green','.procedure.ded','check'],
doc:['Document','doc','muted','.md','doc'],code:['Query','code','yellow','.sql','code'],file:['File','file','muted']};
const WORD={flow:'Diagram',onto:'Diagram',entity:'Designer',schema:'Designer',form:'Designer',check:'Designer',dash:'Designer',page:'Designer',code:'Editor',doc:'Editor'};
