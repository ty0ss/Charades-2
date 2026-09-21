code

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   GRID & GO CHARADES
   200 FUN CHARADES CARDS
   ========================================================= */

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


/* =========================================================
   200 CARDS
   ========================================================= */

const CARDS = [

  /* SUPERHEROES & MOVIES */
  "Superman",
  "Batman",
  "Spider-Man",
  "Wonder Woman",
  "Iron Man",
  "Hulk",
  "Thor",
  "Captain America",
  "Black Panther",
  "The Flash",

  /* DISNEY */
  "Elsa",
  "Anna from Frozen",
  "Olaf",
  "Mickey Mouse",
  "Minnie Mouse",
  "Donald Duck",
  "Stitch",
  "Simba",
  "The Lion King",
  "Cinderella",

  "Snow White",
  "Rapunzel",
  "Moana",
  "Ariel the Mermaid",
  "Aladdin",
  "Genie from Aladdin",
  "Buzz Lightyear",
  "Woody",
  "Dora the Explorer",
  "SpongeBob SquarePants",

  /* CARTOONS & CHARACTERS */
  "Patrick Star",
  "Tom and Jerry",
  "Scooby-Doo",
  "Shrek",
  "Kung Fu Panda",
  "Po from Kung Fu Panda",
  "Minions",
  "Gru",
  "Puss in Boots",
  "Winnie the Pooh",

  "Harry Potter",
  "Hermione Granger",
  "Ron Weasley",
  "Wednesday Addams",
  "Peter Pan",
  "Captain Hook",
  "The Grinch",
  "Charlie and the Chocolate Factory",
  "Mr. Bean",
  "Sherlock Holmes",

  /* POP CULTURE */
  "Barbie",
  "Ken",
  "Hello Kitty",
  "Pikachu",
  "Mario",
  "Luigi",
  "Princess Peach",
  "Sonic the Hedgehog",
  "Pac-Man",
  "Minecraft Creeper",

  /* BRANDS & PLACES */
  "Jarir Bookstore",
  "IKEA",
  "McDonald's",
  "Starbucks",
  "KFC",
  "Apple Store",
  "LEGO",
  "Netflix",
  "YouTube",
  "TikTok",

  "Disney",
  "Disneyland",
  "Marvel",
  "Pixar",
  "Universal Studios",
  "Google",
  "Amazon delivery",
  "Careem driver",
  "Uber driver",
  "Google Maps",

  /* PEOPLE & JOBS */
  "School principal",
  "Math teacher",
  "PE teacher",
  "School bus driver",
  "Dentist",
  "Doctor",
  "Chef",
  "Waiter",
  "Photographer",
  "News reporter",

  "Police officer",
  "Firefighter",
  "Pilot",
  "Astronaut",
  "Detective",
  "Magician",
  "Clown",
  "Pirate",
  "Cowboy",
  "Princess",

  /* SPORTS */
  "Rock star",
  "DJ",
  "Football referee",
  "Soccer player",
  "Basketball player",
  "Tennis player",
  "Swimmer",
  "Gymnast",
  "Boxer",
  "Karate master",

  "Formula 1 driver",
  "Pit stop crew",
  "Race car",
  "Checkered flag",
  "Football goalkeeper",
  "Goal celebration",
  "Olympic athlete",
  "Skateboarder",
  "Surfer",
  "Skiing",

  /* OUTDOOR ACTIVITIES */
  "Riding a camel",
  "Riding a horse",
  "Flying a kite",
  "Building a sandcastle",
  "Making a snowman",
  "Swimming at the beach",
  "Getting caught in the rain",
  "Walking through a haunted house",
  "Camping",
  "Fishing",

  /* FOOD & EVERYDAY LIFE */
  "Cooking spaghetti",
  "Making pancakes",
  "Baking a cake",
  "Eating ice cream",
  "Drinking bubble tea",
  "Opening a jar",
  "Brushing your teeth",
  "Washing your hair",
  "Taking a selfie",
  "Taking a group photo",

  "Looking for lost keys",
  "Missing the bus",
  "Being late for school",
  "Getting a surprise gift",
  "Opening a birthday present",
  "Blowing out birthday candles",
  "Dancing at a wedding",
  "Giving a speech",
  "Singing karaoke",
  "Trying not to laugh",

  /* SILLY ACTIONS */
  "Walking like a penguin",
  "Walking like a robot",
  "Pretending to be a dinosaur",
  "Pretending to be a monkey",
  "Pretending to be a cat",
  "Pretending to be a dog",
  "Pretending to be a chicken",
  "Pretending to be a snake",
  "Pretending to be a frog",
  "Pretending to be a superhero",

  /* CHAOS & EVENTS */
  "Earthquake",
  "Tornado",
  "Volcano",
  "Lightning",
  "Power outage",
  "Traffic jam",
  "Airport security",
  "Missed flight",
  "Lost tourist",
  "Broken elevator",

  /* SHOPPING & ENTERTAINMENT */
  "Shopping spree",
  "Window shopping",
  "Buying shoes",
  "Trying on sunglasses",
  "Going to the cinema",
  "Watching a scary movie",
  "Eating popcorn",
  "Playing an arcade game",
  "Winning a trophy",
  "Losing a game",

  /* FANTASY */
  "Secret agent",
  "Time traveler",
  "Alien landing",
  "Invisible person",
  "Zombie",
  "Vampire",
  "Werewolf",
  "Ghost",
  "Treasure hunt",
  "Escape room",

  /* ADVENTURE */
  "Magic carpet",
  "Flying on a broomstick",
  "Walking on the moon",
  "Underwater explorer",
  "Jungle explorer",
  "Dinosaur hunter",
  "Treasure chest",
  "Talking to a parrot",
  "Stuck in quicksand",
  "Giant spider"

];


/* =========================================================
   GAME VARIABLES
   ========================================================= */

let roomId = "";
let me = "";
let myTeam = "";
let state = null;
let unsubscribe = null;
let timerInterval = null;


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function randomRoomCode() {

  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

}


function roomRef() {

  return doc(db, "rooms", roomId);

}


function toast(message) {

  const element = $("toast");

  if (!element) {

    alert(message);

    return;
  }

  element.textContent = message;

  element.style.display = "block";

  setTimeout(() => {

    element.style.display = "none";

  }, 1800);

}


function shuffle(array) {

  return [...array].sort(
    () => Math.random() - 0.5
  );

}


function escapeHTML(text) {

  return String(text).replace(
    /[&<>"']/g,
    character => {

      const characters = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      };

      return characters[character];

    }
  );

}


/* =========================================================
   SCREEN SWITCHING
   ========================================================= */

window.show = function(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.remove("active");

    });


  const screen = $(id);

  if (screen) {

    screen.classList.add("active");

  }

};


/* =========================================================
   CREATE GAME
   ========================================================= */

window.createGame = async function() {

  try {

    me = $("hostName").value.trim();

    if (!me) {

      toast("Enter your name first");

      return;
    }


    roomId = randomRoomCode();

    myTeam = "";


    const deck = shuffle(CARDS);


    await setDoc(roomRef(), {

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

      deck: deck,

      cardIndex: 0,

      card: "",

      timerEnd: 0,

      turnIndexA: 0,

      turnIndexB: 0

    });


    watchRoom();


    if ($("roomLabel")) {

      $("roomLabel").textContent = roomId;

    }


    window.show("lobby");


  } catch (error) {

    console.error(error);

    toast("Could not create the game");

  }

};


/* =========================================================
   JOIN GAME
   ========================================================= */

window.joinGame = async function() {

  try {

    me = $("joinName").value.trim();

    roomId =
      $("roomCode").value.trim().toUpperCase();


    if (!me) {

      toast("Enter your name first");

      return;
    }


    if (!roomId) {

      toast("Enter the room code");

      return;
    }


    const snapshot =
      await getDoc(roomRef());


    if (!snapshot.exists()) {

      if ($("joinError")) {

        $("joinError").textContent =
          "Room not found.";

      }

      return;
    }


    const data = snapshot.data();

    const players = [
      ...(data.players || [])
    ];


    const alreadyHere =
      players.some(
        player =>
          player.name.toLowerCase() ===
          me.toLowerCase()
      );


    if (!alreadyHere) {

      players.push({

        name: me,

        team: "",

        host: false

      });


      await updateDoc(roomRef(), {

        players: players

      });

    }


    watchRoom();


    if ($("roomLabel")) {

      $("roomLabel").textContent = roomId;

    }


    window.show("lobby");


  } catch (error) {

    console.error(error);

    toast("Could not join the game");

  }

};


/* =========================================================
   FIREBASE REAL-TIME LISTENER
   ========================================================= */

function watchRoom() {

  if (unsubscribe) {

    unsubscribe();

  }


  unsubscribe = onSnapshot(

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


/* =========================================================
   PICK TEAM
   ========================================================= */

window.pickTeam = async function(team) {

  try {

    if (!state) {

      toast("Create or join a game first");

      return;

    }


    if (state.started) {

      toast("The game already started");

      return;

    }


    myTeam = team;


    const players =
      (state.players || []).map(player => {

        if (player.name === me) {

          return {

            ...player,

            team: team

          };

        }


        return player;

      });


    const teamA =
      players
        .filter(player => player.team === "A")
        .map(player => player.name);


    const teamB =
      players
        .filter(player => player.team === "B")
        .map(player => player.name);


    await updateDoc(roomRef(), {

      players: players,

      teamA: teamA,

      teamB: teamB

    });


    toast(`You joined Team ${team}`);


  } catch (error) {

    console.error(error);

    toast("Could not choose team");

  }

};


/* =========================================================
   START GAME
   ========================================================= */

window.startGame = async function() {

  try {

    if (!state) {

      toast("Game isn't ready");

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


    await updateDoc(roomRef(), {

      started: true,

      turn: "A",

      turnIndexA: 0,

      turnIndexB: 0,

      card: "",

      cardIndex: 0,

      timerEnd: 0

    });


  } catch (error) {

    console.error(error);

    toast("Could not start game");

  }

};


/* =========================================================
   RENDER LOBBY
   ========================================================= */

function render() {

  if (!state) {

    return;

  }


  const players =
    state.players || [];


  if ($("countA")) {

    $("countA").textContent =
      (state.teamA || []).length;

  }


  if ($("countB")) {

    $("countB").textContent =
      (state.teamB || []).length;

  }


  if ($("players")) {

    $("players").innerHTML =
      players
        .map(player => {

          const team =
            player.team
              ? `TEAM ${player.team}`
              : "NO TEAM";


          return `
            <span class="player">
              ${escapeHTML(player.name)}
              · ${team}
            </span>
          `;

        })
        .join("");

  }


  const myPlayer =
    players.find(
      player => player.name === me
    );


  if (myPlayer) {

    myTeam =
      myPlayer.team || myTeam;

  }


  const ready =
    (state.teamA || []).length > 0 &&
    (state.teamB || []).length > 0;


  if ($("startBtn")) {

    $("startBtn").disabled = !ready;

  }


  if (state.started) {

    window.show("game");

    renderGame();

  } else {

    window.show("lobby");

  }

}


/* =========================================================
   RENDER GAME
   ========================================================= */

function renderGame() {

  const activeTeam =
    state.turn || "A";


  const teamPlayers =
    activeTeam === "A"
      ? state.teamA || []
      : state.teamB || [];


  const actorIndex =
    activeTeam === "A"
      ? state.turnIndexA || 0
      : state.turnIndexB || 0;


  const actor =
    teamPlayers.length
      ? teamPlayers[
          actorIndex % teamPlayers.length
        ]
      : "";


  if ($("scoreA")) {

    $("scoreA").textContent =
      state.scoreA || 0;

  }


  if ($("scoreB")) {

    $("scoreB").textContent =
      state.scoreB || 0;

  }


  if ($("turnText")) {

    $("turnText").textContent =
      `TEAM ${activeTeam} TURN • ${actor}`;

  }


  const isActor =
    me === actor;


  /*
    Only the actor can see the actual card.
    Everyone else sees READY.
  */

  if ($("word")) {

    if (isActor && state.card) {

      $("word").textContent =
        state.card;

    } else {

      $("word").textContent =
        "READY?";

    }

  }


  if ($("showBtn")) {

    $("showBtn").style.display =
      isActor ? "inline-block" : "none";

  }


  if ($("cardNumber")) {

    $("cardNumber").textContent =
      `CARD ${(state.cardIndex || 0) + 1}`;

  }


  updateTimerDisplay();

}


/* =========================================================
   SHOW FIRST CARD
   ========================================================= */

window.showCard = async function() {

  try {

    if (!state) {

      return;

    }


    const activeTeam =
      state.turn || "A";


    const players =
      activeTeam === "A"
        ? state.teamA || []
        : state.teamB || [];


    const index =
      activeTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;


    const actor =
      players.length
        ? players[index % players.length]
        : "";


    if (me !== actor) {

      toast("You are not the actor");

      return;

    }


    /*
      If a card is already showing,
      don't restart the timer.
    */

    if (state.card) {

      return;

    }


    const deck =
      state.deck || CARDS;


    const card =
      deck[
        state.cardIndex % deck.length
      ];


    await updateDoc(roomRef(), {

      card: card,

      timerEnd:
        Date.now() + 60000

    });


  } catch (error) {

    console.error(error);

    toast("Could not show card");

  }

};


/* =========================================================
   GOT IT
   IMPORTANT:
   SAME TEAM CONTINUES PLAYING
   ========================================================= */

window.gotPoint = async function() {

  try {

    if (!state) {

      return;

    }


    const activeTeam =
      state.turn || "A";


    const players =
      activeTeam === "A"
        ? state.teamA || []
        : state.teamB || [];


    const index =
      activeTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;


    const actor =
      players.length
        ? players[index % players.length]
        : "";


    if (me !== actor) {

      toast("Only the actor can score");

      return;

    }


    /*
      DO NOT CHANGE TEAMS HERE.

      The same team keeps playing
      until the 60-second timer ends.
    */


    const scoreField =
      activeTeam === "A"
        ? "scoreA"
        : "scoreB";


    const nextCardIndex =
      (state.cardIndex + 1) %
      (state.deck || CARDS).length;


    const nextCard =
      (state.deck || CARDS)[
        nextCardIndex
      ];


    await updateDoc(roomRef(), {

      [scoreField]:
        (state[scoreField] || 0) + 1,

      card: nextCard,

      cardIndex: nextCardIndex,

      /*
        Keep the ORIGINAL timer.
        The team continues until 60 seconds
        are completely finished.
      */

      timerEnd: state.timerEnd

    });


  } catch (error) {

    console.error(error);

    toast("Could not record point");

  }

};


/* =========================================================
   SKIP
   SAME TEAM CONTINUES
   ========================================================= */

window.skipCard = async function() {

  try {

    if (!state) {

      return;

    }


    const activeTeam =
      state.turn || "A";


    const players =
      activeTeam === "A"
        ? state.teamA || []
        : state.teamB || [];


    const index =
      activeTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;


    const actor =
      players.length
        ? players[index % players.length]
        : "";


    if (me !== actor) {

      toast("Only the actor can skip");

      return;

    }


    const deck =
      state.deck || CARDS;


    const nextIndex =
      (state.cardIndex + 1) %
      deck.length;


    await updateDoc(roomRef(), {

      card: deck[nextIndex],

      cardIndex: nextIndex,

      /*
        Same timer.
        Same team.
        Same actor.
      */

      timerEnd: state.timerEnd

    });


  } catch (error) {

    console.error(error);

    toast("Could not skip card");

  }

};


/* =========================================================
   TIMER
   WHEN TIMER ENDS:
   - HIDE CARD
   - SWITCH TEAM
   - ROTATE ACTOR
   ========================================================= */

function updateTimerDisplay() {

  if (timerInterval) {

    clearInterval(timerInterval);

  }


  timerInterval =
    setInterval(async () => {

      if (!state) {

        return;

      }


      if (!state.timerEnd) {

        if ($("timer")) {

          $("timer").textContent = "60";

        }

        return;

      }


      const seconds =
        Math.max(
          0,
          Math.ceil(
            (state.timerEnd - Date.now()) /
            1000
          )
        );


      if ($("timer")) {

        $("timer").textContent =
          seconds;

      }


      if (seconds <= 0) {

        clearInterval(timerInterval);

        timerInterval = null;

        await finishTeamTurn();

      }

    }, 250);

}


let finishingTurn = false;


async function finishTeamTurn() {

  if (finishingTurn) {

    return;

  }


  if (!state || !state.timerEnd) {

    return;

  }


  if (Date.now() < state.timerEnd) {

    return;

  }


  finishingTurn = true;


  try {

    const currentTeam =
      state.turn || "A";


    const nextTeam =
      currentTeam === "A"
        ? "B"
        : "A";


    const currentPlayers =
      currentTeam === "A"
        ? state.teamA || []
        : state.teamB || [];


    const currentIndex =
      currentTeam === "A"
        ? state.turnIndexA || 0
        : state.turnIndexB || 0;


    /*
      Rotate the actor within the team
      after that team's 60 seconds finish.
    */

    const nextActorIndex =
      currentPlayers.length
        ? (currentIndex + 1) %
          currentPlayers.length
        : 0;


    const actorIndexField =
      currentTeam === "A"
        ? "turnIndexA"
        : "turnIndexB";


    await updateDoc(roomRef(), {

      turn: nextTeam,

      card: "",

      timerEnd: 0,

      [actorIndexField]:
        nextActorIndex

    });


  } catch (error) {

    console.error(error);

  }


  finishingTurn = false;

}


/* =========================================================
   COPY ROOM CODE
   ========================================================= */

window.copyRoom = async function() {

  try {

    await navigator.clipboard
      .writeText(roomId);

    toast("Room code copied");

  } catch (error) {

    toast(`Room code: ${roomId}`);

  }

};


/* =========================================================
   NEW GAME
   ========================================================= */

window.newGame = function() {

  if (unsubscribe) {

    unsubscribe();

    unsubscribe = null;

  }


  if (timerInterval) {

    clearInterval(timerInterval);

    timerInterval = null;

  }


  roomId = "";

  me = "";

  myTeam = "";

  state = null;


  window.show("home");

};
