/**
 * game.js
 *
 * Nam giu trang thai chinh thuc cua van co. Chess.js la nguon du lieu duy
 * nhat cho luat choi, phat hien chieu/chieu het/het nuoc di/hoa co, quyen
 * nhap thanh, bat tot qua duong va phong cap — module nay khong bao gio
 * tu cai lai luat co, no chi theo doi trang thai o muc hien thi (che do,
 * mau quan, quan bi an, dong ho, lich su nuoc di) xung quanh chess.js.
 */

const GIA_TRI_QUAN = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

class TrangThai {
  constructor(){
    this.co = new Chess();
    this.cheDo = "local";           // "local" | "ai"
    this.mauNguoiChoi = "w";        // mau nguoi choi dieu khien trong che do AI
    this.mauMay = "b";
    this.doKhoMay = "medium";
    this.thoiGianQuyDinh = "none";

    this.trangThai = "playing";     // playing | checkmate | stalemate | draw | resigned | timeout
    this.nguoiThang = null;         // "w" | "b" | null (hoa)
    this.lyDoKetThuc = null;        // khoa dung de dich thong bao

    this.quanBiAn = { w: [], b: [] }; // quanBiAn.w = quan Den bi Trang an
    this.danhSachNuocDi = [];         // danh sach day du cac nuoc di (chess.js history dang verbose)
  }

  /** Cau hinh va reset cho mot van co hoan toan moi. */
  batDauVanMoi({ cheDo, mauNguoiChoi = "w", doKhoMay = "medium", thoiGianQuyDinh = "none" }){
    this.co.reset();
    this.cheDo = cheDo;
    this.thoiGianQuyDinh = thoiGianQuyDinh;
    this.trangThai = "playing";
    this.nguoiThang = null;
    this.lyDoKetThuc = null;
    this.quanBiAn = { w: [], b: [] };
    this.danhSachNuocDi = [];

    if(cheDo === "ai"){
      this.mauNguoiChoi = mauNguoiChoi === "random"
        ? (Math.random() < 0.5 ? "w" : "b")
        : mauNguoiChoi;
      this.mauMay = this.mauNguoiChoi === "w" ? "b" : "w";
      this.doKhoMay = doKhoMay;
    }
  }

  get luot(){ return this.co.turn(); }

  daKetThuc(){ return this.trangThai !== "playing"; }

  /** Co phai luot cua may khong (chi ap dung trong che do AI). */
  laLuotMay(){
    return this.cheDo === "ai" && this.luot === this.mauMay && this.trangThai === "playing";
  }

  /** True neu mau quan cho truoc thuoc ve ben duoc phep di luc nay. */
  laChuQuanDuocDi(mauQuan){
    if(mauQuan !== this.luot) return false;
    if(this.cheDo === "ai" && this.luot === this.mauMay) return false; // nguoi khong duoc di thay may
    return true;
  }

  layFEN(){ return this.co.fen(); }

  /** Cac o dich hop le (kem metadata) cho mot quan tai o `oCo`. */
  layNuocDiHopLe(oCo){
    return this.co.moves({ square: oCo, verbose: true });
  }

  /** True neu di quan tot tu from->to se can chon quan phong cap. */
  laNuocPhongCap(tuO, denO){
    const quan = this.co.get(tuO);
    if(!quan || quan.type !== "p") return false;
    const hangDich = denO[1];
    return (quan.color === "w" && hangDich === "8") || (quan.color === "b" && hangDich === "1");
  }

  /**
   * Thuc hien mot nuoc di. Tra ve doi tuong nuoc di (verbose) neu thanh
   * cong, hoac null neu khong hop le. `phongCap` phai la mot trong
   * q/r/b/n khi nuoc di la phong cap.
   */
  diNuoc(tuO, denO, phongCap){
    if(this.daKetThuc()) return null;

    const cauHinh = { from: tuO, to: denO };
    if(phongCap) cauHinh.promotion = phongCap;

    const nuocDi = this.co.move(cauHinh);
    if(!nuocDi) return null;

    this.danhSachNuocDi.push(nuocDi);
    if(nuocDi.captured){
      // nuocDi.color la ben vua di; quan bi an thuoc ve doi phuong.
      this.quanBiAn[nuocDi.color].push(nuocDi.captured);
    }

    this._capNhatTrangThai();
    return nuocDi;
  }

  /** Ap dung mot chuoi nuoc di UCI tho tu Stockfish, vi du "e2e4" hoac "e7e8q". */
  diNuocUCI(uci){
    const tuO = uci.slice(0, 2);
    const denO = uci.slice(2, 4);
    const phongCap = uci.length > 4 ? uci[4] : undefined;
    return this.diNuoc(tuO, denO, phongCap);
  }

  /**
   * Hoan tac. O che do Local, lui lai mot nua-nuoc-di. O che do AI, lui lai
   * ca nuoc dap tra cua may va nuoc di cua nguoi choi de den luot nguoi
   * choi tro lai. Tra ve so nua-nuoc-di thuc su da duoc hoan tac.
   */
  hoanTac(){
    if(this.danhSachNuocDi.length === 0) return 0;

    let soLanHoanTac = 0;
    const mot = this.co.undo();
    if(mot){
      this.danhSachNuocDi.pop();
      this._xoaQuanBiAn(mot);
      soLanHoanTac++;
    }

    if(this.cheDo === "ai" && this.danhSachNuocDi.length > 0){
      // Xoa luon nuoc di cua nguoi ben duoi, neu co, de nguoi choi luon
      // quay lai dung luot cua minh thay vi luot cua may.
      const nguoiDiCuoi = this.danhSachNuocDi[this.danhSachNuocDi.length - 1].color;
      if(nguoiDiCuoi === this.mauNguoiChoi){
        const hai = this.co.undo();
        if(hai){
          this.danhSachNuocDi.pop();
          this._xoaQuanBiAn(hai);
          soLanHoanTac++;
        }
      }
    }

    this.trangThai = "playing";
    this.nguoiThang = null;
    this.lyDoKetThuc = null;
    this._capNhatTrangThai();
    return soLanHoanTac;
  }

  _xoaQuanBiAn(nuocDi){
    if(nuocDi.captured){
      const mang = this.quanBiAn[nuocDi.color];
      const chiSo = mang.lastIndexOf(nuocDi.captured);
      if(chiSo !== -1) mang.splice(chiSo, 1);
    }
  }

  /** Nguoi choi dau hang; doi phuong thang. */
  dauHang(mauDauHang){
    this.trangThai = "resigned";
    this.nguoiThang = mauDauHang === "w" ? "b" : "w";
    this.lyDoKetThuc = "resign";
  }

  /** Dong ho cua mot ben da het gio. */
  hetGio(mauHetGio){
    this.trangThai = "timeout";
    this.nguoiThang = mauHetGio === "w" ? "b" : "w";
    this.lyDoKetThuc = "timeout";
  }

  _capNhatTrangThai(){
    if(this.co.in_checkmate && this.co.in_checkmate()){
      this.trangThai = "checkmate";
      // Ben den luot bi chieu het, nen ben con lai thang.
      this.nguoiThang = this.co.turn() === "w" ? "b" : "w";
      this.lyDoKetThuc = "checkmate";
    }else if(this.co.in_stalemate && this.co.in_stalemate()){
      this.trangThai = "draw";
      this.nguoiThang = null;
      this.lyDoKetThuc = "stalemate";
    }else if(this.co.insufficient_material && this.co.insufficient_material()){
      this.trangThai = "draw";
      this.nguoiThang = null;
      this.lyDoKetThuc = "insufficient";
    }else if(this.co.in_threefold_repetition && this.co.in_threefold_repetition()){
      this.trangThai = "draw";
      this.nguoiThang = null;
      this.lyDoKetThuc = "repetition";
    }else if(this.co.in_draw && this.co.in_draw()){
      // Bao gom luat 50 nuoc va cac dieu kien hoa khac cua chess.js.
      this.trangThai = "draw";
      this.nguoiThang = null;
      this.lyDoKetThuc = "fifty";
    }else{
      this.trangThai = "playing";
      this.nguoiThang = null;
      this.lyDoKetThuc = null;
    }
  }

  dangBiChieu(){
    return this.co.in_check ? this.co.in_check() : false;
  }

  /** Tra ve lich su nuoc di SAN, nhom theo cap [{num, white, black}]. */
  /** Tra ve lich su nuoc di, nhom theo cap [{num, white, black}]. Moi ben
   *  la { san, laSkill } — lay tu chinh danhSachNuocDi thay vi chess.js
   *  history() de Mode Si Khi co the danh dau Skill Move; voi cac mode
   *  cu (danhSachNuocDi chi chua nuoc chess.js binh thuong) ket qua SAN
   *  hien thi giong het truoc day. */
  layLichSuTheoCap(){
    const cacCap = [];
    for(let i = 0; i < this.danhSachNuocDi.length; i += 2){
      const trang = this.danhSachNuocDi[i];
      const den = this.danhSachNuocDi[i + 1];
      cacCap.push({
        num: (i / 2) + 1,
        white: trang ? { san: trang.san, laSkill: !!trang.laSkill } : { san: "", laSkill: false },
        black: den ? { san: den.san, laSkill: !!den.laSkill } : { san: "", laSkill: false },
      });
    }
    return cacCap;
  }

  /** Chenh lech vat chat rong tinh theo phe Trang, vi du +3 hoac -2. */
  layChenhLechVatChat(){
    const tongHop = (mang) => mang.reduce((tong, loai) => tong + (GIA_TRI_QUAN[loai] || 0), 0);
    return tongHop(this.quanBiAn.w) - tongHop(this.quanBiAn.b);
  }

  /** Doi tuong vi tri ban co dung duoc boi chessboard.js (chinh la FEN). */
  layViTriBanCo(){
    return this.co.fen();
  }

  /** O cua vua dang bi chieu, hoac null. */
  layOVuaBiChieu(){
    if(!this.dangBiChieu()) return null;
    const mau = this.co.turn();
    const banCo = this.co.board();
    for(let r = 0; r < 8; r++){
      for(let c = 0; c < 8; c++){
        const o = banCo[r][c];
        if(o && o.type === "k" && o.color === mau){
          const cot = "abcdefgh"[c];
          const hang = 8 - r;
          return `${cot}${hang}`;
        }
      }
    }
    return null;
  }
}
