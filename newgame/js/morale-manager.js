/**
 * morale-manager.js
 *
 * Module RIENG BIET cho he thong "Si Khi" (Morale). Khong duoc cac mode
 * Classic / AI cu dong cham toi — file nay chi duoc TrangThaiSiKhi
 * (morale-state.js) su dung.
 *
 * Moi quan co mot "pieceId" on dinh (vi du "w-n-1") duoc theo doi rieng,
 * doc lap voi o dang dung. QuanLySiKhi chi lo phan luu tru + tang/giam/
 * gioi han Si Khi theo pieceId — khong biet gi ve ban co hay luat co.
 */

/** Si Khi cong them moi khi mot quan thuc hien MOT nuoc di (thuong hoac Skill). */
const MORALE_GAIN_PER_MOVE = 10;

/** Si Khi toi da / toi thieu. */
const MORALE_MAX = 100;
const MORALE_MIN = 0;

/** Nguong Si Khi toi thieu de mo khoa Skill cap 1. */
const MORALE_SKILL_THRESHOLD = 50;

/** Si Khi khoi tao cho mot quan moi sinh ra tu Promotion. */
const INITIAL_MORALE = 0;

/** Chi phi Si Khi khi su dung Skill, theo tung loai quan. */
const SKILL_COST = {
  p: 50,   // Pawn — Xung Phong
  n: 50,   // Knight — Dot Kich
  b: 50,   // Bishop — Than Toc
  r: 50,   // Rook — Xung Phong Pha Tran
  q: 100,  // Queen — Ap Dao (cap 2 — can Si Khi toi da)
  k: 50,   // King — Tu Chien
};

/** Nguong Si Khi toi thieu de MO KHOA Skill cua tung loai quan (Queen can day binh). */
function nguongMoKhoa(loaiQuan){
  return loaiQuan === "q" ? MORALE_MAX : MORALE_SKILL_THRESHOLD;
}

class QuanLySiKhi {
  constructor(){
    this.duLieu = {}; // pieceId -> so Si Khi (0..100)
  }

  layMorale(pieceId){
    return this.duLieu[pieceId] !== undefined ? this.duLieu[pieceId] : INITIAL_MORALE;
  }

  datMorale(pieceId, giaTri){
    this.duLieu[pieceId] = Math.max(MORALE_MIN, Math.min(MORALE_MAX, giaTri));
  }

  tangMorale(pieceId, luong = MORALE_GAIN_PER_MOVE){
    this.datMorale(pieceId, this.layMorale(pieceId) + luong);
  }

  giamMorale(pieceId, luong){
    this.datMorale(pieceId, this.layMorale(pieceId) - luong);
  }

  /** Quan co du Si Khi de MO KHOA Skill cua chinh no khong (theo loai quan). */
  coTheDungSkill(pieceId, loaiQuan){
    return this.layMorale(pieceId) >= nguongMoKhoa(loaiQuan);
  }

  /** Tieu hao Si Khi khi thuc su su dung Skill (theo chi phi cua loai quan). */
  tieuHaoMorale(pieceId, loaiQuan){
    const chiPhi = SKILL_COST[loaiQuan] || MORALE_SKILL_THRESHOLD;
    this.giamMorale(pieceId, chiPhi);
    return chiPhi;
  }

  /** Quan bi bat / bien mat (vi du phong cap) — xoa het du lieu Si Khi cua no. */
  xoaQuan(pieceId){
    delete this.duLieu[pieceId];
  }

  /** Snapshot toan bo de phuc vu Undo / Save-Load. */
  layToanBo(){
    return { ...this.duLieu };
  }

  napToanBo(duLieu){
    this.duLieu = { ...duLieu };
  }

  resetTatCa(){
    this.duLieu = {};
  }
}
