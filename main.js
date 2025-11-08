// =============================================
//  HELPER FUNCTIONS (ใช้ร่วมกัน)
// =============================================
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// =============================================
//  GAME 1: WEREWOLF
// =============================================
const WerewolfGame = {
  // 1. State
  roles: [] as string[],
  currentPlayerIndex: 0,

  // 2. DOM Elements
  container: document.getElementById('werewolfGameContainer')!,
  setupScreen: document.getElementById('ww-setupScreen')!,
  assignScreen: document.getElementById('ww-assignScreen')!,
  revealScreen: document.getElementById('ww-revealScreen')!,

  rolesTextarea: document.getElementById('ww-rolesTextarea') as HTMLTextAreaElement,
  playerCountText: document.getElementById('ww-playerCount')!,
  startButton: document.getElementById('ww-startButton')!,

  playerTurnText: document.getElementById('ww-playerTurnText')!,
  revealButton: document.getElementById('ww-revealButton')!,

  roleDisplay: document.getElementById('ww-roleDisplay')!,
  nextPlayerButton: document.getElementById('ww-nextPlayerButton')!,

  // 3. Methods
  showScreen(screenId: 'setup' | 'assign' | 'reveal') {
    this.setupScreen.classList.add('hidden');
    this.assignScreen.classList.add('hidden');
    this.revealScreen.classList.add('hidden');

    if (screenId === 'setup') this.setupScreen.classList.remove('hidden');
    else if (screenId === 'assign') this.assignScreen.classList.remove('hidden');
    else if (screenId === 'reveal') this.revealScreen.classList.remove('hidden');
  },

  startGame() {
    const rolesInput = this.rolesTextarea.value;
    const allRoles = rolesInput.split('\n').filter(role => role.trim() !== '');

    if (allRoles.length < 2) {
      alert("กรุณาใส่บทบาทอย่างน้อย 2 คน!");
      return;
    }
    this.roles = shuffleArray(allRoles);
    this.currentPlayerIndex = 0;
    this.playerTurnText.innerText = `ผู้เล่นคนที่ ${this.currentPlayerIndex + 1}`;
    this.showScreen('assign');
  },

  revealRole() {
    this.roleDisplay.innerText = this.roles[this.currentPlayerIndex];
    this.showScreen('reveal');
  },

  nextPlayer() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex < this.roles.length) {
      this.playerTurnText.innerText = `ผู้เล่นคนที่ ${this.currentPlayerIndex + 1}`;
      this.showScreen('assign');
    } else {
      alert("ทุกคนได้รับบทบาทครบแล้ว! เริ่มเกมได้");
      // เมื่อจบเกม ให้กลับไปหน้า setup ของ WW
      this.resetGame();
    }
  },

  updatePlayerCount() {
    const rolesInput = this.rolesTextarea.value;
    const allRoles = rolesInput.split('\n').filter(role => role.trim() !== '');
    this.playerCountText.innerText = `จำนวนผู้เล่น: ${allRoles.length}`;
  },

  resetGame() {
    this.rolesTextarea.value = '';
    this.playerCountText.innerText = 'จำนวนผู้เล่น: 0';
    this.roles = [];
    this.currentPlayerIndex = 0;
    this.showScreen('setup'); // กลับไปหน้าตั้งค่าของตัวเอง
  },

  // 4. Initialize (เชื่อมปุ่ม)
  init() {
    this.startButton.addEventListener('click', () => this.startGame());
    this.revealButton.addEventListener('click', () => this.revealRole());
    this.nextPlayerButton.addEventListener('click', () => this.nextPlayer());
    this.rolesTextarea.addEventListener('input', () => this.updatePlayerCount());
  }
};

// =============================================
//  GAME 2: SPYFALL
// =============================================
const SpyfallGame = {
  // 1. State
  locationsDeck: [
    { name: "สถานีอวกาศ", roles: ["วิศวกร", "นักบินอวกาศ", "นักวิทยาศาสตร์", "เอเลี่ยนแฝงตัว", "ผู้บังคับการ"] },
    { name: "เรือดำน้ำ", roles: ["กัปตัน", "วิศวกรโซนาร์", "ช่างเครื่อง", "กุ๊ก", "นักชีววิทยาทางทะเล"] },
    { name: "คณะละครสัตว์", roles: ["ตัวตลก", "นักกายกรรม", "ผู้ควบคุมสิงโต", "นักมายากล", "ผู้ชม"] },
    // ... (เพิ่มอีก 17 สถานที่จากโค้ดเดิม) ...
    { name: "ธนาคาร", roles: ["ผู้จัดการ", "พนักงานเคาน์เตอร์", "ยาม", "ลูกค้า", "โจร"] }
  ] as { name: string, roles: string[] }[],

  playerCount: 3,
  spyCount: 1,
  currentLocation: null as { name: string, roles: string[] } | null,
  allRoles: [] as string[],
  currentPlayerIndex: 0,
  timeRemaining: 0,
  timerInterval: undefined as number | undefined,

  // 2. DOM Elements
  container: document.getElementById('spyfallGameContainer')!,
  setupScreen: document.getElementById('sf-setupScreen')!,
  assignScreen: document.getElementById('sf-assignScreen')!,
  revealScreen: document.getElementById('sf-revealScreen')!,
  timerScreen: document.getElementById('sf-timerScreen')!,

  playerCountSelect: document.getElementById('sf-playerCountSelect') as HTMLSelectElement,
  spyCountButtons: document.getElementById('sf-spyCountButtons')!,
  startGameButton: document.getElementById('sf-startGameButton')!,

  playerTurnText: document.getElementById('sf-playerTurnText')!,
  revealButton: document.getElementById('sf-revealButton')!,

  roleDisplay: document.getElementById('sf-roleDisplay')!,
  locationDisplay: document.getElementById('sf-locationDisplay')!,
  nextPlayerButton: document.getElementById('sf-nextPlayerButton')!,

  timeSelectButtons: document.getElementById('sf-timeSelectButtons')!,
  timerDisplay: document.getElementById('sf-timerDisplay')!,
  startTimerButton: document.getElementById('sf-startTimerButton') as HTMLButtonElement,
  playAgainButton: document.getElementById('sf-playAgainButton')!,

  // 3. Methods
  showScreen(screenId: 'setup' | 'assign' | 'reveal' | 'timer') {
    this.setupScreen.classList.add('hidden');
    this.assignScreen.classList.add('hidden');
    this.revealScreen.classList.add('hidden');
    this.timerScreen.classList.add('hidden');

    if (screenId === 'setup') this.setupScreen.classList.remove('hidden');
    else if (screenId === 'assign') this.assignScreen.classList.remove('hidden');
    else if (screenId === 'reveal') this.revealScreen.classList.remove('hidden');
    else if (screenId === 'timer') this.timerScreen.classList.remove('hidden');
  },

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  },

  initializeSetup() {
    this.playerCountSelect.innerHTML = '';
    for (let i = 3; i <= 20; i++) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.innerText = `${i} คน`;
      this.playerCountSelect.appendChild(option);
    }
    this.playerCountSelect.value = "3";
  },

  startGame() {
    this.playerCount = parseInt(this.playerCountSelect.value);
    this.currentLocation = this.locationsDeck[Math.floor(Math.random() * this.locationsDeck.length)];
    const rolesToAssign: string[] = [];
    const normalPlayerCount = this.playerCount - this.spyCount;
    const shuffledLocationRoles = shuffleArray([...this.currentLocation.roles]);

    for (let i = 0; i < normalPlayerCount; i++) {
      rolesToAssign.push(shuffledLocationRoles[i % shuffledLocationRoles.length]);
    }
    for (let i = 0; i < this.spyCount; i++) {
      rolesToAssign.push("Spy");
    }
    this.allRoles = shuffleArray(rolesToAssign);
    this.currentPlayerIndex = 0;
    this.playerTurnText.innerText = `ผู้เล่นคนที่ ${this.currentPlayerIndex + 1}`;
    this.showScreen('assign');
  },

  revealRole() {
    const role = this.allRoles[this.currentPlayerIndex];
    if (role === "Spy") {
      this.roleDisplay.innerText = "Spy";
      this.locationDisplay.innerText = "???";
    } else {
      this.roleDisplay.innerText = role;
      this.locationDisplay.innerText = this.currentLocation!.name;
    }
    this.showScreen('reveal');
  },

  nextPlayer() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex < this.playerCount) {
      this.playerTurnText.innerText = `ผู้เล่นคนที่ ${this.currentPlayerIndex + 1}`;
      this.showScreen('assign');
    } else {
      // ครบทุกคนแล้ว -> ไปหน้าจับเวลา
      this.timerDisplay.innerText = "00:00";
      this.timerDisplay.style.color = "#1abc9c";
      this.startTimerButton.disabled = true;
      this.startTimerButton.classList.remove('hidden');
      this.playAgainButton.classList.add('hidden');
      document.querySelectorAll('#sf-timeSelectButtons button').forEach(btn => {
        btn.classList.remove('selected');
        (btn as HTMLButtonElement).disabled = false;
      });
      this.showScreen('timer');
    }
  },

  selectTime(minutes: number) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timeRemaining = minutes * 60;
    this.timerDisplay.innerText = this.formatTime(this.timeRemaining);
    this.startTimerButton.disabled = false;

    document.querySelectorAll('#sf-timeSelectButtons button').forEach(btn => {
      btn.classList.remove('selected');
      if (parseInt(btn.getAttribute('data-time-min')!) === minutes) {
        btn.classList.add('selected');
      }
    });
  },

  startTimer() {
    this.startTimerButton.disabled = true;
    document.querySelectorAll('#sf-timeSelectButtons button').forEach(btn => {
      (btn as HTMLButtonElement).disabled = true;
    });

    this.timerInterval = window.setInterval(() => {
      this.timeRemaining--;
      this.timerDisplay.innerText = this.formatTime(this.timeRemaining);
      if (this.timeRemaining <= 0) this.endGame();
    }, 1000);
  },

  endGame() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerDisplay.innerText = "TIME'S UP!";
    this.timerDisplay.style.color = "#e74c3c";
    this.startTimerButton.classList.add('hidden');
    this.playAgainButton.classList.remove('hidden');
    document.querySelectorAll('#sf-timeSelectButtons button').forEach(btn => {
      (btn as HTMLButtonElement).disabled = false;
    });
  },

  resetGame() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.currentLocation = null;
    this.allRoles = [];
    this.currentPlayerIndex = 0;
    this.spyCount = 1; // รีเซ็ตค่าสปาย
    document.querySelectorAll('#sf-spyCountButtons button').forEach(btn => btn.classList.remove('selected'));
    (document.querySelector('#sf-spyCountButtons button[data-spy-count="1"]') as HTMLElement).classList.add('selected');
    this.initializeSetup(); // สร้าง select ใหม่
    this.showScreen('setup'); // กลับไปหน้าตั้งค่าของตัวเอง
  },

  // 4. Initialize (เชื่อมปุ่ม)
  init() {
    this.initializeSetup(); // สร้างตัวเลือก 3-20
    this.startGameButton.addEventListener('click', () => this.startGame());
    this.revealButton.addEventListener('click', () => this.revealRole());
    this.nextPlayerButton.addEventListener('click', () => this.nextPlayer());
    this.playAgainButton.addEventListener('click', () => this.resetGame());

    this.spyCountButtons.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        this.spyCountButtons.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
        this.spyCount = parseInt(target.getAttribute('data-spy-count')!);
      }
    });

    this.timeSelectButtons.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        const minutes = parseInt(target.getAttribute('data-time-min')!);
        this.selectTime(minutes);
      }
    });

    this.startTimerButton.addEventListener('click', () => this.startTimer());
  }
};


// =============================================
//  APP CONTROLLER (ตัวควบคุมหลัก)
// =============================================
const App = {
  // 1. DOM Elements
  hubScreen: document.getElementById('hubScreen')!,
  werewolfContainer: document.getElementById('werewolfGameContainer')!,
  spyfallContainer: document.getElementById('spyfallGameContainer')!,

  gotoWerewolfBtn: document.getElementById('gotoWerewolfBtn')!,
  gotoSpyfallBtn: document.getElementById('gotoSpyfallBtn')!,

  wwBackBtn: document.getElementById('ww-backToHubBtn')!,
  sfBackBtn: document.getElementById('sf-backToHubBtn')!,

  // 2. Methods
  showScreen(screenId: 'hub' | 'werewolf' | 'spyfall') {
    this.hubScreen.classList.add('hidden');
    this.werewolfContainer.classList.add('hidden');
    this.spyfallContainer.classList.add('hidden');

    if (screenId === 'hub') {
      this.hubScreen.classList.remove('hidden');
    } else if (screenId === 'werewolf') {
      this.werewolfContainer.classList.remove('hidden');
      WerewolfGame.resetGame(); // รีเซ็ตเกม WW ทุกครั้งที่เข้ามา
    } else if (screenId === 'spyfall') {
      this.spyfallContainer.classList.remove('hidden');
      SpyfallGame.resetGame(); // รีเซ็ตเกม SF ทุกครั้งที่เข้ามา
    }
  },

  // 3. Initialize
  init() {
    // เชื่อมปุ่มหน้า Hub
    this.gotoWerewolfBtn.addEventListener('click', () => this.showScreen('werewolf'));
    this.gotoSpyfallBtn.addEventListener('click', () => this.showScreen('spyfall'));

    // เชื่อมปุ่มกลับ
    this.wwBackBtn.addEventListener('click', () => this.showScreen('hub'));
    this.sfBackBtn.addEventListener('click', () => this.showScreen('hub'));

    // เริ่มต้นเกมย่อยทั้งสอง (เพื่อให้ Event Listeners พร้อมทำงาน)
    WerewolfGame.init();
    SpyfallGame.init();

    // เริ่มต้นแอป
    this.showScreen('hub');
  }
};

// =============================================
//  START THE APP
// =============================================
App.init();
