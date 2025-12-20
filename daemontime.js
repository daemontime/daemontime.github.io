<!DOCTYPE html>
<!--DAEMON TIME-->
<html>
  <head>
    <title>Daemon Time</title>
    <link rel="stylesheet" href="daemontime.css" />
    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  </head>
  <body>
    <h1 id="top">Daemon Time</h1>
    <div id="loginOverlay">
      <div><h2 id="welcome">Welcome! Choose an option:</h2></div>
      <div id="signinButtons">
        <button id="guestButton">Play as Guest</button>
        <button id="startLoginButton">Login</button>
        <button id="startSignupButton">Signup</button>
      </div>
      <br />
      <div id="signInUpError">Error</div>
      <form id="loginForm">
        <input
          type="email"
          id="loginEmail"
          placeholder="Email"
          required
        /><br />
        <input
          type="password"
          id="loginPassword"
          placeholder="Password"
          required
        /><br />
        <button type="submit" id="loginSubmitButton">Login</button><br />
        <button type="button" id="loginBackButton">Back</button><br />
      </form>
      <form id="signupForm">
        <input
          type="email"
          id="signupEmail"
          placeholder="Email"
          required
        /><br />
        <input
          type="text"
          id="signupHandle"
          placeholder="In-game handle"
          required
        /><br />
        <input
          type="password"
          id="signupPassword"
          placeholder="Password (Min. length: 6)"
          required
        /><br />
        <button type="submit" id="signupSubmitButton">Sign Up</button><br />
        <button type="button" id="signupBackButton">Back</button><br />
      </form>
      <br />
    </div>
    <div id="game">
      <div id="gameBox">
        <div id="lobby">
          <button id="newGame">New Game</button>
          <button id="newGameOfficial">A</button>
          <table id="currentGamesTable"></table>
        </div>
        <div id="inGame">
          <button id="leaveGameButton">Leave</button>
          <button id="startGameButton">Start Game</button>
          <div id="startedGame">
            <button id="backArrowQuestionButton">&lt</button>
            <button id="forwardArrowQuestionButton">&gt</button>
            <div id="gameQuestion"></div>
            <div id="scores"></div>
            <form id="answerForm">
              <input type="text" id="answer" required />
              <button type="submit" id="answerSubmitButton">Submit</button>
            </form>
          </div>
        </div>
      </div>
      <div id="messageBox">
        <div id="lobbyMessages"></div>
        <form id="lobbyMessageForm">
          <input
            type="text"
            id="enterLobbyMessage"
            placeholder="Enter message here"
            required
          />
          <button type="submit">Message</button>
        </form>
      </div>
      <!--should be a form?-->
    </div>
    <script src="daemontime.js"></script>
  </body>
</html>
