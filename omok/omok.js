class Omok {

  // 상수 정의
  VACANT = '';
  BLACK = 'black';
  WHITE = 'white';
  HUMAN = 'H';
  COM = 'C';

  Alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
  //오목 패턴: 흑은 6목 이상인 경우 금수이므로 만들어지더라도 오목이 아님
  omokPattern = [
    ['SBBBBBS', 'SBBBBBW', 'SBBBBBX', 'WBBBBBS', 'WBBBBBW', 'WBBBBBX', 'XBBBBBS', 'XBBBBBW', 'XBBBBBX'],
    ['WWWWW']
  ];

  boardSize; // 15*15 or 19*19
  playerType = this.HUMAN;
  firstPlayer = this.HUMAN;
  blockInterval; // 오목판 격자 간격

  // 메인보드정보 배열정의
  // mainBoard = []; // 착수정보 배열
  mainBoard = new ObservableArray(
    () => {
      this.makeOmokArray();
    },
    () => {
      this.makeOmokArray();
    }
  );

  omokFlag = [];
  omokFlagPattern = [];
  boardArray; // 오목판 착수정보 배열
  scoreArray;

  constructor(boardSize, playerType, firstPlayer) {

    this.pointInfo = {
      x: 0,
      y: 0,
      color: "",
      order: 0
    };

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

  /**
   * 착수 정보 배열을 오목판(15*15 or 19*19) 형태의 2차원 배열로 변환
   */
  makeOmokArray() {
    this.boardArray = Array.from(Array(this.boardSize + 1), () => new Array(this.boardSize + 1).fill(''));
    this.mainBoard.forEach(item => {
      this.boardArray[item.x][item.y] = item.color;
    })
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

    for (let i = 0; i < this.mainBoard.length; i++) {
      this.drawStone(ctx, this.mainBoard[i]);
    }
  }

  drawDot(x, y) {
    context.beginPath();
    context.fillStyle = 'black';
    context.arc(x * this.blockInterval, y * this.blockInterval, 3, 0, Math.PI * 2, false);
    context.fill();
  }

  // 오목판 위치 변환(canvas 위치 -> 오목 위치)
  // canvas 상의 위치값을 오목판 사이즈에 맞는 오목위치로 변환
  getOmokPosition(LayerX, LayerY) {
    return {
      'omokX': Math.round(LayerY / this.blockInterval),
      'omokY': Math.round(LayerX / this.blockInterval),
    };
  }

  // 오목판 위치 변환 (오목 위치 -> canvas 위치)
  // 오목돌을 그리기 위해 오목위치값을 canvas 상의 위치값으로 변환
  getBoardPosition(omokX, omokY) {
    return {
      'boardX': omokY * this.blockInterval,
      'boardY': omokX * this.blockInterval
    };
  }

  // 다음 오목돌의 색 구하기
  getNextColor() {
    if (this.mainBoard.length === 0) { // 첫 수는 무조건 흑을 줘야함
      return 'black';
    } else {
      return this.mainBoard[this.mainBoard.length - 1].color === 'black' ? 'white' : 'black';
    }
  }

  putStone(omokX, omokY) {
    let pointInfo = Object.create(this.pointInfo);

    pointInfo.x = omokX;
    pointInfo.y = omokY;
    pointInfo.color = this.getNextColor();
    pointInfo.order = this.mainBoard.length + 1;
    this.mainBoard.push(pointInfo);

    // 착수점 분석: 오목여부 판단
    // 1번 방향
    this.analyzePoint(pointInfo, (this.mainBoard[this.mainBoard.length - 1].color === this.BLACK ? 0 : 1), 1, 0, 1);
    // 2번 방향
    this.analyzePoint(pointInfo, (this.mainBoard[this.mainBoard.length - 1].color === this.BLACK ? 0 : 1), 0, 1, 2);
    //3번 방향
    this.analyzePoint(pointInfo, (this.mainBoard[this.mainBoard.length - 1].color === this.BLACK ? 0 : 1), 1, 1, 3);
    //4번 방향
    this.analyzePoint(pointInfo, (this.mainBoard[this.mainBoard.length - 1].color === this.BLACK ? 0 : 1), -1, 1, 4);
  }

  /**
   * 오목돌 그리기
   * @param ctx context
   * @param pointInfo 오목돌 그릴 오목 위치
   */
  drawStone(ctx, pointInfo) {
    // 오목돌을 그릴 위치 계산
    let {boardX, boardY} = this.getBoardPosition(pointInfo.x, pointInfo.y);

    // 오목돌 그리기
    ctx.beginPath();
    ctx.strokeStyle = 'darkgrey';
    ctx.arc(boardX, boardY, (this.blockInterval - 2) / 2, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fillStyle = pointInfo.color;
    ctx.arc(boardX, boardY, (this.blockInterval - 2) / 2, 0, Math.PI * 2, false);
    ctx.fill();
  }

  /**
   * 기 착수 여부 판단
   * @param omokX
   * @param omokY
   */
  checkOccupied(omokX, omokY) {
    let filtered = this.mainBoard.filter(point => {
      return (point.x === omokX) && (point.y === omokY);
    });

    return filtered.length > 0;
  }

  /**
   * 무르기 처리: 마지막에 착수한 착수정보를 삭제
   */
  undoStone() {
    this.mainBoard.pop();
  }

  /**
   * 착수정보 추출
   * @param array 오목판과 동일하게 15*15 또는 19*19 구조의 2차원 배열
   * @param item 최종적으로 착수한 포인트 객체 (속성: x, y, color, order)
   * @param dx 가로바향의 증감을 조정하기 위한 변수(1이면 증가, 0이면 고정, -1이면 감소)
   * @param dy 세로방향의 증감을 조정하기 위한 변수(1이면 증가, 0이면 고정, -1이면 감소)
   */
  getStoneInfo(array, item, dx, dy) {
    let pointX;
    let pointY;
    let pos = 0;
    let getStoneInfo = '';
    let spaceCount = 0; //연속된 공백 개수

    //멈춤 조건
    //  1.다른 돌이 있는 경우
    //  2.오목판을 벗어난 경우
    //  3.공백인 경우는 연속3개 공백이면 멈춤
    do {
      pointX = item.x + pos * dx;
      pointY = item.y + pos * dy;
      if (pointX < 1 || pointX > this.boardSize || pointY < 1 || pointY > this.boardSize) {
        getStoneInfo += 'X';
        break;
      }
      if (array[pointX][pointY] === 'black') {
        getStoneInfo += 'B';
        spaceCount = 0;
        //돌이 바뀌면 멈춤
        if (array[pointX][pointY] !== item.color) break;
      } else if (array[pointX][pointY] === 'white') {
        getStoneInfo += 'W';
        spaceCount = 0;
        //돌이 바뀌면 멈춤
        if (array[pointX][pointY] !== item.color) break;
      } else {
        getStoneInfo += 'S';
        spaceCount++;
        //연속된 공백수가 3개이면 멈춤
        if (spaceCount === 3) break;
      }
      pos++;
    } while (pointX >= 1 && pointX <= this.boardSize && pointY >= 1 && pointY <= this.boardSize);

    spaceCount = 0;
    pos = 1;

    do {
      pointX = item.x + pos * dx * (-1);
      pointY = item.y + pos * dy * (-1);
      if (pointX < 1 || pointX > this.boardSize || pointY < 1 || pointY > this.boardSize) {
        getStoneInfo = 'X' + getStoneInfo;
        break;
      }
      if (array[pointX][pointY] === 'black') {
        getStoneInfo = 'B' + getStoneInfo;
        spaceCount = 0;
        //돌이 바뀌면 멈춤
        if (array[pointX][pointY] !== item.color) break;
      } else if (array[pointX][pointY] === 'white') {
        getStoneInfo = 'W' + getStoneInfo;
        spaceCount = 0;
        //돌이 바뀌면 멈춤
        if (array[pointX][pointY] !== item.color) break;
      } else {
        getStoneInfo = 'S' + getStoneInfo;
        spaceCount++;
        //연속된 공백수가 3개이면 멈춤
        if (spaceCount === 3) break;
      }
      pos++;
    } while (pointX >= 1 && pointX <= this.boardSize && pointY >= 1 && pointY <= this.boardSize);

    return getStoneInfo;
  }

  /**
   * 패턴 검색
   * @param stoneInfo
   * @param pattern
   */
  findPattern(stoneInfo, pattern) {
    let result = false;
    pattern.forEach(i => {
      if (stoneInfo.includes(i)) {
        result = true;
      }
    });
    return result;
  }

  /**
   * 분석 함수
   * @param pointInfo
   * @param checkStone
   * @param dx
   * @param dy
   * @param direction
   */
  analyzePoint(pointInfo, checkStone, dx, dy, direction) {

    // 패턴 flag 초기화
    this.omokFlag[direction] = false;

    const pattern = this.getStoneInfo(this.boardArray, pointInfo, dx, dy);

    // 오목 체크
    if (this.findPattern(pattern, this.omokPattern[checkStone])) {
      this.omokPattern[direction] = true;
      this.omokFlagPattern[direction] = pattern;
      return;
    }
  }
}

class ObservableArray extends Array {
  constructor(onPush, onPop, ...elements) {
    super(...elements);

    this.onPush = onPush;
    this.onPop = onPop;
  }

  push(...elements) {
    super.push(...elements);
    this.onPush?.(this);
  }

  pop() {
    super.pop();
    this.onPop?.(this);
  }
}
