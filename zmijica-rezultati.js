$(document).ready(function () {
  let difficulty = null;
  let mapSize = null;
  let username = null;
  let score = null;
  let scoreTable = new Map();

  function getParameters() {
    let query = window.location.search.substring(1);
    if (query.length > 0) {
      $(".previousScore").show();
      let params = query.split("&");
      difficulty = params[0].split("=")[1];
      mapSize = params[1].split("=")[1];
      username = params[2].split("=")[1];
      score = params[3].split("=")[1];
      $("#diffToFill").text(difficulty);
      $("#mapToFill").text(mapSize);
      $("#scoreToFill").text(score);

      updateLocalStorage();
    } else {
      $(".previousScore").hide();
    }
  }

  function cmpScorePair(a, b) {
    if (a.score > b.score) {
      return -1;
    } else if (a.score < b.score) {
      return 1;
    } else {
      return 0;
    }
  }

  function updateLocalStorage() {
    let list =
      scoreTable.get(`${difficulty}-${mapSize}`) == null
        ? []
        : scoreTable.get(`${difficulty}-${mapSize}`);
    list.push({ username, score });
    list.sort(cmpScorePair);
    list = list.slice(0, 5);
    scoreTable.set(`${difficulty}-${mapSize}`, list);
    localStorage.setItem(
      "scoreTable",
      JSON.stringify(Object.fromEntries(scoreTable))
    );
  }

  function getScoreTable() {
    let jsonObject =
      localStorage.getItem("scoreTable") == null
        ? null
        : JSON.parse(localStorage.getItem("scoreTable"));
    if (jsonObject != null) {
      for (let key in jsonObject) {
        let list = [];
        for (let item in jsonObject[key]) {
          list.push(jsonObject[key][item]);
        }
        scoreTable.set(key, list);
      }
    }
  }

  function populateTables() {
    for (const [key, list] of scoreTable) {
      console.log(key);
      let table = $("#" + key);
      let list = scoreTable.get(key);
      for (let id in list) {
        let row = $("<tr></tr>");
        let th = $(`<th>${Number(id) + 1}</th>`);
        let username = $(`<td>${list[id].username}</td>`);
        let score = $(`<td>${list[id].score}</td>`);
        row.append(th).append(username).append(score);
        table.append(row);
      }
      console.log(list);
    }
  }

  getScoreTable();
  getParameters();
  populateTables();

  $("#homepage").click(function (event) {
    event.preventDefault();
    window.location.href = "./zmijica-uputstvo.html";
  });
});
