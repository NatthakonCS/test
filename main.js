// --- 1. ตัวแปรเก็บสถานะของเกม (State) ---
let roles: string[] = [];
let currentPlayerIndex: number = 0;

// --- 2. การเข้าถึงองค์ประกอบ HTML (DOM Elements) ---
// (ใช้ '!' เพื่อบอก TypeScript ว่าเรามั่นใจว่าองค์ประกอบนี้มีอยู่)

// หน้าจอ
const setupScreen = document.getElementById('setupScreen')!;
const assignScreen = document.getElementById('assignScreen')!;
const revealScreen = document.getElementById('revealScreen')!;

// องค์ประกอบในหน้า Setup
const rolesTextarea = document.getElementById('rolesTextarea') as HTMLTextAreaElement;
const playerCountText = document.getElementById('playerCount')!;
const startButton = document.getElementById('startButton')!;

// องค์ประกอบในหน้า Assign
const playerTurnText = document.getElementById('playerTurnText')!;
const revealButton = document.getElementById('revealButton')!;

// องค์ประกอบในหน้า Reveal
const roleDisplay = document.getElementById('roleDisplay')!;
const nextPlayerButton = document.getElementById('nextPlayerButton')!;

// --- 3. ฟังก์ชันสุ่ม Array (Fisher-Yates Shuffle) ---
// ฟังก์ชันสำคัญมาก! เพื่อให้แน่ใจว่าการสุ่มยุติธรรม
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // สลับที่
  }
  return array;
}

// --- 4. ฟังก์ชันควบคุมการแสดงผลหน้าจอ ---
function showScreen(screenId: 'setup' | 'assign' | 'reveal') {
  // ซ่อนทุกหน้าจอก่อน
  setupScreen.classList.add('hidden');
  assignScreen.classList.add('hidden');
  revealScreen.classList.add('hidden');

  // แสดงเฉพาะหน้าจอที่เลือก
  if (screenId === 'setup') {
    setupScreen.classList.remove('hidden');
  } else if (screenId === 'assign') {
    assignScreen.classList.remove('hidden');
  } else if (screenId === 'reveal') {
    revealScreen.classList.remove('hidden');
  }
}

// --- 5. ฟังก์ชันหลักของเกม ---

/**
 * ฟังก์ชัน: เริ่มเกม
 * - อ่านค่าจาก textarea
 * - สุ่มบทบาท
 * - เปลี่ยนไปหน้า assign
 */
function startGame() {
  const rolesInput = rolesTextarea.value;

  // กรองค่าว่าง (กันการ enter บรรทัดเปล่า)
  const allRoles = rolesInput.split('\n').filter(role => role.trim() !== '');

  if (allRoles.length < 2) {
    alert("กรุณาใส่บทบาทอย่างน้อย 2 คน!");
    return;
  }

  // สุ่มบทบาท
  roles = shuffleArray(allRoles);
  currentPlayerIndex = 0;

  // อัปเดตข้อความสำหรับคนแรก
  playerTurnText.innerText = `ผู้เล่นคนที่ ${currentPlayerIndex + 1}`;

  // ไปยังหน้าสุ่ม
  showScreen('assign');
}

/**
 * ฟังก์ชัน: แสดงบทบาท
 * - แสดงบทบาทของผู้เล่นปัจจุบัน
 * - เปลี่ยนไปหน้า reveal
 */
function revealRole() {
  roleDisplay.innerText = roles[currentPlayerIndex];
  showScreen('reveal');
}

/**
 * ฟังก์ชัน: ผู้เล่นคนถัดไป
 * - ตรวจสอบว่าครบทุกคนหรือยัง
 * - ถ้ายัง: ไปยังหน้า assign ของคนถัดไป
 * - ถ้าครบแล้ว: กลับไปหน้า setup (ตามที่คุณต้องการ)
 */
function nextPlayer() {
  currentPlayerIndex++;

  if (currentPlayerIndex < roles.length) {
    // ยังมีผู้เล่นเหลือ
    playerTurnText.innerText = `ผู้เล่นคนที่ ${currentPlayerIndex + 1}`;
    showScreen('assign');
  } else {
    // ครบทุกคนแล้ว
    alert("ทุกคนได้รับบทบาทครบแล้ว! เริ่มเกมได้");
    // รีเซ็ตค่าและกลับไปหน้าแรก
    rolesTextarea.value = '';
    playerCountText.innerText = 'จำนวนผู้เล่น: 0';
    showScreen('setup');
  }
}

/**
 * ฟังก์ชัน: อัปเดตจำนวนผู้เล่นขณะพิมพ์
 */
function updatePlayerCount() {
  const rolesInput = rolesTextarea.value;
  const allRoles = rolesInput.split('\n').filter(role => role.trim() !== '');
  playerCountText.innerText = `จำนวนผู้เล่น: ${allRoles.length}`;
}


// --- 6. การเชื่อมต่อ Event Listeners ---
startButton.addEventListener('click', startGame);
revealButton.addEventListener('click', revealRole);
nextPlayerButton.addEventListener('click', nextPlayer);
rolesTextarea.addEventListener('input', updatePlayerCount); // อัปเดตจำนวนผู้เล่นแบบ Real-time

// --- 7. เริ่มต้นแอป ---
// เมื่อโหลดเว็บ ให้แสดงหน้า setup เสมอ
showScreen('setup');
