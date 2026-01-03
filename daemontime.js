//import { createClient } from "@supabase/supabase-js";
//import { v4 as uuidv4 } from "uuid";

const supabaseURL = "https://kygyugvojbzawohswyuv.supabase.co";
const supabaseKey = "sb_publishable_sUbdY8ajIle7wiV3MuHm5Q_VHQ-Kxw_";
const supabaseClient = supabase.createClient(supabaseURL, supabaseKey);

let currentUser = null;
let userHandle = null;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

document.getElementById("guestButton").addEventListener("click", async () => {
  const { data, error } = await supabaseClient.auth.signInAnonymously();
  if (!error) {
    const {
      data: { user },
      error: error2,
    } = await supabaseClient.auth.getUser();
    currentUser = user;
    if (!error2) {
      const { error3 } = await supabaseClient
        .from("profiles")
        .insert({ uuid: currentUser.id, isGuest: true });
      if (!error3) {
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("handle")
          .eq("uuid", currentUser.id);
        userHandle = data[0].handle;

        const { data: data2, error: error2 } = await supabaseClient
          .from("profiles")
          .update({ in_game: null })
          .eq("uuid", currentUser.id);
        lobby();
        return;
      }
    }
  }
  document.getElementById("signInUpError").style.display = "block";
});

document
  .getElementById("startLoginButton")
  .addEventListener("click", async () => {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("signinButtons").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
  });

document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!error) {
      const {
        data: { user },
        error: error2,
      } = await supabaseClient.auth.getUser();
      if (!error2) {
        currentUser = user;
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("handle")
          .eq("uuid", currentUser.id);
        userHandle = data[0].handle;
        const { data: data2, error: error2 } = await supabaseClient
          .from("profiles")
          .update({ in_game: null })
          .eq("uuid", currentUser.id);
        lobby();
        return;
      }
    }
    document.getElementById("signInUpError").style.display = "block";
  });

document
  .getElementById("loginBackButton")
  .addEventListener("click", async () => {
    document.getElementById("signInUpError").style.display = "none";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("welcome").style.display = "block";
    document.getElementById("signinButtons").style.display = "block";
  });

document
  .getElementById("startSignupButton")
  .addEventListener("click", async () => {
    document.getElementById("welcome").style.display = "none";
    document.getElementById("signinButtons").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
  });

document
  .getElementById("signupForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const handle = document.getElementById("signupHandle").value;
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { handle: handle },
      },
    });
    if (!error) {
      const {
        data: { user },
        error: error2,
      } = await supabaseClient.auth.getUser();
      if (!error2) {
        currentUser = user;
        const { error3 } = await supabaseClient
          .from("profiles")
          .insert({ uuid: currentUser.id, handle: handle });
        userHandle = handle;

        const { data: data2, error: error2 } = await supabaseClient
          .from("profiles")
          .update({ in_game: null })
          .eq("uuid", currentUser.id);
        lobby();
        return;
      }
    } else document.getElementById("signInUpError").style.display = "block";
  });

document
  .getElementById("signupBackButton")
  .addEventListener("click", async () => {
    document.getElementById("signInUpError").style.display = "none";
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("welcome").style.display = "block";
    document.getElementById("signinButtons").style.display = "block";
  });

const gameColors = [
  ["Aqua", "black"],
  ["Blueviolet", "white"],
  ["Cadetblue", "white"],
  ["Crimson", "white"],
  ["Darkslategray", "white"],
  ["Firebrick", "white"],
  ["Goldenrod", "black"],
  ["Indigo", "white"],
  ["Lavender", "black"],
  ["Lemonchiffon", "black"],
  ["Lightgreen", "black"],
  ["Mistyrose", "black"],
  ["Orange", "black"],
  ["Seagreen", "white"],
  ["Yellowgreen", "black"],
];

document.getElementById("newGame").addEventListener("click", async () => {
  document.getElementById("lobby").style.display = "none";
  const number_of_problems = 10;
  const time_limit = 45;
  let questions = [];
  const { data: questionData, error: questionError } = await supabaseClient
    .from("questions")
    .select("id");
  let numMath = 0;
  let numEnglish = 0;
  for (let i = 0; i < questionData.length; i++) {
    if (questionData[i].id > 1999999) numEnglish++;
    else numMath++;
  }
  for (let i = 0; i < number_of_problems; i++) {
    let a = Math.floor(Math.random() * 2) + 1;
    let b = a * 1000000;
    if (a == 1) b += Math.floor(Math.random() * numMath);
    if (a == 2) b += Math.floor(Math.random() * numEnglish);
    questions.push(b);
  }
  const { data, error } = await supabaseClient
    .from("currentGames")
    .insert({
      host_id: currentUser.id,
      host_handle: userHandle,
      number_of_problems: number_of_problems,
      time_limit: time_limit,
      users_in_game: [currentUser.id],
      questions: questions,
      colorIndex: Math.floor(Math.random() * gameColors.length),
    })
    .select();
  if (!error) {
    const { data: data2, error: error2 } = await supabaseClient
      .from("profiles")
      .update({
        in_game: data[0].game_id,
      })
      .eq("uuid", currentUser.id);

    joinGame(data[0].game_id);
  }
});
/*
let chatOn = true;

document
  .getElementById("chatToggleButton")
  .addEventListener("click", async () => {
    if (chatOn) {
      chatOn = false;
      document.getElementById("gameBox").style.height = "541px";
      document.getElementById("messageBox").style.display = "none";
      document.getElementById("lobbyMessages").style.display = "none";
      document.getElementById("lobbyMessageForm").style.display = "none";
      document.getElementById("gameBox").style.borderBottom = "2px solid black";
    } else {
      chatOn = true;
      document.getElementById("gameBox").style.height = "400px";
      document.getElementById("messageBox").style.display = "block";
      document.getElementById("lobbyMessages").style.display = "block";
      document.getElementById("lobbyMessageForm").style.display = "block";
      document.getElementById("gameBox").style.borderBottom = "0px";
    }
  });
*/
const lobbyMessagesChannel = supabaseClient
  .channel("lobbyMessages", { config: { broadcast: { self: true } } })
  .on("broadcast", { event: "lobby_message_sent" }, (payload) => {
    addLobbyMessage(payload.payload.text, payload.payload.handle, true);
  })
  .subscribe();

let inGameMessagesChannel = null;
let inGame = false;
document
  .getElementById("lobbyGameMessageForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inGame) {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("in_game")
        .eq("uuid", currentUser.id);
      const gameID = data[0].in_game;

      inGameMessagesChannel.send({
        type: "broadcast",
        event: "ingame_message_sent" + gameID,
        payload: {
          text: document.getElementById("enterLobbyGameMessage").value,
          handle: userHandle,
        },
      });
    } else {
      lobbyMessagesChannel.send({
        type: "broadcast",
        event: "lobby_message_sent",
        payload: {
          text: document.getElementById("enterLobbyGameMessage").value,
          handle: userHandle,
        },
      });
    }

    document.getElementById("enterLobbyGameMessage").value = "";
  });
/*
const MAX_MESSAGES = 50;
let lobbyMessages = [];
let gameMessages = [];*/
// no limit of messages currently, do .push, .shift() for array
function addLobbyMessage(newMessage, handle, isLobby) {
  if (newMessage != undefined) {
    let messages;
    if (isLobby) messages = document.getElementById("lobbyMessages");
    else messages = document.getElementById("inGameMessages");
    const div = document.createElement("div");
    if (handle.length > 10) handle = handle.slice(0, 10) + "..";
    for (let i = handle.length; i < 13; i++) handle = handle + "&nbsp;";
    div.innerHTML = handle + ":&nbsp;" + newMessage;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
}

const currentGamesChannel = supabaseClient
  .channel("current-games")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "currentGames" },
    (payload) => {
      showCurrentGames(false);
    }
  )
  .subscribe(); // change to only update when # users change or game addition/deletion?

// make this faster
async function showCurrentGames(isCreate) {
  const { data, error } = await supabaseClient.from("currentGames").select("*");
  for (let i = 0; i < data.length; i++) {
    flag = false;
    for (let j = 0; j < data[i].users_in_game.length; j++) {
      if (data[i].users_in_game[j] == currentUser.id) flag = true;
    }
    if (flag && !data[i].has_started) {
      if (data[i].host_id == currentUser.id) {
        document.getElementById("startGameButton").style.display = "block";
        hostingGameID = data[i].game_id;
      } else document.getElementById("startGameButton").style.display = "none";
      let usersHTML = "<div><br></br><u><b>Users in game:</b></u><br></br>";
      for (let j = 0; j < data[i].users_in_game.length; j++) {
        const { data: data2, error: error2 } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("uuid", data[i].users_in_game[j]);
        let userHandle = data2[0].handle;
        if (userHandle.length > 14)
          userHandle = userHandle.slice(0, 14) + "...";
        usersHTML +=
          userHandle + " : " + Math.floor(data2[0].rating) + "<br></br>";
      }
      usersHTML += "</div>";
      document.getElementById("usersInGame").innerHTML = usersHTML;
    }
  }
  if (isCreate) return;
  let table = "<table>";
  for (let i = 0; i < data.length / 4; i++) {
    table += "<tr>";
    for (let j = 0; j < 4; j++) {
      if (i * 4 + j < data.length) {
        let row = data[i * 4 + j];
        const [bg, text] = gameColors[row.colorIndex];
        const borderColor = text == "black" ? "gray" : "white";
        table += `<td style="background-color:${bg}; color:${text}; border: solid ${borderColor}">`;
        table += "# players: " + row.users_in_game.length;
        let hostHandle = row.host_handle;
        if (hostHandle.length > 10)
          hostHandle =
            hostHandle.substring(0, Math.min(10, hostHandle.length - 3)) +
            "...";
        table += "<br></br>Host: " + hostHandle;
        if (row.has_started) {
          table += "<br></br>Game started";
        } else {
          table +=
            '<br></br><button class="joinGameButton" id="' + row.game_id + '" ';
          const color = text === "black" ? "white" : "black";
          table += `style="background-color:${text}; color:${color}"`;
          table += ">";
          table += "&#8658;</button>";
        }
      } else {
        table += "<td style='border:0px'>";
        table += "&nbsp";
      }
      table += "</td>";
    }
    table += "</tr>";
  }
  table += "</table>";
  const currentGamesTable = document.getElementById("currentGamesTable");
  currentGamesTable.innerHTML = table;

  //document.getElementById("currentGamesTable").style.display = "block";
}

document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("joinGameButton")) {
    const { data, error } = await supabaseClient
      .from("currentGames")
      .select("has_started")
      .eq("game_id", event.target.id);
    if (data[0].has_started) return;
    document.getElementById("lobby").style.display = "none";
    const { data: data2, error: error2 } = await supabaseClient
      .from("currentGames")
      .select("users_in_game")
      .eq("game_id", event.target.id);
    const newArr = data2[0].users_in_game;
    newArr.push(currentUser.id);
    const { data: data3, error: error3 } = await supabaseClient
      .from("currentGames")
      .update({
        users_in_game: newArr,
      })
      .eq("game_id", event.target.id);
    const { data: data4, error: error4 } = await supabaseClient
      .from("profiles")
      .update({ in_game: event.target.id })
      .eq("uuid", currentUser.id);
    joinGame(event.target.id);
  }
});

function lobby() {
  inGame = false;
  inGameMessagesChannel = null;
  document.getElementById("lobbyMessages").style.display = "block";
  document.getElementById("inGameMessages").style.display = "none";
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("messageBox").style.display = "block";
  document.getElementById("newGame").style.display = "block";
  document.getElementById("lobby").style.display = "block";
  document.getElementById("submitQuestionToDatabase").style.display = "block";
  document.getElementById("submitBugOrFeedback").style.display = "block";
  document.getElementById("inGame").style.display = "none";
  document.getElementById("startedGame").style.display = "none";
  document.getElementById("gameQuestion").innerHTML = "<div></div>";
  document.getElementById("gameQuestion").style.marginTop = "50px";
  document.getElementById("gameQuestion").style.display = "none";
  document.getElementById("scores").style.display = "none";
  document.getElementById("leaveGameButton").style.display = "none";
  document.getElementById("usersInGame").style.display = "none";
  document.getElementById("startGameButton").style.display = "none";
  document.getElementById("forwardArrowQuestionButton").style.display = "none";
  document.getElementById("backArrowQuestionButton").style.display = "none";
  document.getElementById("submitQuestionToDatabase").style.display = "block";

  hostingGameID = null;
  showCurrentGames(false);
}

document
  .getElementById("leaveGameButton")
  .addEventListener("click", async () => {
    let afterGame = false;
    if (document.getElementById("startedGame").style.display === "block")
      afterGame = true;
    document.getElementById("inGame").style.display = "none";
    document.getElementById("startedGame").style.display = "none";
    document.getElementById("gameQuestion").innerHTML = "<div></div>";
    document.getElementById("gameQuestion").style.display = "none";
    document.getElementById("scores").style.display = "none";
    document.getElementById("leaveGameButton").style.display = "none";
    document.getElementById("startGameButton").style.display = "none";
    document.getElementById("forwardArrowQuestionButton").style.display =
      "none";
    document.getElementById("backArrowQuestionButton").style.display = "none";

    try {
      supabaseClient.removeChannel(checkInGameChannel);
    } catch (e) {}
    checkInGameChannel = null;
    try {
      supabaseClient.removeChannel(inGameMessagesChannel);
    } catch (e) {}
    inGameMessagesChannel = null;
    document.getElementById("inGameMessages").innerHTML = "";
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("in_game")
      .eq("uuid", currentUser.id);

    const gameID = data[0].in_game;
    const { data: data2, error: error2 } = await supabaseClient
      .from("profiles")
      .update({ in_game: null })
      .eq("uuid", currentUser.id);
    if (!afterGame) {
      const { data: data3, error: error3 } = await supabaseClient
        .from("currentGames")
        .select("users_in_game")
        .eq("game_id", gameID);
      const users = data3[0].users_in_game;
      if (users.length == 1) {
        const {
          data: { user },
          error: error2,
        } = await supabaseClient.auth.getUser();
        const { data: data4, error: error4 } = await supabaseClient
          .from("currentGames")
          .delete()
          .eq("game_id", gameID);
      } else {
        const newArr = [];
        for (let i = 0; i < users.length; i++) {
          if (users[i] != currentUser.id) newArr.push(users[i]);
        }
        const { data: data5, error: error5 } = await supabaseClient
          .from("currentGames")
          .update({ users_in_game: newArr })
          .eq("game_id", gameID);

        const { data: data6, error: error6 } = await supabaseClient
          .from("currentGames")
          .select("host_id")
          .eq("game_id", gameID);
        if (data6[0].host_id == currentUser.id) {
          // wrong?
          const { data: data7, error: error7 } = await supabaseClient
            .from("profiles")
            .select("handle")
            .eq("uuid", newArr[0]);
          const { data: data8, error: error8 } = await supabaseClient
            .from("currentGames")
            .update({ host_id: newArr[0], host_handle: data7[0].handle })
            .eq("game_id", gameID);
        }
      }
    }
    wait(500);
    lobby();
    canStart = true;
  });

let checkInGameChannel = null;

async function joinGame(gameID) {
  inGameMessagesChannel = supabaseClient
    .channel("inGameMessages", { config: { broadcast: { self: true } } })
    .on("broadcast", { event: "ingame_message_sent" + gameID }, (payload) => {
      addLobbyMessage(payload.payload.text, payload.payload.handle, false);
    })
    .subscribe();
  inGame = true;
  document.getElementById("lobbyMessages").style.display = "none";
  document.getElementById("inGameMessages").style.display = "block";
  document.getElementById("inGame").style.display = "block";
  document.getElementById("leaveGameButton").style.display = "block";
  showCurrentGames(true);
  document.getElementById("usersInGame").style.display = "block";
  checkInGameChannel = supabaseClient
    .channel("in_game", { config: { broadcast: { self: true } } })
    .on(
      "broadcast",
      {
        event: "game_start" + gameID,
      },
      (payload) => {
        supabaseClient.removeChannel(checkInGameChannel);
        startGame(gameID);
      }
    )
    .subscribe();
}

let i = 1;
let hostingGameID = null;
document
  .getElementById("startGameButton")
  .addEventListener("click", async () => {
    // should i remove the ability to leave game (leavegamebutton style display = none)
    // edit so only host can start, otherwise gives error (or remove the button for non-host)
    // update: made rls policy only host can start, problem is that other people can edit the host lol
    i++;
    if (!checkInGameChannel) return;
    document.getElementById("startGameButton").style.display = "none";
    document.getElementById("usersInGame").style.display = "none";
    document.getElementById("leaveGameButton").style.display = "none";
    const { data, error } = await supabaseClient
      .from("currentGames")
      .update({ has_started: true })
      .eq("host_id", currentUser.id);
    if (!error) {
      const { data: data2, error: error2 } = await supabaseClient
        .from("profiles")
        .select("in_game")
        .eq("handle", userHandle);
      if (!hostingGameID) return;
      const { data: data3, error: error3 } = await supabaseClient
        .from("currentGames")
        .select("*")
        .eq("game_id", hostingGameID);
      checkInGameChannel.send({
        type: "broadcast",
        event: "game_start" + hostingGameID,
        payload: { game_id: hostingGameID },
      });
    }
  });
let j = 1;
let canStart = true;
async function startGame(gameID, canStart) {
  const { data: rowdata, error: rowerror } = await supabaseClient
    .from("currentGames")
    .select("*")
    .eq("game_id", gameID);
  let row = rowdata[0];
  document.getElementById("usersInGame").style.display = "none";
  document.getElementById("startedGame").style.display = "block";
  function waitForInput(ms, timestamp, answer) {
    return new Promise((resolve) => {
      document.getElementById("answerForm").addEventListener(
        "submit",
        async (event) => {
          event.preventDefault();
          timestamp.push(Date.now());
          answer.push(document.getElementById("answer").value);
          document.getElementById("answer").value = "";
          document.getElementById("answerForm").style.display = "none";
          document.getElementById("gameQuestion").style.display = "none";
          resolve("submitted");
          // check answer ( can you put this after resolve? or does it have to go before)
        },
        { once: true }
      );
      setTimeout(() => resolve("timeout"), ms);
    });
  }
  let scores = [];
  let newScores = [];

  async function showScore(last) {
    document.getElementById("gameQuestion").style.display = "none";
    let scoresDisplay = "<div>";
    scores.sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < scores.length; i++) {
      let rank = i + 1;
      floorScore = Math.floor(scores[i][1] * 1000) / 1000;
      floorIncrease = Math.floor(scores[i][2] * 1000) / 1000;
      let add = "";
      if (userHandle == scores[i][0]) {
        add =
          "<p style='font-weight:bold;'>" +
          rank +
          ". " +
          scores[i][0] +
          ": " +
          floorScore +
          " pts (+" +
          floorIncrease +
          ")";
        ("</p>");
      } else {
        add =
          "<p>" +
          rank +
          ". " +
          scores[i][0] +
          ": " +
          floorScore +
          " pts (+" +
          floorIncrease +
          ")";
        ("</p>");
      }
      scoresDisplay += add;
    }
    scoresDisplay += "</div>";
    document.getElementById("scores").innerHTML = scoresDisplay;
    document.getElementById("scores").style.display = "block";
    if (!last) {
      scores = newScores;
      newScores = [];
    }
    await wait(2000);
  }

  const gameScoreChannel = supabaseClient
    .channel("game_score")
    .on(
      "broadcast",
      {
        event: "game_score" + gameID,
      },
      (payload) => {
        if (scores.length < row.users_in_game.length)
          scores.push([
            payload.payload.handle,
            payload.payload.score,
            payload.payload.increase,
          ]);
        else {
          newScores.push([
            payload.payload.handle,
            payload.payload.score,
            payload.payload.increase,
          ]);
        }
      }
    )
    .subscribe();

  function waitForAllDone(ms) {
    return new Promise(async (resolve) => {
      let i = 0;
      while (scores.length < row.users_in_game.length) {
        await wait(10); // one runs while the other says waiting and then switch because wait(1000)
        // it takes less than a second for
        i++;
        console.log(0);
        if (i > ms / 10) break;
      }
      if (scores.length > row.users_in_game.length) {
        newScores = scores.slice(row.users_in_game.length, scores.length);
        scores = scores.slice(0, row.users_in_game.length);
      }
      resolve();
    });
  }
  async function waitWithTimeout(ms) {
    return Promise.race([
      waitForAllDone(ms),
      new Promise((resolve) => setTimeout(ms)),
    ]);
  }
  let questionRowArr = [];
  let questionArr = [];
  let answerArr = [];
  let score = 0;
  document.getElementById("gameQuestion").style.fontSize = "15px";
  for (let i = 0; i < row.number_of_problems; i++) {
    document.getElementById("scores").style.display = "none";
    const { data, error } = await supabaseClient
      .from("questions")
      .select("*")
      .eq("id", row.questions[i]);
    const questionRow = data[0];
    questionRowArr.push(questionRow);
    let questionDisplay = "<div>";
    questionDisplay += "<div>" + questionRow.question + "</div>";
    for (let j = 0; j < 4; j++) {
      questionDisplay +=
        "<p>" + (j + 1) + ": " + questionRow.choices[j] + "</p>";
    }
    questionArr.push(questionDisplay);
    questionDisplay += "</div>";
    document.getElementById("gameQuestion").innerHTML = questionDisplay;
    document.getElementById("gameQuestion").style.display = "block";
    document.getElementById("answerForm").style.display = "block";
    document.getElementById("answer").focus();
    let timestamp = [Date.now()];
    let getAnswerArr = [];
    const result = await waitForInput(
      (row.time_limit + 0.5) * 1000, //change it to smaller?
      timestamp,
      getAnswerArr
    ); // ms to s, +1 to account for time to call backend
    document.getElementById("answerForm").style.display = "none";
    document.getElementById("gameQuestion").innerHTML =
      "<div>Waiting for others...</div>";
    document.getElementById("gameQuestion").style.display = "block";
    let timeSpent = 0;
    let answer = "";
    let scoreIncrease = 0;
    if (result == "submitted") {
      timeSpent = timestamp[1] - timestamp[0];
      answer = getAnswerArr[0];
      if (answer == questionRow.answer) {
        scoreIncrease = 1.2 * row.time_limit - timeSpent / 1000;
        score += scoreIncrease;
        //score = Math.round(score * 1000) / 1000; // round to nearest thousandth
      }
    } else timeSpent = row.time_limit;
    answerArr.push(answer);
    let last = false;
    if (scores.length == row.users_in_game.length - 1) last = true;
    scores.push([userHandle, score, scoreIncrease]);
    gameScoreChannel.send({
      type: "broadcast",
      event: "game_score" + gameID,
      payload: {
        handle: userHandle,
        score: score,
        increase: scoreIncrease,
      },
    });
    console.log(row.time_limit - timeSpent / 1000 + 2);
    await waitWithTimeout((row.time_limit - timeSpent / 1000 + 2) * 1000);
    console.log("done awaiting");
    if (
      scores.length > row.users_in_game.length &&
      i != row.number_of_problems - 1
    ) {
      newScores = scores.slice(row.users_in_game.length, scores.length);
      scores = scores.slice(0, row.users_in_game.length);
    }
    if (i == row.number_of_problems - 1) await showScore(true);
    else await showScore(false);
    if (last) await wait(250);
  }
  supabaseClient.removeChannel(gameScoreChannel);
  await wait(1000);
  document.getElementById("scores").style.display = "none";
  //check rating change
  let ratings = [];
  let currentRating = 0;
  let ratingIndex = -1;
  for (let i = 0; i < scores.length; i++) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("handle", scores[i][0]);
    ratings.push(data[0].rating);
    if (data[0].uuid == currentUser.id) {
      currentRating = data[0].rating;
      ratingIndex = i;
    }
  }
  let ratingChange = 0;
  let divisors = 0;

  for (let i = 0; i < ratings.length; i++) {
    let diffOne =
      Math.pow(Math.abs(ratings[i] - ratings[ratingIndex] - 300), 1.5) / 400;
    let diffTwo = 33 - diffOne;
    if (ratingIndex > i) {
      if (
        ratings[ratingIndex] - ratings[i] <= 250 &&
        scores[ratingIndex][1] != scores[i][1]
      ) {
        if (ratings[ratingIndex] < ratings[i]) ratingChange -= diffTwo;
        else ratingChange -= diffOne;
      }
    } else if (ratingIndex < i) {
      if (
        ratings[ratingIndex] - ratings[i] <= 250 &&
        scores[ratingIndex][1] != scores[i][1]
      ) {
        if (ratings[ratingIndex] < ratings[i]) ratingChange += diffOne;
        else ratingChange += diffTwo;
      }
    } else divisors--;
    divisors++;
  }
  if (divisors != 0) ratingChange = ratingChange / divisors;
  const { data, error } = await supabaseClient
    .from("profiles")
    .update({ rating: currentRating + ratingChange })
    .eq("uuid", currentUser.id);

  let changeHTML =
    "<div>New rating: " + Math.floor(currentRating + ratingChange) + "(";
  if (ratingChange >= 0) changeHTML += "+";
  else changeHTML += "-";
  changeHTML += Math.floor(Math.abs(ratingChange)) + ")</div>";
  document.getElementById("gameQuestion").innerHTML = changeHTML;
  document.getElementById("gameQuestion").style.display = "block";

  await wait(2000);

  document.getElementById("leaveGameButton").style.display = "block";
  let index = 0;
  document.getElementById("gameQuestion").innerHTML =
    "<div>" +
    "<b><i><u>Question " +
    (index + 1) +
    "</u></i></b>" +
    questionArr[0] +
    "<pre>Your answer: " +
    answerArr[0] +
    "    Correct answer: " +
    questionRowArr[0].answer +
    "</pre></div>";
  document.getElementById("gameQuestion").style.marginTop = "10px";
  document.getElementById("gameQuestion").style.fontSize = "13px";
  document.getElementById("gameQuestion").style.display = "block";
  document.getElementById("forwardArrowQuestionButton").style.display = "block";
  document.getElementById("backArrowQuestionButton").style.display = "block";

  function questionForward() {
    index = (index + 1) % questionArr.length;
    document.getElementById("gameQuestion").innerHTML =
      "<div>" +
      "<b><i><u>Question " +
      (index + 1) +
      "</u></i></b>" +
      questionArr[index] +
      "<pre>Your answer: " +
      answerArr[index] +
      "    Correct answer: " +
      questionRowArr[index].answer +
      "</pre></div>";
  }

  function questionBack() {
    index = (index + questionArr.length - 1) % questionArr.length;
    document.getElementById("gameQuestion").innerHTML =
      "<div>" +
      "<b><i><u>Question " +
      (index + 1) +
      "</u></i></b>" +
      questionArr[index] +
      "<pre>Your answer: " +
      answerArr[index] +
      "    Correct answer: " +
      questionRowArr[index].answer +
      "</pre></div>";
  }
  document
    .getElementById("forwardArrowQuestionButton")
    .addEventListener("click", async () => {
      questionForward();
    });

  document
    .getElementById("backArrowQuestionButton")
    .addEventListener("click", async () => {
      questionBack();
    });

  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "ArrowLeft":
        questionBack();
        break;
      case "ArrowRight":
        questionForward();
        break;
    }
  });

  // delete row
  const { data: data2, error: error2 } = await supabaseClient
    .from("currentGames")
    .delete()
    .eq("game_id", row.game_id);
}

document
  .getElementById("submitQuestionForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data, error } = await supabaseClient
      .from("userAddedQuestions")
      .insert({
        question: document.getElementById("questionInput").value,
        user: currentUser.id,
        handle: userHandle,
      });
    document.getElementById("questionInput").value = "";
    document.getElementById("questionSubmitThanks").style.display = "block";
    await wait(5000);
    document.getElementById("questionSubmitThanks").style.display = "none";
  });

document
  .getElementById("bugFeedbackForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const { data, error } = await supabaseClient
      .from("userBugOrFeedback")
      .insert({
        text: document.getElementById("bugFeedbackInput").value,
      });
    document.getElementById("bugFeedbackInput").value = "";
    document.getElementById("bugFeedbackThanks").style.display = "block";
    await wait(5000);
    document.getElementById("bugFeedbackThanks").style.display = "none";
  });
