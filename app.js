


import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

/*
  GRID & GO CHARADES
  Firebase + multiplayer + player rotation
*/

const firebaseConfig = {
  apiKey: "AIzaSyAp098JW_TkCDEdn1YsXK-nBJIYIsc0uw",
  authDomain: "charades-2.firebaseapp.com",
  projectId: "charades-2",
  storageBucket: "charades-2.firebasestorage.app",
  messagingSenderId: "986466673232",
  appId: "1:986466673232:web:6d7acb993e364f56676755",
  measurementId: "G-HWJGFP4TWM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CARDS = [
  "Elephant",
  "Guitar",
  "Swimming",
  "Pizza",
  "Superhero",
  "Monkey",
  "Dancing",
  "Astronaut",
  "Toothbrush",
  "Roller coaster",
  "Basketball",
  "Rainstorm",
  "Detective",
  "Popcorn",
  "Sleeping",
  "Robot",
  "Dragon",
  "Skiing",
  "Firefighter",
  "Birthday cake",
  "Penguin",
  "Surfing",
  "Magic trick",
  "Photographer",
  "Zombie",
  "Camping",
  "Helicopter",
  "Chef",
  "Tennis",
  "Haunted house",
  "Pirate",
  "Lighthouse",
  "Bowling",
  "Ice skating",
  "Juggling",
  "Vampire",
  "Gardening",
  "Pilot",
  "Treasure hunt",
  "Disco dancing",
  "Alien",
  "Mountain climbing",
  "Movie theater",
  "Snorkeling",
  "Cowboy",
  "Wedding",
  "Pancakes",
  "Yoga",
  "Race car",
  "Supermarket",
  "Mermaid",
  "Fishing",
  "Doctor",
  "Karate",
  "Beach volleyball",
  "Snowman",
  "Playing drums",
  "Roller skating",
  "Lion",
  "Flying a kite",
  "Building a sandcastle",
  "Traffic jam",
  "Birthday party",
  "Ghost",
  "Rock star",
  "Making a sandwich",
  "Camping tent",
  "Bus driver",
  "Photobooth",
  "Dragonfly",
  "Washing a car",
  "Doing homework",
  "Playing chess",
  "Lost tourist",
  "Ice cream truck",
  "Fireworks",
  "News reporter",
  "Baking a cake",
  "Gardener",
  "Treasure chest",
  "Window washer",
  "Singing opera",
  "Space station",
  "Traffic cop",
  "Tornado",
  "Librarian",
  "Making coffee",
  "Puppet show",
  "Mountain biker",
  "Time traveler",
  "Escape room",
  "Riding a camel",
  "Opening a stubborn jar",
  "Invisible person",
  "Robot vacuum",
  "Walking on the moon",
  "Airport security",
  "Video game boss",
  "Photographer hiding from paparazzi"
];

let roomId = "";
let me = "";
let myTeam = "";
let unsub = null;
let state = null;
let tickerStarted = false;

/* -------------------------
   BASIC HELPERS
------------------------- */

function $(id) {
  return document.getElementById(id);
}

function code() {
  return Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();
}

function toast(message) {
  const t = $("toast");

  if (!t) {
    alert(message);
    return;
  }

  t.textContent = message;
  t.style.display = "block";

  setTimeout(() => {
    t.style.display = "none";
  }, 1800);
}

function roomRef() {
  return doc(db, "rooms", roomId);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character];
  });
}

/* -------------------------
   SCREEN NAVIGATION
------------------------- */

window.show = function(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = $(id);

  if (target) {
    target.classList.add("active");
  }
};

/* -------------------------
   CREATE GAME
------------------------- */

window.createGame = async function() {
  try {
    const nameInput = $("hostName");

    me = nameInput.value.trim();

    if (!me) {
      toast("Enter your name first");
      return;
    }

    roomId = code();
    myTeam = "";

    const shuffledDeck = [...CARDS].sort(() => Math.random() - 0.5);

    await setDoc(roomRef(), {
      host: me,

      players: [
        {
          name: me,
          team: "",
          host: true
        }
      ],

      teamA: [],
      teamB: [],

      scoreA: 0,
      scoreB: 0,

      turn: "A",

      started: false,

      cardIndex: 0,
      card: "",

      deck: shuffledDeck,

      timerEnd: 0,

      turnIndexA: 0,
      turnIndexB: 0
    });

    watchRoom();

    $("roomLabel").textContent = roomId;

    window.show("lobby");

  } catch (error) {
    console.error(error);
    toast("Could not create game. Check Firebase.");
  }
};

/* -------------------------
   JOIN GAME
------------------------- */

window.joinGame = async function() {
  try {
    const nameInput = $("joinName");
    const roomInput = $("roomCode");

    me = nameInput.value.trim();
    roomId = roomInput.value.trim().toUpperCase();

    if (!me) {
      toast("Enter your name first");
      return;
    }

    if (!roomId) {
      toast("Enter the room code");
      return;
    }

    const snap = await getDoc(roomRef());

    if (!snap.exists()) {
      $("joinError").textContent = "Room not found.";
      return;
    }

    const data = snap.data();

    const players = [...(data.players || [])];

    const alreadyJoined = players.some(
      player => player.name.toLowerCase() === me.toLowerCase()
    );

    if (!alreadyJoined) {
      players.push({
        name: me,
        team: "",
        host: false
      });

      await updateDoc(roomRef(), {
        players
      });
    }

    watchRoom();

    $("roomLabel").textContent = roomId;

    window.show("lobby");

  } catch (error) {
    console.error(error);
    toast("Could not join game. Check the room code.");
  }
};

/* -------------------------
   WATCH FIREBASE ROOM
------------------------- */

function watchRoom() {
  if (unsub) {
    unsub();
  }

  if ($("roomLabel")) {
    $("roomLabel").textContent = roomId;
  }

  unsub = onSnapshot(
    roomRef(),
    snapshot => {

      if (!snapshot.exists()) {
        toast("Game room no longer exists");
        return;
      }

      state = snapshot.data();

      render();
    },

    error => {
      console.error(error);
      toast("Firebase connection problem");
    }
  );
}

/* -------------------------
   PICK TEAM
------------------------- */

window.pickTeam = async function(team) {

  try {

    if (!state) {
      toast("Please create or join a game first");
      return;
    }

    if (state.started) {
      toast("The game has already started");
      return;
    }

    myTeam = team;

    const players = (state.players || []).map(player => {

      if (player.name === me) {
        return {
          ...player,
          team: team
        };
      }

      return player;
    });

    const teamA = players
      .filter(player => player.team === "A")
      .map(player => player.name);

    const teamB = players
      .filter(player => player.team === "B")
      .map(player => player.name);

    await updateDoc(roomRef(), {
      players,
      teamA,
      teamB
    });

    toast(`You joined Team ${team}`);

  } catch (error) {
    console.error(error);
    toast("Could not choose team");
  }
};

/* -------------------------
   START GAME
------------------------- */

window.startGame = async function() {

  try {

    if (!state) {
      toast("Game is not ready");
      return;
    }

    const teamA = state.teamA || [];
    const teamB = state.teamB || [];

    if (teamA.length === 0) {
      toast("Team A needs a player");
      return;
    }

    if (teamB.length === 0) {
      toast("Team B needs a player");
      return;
    }

    const deck =
      state.deck && state.deck.length
        ? state.deck
        : [...CARDS].sort(() => Math.random() - 0.5);

    await updateDoc(roomRef(), {

      started: true,

      turn: "A",

      turnIndexA: 0,
      turnIndexB: 0,

      cardIndex: 0,

      card: "",

      timerEnd: 0,

      deck
    });

  } catch (error) {
    console.error(error);
    toast("Could not start game");
  }
};

/* -------------------------
   RENDER LOBBY
------------------------- */

function render() {

  if (!state) {
    return;
  }

  const players = state.players || [];

  $("countA").textContent =
    (state.teamA || []).length;

  $("countB").textContent =
    (state.teamB || []).length;

  $("players").innerHTML = players
    .map(player => {

      const teamText = player.team
        ? `· TEAM ${player.team}`
        : "· PICK A TEAM";

      return `
        <span class="player">
          ${escapeHTML(player.name)} ${teamText}
        </span>
      `;
    })
    .join("");

  const mePlayer = players.find(
    player => player.name === me
  );

  if (mePlayer) {
    myTeam = mePlayer.team || myTeam;
  }

  const canStart =
    (state.teamA || []).length > 0 &&
    (state.teamB || []).length > 0;

  $("startBtn").disabled = !canStart;

  if (state.started) {

    window.show("game");

    renderGame();

  } else {

    window.show("lobby");
  }
}

/* -------------------------
   RENDER GAME
------------------------- */

function renderGame() {

  $("scoreA").textContent =
    state.scoreA || 0;

  $("scoreB").textContent =
    state.scoreB || 0;

  const activeTeam = state.turn || "A";

  const teamPlayers =
    activeTeam === "A"
      ? state.teamA || []
      : state.teamB || [];

  const index =
    activeTeam === "A"
      ? state.turnIndexA || 0
      : state.turnIndexB || 0;

  const actor =
    teamPlayers.length
      ? teamPlayers[index % teamPlayers.length]
      : "";

  if (actor) {

    $("turnText").textContent =
      `TEAM ${activeTeam} TURN • ${actor}`;

  } else {

    $("turnText").textContent =
      `TEAM ${activeTeam} TURN`;
  }

  const isActor = me === actor;

  $("showBtn").style.display =
    isActor ? "inline-block" : "none";

  if (state.card && isActor) {

    $("word").textContent =
      state.card;

  } else {

    $("word").textContent =
      "READY?";
  }

  if (state.card) {

    $("cardNumber").textContent =
      `CARD ${(state.cardIndex || 0) + 1}`;

  } else {

    $("cardNumber").textContent =
      "CARD";
  }

  if (
    state.timerEnd &&
    Date.now() < state.timerEnd
  ) {

    startTicker();

  } else {

    $("timer").textContent = "60";
  }
}

/* -------------------------
   TIMER
------------------------- */

function startTicker() {

  if (tickerStarted) {
    return;
  }

  tickerStarted = true;

  function tick() {

    if (!state || !state.timerEnd) {

      tickerStarted = false;
      $("timer").textContent = "60";
      return;
    }

    const seconds = Math.max(
      0,
      Math.ceil(
        (state.timerEnd - Date.now()) / 1000
      )
    );

    $("timer").textContent = seconds;

    if (seconds <= 0) {

      tickerStarted = false;

      expireTimer();

      return;
    }

    requestAnimationFrame(tick);
  }

  tick();
}

async function expireTimer() {

  if (!state || !state.timerEnd) {
    return;
  }

  if (Date.now() < state.timerEnd) {
    return;
  }

  try {

    await updateDoc(roomRef(), {
      timerEnd: 0,
      card: ""
    });

  } catch (error) {

    console.error(error);
  }
}

/* -------------------------
   SHOW CARD
------------------------- */

window.showCard = async function() {

  try {

    if (!state) {
      return;
    }

    const activeTeam = state.turn || "A";

    const teamPlayers =
      activeTeam === "A"
        ? state.teamA || []
        : state.teamB || [];

    const index =
      activeTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;

    const actor =
      teamPlayers.length
        ? teamPlayers[index % teamPlayers.length]
        : "";

    if (me !== actor) {

      toast("You are not this round's actor");

      return;
    }

    if (state.timerEnd) {

      toast("The card is already active");

      return;
    }

    const deck = state.deck || CARDS;

    const card =
      deck[state.cardIndex % deck.length];

    await updateDoc(roomRef(), {

      card,

      timerEnd:
        Date.now() + 60000
    });

  } catch (error) {

    console.error(error);

    toast("Could not show card");
  }
};

/* -------------------------
   SKIP CARD
------------------------- */

window.skipCard = async function() {

  try {

    if (!state) {
      return;
    }

    const activeTeam = state.turn || "A";

    const teamPlayers =
      activeTeam === "A"
        ? state.teamA || []
        : state.teamB || [];

    const index =
      activeTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;

    const actor =
      teamPlayers.length
        ? teamPlayers[index % teamPlayers.length]
        : "";

    if (me !== actor) {

      toast("Only the actor controls the card");

      return;
    }

    const deck = state.deck || CARDS;

    const nextIndex =
      (state.cardIndex + 1) % deck.length;

    await updateDoc(roomRef(), {

      card: deck[nextIndex],

      cardIndex: nextIndex,

      timerEnd: Date.now() + 60000
    });

  } catch (error) {

    console.error(error);

    toast("Could not skip card");
  }
};

/* -------------------------
   GOT POINT
------------------------- */

window.gotPoint = async function() {

  try {

    if (!state) {
      return;
    }

    const activeTeam = state.turn || "A";

    const teamPlayers =
      activeTeam === "A"
        ? state.teamA || []
        : state.teamB || [];

    const currentIndex =
      activeTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;

    const actor =
      teamPlayers.length
        ? teamPlayers[currentIndex % teamPlayers.length]
        : "";

    if (me !== actor) {

      toast("Only the actor controls the round");

      return;
    }

    const scoreField =
      activeTeam === "A"
        ? "scoreA"
        : "scoreB";

    const newScore =
      (state[scoreField] || 0) + 1;

    const nextTeam =
      activeTeam === "A"
        ? "B"
        : "A";

    const deck =
      state.deck || CARDS;

    const nextCardIndex =
      (state.cardIndex + 1) % deck.length;

    const nextActorIndex =
      teamPlayers.length
        ? (currentIndex + 1) % teamPlayers.length
        : 0;

    const actorIndexField =
      activeTeam === "A"
        ? "turnIndexA"
        : "turnIndexB";

    await updateDoc(roomRef(), {

      [scoreField]: newScore,

      turn: nextTeam,

      card: "",

      timerEnd: 0,

      cardIndex: nextCardIndex,

      [actorIndexField]: nextActorIndex
    });

  } catch (error) {

    console.error(error);

    toast("Could not record point");
  }
};

/* -------------------------
   COPY ROOM CODE
------------------------- */

window.copyRoom = async function() {

  try {

    await navigator.clipboard.writeText(roomId);

    toast("Room code copied");

  } catch (error) {

    toast(`Room code: ${roomId}`);
  }
};

/* -------------------------
   NEW GAME
------------------------- */

window.newGame = function() {

  if (unsub) {
    unsub();
    unsub = null;
  }

  roomId = "";
  state = null;
  myTeam = "";
  me = "";

  window.show("home");
};
