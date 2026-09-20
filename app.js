import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

/* Paste your Firebase web config here. See SETUP.md. */
const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
const app = initializeApp(firebaseConfig), db = getFirestore(app);
const CARDS = ["Elephant","Guitar","Swimming","Pizza","Superhero","Monkey","Dancing","Astronaut","Toothbrush","Roller coaster","Basketball","Rainstorm","Detective","Popcorn","Sleeping","Robot","Dragon","Skiing","Firefighter","Birthday cake","Penguin","Surfing","Magic trick","Photographer","Zombie","Camping","Helicopter","Chef","Tennis","Haunted house","Pirate","Lighthouse","Bowling","Ice skating","Juggling","Vampire","Gardening","Pilot","Treasure hunt","Disco dancing","Alien","Mountain climbing","Movie theater","Snorkeling","Cowboy","Wedding","Pancakes","Yoga","Race car","Supermarket","Mermaid","Fishing","Doctor","Karate","Beach volleyball","Snowman","Detective","Playing drums","Roller skating","Lion","Flying a kite","Building a sandcastle","Traffic jam","Birthday party","Ghost","Rock star","Making a sandwich","Camping tent","Bus driver","Photobooth","Dragonfly","Washing a car","Doing homework","Playing chess","Lost tourist","Ice cream truck","Fireworks","News reporter","Baking a cake","Gardener","Treasure chest","Window washer","Singing opera","Space station","Traffic cop","Tornado","Librarian","Making coffee","Puppet show","Mountain biker","Time traveler","Escape room","Riding a camel","Opening a stubborn jar","Invisible person","Robot vacuum","Walking on the moon","Airport security","Video game boss","Photographer hiding from paparazzi"];
let roomId="", me="", myTeam="", unsub=null, state=null, localTimer=null;

const $=id=>document.getElementById(id);
window.show=function(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active')};
function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function toast(s){const t=$('toast');t.textContent=s;t.style.display='block';setTimeout(()=>t.style.display='none',1800)}
function roomRef(){return doc(db,"rooms",roomId)}
window.createGame=async function(){
  me=$('hostName').value.trim(); if(!me) return toast("Enter your name");
  roomId=code(); myTeam=""; const shuffled=[...CARDS].sort(()=>Math.random()-.5);
  await setDoc(roomRef(),{host:me,players:[{name:me,team:"",host:true}],teamA:[],teamB:[],scoreA:0,scoreB:0,turn:"A",started:false,cardIndex:0,card:"",deck:shuffled,timerEnd:0});
  watch(); show("lobby");
};
window.joinGame=async function(){
  me=$('joinName').value.trim(); roomId=$('roomCode').value.trim().toUpperCase();
  if(!me||!roomId) return toast("Enter your name and room code");
  const snap=await getDoc(roomRef()); if(!snap.exists()){$('joinError').textContent="Room not found.";return}
  const players=[...(snap.data().players||[])];
  if(!players.some(p=>p.name===me)) players.push({name:me,team:"",host:false});
  await updateDoc(roomRef(),{players}); watch(); show("lobby");
};
function watch(){
  if(unsub) unsub(); $('roomLabel').textContent=roomId;
  unsub=onSnapshot(roomRef(),snap=>{if(!snap.exists())return;state=snap.data();render();});
}
async function pickTeam(t){
  myTeam=t;
  const players=(state.players||[]).map(p=>p.name===me?{...p,team:t}:p);
  const teamA=players.filter(p=>p.team==="A").map(p=>p.name);
  const teamB=players.filter(p=>p.team==="B").map(p=>p.name);
  await updateDoc(roomRef(),{players,teamA,teamB});
}
async function startGame(){
  if(!state || !state.teamA?.length || !state.teamB?.length) return;
  const deck=state.deck||[...CARDS].sort(()=>Math.random()-.5);
  await updateDoc(roomRef(),{started:true,turn:"A",turnIndexA:0,turnIndexB:0,cardIndex:0,card:"",timerEnd:0,deck});
}
function render(){
  if(!state)return;
  const players=state.players||[];
  $('countA').textContent=state.teamA?.length||0;$('countB').textContent=state.teamB?.length||0;
  $('players').innerHTML=players.map(p=>`<span class="player">${esc(p.name)} ${p.team?`· TEAM ${p.team}`:"· PICK A TEAM"}</span>`).join("");
  const meP=players.find(p=>p.name===me); if(meP) myTeam=meP.team||myTeam;
  $('startBtn').disabled=!(state.teamA?.length&&state.teamB?.length);
  if(state.started){show("game");renderGame();} else if($('lobby').classList.contains('active')){}
}
function renderGame(){
  $('scoreA').textContent=state.scoreA||0;$('scoreB').textContent=state.scoreB||0;
  const actorTeam=state.turn;
  const teamPlayers=state[actorTeam==="A"?"teamA":"teamB"]||[];
  const actorIndex=state[actorTeam==="A"?"turnIndexA":"turnIndexB"]||0;
  const actor=teamPlayers.length ? teamPlayers[actorIndex % teamPlayers.length] : "";
  $('turnText').textContent=actor ? `TEAM ${actorTeam} TURN • ${actor}` : `TEAM ${actorTeam} TURN`;
  const isActor=me===actor;
  $('showBtn').style.display=isActor?"inline-block":"none";
  $('word').textContent=state.card && isActor?state.card:"READY?";
  $('cardNumber').textContent=state.card?`CARD ${(state.cardIndex||0)+1}`:"CARD";
  if(state.timerEnd && Date.now()<state.timerEnd) startTicker(); else if(state.timerEnd && Date.now()>=state.timerEnd) expireTimer();
}
let tickerStarted=false;
function startTicker(){
 if(tickerStarted)return; tickerStarted=true;
 const tick=()=>{const n=Math.max(0,Math.ceil((state.timerEnd-Date.now())/1000));$('timer').textContent=n;if(n<=0){tickerStarted=false;expireTimer();}else requestAnimationFrame(tick)};tick();
}
async function expireTimer(){
 if(!state.timerEnd||Date.now()<state.timerEnd)return;
 if(state.timerEnd!==0) await updateDoc(roomRef(),{timerEnd:0,card:""}).catch(()=>{});
}
window.showCard=async function(){
 const teamPlayers=state[state.turn==="A"?"teamA":"teamB"]||[];
 const actorIndex=state[state.turn==="A"?"turnIndexA":"turnIndexB"]||0;
 const actor=teamPlayers.length?teamPlayers[actorIndex%teamPlayers.length]:"";
 if(me!==actor) return toast("You are not this round's actor");
 const card=state.deck[state.cardIndex%state.deck.length];
 await updateDoc(roomRef(),{card,timerEnd:Date.now()+60000});
};
window.skipCard=async function(){
 const teamPlayers=state[state.turn==="A"?"teamA":"teamB"]||[];
 const actorIndex=state[state.turn==="A"?"turnIndexA":"turnIndexB"]||0;
 const actor=teamPlayers.length?teamPlayers[actorIndex%teamPlayers.length]:"";
 if(me!==actor) return toast("Only the actor controls the card");
 const next=(state.cardIndex+1)%state.deck.length; await updateDoc(roomRef(),{card:state.deck[next],cardIndex:next});
};
window.gotPoint=async function(){
 const teamPlayers=state[state.turn==="A"?"teamA":"teamB"]||[];
 const actorIndex=state[state.turn==="A"?"turnIndexA":"turnIndexB"]||0;
 const actor=teamPlayers.length?teamPlayers[actorIndex%teamPlayers.length]:"";
 if(me!==actor) return toast("Only the actor controls the round");
 const key=state.turn==="A"?"scoreA":"scoreB", score=(state[key]||0)+1;
 const nextTurn=state.turn==="A"?"B":"A", next=(state.cardIndex+1)%state.deck.length;
 const currentIndex=actorIndex;
 const indexField=state.turn==="A"?"turnIndexA":"turnIndexB";
 const nextIndex=teamPlayers.length ? (currentIndex+1)%teamPlayers.length : 0;
 await updateDoc(roomRef(),{[key]:score,turn:nextTurn,card:"",timerEnd:0,cardIndex:next,[indexField]:nextIndex});
};
window.copyRoom=()=>navigator.clipboard.writeText(roomId).then(()=>toast("Room code copied"));
window.newGame=()=>{roomId="";state=null;myTeam="";show("home")};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
