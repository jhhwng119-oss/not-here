/**
 * "Not Here." - 야바위꾼 시뮬레이터 Core Game Logic
 */

// 1. SOUND SYNTHESIS ENGINE (Web Audio API)
const AudioEngine = {
  ctx: null,
  enabled: true,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser.");
    }
  },

  playTone(frequency, type, duration, volume = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Resume AudioContext if suspended (browser security policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playClick() {
    this.playTone(600, 'sine', 0.08, 0.08);
  },

  playShuffle() {
    this.playTone(150, 'triangle', 0.12, 0.12);
  },

  playSleightSuccess() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.25);
  },

  playSleightFail() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.35);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.35);
  },

  playCoin() {
    this.playTone(880, 'sine', 0.08, 0.12);
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.25, 0.12);
    }, 70);
  },

  playLose() {
    this.playTone(180, 'sawtooth', 0.4, 0.12);
  },

  playDistraction() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(now + 0.6);
  },

  playUpgrade() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.15, 0.08);
      }, i * 60);
    });
  },

  playTypingSound() {
    this.playTone(600 + Math.random() * 400, 'sine', 0.02, 0.015);
  }
};

// 2. CUSTOMER TEMPLATES & AVATAR GENERATION
const NPC_TEMPLATES = [
  {
    id: 'novice',
    name: '초보 피터',
    title: '초보 손님',
    badgeClass: 'badge-easy',
    baseObs: 0.30,
    bet: 20,
    avatarColor: '#10b981',
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="45" r="30" fill="#3b3b4f" stroke="#10b981" stroke-width="3"/>
        <circle cx="40" cy="40" r="6" fill="#fff"/>
        <circle cx="40" cy="40" r="2" fill="#000"/>
        <circle cx="60" cy="40" r="6" fill="#fff"/>
        <circle cx="60" cy="40" r="2" fill="#000"/>
        <!-- Glasses -->
        <rect x="30" y="36" width="40" height="2" fill="#10b981"/>
        <circle cx="40" cy="40" r="8" fill="none" stroke="#10b981" stroke-width="2"/>
        <circle cx="60" cy="40" r="8" fill="none" stroke="#10b981" stroke-width="2"/>
        <!-- Mouth -->
        <path d="M 42 60 Q 50 66 58 60" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "와, 야시장에 야바위가 있네? 재밌겠다!",
        "길거리 게임은 처음인데... 한 번 도전해 볼까요?",
        "가장 쉬워 보이는 컵으로 골라야지!"
      ],
      think: [
        "어... 음... 어떤 컵이더라?",
        "이 컵인 것 같기도 하고...?",
        "아, 너무 빨리 섞으시네요!",
        "제발 맞혀라! 찍기 신공 들어간다!",
        "가장 왼쪽에 있는 게 수상한데...",
        "눈이 팽팽 돌아요. 그냥 느낌대로 고를래요!",
        "이건가? 아냐, 저건가? 으아아 선택장애 온다!",
        "엄마가 모르면 가운데로 찍으랬는데...",
        "눈 깜빡하는 사이에 놓쳤어요. 대충 아무거나 가자!"
      ],
      win: [
        "대박! 내가 맞혔어! 완전 식은 죽 먹기네!",
        "우와! 진짜 여기 있었네요! 돈 벌었다!",
        "역시 내 직감이 맞았어!"
      ],
      lose: [
        "어라? 분명 여기에 있었는데...",
        "아깝다! 다음번엔 꼭 맞혀야지.",
        "야바위가 생각보다 쉽지 않네요..."
      ],
      caught: [
        "방금 손이 좀 이상한데요...? 사기 친 거 아니에요?",
        "잠깐만요, 공이 왜 거기서 나와요?"
      ]
    }
  },
  {
    id: 'student',
    name: '공대생 민수',
    title: '학생',
    badgeClass: 'badge-normal',
    baseObs: 0.50,
    bet: 35,
    avatarColor: '#3b82f6',
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="45" r="30" fill="#3b3b4f" stroke="#3b82f6" stroke-width="3"/>
        <rect x="42" y="10" width="16" height="8" fill="#3b82f6"/>
        <circle cx="42" cy="42" r="5" fill="#fff"/>
        <circle cx="42" cy="42" r="2.5" fill="#000"/>
        <circle cx="58" cy="42" r="5" fill="#fff"/>
        <circle cx="58" cy="42" r="2.5" fill="#000"/>
        <!-- Glasses rim -->
        <rect x="37" y="39" width="10" height="6" fill="none" stroke="#3b82f6" stroke-width="2"/>
        <rect x="53" y="39" width="10" height="6" fill="none" stroke="#3b82f6" stroke-width="2"/>
        <line x1="47" y1="42" x2="53" y2="42" stroke="#3b82f6" stroke-width="2"/>
        <!-- Mouth -->
        <line x1="43" y1="62" x2="57" y2="62" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "컵의 궤적과 속도로 볼 때, 회전 주기는 대략 일정하군.",
        "물리학 법칙을 무시할 수 없죠. 과학적으로 풀어내겠습니다.",
        "단순 관성 추적입니다. 제 눈은 못 속여요."
      ],
      think: [
        "각가속도를 고려하면... 세 번째인가?",
        "프레임 단위로 뇌내 역추적 중...",
        "마찰력 상수를 계산해 볼 때 여기다!",
        "컵의 포물선 반사 각도를 계산하면...",
        "지구 자전 속도까지 대입해 봐야겠어.",
        "공학적 직감으로는 이 컵이 확실해.",
        "선형대수학 벡터 계산상 이 위치일 확률이 66.7%...",
        "아날로그 궤적 추적 알고리즘 가동 중...",
        "손목 회전 토크를 미분해서 궤적 역추적 중..."
      ],
      win: [
        "Q.E.D. 제 궤적 계산이 완벽했군요.",
        "예상된 결과입니다. 확률은 100%였죠.",
        "당신의 무작위 난수 생성은 너무 뻔하네요."
      ],
      lose: [
        "어? 오차 범위 밖의 움직임인데... 유체역학인가?",
        "이상하다. 회전 중심 축 계산이 틀렸나?",
        "이건 물리 법칙 위배인데... 기류의 영향인가?"
      ],
      caught: [
        "물리학적으로 불가능한 좌표 이동입니다. 사기 검출 완료!",
        "손가락의 프레임 간격에 불연속점이 발견되었습니다. 해명하시죠."
      ]
    }
  },
  {
    id: 'magician',
    name: '마술사 루나',
    title: '마술사',
    badgeClass: 'badge-hard',
    baseObs: 0.70,
    bet: 60,
    avatarColor: '#f59e0b',
    trickResistant: true,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#f59e0b" stroke-width="3"/>
        <!-- Top Hat -->
        <path d="M 25 25 L 75 25 L 70 5 L 30 5 Z" fill="#1e1e2d" stroke="#f59e0b" stroke-width="2"/>
        <rect x="20" y="23" width="60" height="4" fill="#f59e0b"/>
        <!-- Eyes -->
        <polygon points="35,45 45,42 40,49" fill="#00e5ff"/>
        <polygon points="65,45 55,42 60,49" fill="#00e5ff"/>
        <!-- Smile -->
        <path d="M 40 65 Q 50 72 60 65" fill="none" stroke="#f59e0b" stroke-width="2"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "저도 마술사랍니다. 미스디렉션은 통하지 않아요.",
        "동종 업계끼리 살살 합시다. 손기술 좀 볼까요?",
        "어떤 마술이든 트릭은 존재하기 마련이죠."
      ],
      think: [
        "시선 유도는 훌륭했지만... 본질은 이겁니다.",
        "거짓 정보(Decoy)가 꽤 그럴듯하군요.",
        "내 눈은 이미 비밀을 알고 있어요.",
        "클래식 포스 기법인가요? 꽤 능숙하시네요.",
        "마술에서는 언제나 꼼수가 숨어있기 마련이죠.",
        "손가락 끝의 텐션을 보니 답이 보입니다.",
        "소매 안으로 들어간 건 아니겠죠? 의심스러운 컵은...",
        "일루션의 규칙: 눈에 보이는 것만 믿지 마라.",
        "컵 바닥의 미세한 각도 불일치... 감지 완료."
      ],
      win: [
        "속임수보다 제 눈이 더 빠르답니다.",
        "다음엔 좀 더 연출에 신경 쓰셔야겠어요.",
        "마술사의 눈을 피할 순 없죠."
      ],
      lose: [
        "오... 대단한 미스디렉션이네요. 속았습니다.",
        "설마 더블 리프트? 훌륭한 속임수였어요.",
        "박수를 보냅니다. 완전히 당했네요."
      ],
      caught: [
        "트릭이 너무 조잡해요. 협회에 신고해야겠는걸요?",
        "방금 그 팜(Palm) 기술은 영 형편없군요."
      ]
    }
  },
  {
    id: 'detective',
    name: '오형사',
    title: '형사',
    badgeClass: 'badge-danger',
    baseObs: 0.85,
    bet: 100,
    avatarColor: '#ff3366',
    detectiveAlert: true,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#ff3366" stroke-width="3"/>
        <!-- Fedora Hat -->
        <path d="M 15 35 Q 50 20 85 35 Z" fill="#1e1e2d" stroke="#ff3366" stroke-width="2"/>
        <!-- Glasses/Shadow -->
        <polygon points="30,48 48,48 42,56 30,56" fill="#111" stroke="#ff3366" stroke-width="1.5"/>
        <polygon points="52,48 70,48 70,56 58,56" fill="#111" stroke="#ff3366" stroke-width="1.5"/>
        <line x1="48" y1="50" x2="52" y2="50" stroke="#ff3366" stroke-width="2"/>
        <!-- Stern mouth -->
        <line x1="42" y1="68" x2="58" y2="68" stroke="#ff3366" stroke-width="3"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "서부서 오형사다. 수상한 짓 하다 걸리면 바로 쇠고랑이야.",
        "밑장빼기 하다가 나한테 걸린 놈들만 트럭 한 대야. 시작해.",
        "난 너 같은 부류들의 미세한 안면 근육 떨림까지 다 보인다."
      ],
      think: [
        "눈알 굴리지 마라. 컵만 쳐다보고 있으니까.",
        "수사 기법 1조: 피의자의 손목 움직임을 추적한다.",
        "허튼수작 부리는 순간 바로 수갑 채운다.",
        "범인은 이 안에 있어. 물론 공도 마찬가지고.",
        "네 미세 표정 변화... 거짓말을 하고 있군.",
        "범죄 현장 검증하듯 차분히 살피겠다.",
        "수많은 도박판을 단속한 짬바가 있다. 이 컵이군.",
        "도박 꾼들의 전형적인 셔플 리듬이 감지되는구먼.",
        "잔머리 굴려봤자 형사 눈바닥 안이다."
      ],
      win: [
        "거 봐, 내 눈은 못 속인다니까? 돈 내놔.",
        "꼼수 쓰려다가 도리어 당했군 그래.",
        "자, 합법적으로 딴 돈이다."
      ],
      lose: [
        "아니... 이게 왜 여기 없지? 분명히 봤는데...",
        "음... 교묘하군. 정황 증거는 없으니 넘어가 주지.",
        "이상하단 말이야... 증거는 없지만 심증이 감다."
      ],
      caught: [
        "딱 걸렸어! 현행범 체포다! 사기 도박 혐의로 연행하겠다!",
        "손가락 꼼지락거리는 거 다 봤다! 불어, 공 어디다 숨겼어?!"
      ]
    }
  },
  {
    id: 'aican',
    name: 'AlphaCup',
    title: 'AI 판독기',
    badgeClass: 'badge-danger',
    baseObs: 0.95,
    bet: 200,
    avatarColor: '#00e5ff',
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <!-- CRT Monitor face -->
        <rect x="20" y="20" width="60" height="50" rx="6" fill="#1e1e2d" stroke="#00e5ff" stroke-width="3"/>
        <rect x="25" y="25" width="50" height="40" rx="4" fill="#0c0c14" stroke="#00e5ff" stroke-width="1"/>
        <!-- Neck & Stand -->
        <rect x="42" y="70" width="16" height="15" fill="#3b3b4f" stroke="#00e5ff" stroke-width="2"/>
        <ellipse cx="50" cy="85" rx="20" ry="6" fill="#1e1e2d" stroke="#00e5ff" stroke-width="2"/>
        <!-- AI Eye scanline -->
        <line x1="30" y1="45" x2="70" y2="45" stroke="#00e5ff" stroke-width="3" stroke-linecap="round">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
        </line>
        <circle cx="50" cy="45" r="4" fill="#fff"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "시스템 가동. 야바위 연산 장치 구동 완료.",
        "공의 위치를 고해상도 초고속 센서로 모니터링합니다.",
        "AlphaCup은 속지 않습니다. 최적의 확률을 연산합니다."
      ],
      think: [
        "컵의 변위 센서값 분석 중... 신뢰도 98.7%...",
        "물리적 난수성 분산 분석... 타겟 고정...",
        "사기(Cheat) 벡터 감지 알고리즘 작동 중...",
        "예상 궤적 히트맵 생성 중... 오차율 0.02%...",
        "GPU 온도 상승 중... 병렬 처리 연산 중...",
        "딥러닝 모델 예측값 로딩: 클래스 1번...",
        "패턴 추적 서브루틴 정상 작동 중...",
        "인간의 사기 확률 변수 보정 적용 중...",
        "이전 프레임 대비 픽셀 차분 데이터 분석 완료..."
      ],
      win: [
        "연산 성공. 볼의 좌표는 일치했습니다.",
        "당신의 속임수 패턴은 데이터베이스에 이미 등재되어 있습니다.",
        "인간의 손가락 물리 속도는 AI의 픽셀 감지를 넘을 수 없습니다."
      ],
      lose: [
        "경고: 연산 오류 발생. 공의 양자 역학적 위치 이탈.",
        "오류 코드 404: 예상 좌표에 볼이 존재하지 않습니다.",
        "의외군요. 인간의 변수가 내 연산 엔진을 초과했습니다."
      ],
      caught: [
        "치트 엔진(Cheat Engine) 활성화 감지. 시스템 차단 조치 실행.",
        "부정행위 100% 감지. 이 사실을 네트워크에 전파합니다."
      ]
    }
  },
  {
    id: 'grandma',
    name: '순임 할머니',
    title: '욕쟁이 할머니',
    badgeClass: 'badge-normal',
    baseObs: 0.65,
    bet: 50,
    avatarColor: '#a855f7',
    distractionResistant: true,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#a855f7" stroke-width="3"/>
        <!-- Grandma hair bun -->
        <circle cx="50" cy="18" r="10" fill="#d1d5db" stroke="#a855f7" stroke-width="2"/>
        <!-- Glasses sitting low -->
        <circle cx="43" cy="48" r="5" fill="none" stroke="#d1d5db" stroke-width="2"/>
        <circle cx="57" cy="48" r="5" fill="none" stroke="#d1d5db" stroke-width="2"/>
        <line x1="48" y1="48" x2="52" y2="48" stroke="#d1d5db" stroke-width="2"/>
        <!-- Wrinkles -->
        <path d="M 40 32 Q 50 35 60 32" fill="none" stroke="#a855f7" stroke-width="1.5"/>
        <path d="M 42 37 Q 50 40 58 37" fill="none" stroke="#a855f7" stroke-width="1.5"/>
        <!-- Smile -->
        <path d="M 44 65 Q 50 60 56 65" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "이놈아! 할미 눈이 침침해 보여도 속이려 들지 마라!",
        "골목 시장 40년 짬바다, 이 녀석아. 컵 굴려봐라.",
        "어디서 밑장빼기를 배워가지고... 할미한테 통할 성싶으냐?"
      ],
      think: [
        "어이구, 현란하게도 굴려대는구나.",
        "네 녀석 손목 꼬락서니를 보아하니...",
        "잔머리 굴리지 말고 컵이나 딱 내려놔라!",
        "어떤 녀석이 공을 딴 데다 빼돌렸으려나?",
        "할미 눈은 현혹되지 않아, 욘석아.",
        "아주 손장난이 예술이구나. 밥은 먹고 다니냐?"
      ],
      win: [
        "어디서 할미를 속여먹으려고! 내 돈 내놔라 이놈아!",
        "내 눈은 속여도 세월은 못 속인다, 녀석아!",
        "떽! 공부는 안 하고 야바위나 하고 있구먼!"
      ],
      lose: [
        "아고, 눈이 침침하긴 한가 보네... 놓쳐버렸네.",
        "이번엔 봐줬다, 욘석아. 다음엔 국물도 없다.",
        "에잉... 컵이 너무 발이 빨라!"
      ],
      caught: [
        "이 쓰글 놈이 어디서 사기를 쳐?! 당장 손 안 떼?!"
      ]
    }
  },
  {
    id: 'drunkard',
    name: '취객 아저씨',
    title: '취객',
    badgeClass: 'badge-easy',
    baseObs: 0.15,
    bet: 75,
    avatarColor: '#f43f5e',
    suspicionMultiplier: 0.7,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#f43f5e" stroke-width="3"/>
        <!-- Red nose and drunk spiral cheeks -->
        <circle cx="50" cy="50" r="7" fill="#f43f5e"/>
        <circle cx="35" cy="50" r="4" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
        <circle cx="65" cy="50" r="4" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
        <!-- Half closed eyes -->
        <line x1="30" y1="42" x2="42" y2="44" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="58" y1="44" x2="70" y2="42" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Silly open mouth -->
        <ellipse cx="50" cy="67" rx="8" ry="5" fill="#1e1e2d" stroke="#fff" stroke-width="2"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "어어... 거 컵이... 컵이 세 개가 아니라 여섯 개로 보이는데...?",
        "딸꾹! 거 젊은 친구, 솜씨가 좋구만! 나랑 한 판 해!",
        "돈은 많으니까! 어디 한번 굴려봐아!"
      ],
      think: [
        "이... 이리 갔다... 저리 갔다... 빙글빙글...",
        "어지러우니까 대충 빨간 거 고르면 되지...?",
        "이거이거... 다 똑같이 생겼는데...?",
        "안주가 맛있고... 컵은 돌고... 에헤라디야~",
        "어라... 방금 나 순간이동 본 것 같은데?",
        "이 컵이 제일 달콤하게 생겼군!"
      ],
      win: [
        "어? 맞았어? 역시 난 천재야! 딸꾹!",
        "와하하하! 한 잔 더 마실 돈 벌었다!",
        "거 봐! 내가 찍으면 다 맞는다니까!"
      ],
      lose: [
        "에이... 컵이 갑자기 유체이탈을 했어...",
        "내가 취해서 그런 게 아냐, 컵이 네 개였어...!",
        "아쉽네에... 자, 여기 판돈 가져가라!"
      ],
      caught: [
        "어어...? 방금 손가락이 두 개로 갈라졌는데... 사기 아냐...?"
      ]
    }
  },
  {
    id: 'hipster',
    name: '리치 제이',
    title: '돈 많은 힙스터',
    badgeClass: 'badge-normal',
    baseObs: 0.55,
    bet: 120,
    avatarColor: '#fbbf24',
    suspicionMultiplier: 1.2,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#fbbf24" stroke-width="3"/>
        <!-- Backwards cap -->
        <path d="M 25 35 Q 50 15 75 35 Z" fill="#ef4444" stroke="#fbbf24" stroke-width="2"/>
        <rect x="70" y="32" width="20" height="4" fill="#ef4444" transform="rotate(15 70 32)"/>
        <!-- Cool sunglasses -->
        <polygon points="28,42 48,42 44,52 32,52" fill="#000" stroke="#fbbf24" stroke-width="1.5"/>
        <polygon points="52,42 72,42 68,52 56,52" fill="#000" stroke="#fbbf24" stroke-width="1.5"/>
        <line x1="48" y1="44" x2="52" y2="44" stroke="#fbbf24" stroke-width="2"/>
        <!-- Smirk mouth -->
        <path d="M 42 63 Q 52 68 55 60" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "Hey, 내 지갑은 터지기 직전이야. 재미 좀 보여줘 봐.",
        "골목길 바이브 좋은데? 판돈 시원하게 걸고 간다.",
        "내 시야는 4K 초고화질이야. Flex 해보자고."
      ],
      think: [
        "흐음... 비트 비주얼은 좋은데, 너무 뻔해.",
        "내 스웨그 레이더가 가리키는 컵은...",
        "속도가 힙하지 못하네. 이거 아냐?",
        "비트에 몸을 맡기고... 드랍 더 컵!",
        "화려한 조명 아래서 컵이 교차하는군.",
        "이 컵이 가장 트렌디해 보이는구먼."
      ],
      win: [
        "Yeah! 너무 이지한데? 보너스 고맙고!",
        "이게 바로 리치 라이프지. 돈 복사 완료.",
        "Too slow, bro. 더 빨리 섞어봐."
      ],
      lose: [
        "Oh... 오차가 있었나 보군. 쿨하게 드림.",
        "왓 더... 이걸 틀린다고? 테이블이 사기네.",
        "배웠다 치지 뭐. 돈은 또 벌면 돼."
      ],
      caught: [
        "Excuse me? 방금 그 무브는 너무 저급한 치팅인데?"
      ]
    }
  },
  {
    id: 'child',
    name: '꼬마 동수',
    title: '동네 꼬마',
    badgeClass: 'badge-hard',
    baseObs: 0.70,
    bet: 10,
    avatarColor: '#06b6d4',
    suspicionMultiplier: 1.5,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#06b6d4" stroke-width="3"/>
        <!-- Big curious eyes -->
        <circle cx="38" cy="45" r="7" fill="#fff" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="38" cy="45" r="3" fill="#000"/>
        <circle cx="62" cy="45" r="7" fill="#fff" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="62" cy="45" r="3" fill="#000"/>
        <!-- Blush cheeks -->
        <circle cx="30" cy="55" r="3" fill="#f43f5e" opacity="0.6"/>
        <circle cx="70" cy="55" r="3" fill="#f43f5e" opacity="0.6"/>
        <!-- Cute lollipop -->
        <circle cx="50" cy="65" r="4" fill="#ef4444"/>
        <line x1="50" y1="69" x2="50" y2="78" stroke="#fff" stroke-width="2"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "우와! 아저씨 컵 흔드는 거 짱 신기하다!",
        "나 유치원에서 컵 쌓기 1등이에요! 짱 잘 봐요!",
        "백 원짜리 여러 개 모아왔어요! 할래요!"
      ],
      think: [
        "반짝반짝... 두 번째 컵인가...?",
        "아저씨 눈이 이상하게 흔들려요!",
        "공 어디 숨겼는지 다 안다!",
        "저기 파란 불빛 나오는 컵이 수상해요!",
        "이번엔 속지 않을 거예요! 얍!",
        "동수 눈은 매의 눈이래요!"
      ],
      win: [
        "이겼다! 아저씨 바보! 내가 이겼지롱!",
        "우와! 까만 공 여기 있다! 유치원 돈벌었다!",
        "약속대로 내 백 원 돌려줘요!"
      ],
      lose: [
        "치... 원래 거기 없었으면서... 아저씨 미워요.",
        "동수 슬퍼요... 공이 사라졌어...",
        "한 판만 다시 해주면 안 돼요?"
      ],
      caught: [
        "엄마! 저 대머리 아저씨가 주머니에서 공 뺐어! 사기야!"
      ]
    }
  },
  {
    id: 'gambler',
    name: '타짜 김군',
    title: '프로 도박사',
    badgeClass: 'badge-danger',
    baseObs: 0.90,
    bet: 150,
    avatarColor: '#ec4899',
    sleightPenalty: 0.20,
    distractionResistant: true,
    drawAvatar() {
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="#3b3b4f" stroke="#ec4899" stroke-width="3"/>
        <!-- Scar on left eye -->
        <line x1="32" y1="36" x2="38" y2="48" stroke="#ef4444" stroke-width="2"/>
        <!-- Wink right eye, sharp left eye -->
        <polygon points="34,44 44,42 40,48" fill="#fff" stroke="#ec4899"/>
        <circle cx="38" cy="45" r="1.5" fill="#000"/>
        <line x1="56" y1="46" x2="66" y2="44" stroke="#ec4899" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Card pattern tattoo on cheek -->
        <polygon points="63,55 66,51 69,55 66,59" fill="#ec4899"/>
        <!-- Smug line smile -->
        <path d="M 40 64 Q 48 68 56 61" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
    },
    phrases: {
      intro: [
        "어깨너머로 배운 솜씨 치곤 괜찮군. 자, 판을 벌려볼까?",
        "도박판의 기본 상식: 눈보다 손이 빠르다. 입증해 봐.",
        "내 눈은 이미 네 손가락 인대 움직임까지 스캔 중이다."
      ],
      think: [
        "밑장 뺼 때의 미세한 마찰음이 안 들렸는데...",
        "두 번째 컵의 무게중심이 쏠리는구만.",
        "속임수 쿨타임 재는 눈빛인데, 어디 보자...",
        "속임수를 걷어내면... 진짜는 이 컵이 확실하지.",
        "기술이 좀 거칠군. 이 컵으로 가지.",
        "트릭의 냄새가 풀풀 풍기는데 말이야."
      ],
      win: [
        "이 바닥에선 확실치 않으면 승부를 걸지 말랬지.",
        "네 패가 다 읽히는구나. 돈은 내가 챙긴다.",
        "훌륭한 승부였어. 하지만 내가 위지."
      ],
      lose: [
        "음... 설계가 아주 훌륭했어. 제대로 당했네.",
        "화려하네... 그 기술, 어디서 배웠나?",
        "이 판돈은 설계비라 쳐 두지. 깔끔한 기술이었다."
      ],
      caught: [
        "동작 그만. 손목 뒤집는 거 다 봤다. 밑장빼기로 구속당하고 싶나?"
      ]
    }
  }
];

// 3. GAME STATE & VARIABLES
const GameState = {
  money: 100,
  round: 1,
  suspicion: 0,
  state: 'START', // START, READY, SHUFFLING, TRICK_TIME, CHOOSING, REVEAL, SHOP, ENDING
  
  cupsCount: 3,
  ballCupIndex: 1, // Current index of cup containing the ball (0, 1, 2)
  cupPositions: [0, 1, 2], // Mapping from slotIndex -> cupIndex
  
  customer: null,
  trickedNpcsCount: 0,
  maxMoneyReached: 100,
  
  // Upgrades
  upgrades: {
    sleight: 0,  // Hand Sleight success rate (+10%, +15%, +20%) -> 70%, 80%, 90%, 95%
    shill: 0,    // Shill Hire: Suspicion gain reduction (0%, 15%, 30%, 45%)
    table: 0,    // Fancy Table: Bet payout multiplier (+0%, +10%, +20%, +30%)
    light: 0     // Light Install: Enhances distraction skill (-40%, -50%, -60%, -70%)
  },
  
  // Skills Cooldowns
  cooldowns: {
    sleight: 0,
    fakeBall: 0,
    distraction: 0,
    fakeCup: 0
  },
  
  // Current active tricks for the round
  activeTricks: {
    sleight: false,
    fakeBall: false,
    distraction: false,
    fakeCup: false
  },

  // UI elements
  dom: {
    introScreen: document.getElementById('intro-screen'),
    gameScreen: document.getElementById('game-screen'),
    endingScreen: document.getElementById('ending-screen'),
    shopModal: document.getElementById('shop-modal'),
    
    btnStart: document.getElementById('btn-start'),
    btnAction: document.getElementById('btn-action'),
    btnOpenShop: document.getElementById('btn-open-shop'),
    btnCloseShop: document.getElementById('btn-close-shop'),
    btnRestart: document.getElementById('btn-restart'),
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    
    moneyDisplay: document.getElementById('money-display'),
    roundDisplay: document.getElementById('round-display'),
    suspicionText: document.getElementById('suspicion-text'),
    suspicionBar: document.getElementById('suspicion-bar'),
    
    tableBoard: document.getElementById('table-board'),
    cupsContainer: document.getElementById('cups-container'),
    whiteBall: document.getElementById('white-ball'),
    actionBanner: document.getElementById('action-banner'),
    alertBanner: document.getElementById('alert-banner'),
    
    npcName: document.getElementById('npc-name'),
    npcBadge: document.getElementById('npc-badge'),
    npcAvatar: document.getElementById('npc-avatar'),
    npcSpeech: document.getElementById('npc-speech'),
    statObsBar: document.getElementById('stat-obs-bar'),
    statObsVal: document.getElementById('stat-obs-val'),
    statBetVal: document.getElementById('stat-bet-val'),
    
    // Skill Buttons
    skillSleight: document.getElementById('skill-sleight'),
    skillFakeBall: document.getElementById('skill-fake-ball'),
    skillDistraction: document.getElementById('skill-distraction'),
    skillFakeCup: document.getElementById('skill-fake-cup'),
    
    cooldownSleight: document.getElementById('cooldown-sleight'),
    cooldownFakeBall: document.getElementById('cooldown-fake-ball'),
    cooldownDistraction: document.getElementById('cooldown-distraction'),
    cooldownFakeCup: document.getElementById('cooldown-fake-cup'),
    
    // Shop Upgrades Buttons
    shopMoney: document.getElementById('shop-money'),
    btnUpgSleight: document.getElementById('btn-upg-sleight'),
    btnUpgShill: document.getElementById('btn-upg-shill'),
    btnUpgTable: document.getElementById('btn-upg-table'),
    btnUpgLight: document.getElementById('btn-upg-light'),
    
    upgSleightStatus: document.getElementById('upg-sleight-status'),
    upgShillStatus: document.getElementById('upg-shill-status'),
    upgTableStatus: document.getElementById('upg-table-status'),
    upgLightStatus: document.getElementById('upg-light-status'),
    
    upgSleightCost: document.getElementById('upg-sleight-cost'),
    upgShillCost: document.getElementById('upg-shill-cost'),
    upgTableCost: document.getElementById('upg-table-cost'),
    upgLightCost: document.getElementById('upg-light-cost'),
    
    // Ending Screen elements
    endingTitle: document.getElementById('ending-title'),
    endingMessage: document.getElementById('ending-message'),
    endMoney: document.getElementById('end-money'),
    endRounds: document.getElementById('end-rounds'),
    endTricked: document.getElementById('end-tricked'),
    
    particlesContainer: document.getElementById('particles-container')
  }
};

// 4. CONFIGURATION VALUES
const GAME_CONFIG = {
  maxMoney: 200,
  maxSuspicion: 100,
  
  // Upgrades Pricing & Levels
  upgradeCosts: {
    sleight: [100, 250, 500],
    shill: [150, 300, 600],
    table: [120, 280, 500],
    light: [80, 200, 400]
  },
  
  // Base trick suspicion costs (before shill reductions)
  trickSuspicion: {
    sleight: 15,
    fakeBall: 10,
    distraction: 8,
    fakeCup: 20,
    winHonest: 5,
    sleightFail: 30
  }
};

// 5. GAME CONTROLLER FUNCTIONS

function initGame() {
  setupEventListeners();
  updateUI();
  
  // Auto init audio engine on user interactions
  window.addEventListener('click', () => {
    AudioEngine.init();
  }, { once: true });
}

function setupEventListeners() {
  GameState.dom.btnStart.addEventListener('click', startGame);
  GameState.dom.btnAction.addEventListener('click', handleMainActionButton);
  GameState.dom.btnOpenShop.addEventListener('click', openShop);
  GameState.dom.btnCloseShop.addEventListener('click', closeShop);
  GameState.dom.btnRestart.addEventListener('click', restartGame);
  
  // Skills click events
  GameState.dom.skillSleight.addEventListener('click', () => useTrick('sleight'));
  GameState.dom.skillFakeBall.addEventListener('click', () => useTrick('fakeBall'));
  GameState.dom.skillDistraction.addEventListener('click', () => useTrick('distraction'));
  GameState.dom.skillFakeCup.addEventListener('click', () => useTrick('fakeCup'));
  
  // Shop purchase clicks
  GameState.dom.btnUpgSleight.addEventListener('click', () => buyUpgrade('sleight'));
  GameState.dom.btnUpgShill.addEventListener('click', () => buyUpgrade('shill'));
  GameState.dom.btnUpgTable.addEventListener('click', () => buyUpgrade('table'));
  GameState.dom.btnUpgLight.addEventListener('click', () => buyUpgrade('light'));
  
  // Sound toggle
  GameState.dom.btnSoundToggle.addEventListener('click', toggleSound);
}

// Sound toggle controller
function toggleSound() {
  AudioEngine.enabled = !AudioEngine.enabled;
  const icon = GameState.dom.btnSoundToggle.querySelector('.sound-icon');
  icon.textContent = AudioEngine.enabled ? "🔊" : "🔇";
  AudioEngine.playClick();
}

function startGame() {
  AudioEngine.playClick();
  GameState.dom.introScreen.classList.remove('active');
  GameState.dom.gameScreen.classList.add('active');
  
  // Reset variables
  GameState.money = 100;
  GameState.round = 1;
  GameState.suspicion = 0;
  GameState.trickedNpcsCount = 0;
  GameState.maxMoneyReached = 100;
  GameState.usedCustomerIds = [];
  
  // Reset upgrades
  GameState.upgrades = { sleight: 0, shill: 0, table: 0, light: 0 };
  GameState.cooldowns = { sleight: 0, fakeBall: 0, distraction: 0, fakeCup: 0 };
  
  setupNewRound();
}

function setupNewRound() {
  GameState.state = 'READY';
  GameState.cupsCount = 3;
  GameState.cupPositions = [0, 1, 2];
  
  // Clear active tricks for this round
  GameState.activeTricks = {
    sleight: false,
    fakeBall: false,
    distraction: false,
    fakeCup: false
  };
  
  // Decrement cooldowns
  for (let trick in GameState.cooldowns) {
    if (GameState.cooldowns[trick] > 0) {
      GameState.cooldowns[trick]--;
    }
  }
  
  // Select customer template based on round difficulty
  GameState.customer = selectCustomerForRound(GameState.round);
  
  // Spawn ball under middle cup initially (slot index 1)
  GameState.ballCupIndex = 1; // cup index 1 is ball owner
  
  // Build DOM cups
  buildCupsDOM();
  
  // Type NPC intro speech
  typeText(GameState.dom.npcSpeech, getRandomPhrase(GameState.customer.phrases.intro));
  
  // Clear any warnings
  GameState.dom.alertBanner.classList.add('hide');
  GameState.dom.alertBanner.textContent = "";
  
  updateUI();
}

// Selects an appropriate NPC template based on the round number
function selectCustomerForRound(r) {
  // Tiers
  const tier1 = ['novice', 'drunkard'];
  const tier2 = ['student', 'hipster'];
  const tier3 = ['magician', 'grandma', 'child'];
  const tier4 = ['detective', 'gambler', 'aican'];
  
  let targetTier;
  if (r === 1) targetTier = tier1;
  else if (r === 2) targetTier = tier2;
  else if (r === 3) targetTier = tier3;
  else if (r === 4) targetTier = tier4;
  else {
    // Round 5+: Mix all tiers
    targetTier = [...tier1, ...tier2, ...tier3, ...tier4];
  }
  
  // Filter out customer IDs that have already been played this game
  let available = targetTier.filter(id => !GameState.usedCustomerIds.includes(id));
  
  // If all customers in this tier (or in the game) are already used, reset history
  if (available.length === 0) {
    // Keep the current one out to prevent back-to-back repeats
    GameState.usedCustomerIds = GameState.customer ? [GameState.customer.id] : [];
    available = targetTier.filter(id => !GameState.usedCustomerIds.includes(id));
    if (available.length === 0) {
      available = targetTier; // Fallback
    }
  }
  
  // Pick random ID from available list
  const chosenId = available[Math.floor(Math.random() * available.length)];
  
  // Track this ID to prevent repeats
  GameState.usedCustomerIds.push(chosenId);
  
  // Find template matching this ID
  const template = NPC_TEMPLATES.find(npc => npc.id === chosenId);
  return { ...template };
}

function buildCupsDOM() {
  // Clear slots
  const slots = GameState.dom.cupsContainer.querySelectorAll('.cup-slot');
  slots.forEach(s => s.remove());
  
  // Create cup elements based on cupsCount (3 or 4)
  for (let i = 0; i < GameState.cupsCount; i++) {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'cup-slot';
    slotDiv.id = `slot-${i}`;
    
    // Position slot based on dynamic width
    const percentage = getSlotPercentage(i, GameState.cupsCount);
    slotDiv.style.left = `${percentage}%`;
    
    const cupItem = document.createElement('div');
    cupItem.className = 'cup-item lifted'; // Lifted initially to show the ball
    cupItem.dataset.index = i; // Assigns cup ID (0 to cupsCount-1)
    
    const liftContainer = document.createElement('div');
    liftContainer.className = 'cup-lift-container';
    
    const sprite = document.createElement('div');
    sprite.className = 'cup-sprite';
    
    // For Fake Cup styling (make 4th cup slightly glitchy or neon blue)
    if (i === 3) {
      sprite.style.background = "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 20%, #60a5fa 45%, #93c5fd 55%, #2563eb 75%, #1d4ed8 90%, #172554 100%)";
    }
    
    const targetMarker = document.createElement('div');
    targetMarker.className = 'target-marker';
    targetMarker.textContent = '▼';
    
    liftContainer.appendChild(sprite);
    cupItem.appendChild(liftContainer);
    cupItem.appendChild(targetMarker);
    slotDiv.appendChild(cupItem);
    
    GameState.dom.cupsContainer.appendChild(slotDiv);
    
    // Click listener for choices
    cupItem.addEventListener('click', () => handleCupChoice(i));
  }
  
  // Position ball under slot containing cup index containing the ball
  positionBallAtCup(GameState.ballCupIndex);
  GameState.dom.whiteBall.style.opacity = '1';
}

function getSlotPercentage(slotIndex, totalCups) {
  if (totalCups === 3) {
    const positions = [15, 50, 85];
    return positions[slotIndex];
  } else {
    const positions = [10, 36, 62, 88];
    return positions[slotIndex];
  }
}

function positionBallAtCup(cupIndex) {
  // Find which slot holds cupIndex
  const slotIndex = GameState.cupPositions.indexOf(cupIndex);
  const percentage = getSlotPercentage(slotIndex, GameState.cupsCount);
  
  // The ball should align exactly in the middle of that slot
  GameState.dom.whiteBall.style.left = `calc(${percentage}% + 47px)`; // 47px coordinates balance offset
  GameState.dom.whiteBall.style.bottom = '15px';
}

// 6. SHUFFLE SYSTEM

function handleMainActionButton() {
  AudioEngine.playClick();
  if (GameState.state === 'READY') {
    startShufflePhase();
  } else if (GameState.state === 'TRICK_TIME') {
    startNPCSelectPhase();
  } else if (GameState.state === 'REVEAL') {
    setupNewRound();
  }
}

async function startShufflePhase() {
  GameState.state = 'SHUFFLING';
  updateUI();
  
  GameState.dom.actionBanner.textContent = "손님이 관찰하고 있습니다. 컵 섞는 중...";
  
  // 1. Cover the ball (Lower cups)
  const cupItems = GameState.dom.cupsContainer.querySelectorAll('.cup-item');
  cupItems.forEach(cup => cup.classList.remove('lifted'));
  
  // Wait for cup lowering animation (400ms)
  await sleep(400);
  GameState.dom.whiteBall.style.opacity = '0'; // Hide ball during shuffle
  
  // 2. Shuffle loops
  const swapsCount = 6 + Math.floor(Math.random() * 4); // 6 to 9 swaps
  
  for (let s = 0; s < swapsCount; s++) {
    // Choose two random slots to swap
    let idxA = Math.floor(Math.random() * GameState.cupsCount);
    let idxB = Math.floor(Math.random() * GameState.cupsCount);
    while (idxA === idxB) {
      idxB = Math.floor(Math.random() * GameState.cupsCount);
    }
    
    await swapCups(idxA, idxB);
  }
  
  // 3. Shuffling completed
  GameState.state = 'TRICK_TIME';
  GameState.dom.actionBanner.textContent = "속임수를 사용하거나 손님의 선택을 요청하세요.";
  typeText(GameState.dom.npcSpeech, getRandomPhrase(GameState.customer.phrases.think));
  updateUI();
}

function swapCups(slotA, slotB) {
  return new Promise((resolve) => {
    AudioEngine.playShuffle();
    
    // Swap positions in logic array
    const cupAIndex = GameState.cupPositions[slotA];
    const cupBIndex = GameState.cupPositions[slotB];
    
    GameState.cupPositions[slotA] = cupBIndex;
    GameState.cupPositions[slotB] = cupAIndex;
    
    // Update DOM visual coordinates
    const slotDivA = document.getElementById(`slot-${slotA}`);
    const slotDivB = document.getElementById(`slot-${slotB}`);
    
    const percentageA = getSlotPercentage(slotA, GameState.cupsCount);
    const percentageB = getSlotPercentage(slotB, GameState.cupsCount);
    
    // Apply 3D orbital animation classes or offsets (one arcs up, one arcs down)
    const cupItemA = slotDivA.querySelector('.cup-item');
    const cupItemB = slotDivB.querySelector('.cup-item');
    
    if (cupItemA) cupItemA.style.transform = "translateY(-30px)";
    if (cupItemB) cupItemB.style.transform = "translateY(30px)";
    
    slotDivA.style.left = `${percentageB}%`;
    slotDivB.style.left = `${percentageA}%`;
    
    // Swap IDs of slot divs so slot-X always matches coordinates index
    slotDivA.id = `slot-${slotB}`;
    slotDivB.id = `slot-${slotA}`;
    
    // Wait for slide transition to finish
    setTimeout(() => {
      if (cupItemA) cupItemA.style.transform = "";
      if (cupItemB) cupItemB.style.transform = "";
      resolve();
    }, 450); // Matches CSS slide duration + buffer
  });
}

// 7. TRICK IMPLEMENTATIONS

function useTrick(trick) {
  if (GameState.state !== 'TRICK_TIME' || GameState.cooldowns[trick] > 0) return;
  
  let suspicionGain = GAME_CONFIG.trickSuspicion[trick];
  
  // Multiplier for Detective (highly sensitive)
  if (GameState.customer.detectiveAlert) {
    suspicionGain *= 1.5;
  }
  // Custom NPC suspicion multiplier (Child, Flexer, Drunkard)
  if (GameState.customer.suspicionMultiplier) {
    suspicionGain *= GameState.customer.suspicionMultiplier;
  }
  
  // Apply Shill Hire upgrade discount
  const shillDiscount = 1 - (GameState.upgrades.shill * 0.15); // Level 3 = 45% discount
  suspicionGain = Math.round(suspicionGain * shillDiscount);
  
  if (trick === 'sleight') {
    AudioEngine.playClick();
    
    // Calculate Sleight Success Rate
    // Level 0: 70%, Level 1: 80%, Level 2: 90%, Level 3: 95%
    let successRate = 0.70;
    if (GameState.upgrades.sleight === 1) successRate = 0.80;
    else if (GameState.upgrades.sleight === 2) successRate = 0.90;
    else if (GameState.upgrades.sleight === 3) successRate = 0.95;
    
    // If Detective is active, reduce sleight success rate by 15%
    if (GameState.customer.detectiveAlert) {
      successRate -= 0.15;
    }
    // Custom NPC hand sleight success rate penalty (Gambler)
    if (GameState.customer.sleightPenalty) {
      successRate -= GameState.customer.sleightPenalty;
    }
    
    const r = Math.random();
    if (r < successRate) {
      // SUCCESS: Mark trick active (we swap ball target secretly when customer decides)
      GameState.activeTricks.sleight = true;
      AudioEngine.playSleightSuccess();
      showRoundAlert("손놀림 성공! 공의 위치를 바꿀 수 있습니다.");
    } else {
      // FAIL: Customer catches player instantly
      AudioEngine.playSleightFail();
      GameState.activeTricks.sleight = false;
      
      // Calculate caught suspicion penalty
      let failSuspicion = Math.round(GAME_CONFIG.trickSuspicion.sleightFail * shillDiscount);
      if (GameState.customer.detectiveAlert) failSuspicion *= 1.5;
      
      addSuspicion(failSuspicion);
      showRoundAlert("손놀림 실패! 손님이 이상한 기운을 감지했습니다!");
      
      // Forces immediate NPC reveal win (NPC catches you cheating and finds it)
      forceNPCInstantWin();
      return;
    }
    
    GameState.cooldowns.sleight = 2; // Cooldown: 2 rounds
    addSuspicion(suspicionGain);
    
  } else if (trick === 'fakeBall') {
    AudioEngine.playClick();
    GameState.activeTricks.fakeBall = true;
    GameState.cooldowns.fakeBall = 3;
    
    addSuspicion(suspicionGain);
    
    // Play visual glitch/magical lift
    playFakeBallFX();
    
  } else if (trick === 'distraction') {
    AudioEngine.playDistraction();
    GameState.activeTricks.distraction = true;
    GameState.cooldowns.distraction = 3;
    
    addSuspicion(suspicionGain);
    
    // Shake table board
    GameState.dom.tableBoard.classList.add('shake');
    setTimeout(() => {
      GameState.dom.tableBoard.classList.remove('shake');
    }, 500);
    
    showRoundAlert("시선 분산 완료! 손님이 딴 곳을 봅니다.");
    
  } else if (trick === 'fakeCup') {
    AudioEngine.playClick();
    GameState.activeTricks.fakeCup = true;
    GameState.cooldowns.fakeCup = 5;
    
    addSuspicion(suspicionGain);
    
    // Spawn 4th cup slots and shuffle it
    spawn4thCupFX();
  }
  
  updateUI();
}

function showRoundAlert(msg) {
  GameState.dom.alertBanner.textContent = msg;
  GameState.dom.alertBanner.classList.remove('hide');
}

// Visual cue for fake ball
async function playFakeBallFX() {
  const cups = GameState.dom.cupsContainer.querySelectorAll('.cup-item');
  
  // Show three glowing ball elements
  const ballElements = [];
  
  // Get slot percentages
  for (let i = 0; i < GameState.cupsCount; i++) {
    const pct = getSlotPercentage(i, GameState.cupsCount);
    
    // If it's the original ball, just move it. Otherwise create clone.
    const tempBall = document.createElement('div');
    tempBall.className = 'white-ball';
    tempBall.style.left = `calc(${pct}% + 47px)`;
    tempBall.style.bottom = '15px';
    tempBall.style.opacity = '1';
    GameState.dom.cupsContainer.appendChild(tempBall);
    ballElements.push(tempBall);
  }
  
  // Lift cups slightly
  cups.forEach(c => {
    c.querySelector('.cup-lift-container').style.transform = "translateY(-40px)";
  });
  
  showRoundAlert("가짜 공 활성화! 사방에 공이 나타납니다.");
  
  await sleep(1000);
  
  // Lower cups & clean up temp balls
  cups.forEach(c => {
    c.querySelector('.cup-lift-container').style.transform = "";
  });
  
  await sleep(300);
  ballElements.forEach(el => el.remove());
}

// Visual layout for 4th cup spawn
async function spawn4thCupFX() {
  GameState.cupsCount = 4;
  
  // Set positions for all existing cups based on 4-slot layout
  const cups = GameState.dom.cupsContainer.querySelectorAll('.cup-slot');
  cups.forEach((cupSlot, i) => {
    const pct = getSlotPercentage(i, 4);
    cupSlot.style.left = `${pct}%`;
  });
  
  // Add a 4th slot at the right edge
  const slotDiv = document.createElement('div');
  slotDiv.className = 'cup-slot';
  slotDiv.id = `slot-3`;
  slotDiv.style.left = '100%'; // Off-screen right
  
  const cupItem = document.createElement('div');
  cupItem.className = 'cup-item';
  cupItem.dataset.index = 3;
  
  const liftContainer = document.createElement('div');
  liftContainer.className = 'cup-lift-container';
  
  const sprite = document.createElement('div');
  sprite.className = 'cup-sprite';
  // Glitchy blue sprite
  sprite.style.background = "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 20%, #60a5fa 45%, #93c5fd 55%, #2563eb 75%, #1d4ed8 90%, #172554 100%)";
  
  const targetMarker = document.createElement('div');
  targetMarker.className = 'target-marker';
  targetMarker.textContent = '▼';
  
  liftContainer.appendChild(sprite);
  cupItem.appendChild(liftContainer);
  cupItem.appendChild(targetMarker);
  slotDiv.appendChild(cupItem);
  GameState.dom.cupsContainer.appendChild(slotDiv);
  
  // Click handler
  cupItem.addEventListener('click', () => handleCupChoice(3));
  
  // Append to logic
  GameState.cupPositions.push(3);
  
  await sleep(100);
  
  // Slide 4th slot to slotIndex 3 (88%)
  const pct3 = getSlotPercentage(3, 4);
  slotDiv.style.left = `${pct3}%`;
  
  showRoundAlert("가짜 컵 합류! 혼란이 증가합니다.");
  
  // Run an extra mini-shuffle to blend it in
  await sleep(400);
  await swapCups(1, 3);
  await swapCups(0, 2);
}

// 8. CUSTOMER CHOICE CALCULATION

function startNPCSelectPhase() {
  GameState.state = 'CHOOSING';
  updateUI();
  
  GameState.dom.actionBanner.textContent = "손님이 고민하는 중입니다...";
  
  // Add a slight thinking delay (1.5 seconds)
  setTimeout(() => {
    calculateNPCChoice();
  }, 1500);
}

function calculateNPCChoice() {
  const npc = GameState.customer;
  
  // 1. Calculate active tracking accuracy
  // Base Obs + suspicion modifier (suspicion increases observation)
  let observation = npc.baseObs + (GameState.suspicion / 100) * 0.3;
  
  // Apply trick debuffs
  if (GameState.activeTricks.fakeBall) {
    let debuff = npc.trickResistant ? 0.35 : 0.50; // Magician is resistant
    observation *= (1 - debuff);
  }
  
  if (GameState.activeTricks.distraction) {
    // Basic distraction reduces by 40%
    // Upgrade increases effect: Level 1 (-50%), Level 2 (-60%), Level 3 (-70%)
    let reductionRate = 0.40 + (GameState.upgrades.light * 0.10);
    // Custom NPC distraction resistance (Grandma, Gambler)
    if (npc.distractionResistant) {
      let resist = npc.id === 'grandma' ? 0.50 : 0.30;
      reductionRate *= (1 - resist);
    }
    observation *= (1 - reductionRate);
  }
  
  if (GameState.activeTricks.fakeCup) {
    let debuff = npc.trickResistant ? 0.40 : 0.60;
    observation *= (1 - debuff);
  }
  
  // Cap between 5% and 98% (bosses can reach 100%)
  const maxCap = npc.id === 'aican' ? 1.0 : 0.98;
  observation = Math.max(0.05, Math.min(maxCap, observation));
  
  // Roll to check if customer tracked correctly
  const roll = Math.random();
  const trackedCorrectly = roll < observation;
  
  let targetCupIndex;
  
  if (trackedCorrectly) {
    // Customer points to where the ball CURRENTLY is
    targetCupIndex = GameState.ballCupIndex;
  } else {
    // Customer is confused, guesses randomly
    // Random select from available cups
    targetCupIndex = Math.floor(Math.random() * GameState.cupsCount);
  }
  
  // 2. Handle Hand Sleight trick
  if (GameState.activeTricks.sleight) {
    // Sleight successful, which means ball moves.
    // Move the ball to a different cup index that is NOT the customer's choice target!
    let alternativeCups = [];
    for (let c = 0; c < GameState.cupsCount; c++) {
      if (c !== targetCupIndex) {
        alternativeCups.push(c);
      }
    }
    
    // Choose one alternative randomly
    const newBallCupIndex = alternativeCups[Math.floor(Math.random() * alternativeCups.length)];
    
    // Relocate ball internally
    GameState.ballCupIndex = newBallCupIndex;
  }
  
  // Trigger UI selection point animation
  visualizeNPCChoice(targetCupIndex);
}

// Force instant fail when player fails sleight
function forceNPCInstantWin() {
  GameState.state = 'CHOOSING';
  updateUI();
  
  setTimeout(() => {
    // Customer points to the ball, catching player
    visualizeNPCChoice(GameState.ballCupIndex, true);
  }, 1000);
}

function visualizeNPCChoice(cupIndex, caughtCheating = false) {
  // Find slot index holding that cupIndex
  const slotIdx = GameState.cupPositions.indexOf(cupIndex);
  const cupDiv = document.getElementById(`slot-${slotIdx}`).querySelector('.cup-item');
  
  // Highlight targeted cup
  cupDiv.classList.add('lifted');
  
  // Check if ball is here
  const isCorrectChoice = (cupIndex === GameState.ballCupIndex);
  
  setTimeout(() => {
    revealResult(cupIndex, isCorrectChoice, caughtCheating);
  }, 600);
}

// 9. REVEAL & RESULT PHASE

function revealResult(npcChoiceCupIndex, customerWon, caughtCheating) {
  GameState.state = 'REVEAL';
  
  // Lift remaining cups to show true state
  const cupItems = GameState.dom.cupsContainer.querySelectorAll('.cup-item');
  cupItems.forEach(cup => cup.classList.add('lifted'));
  
  // Position and display the ball
  positionBallAtCup(GameState.ballCupIndex);
  GameState.dom.whiteBall.style.opacity = '1';
  
  let payout = GameState.customer.bet;
  // Apply Table upgrade reward bonus (+10% / +20% / +30%)
  const tableBonusMultiplier = 1 + (GameState.upgrades.table * 0.10);
  payout = Math.round(payout * tableBonusMultiplier);
  
  if (caughtCheating) {
    // Busted during hand sleight fail
    AudioEngine.playLose();
    GameState.money = Math.max(0, GameState.money - payout);
    
    typeText(GameState.dom.npcSpeech, getRandomPhrase(GameState.customer.phrases.caught));
    GameState.dom.actionBanner.innerHTML = `<span class="text-red">손기술 발각! -$${payout}</span>`;
    
  } else if (customerWon) {
    // Customer guessed correctly
    AudioEngine.playLose();
    GameState.money = Math.max(0, GameState.money - payout);
    
    // Suspicion decreases slightly when dealer loses honestly
    addSuspicion(-8);
    
    typeText(GameState.dom.npcSpeech, getRandomPhrase(GameState.customer.phrases.win));
    GameState.dom.actionBanner.innerHTML = `<span class="text-red">손님이 맞혔습니다! -$${payout}</span>`;
  } else {
    // Customer guessed wrong, player wins!
    AudioEngine.playCoin();
    GameState.money += payout;
    GameState.trickedNpcsCount++;
    
    // Track stats
    if (GameState.money > GameState.maxMoneyReached) {
      GameState.maxMoneyReached = GameState.money;
    }
    
    // Adjust suspicion: Winning honestly vs using tricks
    let suspicionIncrease = GAME_CONFIG.trickSuspicion.winHonest;
    
    if (GameState.activeTricks.sleight || GameState.activeTricks.fakeBall || GameState.activeTricks.distraction || GameState.activeTricks.fakeCup) {
      // Tricks were used, suspicion already applied during trigger.
      suspicionIncrease = 0;
    } else {
      // Honest win gets standard suspicion
      if (GameState.customer.detectiveAlert) suspicionIncrease *= 1.5;
      const shillDiscount = 1 - (GameState.upgrades.shill * 0.15);
      suspicionIncrease = Math.round(suspicionIncrease * shillDiscount);
      addSuspicion(suspicionIncrease);
    }
    
    typeText(GameState.dom.npcSpeech, getRandomPhrase(GameState.customer.phrases.lose));
    GameState.dom.actionBanner.innerHTML = `<span class="text-gold">손님이 틀렸습니다! +$${payout}</span>`;
    
    // Spawn coin effects from the winning cup
    const slotIdx = GameState.cupPositions.indexOf(npcChoiceCupIndex); // Spawn at customer's clicked slot
    const slotElement = document.getElementById(`slot-${slotIdx}`);
    if (slotElement) {
      const rect = slotElement.getBoundingClientRect();
      spawnCoins(rect.left + rect.width / 2, rect.top + 30, payout);
    }
  }
  
  // Game ending conditions check
  if (GameState.money >= GAME_CONFIG.maxMoney) {
    setTimeout(() => {
      endGame(true);
    }, 1500);
  } else if (GameState.money <= 0) {
    setTimeout(() => {
      endGame(false, "돈이 바닥나서 길거리에서 쫓겨났습니다.");
    }, 1500);
  } else if (GameState.suspicion >= GAME_CONFIG.maxSuspicion) {
    setTimeout(() => {
      endGame(false, "사람들이 더 이상 당신을 믿지 않습니다. (의심도 100%)");
    }, 1500);
  } else {
    // Prep next round
    GameState.round++;
    GameState.dom.btnAction.textContent = "다음 라운드 진행";
  }
  
  updateUI();
}

function handleCupChoice(cupIndex) {
  // Unused because dealer is host, but let's prevent default click errors.
}

// 10. SUSPICION GAUGE CONTROL

function addSuspicion(val) {
  GameState.suspicion = Math.max(0, Math.min(GAME_CONFIG.maxSuspicion, GameState.suspicion + val));
  
  // Play alert warning sounds if suspicion crosses certain dangerous lines
  if (val > 0 && GameState.suspicion >= 80) {
    AudioEngine.playAlarm();
  }
}

// 11. SHADOW UPGRADE SHOP SYSTEM

function openShop() {
  if (GameState.state === 'SHUFFLING' || GameState.state === 'CHOOSING') return;
  
  AudioEngine.playClick();
  GameState.dom.shopModal.classList.add('active');
  GameState.stateBeforeShop = GameState.state;
  GameState.state = 'SHOP';
  
  updateShopUI();
}

function closeShop() {
  AudioEngine.playClick();
  GameState.dom.shopModal.classList.remove('active');
  GameState.state = GameState.stateBeforeShop;
  updateUI();
}

function updateShopUI() {
  GameState.dom.shopMoney.textContent = `$${GameState.money}`;
  
  // 1. Hand Sleight Upgrade
  const levelSleight = GameState.upgrades.sleight;
  const maxSleight = GAME_CONFIG.upgradeCosts.sleight.length;
  if (levelSleight < maxSleight) {
    const cost = GAME_CONFIG.upgradeCosts.sleight[levelSleight];
    const successRates = ["70%", "80%", "90%", "95%"];
    GameState.dom.upgSleightStatus.textContent = `현재: ${successRates[levelSleight]} ➔ 다음: ${successRates[levelSleight + 1]}`;
    GameState.dom.upgSleightCost.textContent = `$${cost}`;
    GameState.dom.btnUpgSleight.disabled = GameState.money < cost;
  } else {
    GameState.dom.upgSleightStatus.textContent = "최대 레벨 (95% 성공)";
    GameState.dom.upgSleightCost.textContent = "MAX";
    GameState.dom.btnUpgSleight.disabled = true;
  }

  // 2. Shill Hire
  const levelShill = GameState.upgrades.shill;
  const maxShill = GAME_CONFIG.upgradeCosts.shill.length;
  if (levelShill < maxShill) {
    const cost = GAME_CONFIG.upgradeCosts.shill[levelShill];
    const statusText = ["기본", "-15%", "-30%", "-45%"];
    const nextText = ["-15%", "-30%", "-45%"];
    GameState.dom.upgShillStatus.textContent = `현재: ${statusText[levelShill]} ➔ 다음: ${nextText[levelShill]}`;
    GameState.dom.upgShillCost.textContent = `$${cost}`;
    GameState.dom.btnUpgShill.disabled = GameState.money < cost;
  } else {
    GameState.dom.upgShillStatus.textContent = "최대 레벨 (의심도 -45% 감면)";
    GameState.dom.upgShillCost.textContent = "MAX";
    GameState.dom.btnUpgShill.disabled = true;
  }

  // 3. Fancy Table
  const levelTable = GameState.upgrades.table;
  const maxTable = GAME_CONFIG.upgradeCosts.table.length;
  if (levelTable < maxTable) {
    const cost = GAME_CONFIG.upgradeCosts.table[levelTable];
    const statusText = ["기본", "+10%", "+20%", "+30%"];
    const nextText = ["+10%", "+20%", "+30%"];
    GameState.dom.upgTableStatus.textContent = `현재: ${statusText[levelTable]} ➔ 다음: ${nextText[levelTable]}`;
    GameState.dom.upgTableCost.textContent = `$${cost}`;
    GameState.dom.btnUpgTable.disabled = GameState.money < cost;
  } else {
    GameState.dom.upgTableStatus.textContent = "최대 레벨 (베팅 획득 +30%)";
    GameState.dom.upgTableCost.textContent = "MAX";
    GameState.dom.btnUpgTable.disabled = true;
  }

  // 4. Light Installation
  const levelLight = GameState.upgrades.light;
  const maxLight = GAME_CONFIG.upgradeCosts.light.length;
  if (levelLight < maxLight) {
    const cost = GAME_CONFIG.upgradeCosts.light[levelLight];
    const statusText = ["기본 (-40%)", "-50%", "-60%", "-70%"];
    const nextText = ["-50%", "-60%", "-70%"];
    GameState.dom.upgLightStatus.textContent = `현재: ${statusText[levelLight]} ➔ 다음: ${nextText[levelLight]}`;
    GameState.dom.upgLightCost.textContent = `$${cost}`;
    GameState.dom.btnUpgLight.disabled = GameState.money < cost;
  } else {
    GameState.dom.upgLightStatus.textContent = "최대 레벨 (관찰력 -70% 감소)";
    GameState.dom.upgLightCost.textContent = "MAX";
    GameState.dom.btnUpgLight.disabled = true;
  }
}

function buyUpgrade(type) {
  const currentLevel = GameState.upgrades[type];
  const cost = GAME_CONFIG.upgradeCosts[type][currentLevel];
  
  if (GameState.money >= cost) {
    AudioEngine.playUpgrade();
    GameState.money -= cost;
    GameState.upgrades[type]++;
    
    updateShopUI();
    updateUI();
  }
}

// 12. GAME OVER / VICTORY

function endGame(victory, message = "") {
  GameState.state = 'ENDING';
  GameState.dom.gameScreen.classList.remove('active');
  GameState.dom.endingScreen.classList.add('active');
  
  if (victory) {
    AudioEngine.playUpgrade(); // Win tune
    GameState.dom.endingTitle.textContent = "VICTORY";
    GameState.dom.endingTitle.style.color = "var(--color-neon-gold)";
    GameState.dom.endingTitle.style.textShadow = "0 0 15px var(--color-neon-gold)";
    GameState.dom.endingMessage.textContent = "축하합니다! 당신은 길거리 야시장의 전설적인 야바위꾼이 되었습니다!";
  } else {
    AudioEngine.playLose();
    GameState.dom.endingTitle.textContent = "GAME OVER";
    GameState.dom.endingTitle.style.color = "var(--color-neon-red)";
    GameState.dom.endingTitle.style.textShadow = "0 0 15px var(--color-neon-red)";
    GameState.dom.endingMessage.textContent = message;
  }
  
  GameState.dom.endMoney.textContent = `$${GameState.money}`;
  GameState.dom.endRounds.textContent = GameState.round;
  GameState.dom.endTricked.textContent = GameState.trickedNpcsCount;
}

function restartGame() {
  AudioEngine.playClick();
  GameState.dom.endingScreen.classList.remove('active');
  startGame();
}

// 13. UTILITIES & ANIMATIONS

function updateUI() {
  // Headers
  GameState.dom.moneyDisplay.textContent = `$${GameState.money}`;
  GameState.dom.roundDisplay.textContent = GameState.round;
  GameState.dom.suspicionText.textContent = `${GameState.suspicion}%`;
  GameState.dom.suspicionBar.style.width = `${GameState.suspicion}%`;
  
  // Main Action button states
  if (GameState.state === 'READY') {
    GameState.dom.btnAction.textContent = "컵 섞기 시작";
    GameState.dom.btnAction.disabled = false;
    GameState.dom.btnOpenShop.disabled = false;
  } else if (GameState.state === 'SHUFFLING') {
    GameState.dom.btnAction.textContent = "섞는 중...";
    GameState.dom.btnAction.disabled = true;
    GameState.dom.btnOpenShop.disabled = true;
  } else if (GameState.state === 'TRICK_TIME') {
    GameState.dom.btnAction.textContent = "손님의 선택 받기";
    GameState.dom.btnAction.disabled = false;
    GameState.dom.btnOpenShop.disabled = true;
  } else if (GameState.state === 'CHOOSING') {
    GameState.dom.btnAction.textContent = "관찰하는 중...";
    GameState.dom.btnAction.disabled = true;
    GameState.dom.btnOpenShop.disabled = true;
  } else if (GameState.state === 'REVEAL') {
    GameState.dom.btnAction.textContent = "다음 라운드 진행";
    GameState.dom.btnAction.disabled = false;
    GameState.dom.btnOpenShop.disabled = false;
  }
  
  // NPC Profile Render
  if (GameState.customer) {
    GameState.dom.npcName.textContent = GameState.customer.name;
    GameState.dom.npcBadge.textContent = GameState.customer.title;
    GameState.dom.npcBadge.className = `badge ${GameState.customer.badgeClass}`;
    
    // Draw dynamic SVG Portrait
    GameState.dom.npcAvatar.innerHTML = GameState.customer.drawAvatar();
    
    // Display stats
    const obsPct = Math.round((GameState.customer.baseObs + (GameState.suspicion / 100) * 0.3) * 100);
    GameState.dom.statObsVal.textContent = `${obsPct}%`;
    GameState.dom.statObsBar.style.width = `${obsPct}%`;
    
    // Custom label text colors based on danger
    if (obsPct > 80) GameState.dom.statObsBar.style.backgroundColor = "var(--color-neon-red)";
    else if (obsPct > 55) GameState.dom.statObsBar.style.backgroundColor = "var(--color-gold)";
    else GameState.dom.statObsBar.style.backgroundColor = "var(--color-neon-blue)";
    
    const betWithBonus = Math.round(GameState.customer.bet * (1 + GameState.upgrades.table * 0.10));
    GameState.dom.statBetVal.textContent = `$${betWithBonus}`;
  }
  
  // Skill buttons enabled/disabled states
  const inTrickPhase = (GameState.state === 'TRICK_TIME');
  
  updateSkillButton(GameState.dom.skillSleight, GameState.dom.cooldownSleight, 'sleight', inTrickPhase);
  updateSkillButton(GameState.dom.skillFakeBall, GameState.dom.cooldownFakeBall, 'fakeBall', inTrickPhase);
  updateSkillButton(GameState.dom.skillDistraction, GameState.dom.cooldownDistraction, 'distraction', inTrickPhase);
  updateSkillButton(GameState.dom.skillFakeCup, GameState.dom.cooldownFakeCup, 'fakeCup', inTrickPhase);
}

function updateSkillButton(btn, cooldownOverlay, trickKey, inTrickPhase) {
  const cd = GameState.cooldowns[trickKey];
  
  // A skill is active if used this round
  const isUsed = GameState.activeTricks[trickKey];
  
  if (cd > 0) {
    btn.disabled = true;
    cooldownOverlay.textContent = cd;
    cooldownOverlay.classList.add('active');
  } else {
    cooldownOverlay.classList.remove('active');
    cooldownOverlay.textContent = "";
    
    // Enable only in Trick Phase if not already used this round
    btn.disabled = !inTrickPhase || isUsed;
  }
}

// Typist effect
let typingTimer = null;
function typeText(element, text) {
  if (typingTimer) clearTimeout(typingTimer);
  
  element.textContent = "";
  let idx = 0;
  
  function step() {
    if (idx < text.length) {
      element.textContent += text.charAt(idx);
      idx++;
      
      // Play retro blip typing sound (only for non-space characters)
      if (text.charAt(idx - 1) !== " ") {
        AudioEngine.playTypingSound();
      }
      
      typingTimer = setTimeout(step, 30);
    }
  }
  
  step();
}

function getRandomPhrase(phraseArray) {
  return phraseArray[Math.floor(Math.random() * phraseArray.length)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// COIN PARTICLE GENERATION
function spawnCoins(startX, startY, amount) {
  const count = Math.min(15, 6 + Math.floor(amount / 8)); // Scaled particle counts
  const targetElement = document.getElementById('money-display');
  const targetRect = targetElement.getBoundingClientRect();
  const destX = targetRect.left + targetRect.width / 2;
  const destY = targetRect.top + targetRect.height / 2;
  
  for (let i = 0; i < count; i++) {
    const coin = document.createElement('div');
    coin.className = 'coin-particle';
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;
    
    GameState.dom.particlesContainer.appendChild(coin);
    
    // Random angle and speed for fountain splash
    const angle = (Math.random() * 120 + 210) * (Math.PI / 180); // Arc upwards
    const speed = 4 + Math.random() * 8;
    
    let x = startX;
    let y = startY;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    
    let age = 0;
    const maxAge = 25 + Math.floor(Math.random() * 15);
    
    // Phase 1: Splash upwards
    function updatePhysics() {
      if (age < maxAge) {
        x += vx;
        y += vy;
        vy += 0.35; // Gravity
        
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        
        age++;
        requestAnimationFrame(updatePhysics);
      } else {
        // Phase 2: fly to destination Money Counter
        flyToDestination();
      }
    }
    
    function flyToDestination() {
      const duration = 20 + Math.floor(Math.random() * 10); // frames
      let frame = 0;
      const startXVal = x;
      const startYVal = y;
      
      function lerp() {
        if (frame <= duration) {
          const t = frame / duration;
          // Cubic ease-in for clean magnetism look
          const easedT = t * t * t; 
          
          const currentX = startXVal + (destX - startXVal) * easedT;
          const currentY = startYVal + (destY - startYVal) * easedT;
          
          coin.style.left = `${currentX}px`;
          coin.style.top = `${currentY}px`;
          
          frame++;
          requestAnimationFrame(lerp);
        } else {
          // Arrived!
          coin.remove();
          // Visual money display wiggle
          targetElement.classList.add('pulse');
          setTimeout(() => targetElement.classList.remove('pulse'), 150);
        }
      }
      
      lerp();
    }
    
    requestAnimationFrame(updatePhysics);
  }
}

// Start everything when DOM is ready
window.addEventListener('DOMContentLoaded', initGame);
