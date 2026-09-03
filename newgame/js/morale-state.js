/**
 * morale-state.js
 *
 * TrangThaiSiKhi MO RONG (extends) TrangThai — day la nguyen tac quan
 * trong nhat cua viec tich hop: KHONG sua TrangThai goc, chi ke thua va
 * ghi de/bo sung nhung gi rieng cho Mode Si Khi. Cac mode "classic" va
 * "ai" van dung thang class TrangThai nhu cu, hoan toan khong bi dung
 * cham toi bang file nay.
 *
 * Diem mau chot: moi quan co mot pieceId ON DINH (vi du "w-n-1"), duoc
 * theo doi qua tung nuoc di trong `banDoQuanCo` (o -> pieceId). Si Khi
 * duoc luu theo pieceId (trong QuanLySiKhi), khong theo o cờ — vi vay
 * quan di chuyen tu g1 -> f3 -> h4 Si Khi van di theo dung quan do.
 *
 * Undo duoc thuc hien bang SNAPSHOT toan bo (FEN + ban do quan + Si Khi)
 * truoc moi nuoc di — vi Skill Move duoc ap dung bang Chess.js `put`/
 * `remove`/`load` (khong qua `.move()`), nen khong the dua vao ngan xep
 * Undo noi bo cua Chess.js nhu cac mode cu.
 */

class TrangThaiSiKhi extends TrangThai {
  constructor(){
    super();
    this.siKhi = new QuanLySiKhi();
    this.banDoQuanCo = {};       // o co -> pieceId
    this.lichSuSnapshot = [];    // ngan xep snapshot, dung cho hoanTac()
    this._demIdTheoLoai = {};
  }

  batDauVanMoi(tuyChon){
    super.batDauVanMoi(tuyChon);
    // TrangThai goc chi thiet lap mauNguoiChoi/mauMay/doKhoMay khi cheDo
    // === "ai"; voi "morale-ai" ta tu lam viec nay o day de khong dung
    // toi (va khong sua) logic cua class cha.
    if(this.cheDo === "morale-ai"){
      const mauNguoiChoi = tuyChon.mauNguoiChoi || "w";
      this.mauNguoiChoi = mauNguoiChoi === "random" ? (Math.random() < 0.5 ? "w" : "b") : mauNguoiChoi;
      this.mauMay = this.mauNguoiChoi === "w" ? "b" : "w";
      this.doKhoMay = tuyChon.doKhoMay || "medium";
    }
    this.siKhi.resetTatCa();
    this.lichSuSnapshot = [];
    this._demIdTheoLoai = {};
    this._khoiTaoBanDoQuanCo();
  }

  /** Ghi de: TrangThai goc chi nhan biet cheDo === "ai"; morale-ai can duoc coi la AI. */
  laLuotMay(){
    return this.cheDo === "morale-ai" && this.luot === this.mauMay && this.trangThai === "playing";
  }

  laChuQuanDuocDi(mauQuan){
    if(mauQuan !== this.luot) return false;
    if(this.cheDo === "morale-ai" && this.luot === this.mauMay) return false;
    return true;
  }

  _taoId(mau, loai){
    const khoa = `${mau}-${loai}`;
    this._demIdTheoLoai[khoa] = (this._demIdTheoLoai[khoa] || 0) + 1;
    return `${khoa}-${this._demIdTheoLoai[khoa]}`;
  }

  _khoiTaoBanDoQuanCo(){
    this.banDoQuanCo = {};
    const banCo = this.co.board(); // mang 8x8: hang 0 = hang "8"
    for(let r = 0; r < 8; r++){
      for(let c = 0; c < 8; c++){
        const o = banCo[r][c];
        if(!o) continue;
        const ten = "abcdefgh"[c] + (8 - r);
        this.banDoQuanCo[ten] = this._taoId(o.color, o.type);
      }
    }
  }

  _snapshot(){
    return {
      fen: this.co.fen(),
      banDoQuanCo: { ...this.banDoQuanCo },
      siKhi: this.siKhi.layToanBo(),
      trangThai: this.trangThai,
      nguoiThang: this.nguoiThang,
      lyDoKetThuc: this.lyDoKetThuc,
      quanBiAn: { w: [...this.quanBiAn.w], b: [...this.quanBiAn.b] },
      demIdTheoLoai: { ...this._demIdTheoLoai },
    };
  }

  _phucHoi(sn){
    this.co.load(sn.fen);
    this.banDoQuanCo = { ...sn.banDoQuanCo };
    this.siKhi.napToanBo(sn.siKhi);
    this.trangThai = sn.trangThai;
    this.nguoiThang = sn.nguoiThang;
    this.lyDoKetThuc = sn.lyDoKetThuc;
    this.quanBiAn = { w: [...sn.quanBiAn.w], b: [...sn.quanBiAn.b] };
    this._demIdTheoLoai = { ...sn.demIdTheoLoai };
  }

  /** Thong tin Skill hien tai cua quan tai o `o` — dung de ve UI. */
  layThongTinSkillTaiO(o){
    const quan = this.co.get(o);
    const pieceId = this.banDoQuanCo[o];
    if(!quan || !pieceId) return null;
    const morale = this.siKhi.layMorale(pieceId);
    const nguong = nguongMoKhoa(quan.type);
    return {
      pieceId, loaiQuan: quan.type, mau: quan.color,
      morale, nguong, chiPhi: SKILL_COST[quan.type],
      sanSang: morale >= nguong,
      tenSkill: TEN_SKILL[quan.type],
      nuocSkill: morale >= nguong ? layNuocSkillHopLe(this.co, o) : [],
    };
  }

  /* ============== NUOC DI THUONG (mo rong TrangThai) ============== */
  diNuoc(tuO, denO, phongCap){
    if(this.daKetThuc()) return null;
    const truoc = this._snapshot();
    const idQuanDi = this.banDoQuanCo[tuO];

    const nuocDi = super.diNuoc(tuO, denO, phongCap);
    if(!nuocDi) return null;

    this.lichSuSnapshot.push(truoc);
    this._capNhatBanDoSauNuocThuong(nuocDi, idQuanDi);

    if(!nuocDi.promotion){
      const idSauCung = this.banDoQuanCo[denO];
      if(idSauCung) this.siKhi.tangMorale(idSauCung);
    }
    nuocDi.laSkill = false;
    return nuocDi;
  }

  _capNhatBanDoSauNuocThuong(nuocDi, idQuanDi){
    if(nuocDi.captured){
      let oBiAn = nuocDi.to;
      if(nuocDi.flags.includes("e")){
        const hangGoc = parseInt(nuocDi.to[1], 10);
        const hangBiAn = nuocDi.color === "w" ? hangGoc - 1 : hangGoc + 1;
        oBiAn = nuocDi.to[0] + hangBiAn;
      }
      const idBiAn = this.banDoQuanCo[oBiAn];
      if(idBiAn) this.siKhi.xoaQuan(idBiAn);
      delete this.banDoQuanCo[oBiAn];
    }

    delete this.banDoQuanCo[nuocDi.from];

    if(nuocDi.promotion){
      const idMoi = this._taoId(nuocDi.color, nuocDi.promotion);
      if(idQuanDi) this.siKhi.xoaQuan(idQuanDi);
      this.siKhi.datMorale(idMoi, INITIAL_MORALE);
      this.banDoQuanCo[nuocDi.to] = idMoi;
    }else{
      this.banDoQuanCo[nuocDi.to] = idQuanDi;
    }

    if(nuocDi.flags.includes("k") || nuocDi.flags.includes("q")){
      const hang = nuocDi.color === "w" ? "1" : "8";
      if(nuocDi.flags.includes("k")){
        const idXe = this.banDoQuanCo["h" + hang];
        delete this.banDoQuanCo["h" + hang];
        this.banDoQuanCo["f" + hang] = idXe;
        if(idXe) this.siKhi.tangMorale(idXe);
      }else{
        const idXe = this.banDoQuanCo["a" + hang];
        delete this.banDoQuanCo["a" + hang];
        this.banDoQuanCo["d" + hang] = idXe;
        if(idXe) this.siKhi.tangMorale(idXe);
      }
    }
  }

  /* ============== SKILL MOVE ============== */
  thucHienSkill(tuO, denO){
    if(this.daKetThuc()) return null;
    const quan = this.co.get(tuO);
    const idQuan = this.banDoQuanCo[tuO];
    if(!quan || !idQuan) return null;
    if(!this.siKhi.coTheDungSkill(idQuan, quan.type)) return null;

    const ungVien = layNuocSkillHopLe(this.co, tuO);
    if(!ungVien.some(uv => uv.to === denO)) return null;

    const truoc = this._snapshot();
    const quanBiAnTaiDich = this.co.get(denO);

    this.co.remove(tuO);
    this.co.remove(denO);
    this.co.put(quan, denO);

    const mauKeTiep = quan.color === "w" ? "b" : "w";
    const phan = this.co.fen().split(" ");
    phan[1] = mauKeTiep;
    phan[2] = "-";
    phan[3] = "-";
    phan[4] = (quanBiAnTaiDich || quan.type === "p") ? "0" : String((parseInt(phan[4], 10) || 0) + 1);
    if(mauKeTiep === "w") phan[5] = String((parseInt(phan[5], 10) || 1) + 1);
    this.co.load(phan.join(" "));

    this.lichSuSnapshot.push(truoc);

    if(quanBiAnTaiDich){
      const idBiAn = this.banDoQuanCo[denO];
      if(idBiAn) this.siKhi.xoaQuan(idBiAn);
    }
    delete this.banDoQuanCo[tuO];
    this.banDoQuanCo[denO] = idQuan;

    this.siKhi.tieuHaoMorale(idQuan, quan.type);

    const nuocDi = {
      from: tuO, to: denO, color: quan.color, piece: quan.type,
      captured: quanBiAnTaiDich ? quanBiAnTaiDich.type : undefined,
      flags: "s",
      san: this._sanChoSkill(quan, tuO, denO, quanBiAnTaiDich),
      laSkill: true,
    };
    this.danhSachNuocDi.push(nuocDi);
    if(nuocDi.captured) this.quanBiAn[quan.color].push(nuocDi.captured);

    this._capNhatTrangThai();
    return nuocDi;
  }

  _sanChoSkill(quan, tuO, denO, quanBiAn){
    const chuQuan = { p: "", n: "N", b: "B", r: "R", q: "Q", k: "K" }[quan.type];
    return `${chuQuan}${tuO}${quanBiAn ? "x" : "-"}${denO}`;
  }

  /* ============== HOAN TAC (rieng, dua tren snapshot) ============== */
  hoanTac(){
    if(this.lichSuSnapshot.length === 0) return 0;

    let soLan = 0;
    const sn1 = this.lichSuSnapshot.pop();
    this.danhSachNuocDi.pop();
    this._phucHoi(sn1);
    soLan++;

    if(this.cheDo === "morale-ai" && this.danhSachNuocDi.length > 0 && this.lichSuSnapshot.length > 0){
      const nguoiDiTruocDo = this.danhSachNuocDi[this.danhSachNuocDi.length - 1].color;
      if(nguoiDiTruocDo === this.mauNguoiChoi){
        const sn2 = this.lichSuSnapshot.pop();
        this.danhSachNuocDi.pop();
        this._phucHoi(sn2);
        soLan++;
      }
    }
    return soLan;
  }
}
