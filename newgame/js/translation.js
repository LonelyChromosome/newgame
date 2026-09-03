/**
 * translation.js
 * He thong da ngu don gian. Van ban khong bao gio duoc viet cung trong
 * logic HTML; cac phan tu khai bao `data-i18n="key"` (textContent) hoac
 * `data-i18n-title="key"` (thuoc tinh title) va apDungBanDich() se dien
 * noi dung tuong ung vao.
 */

const banDich = {
  vi: {
    brandName: "CHESS",
    menuSubtitle: "Đồ án Nhóm 10 — Cờ vua trên trình duyệt",
    footerNote: "Chạy hoàn toàn offline trên trình duyệt — không cần Internet.",
    localGame: "Đấu nội bộ (2 người)",
    playAI: "Đấu với máy",
    settings: "Cài đặt",
    howToPlay: "Hướng dẫn chơi",
    back: "Quay lại",
    startGame: "Bắt đầu",
    chooseColor: "Chọn màu quân",
    playWhite: "Chơi Trắng",
    playBlack: "Chơi Đen",
    playRandom: "Ngẫu nhiên",
    difficulty: "Độ khó",
    diffBeginner: "Beginner",
    diffEasy: "Easy",
    diffMedium: "Medium",
    diffHard: "Hard",
    diffExpert: "Expert",
    timeControl: "Thời gian",
    timerNone: "Không giới hạn",
    newGame: "Ván mới",
    undo: "Hoàn tác",
    resign: "Đầu hàng",
    mainMenu: "Menu chính",
    moveHistory: "Lịch sử nước đi",
    aiThinking: "AI đang suy nghĩ...",
    choosePromotion: "Chọn quân phong cấp",
    gameOver: "Ván đấu kết thúc",
    close: "Đóng",
    language: "Ngôn ngữ",
    boardTheme: "Màu bàn cờ",
    themeClassicGreen: "Xanh cổ điển",
    soundOn: "Âm thanh",
    animationOn: "Hiệu ứng chuyển động",
    showCoords: "Hiện tọa độ",
    displayMode: "Giao diện",
    lightMode: "Sáng",
    darkMode: "Tối",
    howto1: "Chọn \"Đấu nội bộ\" để hai người chơi luân phiên trên cùng một máy.",
    howto2: "Chọn \"Đấu với máy\" để chơi với AI Stockfish, có thể chọn màu quân và độ khó.",
    howto3: "Kéo thả hoặc nhấp chọn quân rồi nhấp ô đích để di chuyển.",
    howto4: "Ô hợp lệ, quân vừa đi và vua đang bị chiếu sẽ được tô sáng.",
    howto5: "Dùng \"Hoàn tác\" để lùi lại nước đi, \"Ván mới\" để chơi lại.",

    turnWhite: "Lượt của Trắng",
    turnBlack: "Lượt của Đen",
    inCheck: "{color} đang bị chiếu!",
    checkmate: "Chiếu hết! {winner} thắng.",
    stalemate: "Hòa cờ — Hết nước đi (Stalemate).",
    drawInsufficient: "Hòa cờ — Không đủ quân để chiếu hết.",
    drawRepetition: "Hòa cờ — Lặp lại nước đi 3 lần.",
    drawFiftyMove: "Hòa cờ — Luật 50 nước.",
    drawGeneric: "Hòa cờ.",
    resignWin: "{winner} thắng do đối thủ đầu hàng.",
    timeoutWin: "{winner} thắng do hết giờ.",
    white: "Trắng",
    black: "Đen",
    you: "Bạn",
    aiName: "Máy (Stockfish)",
    player1: "Người chơi 1 (Trắng)",
    player2: "Người chơi 2 (Đen)",
    engineError: "Không thể tải AI engine.",
    invalidMove: "Nước đi không hợp lệ.",
    cannotActWhileAI: "Vui lòng chờ AI suy nghĩ xong.",
    materialAdv: "Chênh lệch vật chất: {value}",

    moraleMode: "CHẾ ĐỘ SĨ KHÍ",
    moraleIntro: "Mỗi quân có Sĩ Khí riêng — tích lũy dần và dùng để kích hoạt Skill đặc biệt.",
    opponentType: "Đối thủ",
    moraleLabel: "Sĩ Khí",
    normalMove: "Nước thường",
    useSkill: "Dùng Skill",
    cancel: "Hủy",
    skillCost: "Tiêu hao: {cost} Sĩ Khí",
    skill_xungPhong: "Xung Phong",
    skill_dotKich: "Đột Kích",
    skill_thanToc: "Thần Tốc",
    skill_phaTran: "Xung Phong Phá Trận",
    skill_apDao: "Áp Đảo",
    skill_tuChien: "Tử Chiến",
    howtoMorale1: "Chế độ Sĩ Khí: mỗi quân có thanh Sĩ Khí riêng, tăng dần khi quân đó đi.",
    howtoMorale2: "Khi đủ Sĩ Khí, bấm vào quân sẽ cho chọn \"Nước thường\" hoặc dùng Skill đặc biệt — dùng Skill sẽ tiêu hao Sĩ Khí.",
  },

  en: {
    brandName: "CHESS",
    menuSubtitle: "Group 10 Project — Browser-based Chess",
    footerNote: "Runs fully offline in your browser — no Internet required.",
    localGame: "Local 2 Players",
    playAI: "Play vs AI",
    settings: "Settings",
    howToPlay: "How to Play",
    back: "Back",
    startGame: "Start Game",
    chooseColor: "Choose your color",
    playWhite: "Play White",
    playBlack: "Play Black",
    playRandom: "Random",
    difficulty: "Difficulty",
    diffBeginner: "Beginner",
    diffEasy: "Easy",
    diffMedium: "Medium",
    diffHard: "Hard",
    diffExpert: "Expert",
    timeControl: "Time Control",
    timerNone: "No Timer",
    newGame: "New Game",
    undo: "Undo",
    resign: "Resign",
    mainMenu: "Main Menu",
    moveHistory: "Move History",
    aiThinking: "AI is thinking...",
    choosePromotion: "Choose promotion piece",
    gameOver: "Game Over",
    close: "Close",
    language: "Language",
    boardTheme: "Board Theme",
    themeClassicGreen: "Classic Green",
    soundOn: "Sound",
    animationOn: "Animation",
    showCoords: "Show Coordinates",
    displayMode: "Theme",
    lightMode: "Light",
    darkMode: "Dark",
    howto1: "Choose \"Local 2 Players\" so two people can take turns on the same machine.",
    howto2: "Choose \"Play vs AI\" to play against Stockfish, with a choice of color and difficulty.",
    howto3: "Drag a piece, or click it then click the destination square, to move.",
    howto4: "Legal squares, the last move, and a king in check are highlighted.",
    howto5: "Use \"Undo\" to take back a move, and \"New Game\" to start over.",

    turnWhite: "White to move",
    turnBlack: "Black to move",
    inCheck: "{color} is in check!",
    checkmate: "Checkmate! {winner} wins.",
    stalemate: "Draw — Stalemate.",
    drawInsufficient: "Draw — Insufficient material.",
    drawRepetition: "Draw — Threefold repetition.",
    drawFiftyMove: "Draw — Fifty-move rule.",
    drawGeneric: "Draw.",
    resignWin: "{winner} wins by resignation.",
    timeoutWin: "{winner} wins on time.",
    white: "White",
    black: "Black",
    you: "You",
    aiName: "Computer (Stockfish)",
    player1: "Player 1 (White)",
    player2: "Player 2 (Black)",
    engineError: "AI engine could not be loaded.",
    invalidMove: "Invalid move.",
    cannotActWhileAI: "Please wait for the AI to finish thinking.",
    materialAdv: "Material advantage: {value}",

    moraleMode: "MORALE MODE",
    moraleIntro: "Every piece has its own Morale — build it up and spend it on a special Skill.",
    opponentType: "Opponent",
    moraleLabel: "Morale",
    normalMove: "Normal Move",
    useSkill: "Use Skill",
    cancel: "Cancel",
    skillCost: "Cost: {cost} Morale",
    skill_xungPhong: "Charge",
    skill_dotKich: "Raid",
    skill_thanToc: "Swift Dash",
    skill_phaTran: "Breakthrough",
    skill_apDao: "Overwhelm",
    skill_tuChien: "Last Stand",
    howtoMorale1: "Morale Mode: every piece has its own Morale bar that builds up as it moves.",
    howtoMorale2: "Once a piece has enough Morale, clicking it offers \"Normal Move\" or its special Skill — using the Skill spends Morale.",
  }
};

const KHOA_NGON_NGU = "chess_language";

const NgonNgu = {
  hienTai: "vi",

  khoiTao(){
    const daLuu = localStorage.getItem(KHOA_NGON_NGU);
    this.hienTai = daLuu && banDich[daLuu] ? daLuu : "vi";
    document.documentElement.lang = this.hienTai;
    this.apDungBanDich();
  },

  datNgonNgu(ngonNgu){
    if(!banDich[ngonNgu]) return;
    this.hienTai = ngonNgu;
    localStorage.setItem(KHOA_NGON_NGU, ngonNgu);
    document.documentElement.lang = ngonNgu;
    this.apDungBanDich();
  },

  /** Lay chuoi da dich theo khoa, co the thay the {placeholder} */
  dich(khoa, bienThe){
    const tuDien = banDich[this.hienTai] || banDich.vi;
    let chuoi = tuDien[khoa] !== undefined ? tuDien[khoa] : khoa;
    if(bienThe){
      Object.keys(bienThe).forEach(k => {
        chuoi = chuoi.replace(new RegExp("\\{" + k + "\\}", "g"), bienThe[k]);
      });
    }
    return chuoi;
  },

  apDungBanDich(){
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const khoa = el.getAttribute("data-i18n");
      el.textContent = this.dich(khoa);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(el => {
      const khoa = el.getAttribute("data-i18n-title");
      el.title = this.dich(khoa);
    });
    const nutNgonNgu = document.getElementById("btn-lang");
    if(nutNgonNgu) nutNgonNgu.textContent = this.hienTai.toUpperCase();
    const chonNgonNgu = document.getElementById("setting-language");
    if(chonNgonNgu) chonNgonNgu.value = this.hienTai;
  }
};
