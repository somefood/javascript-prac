const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');

const startButton = document.querySelector('.start');
const undoButton = document.querySelector('.undo');

const boardSizeButton = document.getElementsByName('boardsize');

const playerButton = document.getElementsByName('playertype');

const firstPlayerButton = document.getElementsByName('firstplayer');

let boardSize;
let playerType;
let firstPlayer;

// 오목판 사이즈 설정
if (document.getElementById('size15').checked) boardSize = 15;
if (document.getElementById('size19').checked) boardSize = 19;

// 상대선수: 사람 설정
if (document.getElementById('human').checked) {
  playerType = 'H';
  document.querySelector('.firstplayer').style.display = 'none';
}

// 상대선수: 컴퓨터 설정
if (document.getElementById('com').checked) {
  playerType = 'C';
  document.querySelector('.firstplayer').style.display = 'block';
}

// 흑 선수 설정
if (document.getElementById('humanfirst').checked) firstPlayer = 'H';
if (document.getElementById('comfirst').checked) firstPlayer = 'C';

// 오목판 사이즈 선택 이벤트 처리
for (let i = 0; i < boardSizeButton.length; i++) {
  boardSizeButton[i].addEventListener('click', () => {
    if (boardSizeButton[i].id === 'size15') boardSize = 15;
    if (boardSizeButton[i].id === 'size19') boardSize = 19;
  });
}

// 상대선수 선택 이벤트 처리
for (let i = 0; i < playerButton.length; i++) {
  playerButton[i].addEventListener('click', () => {
    if (playerButton[i].id === 'human') {
      playerType = 'H';
      document.querySelector('.firstplayer').style.display = 'none';
    }
    if (playerButton[i].id === 'com') {
      playerType = 'C';
      document.querySelector('.firstplayer').style.display = 'block';
    }
  });
}

// 혹 선수 선택 이벤트 처리
for (let i = 0; i < firstPlayerButton.length; i++) {
  firstPlayerButton[i].addEventListener('click', () => {
    if (firstPlayerButton[i].id === 'humanfirst') firstPlayer = 'H';
    if (firstPlayerButton[i].id === 'comfirst') firstPlayer = 'C';
  });
}

// 오목 객체 생성
let omokGame = new Omok(boardSize, playerType, firstPlayer);

// 오목판 그리기
omokGame.drawBoard(context);

startButton.addEventListener('click', () => {
  alert(`시작버튼 클랙=> 사이즈 ${boardSize}, 상대선수: ${playerType}, 흑 선수: ${firstPlayer}`)
});

undoButton.addEventListener('click', () => {
  alert('무르기버튼 클릭!');
});

canvas.addEventListener('click', e => {
  alert(`착수=> (${e.layerX}, ${e.layerY})`);
});
