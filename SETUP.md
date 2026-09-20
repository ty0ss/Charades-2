# GRID&GO — Custom Online Charades

A simple two-team, phone-friendly charades game. It uses GitHub Pages for the website and Firebase Firestore for real-time multiplayer.

## What is already included
- Two teams; players choose Team A or Team B from their own phones.
- Room code to join the same game.
- 100 English charades cards, mixed easy/hard.
- 60-second round timer.
- Team score counter.
- Actor-only card reveal.
- Skip and +1 buttons.
- Responsive mobile design.
- Red `#e32b09`, light blue `#d9e8fb`, grey `#d4cece`, black and white.
- Subtle motorsport/F1-inspired background details without making the site look like an F1 site.

## Important: Firebase is needed for phone-to-phone live play
GitHub Pages can host the front-end, but it does not provide the live database needed to synchronize phones. Firebase Firestore supplies that part.

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com/
2. Click **Create a project**.
3. Give it any name, e.g. `grid-go-charades`.
4. After the project is created, click the Web icon `</>` to add a web app.
5. Register it with any nickname.
6. Firebase will show a `firebaseConfig` object.

## 2. Put your Firebase config into the site
Open `app.js` and replace the six `PASTE_...` values near the top with the values Firebase gives you.

## 3. Turn on Firestore
In Firebase:
1. Open **Build → Firestore Database**.
2. Create a database.
3. For a quick friends-only prototype, choose **Start in test mode**.
4. Publish it.

Test mode is convenient for a private game, but it should not be treated as a secure production database. If you plan to share the site publicly for a long time, add proper Firebase Authentication and tighter Firestore rules.

## 4. Put it on GitHub
1. Go to https://github.com/ and sign in.
2. Click **New repository**.
3. Name it something like `grid-go-charades`.
4. Make it **Public**.
5. Create the repository.
6. Upload these files:
   - `index.html`
   - `style.css`
   - `app.js`
   - `cards.json`
   - `README.md` (optional)
7. Commit the files.

## 5. Turn on the public link
Inside the GitHub repository:
1. Open **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`.
5. Save.
6. GitHub will give you a public URL similar to:
   `https://YOUR-USERNAME.github.io/grid-go-charades/`

Send that link to your friends. Everyone opens it on their own phone and uses the same room code.

## How a game works
1. One person chooses **Create Game** and enters their name.
2. They share the room code.
3. Everyone else chooses **Join a Game** and enters the code.
4. Everyone picks Team A or Team B.
5. The host presses Start Game.
6. The first person listed on the active team is that round's actor.
7. Only the actor sees **SHOW CARD**.
8. The actor has 60 seconds to act it out.
9. Press **+1 GOT IT** when the team guesses correctly, or **SKIP** to move on.
10. The turn switches teams.

## Player rotation
Actor selection now rotates automatically within each team. For example, if Team A has Sara, Omar, and Lina, their turns will rotate Sara → Omar → Lina → Sara. Team B rotates independently in the same way.

The game switches teams after a successful point. The active team's next actor is selected from that team's rotation.
