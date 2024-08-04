let socket;
const canvas = document.querySelector('.canvas');
const context = canvas.getContext('2d');
const roomInfo = document.querySelector('.room-info');

const startButton = document.querySelector('.start');
const undoButton = document.querySelector('.undo');
const exitButton = document.querySelector('.exit');

const urlSearch = new URLSearchParams(location.search);
const roomId = urlSearch.get('roomId');

const playerButton = document.getElementsByName('playertype');

const firstPlayerButton = document.getElementsByName('firstplayer');
const playSound = new Audio('tak.wav');

let boardSize = 15;
let playerType;
let firstPlayer;

function initSocket(roomId) {
  if (!socket) {
    socket = io('ws://localhost:9090', {transports: ["websocket"]});
    socket.emit("join_room", roomId);

    socket.on('start', () => {
      console.log('게임 시작');
    })

    socket.on('chat', async (message) => {
      const newChat = document.createElement('div');
      newChat.classList.add('message', 'received');
      newChat.innerText = message;
      chattingList.appendChild(newChat);
    });

    socket.on('put', position => {
      put(position.omokX, position.omokY);
    });
  }
}

async function initRoomInfo(roomId) {
  const response = await fetch(`http://localhost:9090/rooms/${roomId}`);
  const roomInfo = await response.json();
  console.log(roomInfo);
  const roomName = document.querySelector('.room-name');
  roomName.textContent = roomInfo.roomName;
}

function initOmokGame(boardSize, playerType, firstPlayer) {
  const omok = new Omok(boardSize, playerType, firstPlayer);
  omok.drawBoard(context);
  return omok;
}

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

startButton.addEventListener('click', () => {
  console.log(`시작버튼 클랙=> 사이즈 ${boardSize}, 상대선수: ${playerType}, 흑 선수: ${firstPlayer}`);
  let restartFlag = false;

  //게임 진행중이면 확인 후 새게임 처리
  if (omokGame.getOrder() > 0) {
    if (confirm("게임 진행 중입니다. 다시 시작하겠습니까?")) {
      restartFlag = true;
    }
  } else {
    restartFlag = true;
  }

  if (restartFlag) {
    //오목객체 생성(초기화)
    omokGame = new Omok(boardSize, playerType, firstPlayer);

    //컴퓨터가 선수이면 컴퓨터 착수 처리

    //오목판 그리기
    omokGame.drawBoard(context);
  }
});

// 무르기 버튼 이벤트 처리
undoButton.addEventListener('click', () => {
  console.log('무르기버튼 클릭!');
  if (omokGame.omokFlag[1] || omokGame.omokFlag[2] || omokGame.omokFlag[3] || omokGame.omokFlag[4]) {
    return;
  }

  // 무르기 처리
  omokGame.undoStone();

  // 오목판 그리기
  omokGame.drawBoard(context);
});

exitButton.addEventListener('click', () => {
  const exit = confirm('퇴장하겠습니까?');
  if (exit) {
    history.back();
  }
})

// 사람 착수 처리
canvas.addEventListener('click', e => {
  //현재 오목이면 return
  if (omokGame.omokFlag[1] || omokGame.omokFlag[2] || omokGame.omokFlag[3] || omokGame.omokFlag[4]) {
    alert('게임이 종료되었습니다. 새로 시작하십시오.');
    return;
  }

  let {omokX, omokY} = omokGame.getOmokPosition(e.layerX, e.layerY - roomInfo.clientHeight);

  // 오목판을 벗어나면 return (무시)
  if (omokX < 1 || omokX > boardSize || omokY < 1 || omokY > boardSize) {
    alert('오목판 내에서 클릭해 주십시오.');
    return;
  }

  // 클릭 포인트에 이미 돌이 있는 경우 return (무시)
  if (omokGame.checkOccupied(omokX, omokY)) {
    alert('이미 착수된 지점입니다. 다른 곳을 선택해주십시오.');
    return;
  }

  console.log(`클릭 위치=> (${e.layerX}, ${e.layerY}) 오목판 위치=> (${omokX}, ${omokY})`);

// 착수정보 저장(추가)
  put(omokX, omokY);
  socket.emit('put', roomId, {omokX: omokX, omokY: omokY})

  // 오목여부 체크
  if (omokGame.omokFlag[1] || omokGame.omokFlag[2] || omokGame.omokFlag[3] || omokGame.omokFlag[4]) {
    setTimeout(() => {
      alert('오목!!! 다음 게임을 계속하려면 시작버튼을 누르세요.');
    });
    return;
  }
});

function put(omokX, omokY) {
  omokGame.putStone(omokX, omokY);

  // 오목판 그리기
  omokGame.drawBoard(context);

  // 착수 소리 재생
  playSound.play();
}

const chattingList = document.querySelector('#chatting-list');

const chatMessage = document.querySelector('#message');
chatMessage.addEventListener('keydown', ({key, isComposing}) => {
  if (isComposing) {
    return;
  }

  if (key === 'Enter') {
    console.log('데이터 전송');
    const newChat = document.createElement('div');
    newChat.classList.add('message', 'sent');
    newChat.innerText = chatMessage.value;
    chattingList.appendChild(newChat);
    socket.emit('chat', chatMessage.value, roomId);
    chatMessage.value = "";
  }
});

initRoomInfo(roomId);

// 소켓 생성
initSocket(roomId);
// 오목 객체 생성
let omokGame = initOmokGame(boardSize, playerType, firstPlayer);
