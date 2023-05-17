$(document).ready(() => {
  let gamePath = "./zmijica-igra.html?";
  let resultsPath = "./zmijica-rezultati.html";

  $("#game").click(function (event) {
    event.preventDefault();
    let difficulty = $("#selectDifficulty").val();
    let mapSize = $("#selectMap").val();
    window.location.href =
      gamePath + "difficulty=" + difficulty + "&mapSize=" + mapSize;
  });

  $("#results").click(function (event) {
    event.preventDefault();
    window.location.href = resultsPath;
  });
});
