/**
 * ui.js
 * Tat ca nhung gi dung cham vao DOM/hien thi ban co. Khong bao gio dung
 * truc tiep vao luat cua chess.js — chi hoi TrangThai de lay du lieu va
 * bao cac thao tac cua nguoi dung (click/keo o) ve lai cho main.js qua
 * cac callback.
 */

const KY_TU_QUAN_CO = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" }
};

/* ---------------------------------------------------------------------
 * Am thanh — tong hop bang Web Audio API de du an khong can file am
 * thanh nao va khong vuong chinh sach tu-phat-am-thanh cua trinh duyet
 * (am thanh chi phat khi nguoi dung thuc su tuong tac/di quan).
 * ------------------------------------------------------------------- */
const AmThanh = {
  nguCanh: null,

  _layNguCanh(){
    if(!this.nguCanh){
      const LopNguCanhAudio = window.AudioContext || window.webkitAudioContext;
      this.nguCanh = new LopNguCanhAudio();
    }
    if(this.nguCanh.state === "suspended") this.nguCanh.resume();
    return this.nguCanh;
  },

  _amDon(tanSo, thoiLuong, loai = "sine", doLon = 0.15, doTre = 0){
    if(!CaiDat.lay("amThanhBat")) return;
    try{
      const nguCanh = this._layNguCanh();
      const bienTan = nguCanh.createOscillator();
      const bienDoLon = nguCanh.createGain();
      bienTan.type = loai;
      bienTan.frequency.value = tanSo;
      bienDoLon.gain.value = doLon;
      bienTan.connect(bienDoLon);
      bienDoLon.connect(nguCanh.destination);
      const thoiDiemBatDau = nguCanh.currentTime + doTre;
      bienDoLon.gain.setValueAtTime(doLon, thoiDiemBatDau);
      bienDoLon.gain.exponentialRampToValueAtTime(0.001, thoiDiemBatDau + thoiLuong);
      bienTan.start(thoiDiemBatDau);
      bienTan.stop(thoiDiemBatDau + thoiLuong);
    }catch(loi){
      console.warn("AmThanh: phat am that bai", loi);
    }
  },

  di(){ this._amDon(440, 0.09, "triangle"); },
  an(){ this._amDon(300, 0.1, "square"); this._amDon(220, 0.12, "square", 0.12, 0.05); },
  chieu(){ this._amDon(660, 0.15, "sawtooth"); },
  nhapThanh(){ this._amDon(392, 0.08); this._amDon(523, 0.1, "sine", 0.15, 0.07); },
  phongCap(){ this._amDon(523, 0.08); this._amDon(659, 0.08, "sine", 0.15, 0.08); this._amDon(784, 0.14, "sine", 0.15, 0.16); },
  ketThucVan(){ this._amDon(392, 0.15); this._amDon(330, 0.15, "sine", 0.15, 0.15); this._amDon(261, 0.25, "sine", 0.15, 0.3); }
};

const GiaoDien = {
  banCo: null,
  oDangChon: null,
  khiTuongTacO: null, // (tuO, denO) => void, duoc gan boi main.js
  huongBanCo: "white",

  /* ---------------- Man hinh ---------------- */
  hienThiManHinh(id){
    document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
  },

  /* ---------------- Khoi tao ban co ---------------- */
  khoiTaoBanCo(layFEN){
    const cauHinh = {
      draggable: true,
      position: "start",
      pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
      showNotation: CaiDat.lay("hienToaDo"),
      moveSpeed: CaiDat.lay("hieuUngBat") ? 200 : 0,
      snapbackSpeed: 150,
      snapSpeed: 80,
      onDragStart: (nguon, quan) => this._xuLyBatDauKeo(nguon, quan),
      onDrop: (nguon, dich) => this._xuLyTha(nguon, dich),
      onSnapEnd: () => {
        // Bo qua dong bo lai vi tri chinh thuc trong luc dang cho chon
        // quan phong cap — nuoc di chua duoc ap dung vao chess.js, neu
        // dong bo luc nay se lam quan bi giat nguoc ve o cu.
        if(this.tamDungDongBoViTri) return;
        this.banCo.position(layFEN(), false);
      }
    };
    this.banCo = Chessboard("chess-board", cauHinh);
    this._ganSuKienClickDeDi();

    window.addEventListener("resize", () => this.banCo.resize());
    return this.banCo;
  },

  _xuLyBatDauKeo(nguon, quan){
    if(!this.kiemTraChoPhepKeo) return false;
    return this.kiemTraChoPhepKeo(nguon, quan);
  },

  _xuLyTha(nguon, dich){
    if(nguon === dich){
      this._boChonO();
      return "snapback";
    }
    // Nuoc di keo-tha da duoc chessboard.js dat quan vao vi tri ngay lap
    // tuc (khong hieu ung). Bao hieu cho datViTriBanCo() biet de KHONG
    // chay lai hieu ung chuyen dong chong len thao tac keo nay — day
    // chinh la nguyen nhan gay "hu anh"/giat hinh truoc day.
    this._dangKeoTha = true;
    const chapNhan = this.khiTuongTacO && this.khiTuongTacO(nguon, dich);
    this._dangKeoTha = false;
    if(!chapNhan) return "snapback";
    this._boChonO();
  },

  _ganSuKienClickDeDi(){
    const $banCo = $("#chess-board");
    $banCo.on("click", "[data-square]", (suKien) => {
      const o = $(suKien.currentTarget).attr("data-square");
      this._xuLyClickO(o);
    });
  },

  _xuLyClickO(o){
    if(!this.kiemTraThongTinClick) return;

    // Che do Si Khi: dang trong buoc chon O DICH cho mot Skill Move —
    // moi click duoc dua het cho main.js xu ly (thuc hien Skill hoac huy).
    if(this.dangChonOSkill){
      if(this.khiChonOSkill) this.khiChonOSkill(o);
      return;
    }

    // Che do Si Khi: truoc khi vao luong chon-quan binh thuong, hoi xem
    // main.js co muon chen vao (hien hop thoai Nuoc thuong/Skill) khong.
    if(this.truocKhiChonO && this.truocKhiChonO(o)) return;

    if(this.oDangChon){
      if(this.oDangChon === o){
        this._boChonO();
        return;
      }
      const chapNhan = this.khiTuongTacO && this.khiTuongTacO(this.oDangChon, o);
      this._boChonO();
      if(chapNhan) return;
      // Neu khong duoc chap nhan: co the nguoi dung vua chon quan khac cua minh.
    }

    const thongTin = this.kiemTraThongTinClick(o);
    if(thongTin && thongTin.chonDuoc){
      this.oDangChon = o;
      this._toSangOChon(o, thongTin.nuocDiHopLe);
    }
  },

  _boChonO(){
    this.oDangChon = null;
    $("[data-square]").removeClass("sq-selected");
    $(".move-hint").remove();
  },

  _toSangOChon(o, nuocDiHopLe){
    $("[data-square]").removeClass("sq-selected");
    $(".move-hint").remove();
    $(`[data-square="${o}"]`).addClass("sq-selected");
    (nuocDiHopLe || []).forEach(nuocDi => {
      const $o = $(`[data-square="${nuocDi.to}"]`);
      const goiY = document.createElement("div");
      goiY.className = "move-hint " + (nuocDi.captured || nuocDi.flags.includes("e") ? "capture" : "dot");
      $o.append(goiY);
    });
  },

  /** API cong khai: bat dau chon mot quan (dung boi main.js sau khi nguoi
   *  choi chon "Nuoc thuong" trong hop thoai Skill cua Mode Si Khi). */
  batDauChonThuong(o){
    if(!this.kiemTraThongTinClick) return;
    const thongTin = this.kiemTraThongTinClick(o);
    if(thongTin && thongTin.chonDuoc){
      this.oDangChon = o;
      this._toSangOChon(o, thongTin.nuocDiHopLe);
    }
  },

  /** To sang cac o dich hop le cua mot Skill Move (Mode Si Khi). */
  toSangONuocSkill(danhSachO){
    $(".move-hint").remove();
    $("[data-square]").removeClass("sq-skill-target");
    danhSachO.forEach(o => {
      const $o = $(`[data-square="${o}"]`);
      const goiY = document.createElement("div");
      goiY.className = "move-hint skill";
      $o.append(goiY);
      $o.addClass("sq-skill-target");
    });
  },

  xoaToSangSkill(){
    $(".move-hint.skill").remove();
    $("[data-square]").removeClass("sq-skill-target");
  },

  /** Ve nhan Si Khi nho duoi moi quan (chi dung trong Mode Si Khi).
   *  `danhSach` la mang {o, morale, sanSang} hoac null de xoa het. */
  veBadgeSiKhi(danhSach){
    $(".morale-badge").remove();
    if(!danhSach) return;
    danhSach.forEach(muc => {
      const $o = $(`[data-square="${muc.o}"]`);
      if($o.length === 0) return;
      const nhan = document.createElement("div");
      nhan.className = "morale-badge" + (muc.sanSang ? " ready" : "");
      nhan.textContent = muc.morale;
      $o.append(nhan);
    });
  },

  /* ---------------- To sang ---------------- */
  toSangNuocCuoi(nuocDi){
    $("[data-square]").removeClass("sq-lastmove-from sq-lastmove-to");
    if(!nuocDi) return;
    $(`[data-square="${nuocDi.from}"]`).addClass("sq-lastmove-from");
    $(`[data-square="${nuocDi.to}"]`).addClass("sq-lastmove-to");
  },

  toSangChieu(o){
    $("[data-square]").removeClass("sq-check");
    if(o) $(`[data-square="${o}"]`).addClass("sq-check");
  },

  datViTriBanCo(fen, hieuUng = true){
    // Trong luc mot nuoc keo-tha vua duoc xu ly dong bo (xem _xuLyTha),
    // quan co da nam dung o dich roi; bat hieu ung o day se chay dong
    // thoi/tranh chap voi thao tac keo va voi onSnapEnd ben tren, gay
    // giat hinh. Vi vay ta tat hieu ung cho truong hop nay.
    const coHieuUng = this._dangKeoTha ? false : hieuUng;
    this.banCo.position(fen, coHieuUng);
  },

  latBanCo(huong){
    this.huongBanCo = huong;
    this.banCo.orientation(huong);
  },

  /* ---------------- Cac bang thong tin ---------------- */
  datTenNguoiChoi(tenTren, tenDuoi){
    document.getElementById("name-top").textContent = tenTren;
    document.getElementById("name-bottom").textContent = tenDuoi;
  },

  datTheDangDenLuot(trenDangDi){
    document.getElementById("player-card-top").classList.toggle("active-turn", trenDangDi);
    document.getElementById("player-card-bottom").classList.toggle("active-turn", !trenDangDi);
  },

  datDongHo(giayTren, giayDuoi){
    document.getElementById("clock-top").textContent = DongHoCo.dinhDangThoiGian(giayTren);
    document.getElementById("clock-bottom").textContent = DongHoCo.dinhDangThoiGian(giayDuoi);
    document.getElementById("clock-top").classList.toggle("low-time", giayTren !== null && giayTren <= 20);
    document.getElementById("clock-bottom").classList.toggle("low-time", giayDuoi !== null && giayDuoi <= 20);
  },

  datQuanBiAn(quanTren, quanDuoi){
    document.getElementById("captured-top").textContent = quanTren.map(q => KY_TU_QUAN_CO[q.color][q.type]).join(" ");
    document.getElementById("captured-bottom").textContent = quanDuoi.map(q => KY_TU_QUAN_CO[q.color][q.type]).join(" ");
  },

  datChenhLechVatChat(giaTri){
    const el = document.getElementById("material-advantage");
    if(giaTri === 0){ el.textContent = ""; return; }
    const dau = giaTri > 0 ? "+" : "";
    el.textContent = NgonNgu.dich("materialAdv", { value: `${dau}${giaTri}` });
  },

  datVanBanTrangThai(vanBan){
    document.getElementById("game-status-text").textContent = vanBan;
  },

  datTrangThaiMaySuyNghi(dangSuyNghi){
    document.getElementById("ai-thinking-indicator").classList.toggle("hidden", !dangSuyNghi);
  },

  veLichSuNuocDi(cacCap){
    const khung = document.getElementById("move-history");
    khung.innerHTML = "";
    cacCap.forEach(cap => {
      const dong = document.createElement("div");
      dong.className = "move-row";
      const vanBanTrang = cap.white.san ? (cap.white.san + (cap.white.laSkill ? " ⚡" : "")) : "";
      const vanBanDen = cap.black.san ? (cap.black.san + (cap.black.laSkill ? " ⚡" : "")) : "";
      dong.innerHTML = `
        <span class="move-num">${cap.num}.</span>
        <span class="move-san${cap.white.laSkill ? " move-san-skill" : ""}">${vanBanTrang}</span>
        <span class="move-san${cap.black.laSkill ? " move-san-skill" : ""}">${vanBanDen}</span>
      `;
      khung.appendChild(dong);
    });
    khung.scrollTop = khung.scrollHeight;
  },

  /* ---------------- Hop thoai ---------------- */
  hienHopThoaiPhongCap(mau){
    return new Promise((giaiQuyet) => {
      const hopThoai = document.getElementById("promotion-modal");
      const khungLuaChon = document.getElementById("promotion-choices");
      khungLuaChon.innerHTML = "";
      ["q", "r", "b", "n"].forEach(loai => {
        const nut = document.createElement("button");
        nut.className = "promo-piece-btn";
        nut.textContent = KY_TU_QUAN_CO[mau][loai];
        nut.onclick = () => {
          hopThoai.classList.add("hidden");
          giaiQuyet(loai);
        };
        khungLuaChon.appendChild(nut);
      });
      hopThoai.classList.remove("hidden");
    });
  },

  hienHopThoaiKetThuc(tieuDe, lyDo){
    document.getElementById("gameover-title").textContent = tieuDe;
    document.getElementById("gameover-reason").textContent = lyDo;
    document.getElementById("gameover-modal").classList.remove("hidden");
  },

  anHopThoaiKetThuc(){
    document.getElementById("gameover-modal").classList.add("hidden");
  },

  hienHopThoaiCaiDat(){
    CaiDat.dongBoFormDieuKhien();
    document.getElementById("settings-modal").classList.remove("hidden");
  },

  anHopThoaiCaiDat(){
    document.getElementById("settings-modal").classList.add("hidden");
  },

  hienHopThoaiHuongDan(){ document.getElementById("howto-modal").classList.remove("hidden"); },
  anHopThoaiHuongDan(){ document.getElementById("howto-modal").classList.add("hidden"); },

  hienThongBaoLoi(thongDiep){
    const banner = document.getElementById("error-banner");
    banner.textContent = thongDiep;
    banner.classList.remove("hidden");
    clearTimeout(this._thoiGianLoi);
    this._thoiGianLoi = setTimeout(() => banner.classList.add("hidden"), 5000);
  }
};
