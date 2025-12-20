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

document.getElementById("newGame").addEventListener("click", async () => {
  document.getElementById("lobby").style.display = "none";
  const number_of_problems = 10;
  const time_limit = 30;
  let questions = [];
  for (let i = 0; i < number_of_problems; i++) {
    let a = Math.floor(Math.random() * 2) + 1;
    let b = a * 1000000;
    if (a == 1) b += Math.floor(Math.random() * 2);
    if (a == 2) b += Math.floor(Math.random() * 3);
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
    })
    .select();
  if (!error) {
    const { data: data2, error: error2 } = await supabaseClient
      .from("profiles")
      .update({
        in_game: data[0].game_id,
      })
      .eq("uuid", currentUser.id);

    document.getElementById("startGameButton").style.display = "block";
    joinGame(data[0].game_id);
  }
});

const lobbyMessagesChannel = supabaseClient
  .channel("lobbyMessages")
  .on("broadcast", { event: "lobby_message_sent" }, (payload) => {
    addLobbyMessage(payload.payload.text, payload.payload.handle);
  })
  .subscribe();

document
  .getElementById("lobbyMessageForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    lobbyMessagesChannel.send({
      type: "broadcast",
      event: "lobby_message_sent",
      payload: {
        text: document.getElementById("enterLobbyMessage").value,
        handle: userHandle,
      },
    });
    addLobbyMessage(
      document.getElementById("enterLobbyMessage").value,
      userHandle
    );
    document.getElementById("enterLobbyMessage").value = "";
  });
/*
const MAX_MESSAGES = 50;
let lobbyMessages = [];
let gameMessages = [];*/
// no limit of messages currently, do .push, .shift() for array
function addLobbyMessage(newMessage, handle) {
  if (newMessage != undefined) {
    const messages = document.getElementById("lobbyMessages");
    const div = document.createElement("div");
    if (handle.length > 10) handle = handle.slice(0, 10) + "...";
    div.textContent = " " + handle + ": " + newMessage;
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
      showCurrentGames();
    }
  )
  .subscribe(); // change to only update when # users change or game addition/deletion?

// make this faster
async function showCurrentGames() {
  const { data, error } = await supabaseClient.from("currentGames").select("*");
  let table = "<table>";
  for (let i = 0; i < data.length / 4; i++) {
    table += "<tr>";
    for (let j = 0; j < 4; j++) {
      if (i * 4 + j < data.length) {
        let row = data[i * 4 + j];
        table += "<td>";
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
            '<br></br><button class="joinGameButton" id="' + row.game_id + '">';
          table += "Join</button>";
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
    console.log("update error?");
    console.log(error4);
    joinGame(event.target.id);
  }
});

function lobby() {
  document.getElementById("loginOverlay").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("messageBox").style.display = "block";
  showCurrentGames();
}

document
  .getElementById("leaveGameButton")
  .addEventListener("click", async () => {
    document.getElementById("inGame").style.display = "none";
    document.getElementById("gameQuestion").style.display = "none";
    document.getElementById("leaveGameButton").style.display = "none";
    document.getElementById("startGameButton").style.display = "none";
    document.getElementById("forwardArrowQuestionButton").style.display =
      "none";
    document.getElementById("backArrowQuestionButton").style.display = "none";
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("in_game")
      .eq("uuid", currentUser.id);
    console.log(data + "leavr game");
    const gameID = data[0].in_game;
    const { data: data2, error: error2 } = await supabaseClient
      .from("profiles")
      .update({ in_game: null })
      .eq("uuid", currentUser.id);
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
      if (data6 == currentUser.id) {
        // wrong?
        const { data: data7, error: error7 } = await supabaseClient
          .from("currentGames")
          .update({ host_id: newArr[0] })
          .eq("game_id", gameID);
      }
    }
    wait(500);
    showCurrentGames();
    document.getElementById("lobby").style.display = "block";
  });

async function joinGame(gameID) {
  document.getElementById("inGame").style.display = "block";
  document.getElementById("leaveGameButton").style.display = "block";
  const checkInGameChannel = supabaseClient
    .channel("in_game")
    .on(
      "broadcast",
      {
        event: "game_start" + gameID,
      },
      (payload) => {
        supabaseClient.removeChannel(checkInGameChannel);
        console.log("payload:");
        console.log(payload);
        console.log(payload.payload);
        startGame(payload.payload.row);
      }
    )
    .subscribe();

  document
    .getElementById("startGameButton")
    .addEventListener("click", async () => {
      // should i remove the ability to leave game (leavegamebutton style display = none)
      // edit so only host can start, otherwise gives error (or remove the button for non-host)
      // update: made rls policy only host can start, problem is that other people can edit the host lol

      const { data, error } = await supabaseClient
        .from("currentGames")
        .update({ has_started: true })
        .eq("host_id", currentUser.id);
      if (!error) {
        const { data: data2, error: error2 } = await supabaseClient
          .from("profiles")
          .select("in_game")
          .eq("handle", userHandle);
        const { data: data3, error: error3 } = await supabaseClient
          .from("currentGames")
          .select("*")
          .eq("game_id", gameID);
        checkInGameChannel.send({
          type: "broadcast",
          event: "game_start" + gameID,
          payload: { row: data2[0] },
        });
        document.getElementById("startGameButton").style.display = "none";
        supabaseClient.removeChannel(checkInGameChannel);
        if (error2) console.log(error3);
        console.log("start host row?");
        console.log(data3);
        console.log(data3[0].host_id);
        startGame(data3[0]);
      }
    });
}

async function startGame(row) {
  document.getElementById("startedGame").style.display = "block";
  console.log("row" + row);
  const gameID = row.game_id;
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

  async function showScore() {
    let scoresDisplay = "<div>";
    scores.sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < scores.length; i++) {
      let rank = i + 1;
      scoresDisplay +=
        "<p>" +
        rank +
        ". " +
        scores[i][0] +
        ": " +
        scores[i][1] +
        " pts" +
        "</p>";
    }
    scoresDisplay += "</div>";
    document.getElementById("scores").innerHTML = scoresDisplay;
    document.getElementById("scores").style.display = "block";
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
        scores.push([payload.payload.handle, payload.payload.score]);
      }
    )
    .subscribe();

  function waitForAllDone() {
    return new Promise(async (resolve) => {
      while (scores.length != row.users_in_game.length) {
        await wait(1000);
      }
      resolve();
    });
  }
  async function waitWithTimeout(ms) {
    return Promise.race([
      waitForAllDone(),
      new Promise((resolve) => setTimeout(ms)),
    ]);
  }
  let questionRowArr = [];
  let questionArr = [];
  let answerArr = [];
  let score = 0;
  for (let i = 0; i < row.number_of_problems; i++) {
    document.getElementById("scores").style.display = "none";
    scores = [];
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
    document.getElementById("gameQuestion").style.fontSize = "15";
    document.getElementById("gameQuestion").style.display = "block";
    document.getElementById("answerForm").style.display = "block";
    let timestamp = [Date.now()];
    let getAnswerArr = [];
    const result = await waitForInput(
      (row.time_limit + 1) * 1000,
      timestamp,
      getAnswerArr
    ); // ms to s, +1 to account for time to call backend
    document.getElementById("answerForm").style.display = "none";
    document.getElementById("gameQuestion").style.display = "none";
    const timeSpent = timestamp[1] - timestamp[0];
    let answer = "";
    if (result == "submitted") {
      answer = getAnswerArr[0];
      if (answer == questionRow.answer)
        score += 1.2 * row.time_limit - timeSpent / 1000;
    }
    answerArr.push(answer);
    let last = false;
    if (scores.length == row.users_in_game.length - 1) last = true;
    scores.push([userHandle, score]);
    gameScoreChannel.send({
      type: "broadcast",
      event: "game_score" + gameID,
      payload: {
        handle: userHandle,
        score: score,
      },
    });
    await waitWithTimeout((row.time_limit - timeSpent + 2) * 1000);
    await showScore();
    if (last) await wait(250);
  }
  supabaseClient.removeChannel(gameScoreChannel);
  await wait(1000);
  document.getElementById("scores").style.display = "none";
  //check rating change
  let ratings = [];
  for (let i = 0; i < scores.length; i++) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("rating")
      .eq("handle", scores[i][0]);
    console.log(data[0]);
    ratings.push(data[0]);
  }
  await wait(1500);

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
  document.getElementById("gameQuestion").style.display = "block";
  document.getElementById("gameQuestion").style.fontSize = "12";
  document.getElementById("forwardArrowQuestionButton").style.display = "block";
  document.getElementById("backArrowQuestionButton").style.display = "block";

  document
    .getElementById("forwardArrowQuestionButton")
    .addEventListener("click", async () => {
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
    });

  document
    .getElementById("backArrowQuestionButton")
    .addEventListener("click", async () => {
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
    });

  //document.getElementById("leaveGameButton").style.display = "none";
  // add end page, question and answers
}
