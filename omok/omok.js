class Omok {

  // 상수 정의
  VACANT = '';
  BLACK = 'black';
  WHITE = 'white';
  HUMAN = 'H';
  COM = 'C';

  Alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

  boardSize; // 15*15 or 19*19
  playerType = this.HUMAN;
  firstPlayer = this.HUMAN;
  blockInterval; // 오목판 격자 간격

  // 메인보드정보 배열정의
  mainBoard; // 착수정보 배열
  boardArray; // 오목판 착수정보 배열
  scoreArray;

  constructor(boardSize, playerType, firstPlayer) {
    // 오목판 사이즈 세팅
    this.boardSize = boardSize;

    // 오목판 사이즈에 따라 오목판 격자 간격 설정
    if (this.boardSize === 19) {
      this.blockInterval = 30;
    } else if (this.boardSize === 15) {
      this.blockInterval = 38;
    }

    // 오목판 배열 생성. 초기값 ''로 세팅
    this.boardArray = Array.from(
      Array(this.boardSize + 1),
      () => new Array(this.boardSize + 1).fill('')
    );

    // 점수 배열 생성. 초기값 1로 세팅
    this.scoreArray = Array.from(Array(this.boardSize + 1),
      () => new Array(this.boardSize + 1).fill(1));

    // 상대선수 세팅
    this.playerType = playerType;

    // 흑 선수 세팅
    this.firstPlayer = firstPlayer;
  }

  drawBoard(ctx) {
    ctx.clearRect(0, 0, 700, 630);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'black';

    // 오목판 그리기
    for (let i = 1; i < this.boardSize; i++) {
      for (let j = 1; j < this.boardSize; j++) {
        // 정사각형 그리기
        ctx.strokeRect(i * this.blockInterval, j * this.blockInterval, this.blockInterval, this.blockInterval);
      }
    }

    // 오목판 점 생성
    if (this.boardSize === 19) {
      this.drawDot(4, 4);
      this.drawDot(4, 10);
      this.drawDot(4, 16);
      this.drawDot(10, 4);
      this.drawDot(10, 10);
      this.drawDot(10, 16);
      this.drawDot(16, 4);
      this.drawDot(16, 10);
      this.drawDot(16, 16);
    } else if (this.boardSize === 15) {
      this.drawDot(4, 4);
      this.drawDot(4, 12);
      this.drawDot(12, 4);
      this.drawDot(12, 12);
    }

    // 세로 레이블 표시(숫자)
    for (let i = 1; i <= this.boardSize; i++) {
      ctx.fillStyle = 'darkGrey';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.font = '12px verdana';
      ctx.fillText(i, (this.blockInterval / 2) + 5, (i * this.blockInterval) - 5);
    }

    // 가로 레이블 표시(알파벳)
    for (let i = 1; i <= this.boardSize; i++) {
      ctx.fillStyle = 'darkGrey';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.font = '12px verdana';
      ctx.fillText(this.Alphabet[i - 1], (i * this.blockInterval), (this.boardSize * this.blockInterval + 9));
    }
  }

  drawDot(x, y) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(x * this.blockInterval, y * this.blockInterval, 3, 0, Math.PI * 2, false);
    context.fill();
  }
}
