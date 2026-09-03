/**
 * morale-ai.js
 *
 * "Morale AI Adapter" — lop rieng cho AI trong Mode Si Khi.
 *
 * QUAN TRONG: Stockfish KHONG he biet gi ve he thong Si Khi / Skill Move —
 * no chi hieu luat co chuan. Vi vay module nay KHONG coi `bestmove` cua
 * Stockfish la dap an tuyet doi. Thay vao do:
 *
 *   1. Sinh toan bo ung vien: nuoc co CHUAN (qua chess.js) + Skill Move
 *      (qua morale-skills.js) cho moi quan cua AI dang du Si Khi.
 *   2. Neu Stockfish san sang, hoi no mot goi y cho THE CO CHUAN hien tai
 *      va dung goi y do nhu MOT tin hieu cong them diem cho ung vien
 *      trung khop (chu khong phai chon thang no).
 *   3. Danh gia MOI ung vien (thuong + skill) bang mot ham heuristic rieng
 *      (vat chat, an quan, phong cap, chi phi Skill) de so sanh cong bang
 *      giua hai loai nuoc di.
 *   4. Chon ung vien tot nhat (co chut ngau nhien theo do kho de AI khong
 *      may moc tuyet doi).
 */

class AiSiKhi {
  constructor(qlStockfish){
    this.qlStockfish = qlStockfish || null;
  }

  /**
   * @param {TrangThaiSiKhi} trangThai
   * @param {string} doKho
   * @returns {Promise<{loai:'normal'|'skill', from:string, to:string, promotion?:string}|null>}
   */
  async chonNuocDi(trangThai, doKho){
    const mau = trangThai.mauMay;
    const ungVien = this._sinhUngVien(trangThai, mau);
    if(ungVien.length === 0) return null;

    let goiYEngine = null;
    if(this.qlStockfish && this.qlStockfish.sanSang && !this.qlStockfish.loi){
      try{
        const uci = await this.qlStockfish.yeuCauNuocDiTot(trangThai.layFEN(), doKho);
        if(uci){
          goiYEngine = { from: uci.slice(0, 2), to: uci.slice(2, 4) };
        }
      }catch(loi){
        goiYEngine = null; // Khong sao — AI van quyet dinh duoc bang heuristic rieng.
      }
    }

    ungVien.forEach(uv => {
      uv.diem = this._danhGia(uv);
      if(goiYEngine && uv.loai === "normal" && uv.from === goiYEngine.from && uv.to === goiYEngine.to){
        uv.diem += 1.5; // duoc engine de xuat cho the co chuan
      }
    });

    ungVien.sort((a, b) => b.diem - a.diem);

    const bienDoTheoDoKho = { beginner: 6, easy: 4, medium: 2, hard: 1, expert: 1 }[doKho] || 2;
    const nhomTop = ungVien.slice(0, Math.min(bienDoTheoDoKho, ungVien.length));
    return nhomTop[Math.floor(Math.random() * nhomTop.length)];
  }

  _sinhUngVien(trangThai, mau){
    const ds = [];
    const co = trangThai.co;
    const cacO = Object.keys(trangThai.banDoQuanCo).filter(o => {
      const q = co.get(o);
      return q && q.color === mau;
    });

    cacO.forEach(o => {
      (co.moves({ square: o, verbose: true }) || []).forEach(m => {
        ds.push({ loai: "normal", from: o, to: m.to, promotion: m.promotion, captured: m.captured });
      });

      const thongTin = trangThai.layThongTinSkillTaiO(o);
      if(thongTin && thongTin.sanSang){
        thongTin.nuocSkill.forEach(uv => {
          ds.push({ loai: "skill", from: o, to: uv.to, captured: uv.captured });
        });
      }
    });

    return ds;
  }

  /** Heuristic don gian: khong can Stockfish van danh gia duoc moi ung vien. */
  _danhGia(ungVien){
    let diem = 0;
    if(ungVien.captured) diem += (GIA_TRI_QUAN[ungVien.captured] || 0);
    if(ungVien.promotion) diem += (GIA_TRI_QUAN[ungVien.promotion] || 0) - GIA_TRI_QUAN.p;
    if(ungVien.loai === "skill") diem += ungVien.captured ? 0.75 : 0.1;
    diem += Math.random() * 0.3; // tranh AI qua may moc/de doan
    return diem;
  }
}
