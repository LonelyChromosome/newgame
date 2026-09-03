/**
 * morale-skills.js
 *
 * Module RIENG BIET: sinh va kiem tra cac "Skill Move" cho tung loai quan
 * trong Mode Si Khi. Day la cac ham THUAN (khong giu state), chi lam viec
 * tren mot doi tuong Chess.js (tham so truyen vao) — khong dung chung
 * trang thai voi Classic / AI mode.
 *
 * Trung thanh voi nguyen tac o muc 13 cua yeu cau: du Skill co mo rong
 * cach di chuyen, ket qua cuoi cung VAN phai la mot the co hop le —
 * trong ban co, khong tu dua vua minh vao check, khong bo qua vat can
 * mot cach vo ly (chi "Than Toc/Ap Dao/Pha Tran" duoc nhay qua DUNG MOT
 * quan can duong, giong mot ky nang dac biet co chu dich).
 */

const CAC_CHU_CAI_COT = "abcdefgh";

function toaDo(o){
  return { cot: CAC_CHU_CAI_COT.indexOf(o[0]), hang: parseInt(o[1], 10) - 1 };
}
function tenO(cot, hang){
  return CAC_CHU_CAI_COT[cot] + (hang + 1);
}
function trongBanCo(cot, hang){
  return cot >= 0 && cot <= 7 && hang >= 0 && hang <= 7;
}

/**
 * Kiem tra: neu quan tai `tuO` duoc dat thang sang `denO` (bo qua moi quan
 * dang o denO — tuc la co the an), thi vua cua CHINH BEN DI CO bi chieu
 * hay khong. Day la buoc kiem tra an toan bat buoc cho MOI Skill Move.
 */
function diNuocConLaiAnToan(chessGoc, tuO, denO){
  const banTho = new Chess(chessGoc.fen());
  const quan = banTho.get(tuO);
  if(!quan) return false;

  banTho.remove(tuO);
  banTho.remove(denO);
  const datDuoc = banTho.put(quan, denO);
  if(!datDuoc) return false;

  // Ep active color = mau cua quan vua di de in_check() phan anh dung
  // "vua cua ben vua di co dang bi tan cong khong", bat ke luot ai.
  const phanFen = banTho.fen().split(" ");
  phanFen[1] = quan.color;
  phanFen[2] = "-"; // bo quyen nhap thanh — khong lien quan toi kiem tra chieu
  phanFen[3] = "-"; // bo o bat tot qua duong

  let banKiemTra;
  try{
    banKiemTra = new Chess(phanFen.join(" "));
  }catch(loi){
    return false;
  }
  return !banKiemTra.in_check();
}

/** Sinh cac o dich "tho" (chua kiem tra an toan vua) cho tung loai quan. */
function ungVienTho(chess, tuO){
  const quan = chess.get(tuO);
  if(!quan) return [];
  const { cot, hang } = toaDo(tuO);
  const mau = quan.color;

  switch(quan.type){
    case "p": return ungVienTot(chess, tuO, cot, hang, mau);
    case "n": return ungVienMa(chess, tuO, cot, hang, mau);
    case "b": return ungVienDash(chess, tuO, cot, hang, mau, HUONG_CHEO);
    case "r": return ungVienDash(chess, tuO, cot, hang, mau, HUONG_THANG);
    case "q": return ungVienDash(chess, tuO, cot, hang, mau, HUONG_CHEO.concat(HUONG_THANG));
    case "k": return ungVienVua(chess, tuO, cot, hang, mau);
    default: return [];
  }
}

/** PAWN — "Xung Phong": tien 2 o thang bat ke da di chuyen chua, khong an quan. */
function ungVienTot(chess, tuO, cot, hang, mau){
  const huong = mau === "w" ? 1 : -1;
  const hang1 = hang + huong;
  const hang2 = hang + huong * 2;
  if(!trongBanCo(cot, hang2)) return [];
  const hangCuoi = mau === "w" ? 7 : 0;
  if(hang2 === hangCuoi) return []; // Skill khong xu ly phong cap — bo qua truong hop nay
  const o1 = tenO(cot, hang1);
  const o2 = tenO(cot, hang2);
  if(chess.get(o1) || chess.get(o2)) return []; // duong phai trong, khong an quan
  return [o2];
}

const NUOC_MA = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];

/** KNIGHT — "Dot Kich": mot cu "nhay doi" — hai buoc ma lien tiep. */
function ungVienMa(chess, tuO, cot, hang, mau){
  const capNhat1 = new Set();
  NUOC_MA.forEach(([dc, dh]) => {
    const c = cot + dc, h = hang + dh;
    if(trongBanCo(c, h)) capNhat1.add(tenO(c, h));
  });

  const ketQua = new Set();
  capNhat1.forEach(o1 => {
    const { cot: c1, hang: h1 } = toaDo(o1);
    NUOC_MA.forEach(([dc, dh]) => {
      const c2 = c1 + dc, h2 = h1 + dh;
      if(!trongBanCo(c2, h2)) return;
      const o2 = tenO(c2, h2);
      if(o2 === tuO) return;
      if(capNhat1.has(o2)) return; // da la nuoc Ma binh thuong, khong tinh la Skill
      const quanTaiO2 = chess.get(o2);
      if(quanTaiO2 && quanTaiO2.color === mau) return; // khong the "an" quan minh
      ketQua.add(o2);
    });
  });
  return Array.from(ketQua);
}

const HUONG_CHEO = [[1,1],[1,-1],[-1,1],[-1,-1]];
const HUONG_THANG = [[1,0],[-1,0],[0,1],[0,-1]];

/**
 * Dung chung cho BISHOP / ROOK / QUEEN — "nhay qua DUNG MOT quan can
 * duong" doc theo huong di chuyen tu nhien cua quan, dap xuong o ngay
 * sau quan can do (trong hoac an quan doi phuong tai o do).
 */
function ungVienDash(chess, tuO, cot, hang, mau, dsHuong){
  const ketQua = [];
  dsHuong.forEach(([dc, dh]) => {
    let c = cot + dc, h = hang + dh;
    let daGapCan = false;
    while(trongBanCo(c, h)){
      const oHienTai = tenO(c, h);
      const quanTaiO = chess.get(oHienTai);
      if(!daGapCan){
        if(quanTaiO){
          daGapCan = true; // gap quan can duong dau tien — buoc ke tiep la o dap xuong
        }
        // chua gap can: day la vung di chuyen BINH THUONG cua quan, bo qua
        // (khong tinh la Skill vi khong can Si Khi de di toi day).
      }else{
        // day la o NGAY SAU quan can duong dau tien — ung vien Dash duy nhat
        // theo huong nay.
        if(!quanTaiO || quanTaiO.color !== mau) ketQua.push(oHienTai);
        break;
      }
      c += dc; h += dh;
    }
  });
  return ketQua;
}

/** KING — "Tu Chien": di 2 o theo bat ky huong nao, o giua phai trong. */
function ungVienVua(chess, tuO, cot, hang, mau){
  const ketQua = [];
  HUONG_CHEO.concat(HUONG_THANG).forEach(([dc, dh]) => {
    const cGiua = cot + dc, hGiua = hang + dh;
    const cDich = cot + dc * 2, hDich = hang + dh * 2;
    if(!trongBanCo(cGiua, hGiua) || !trongBanCo(cDich, hDich)) return;
    if(chess.get(tenO(cGiua, hGiua))) return; // o giua phai trong — khong nhay qua quan
    const quanTaiDich = chess.get(tenO(cDich, hDich));
    if(quanTaiDich && quanTaiDich.color === mau) return;
    ketQua.push(tenO(cDich, hDich));
  });
  return ketQua;
}

/**
 * API chinh: tra ve danh sach Skill Move HOP LE (da qua kiem tra an toan
 * vua) cho quan tai `tuO`. Moi phan tu: { to, captured } — `captured` la
 * ky hieu loai quan bi an (hoac null).
 */
function layNuocSkillHopLe(chess, tuO){
  const raw = ungVienTho(chess, tuO);
  const ketQua = [];
  raw.forEach(denO => {
    if(!diNuocConLaiAnToan(chess, tuO, denO)) return;
    const quanBiAn = chess.get(denO);
    ketQua.push({ to: denO, captured: quanBiAn ? quanBiAn.type : null });
  });
  return ketQua;
}

const TEN_SKILL = {
  p: "xungPhong",
  n: "dotKich",
  b: "thanToc",
  r: "phaTran",
  q: "apDao",
  k: "tuChien",
};
