/**
 * main.js
 * Khoi dong ung dung va dieu phoi TrangThai <-> GiaoDien <-> QuanLyStockfish.
 * Day la file duy nhat "biet ve" tat ca cac module khac; game.js, ui.js,
 * timer.js va stockfish-manager.js van doc lap voi nhau.
 */

(function(){
  let trangThai = new TrangThai();
  const qlStockfish = new QuanLyStockfish();
  const aiSiKhi = new AiSiKhi(qlStockfish);
  let dongHo = null;
  let mayDangSuyNghi = false;
  let dangChoPhongCap = false;
  let dangChonSkillTarget = null; // { o, thongTin } khi dang cho chon o dich Skill (Mode Si Khi)
  let oSkillHienTai = null;       // o dang duoc hoi Nuoc thuong/Skill (hop thoai)
  let thongTinSkillHienTai = null;
  let mauTren = "b";
  let mauDuoi = "w";
  let cauHinhVanTruoc = null; // dung boi "Van moi" de choi lai voi cung thiet lap

  /** true khi dang o Mode Si Khi (ca ban local lan ban dau AI). */
  function dangTrongCheDoSiKhi(){
    return trangThai.cheDo === "morale" || trangThai.cheDo === "morale-ai";
  }

  /** true khi che do hien tai co doi thu la AI (Classic AI hoac Si Khi AI). */
  function laCheDoAI(cheDo){
    return cheDo === "ai" || cheDo === "morale-ai";
  }

  /* =====================================================
     KHOI DONG
     ===================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    NgonNgu.khoiTao();
    CaiDat.taiCaiDat();
    CaiDat.dongBoFormDieuKhien();
    ganMenu();
    ganManHinhThietLap();
    ganManHinhThietLapSiKhi();
    ganDieuKhienVanCo();
    ganHopThoai();
    ganHopThoaiSkill();
    ganThanhTren();
    GiaoDien.hienThiManHinh("screen-menu");
  });

  /* =====================================================
     DIEU HUONG MENU
     ===================================================== */
  function ganMenu(){
    document.getElementById("menu-local").addEventListener("click", () => GiaoDien.hienThiManHinh("screen-local-setup"));
    document.getElementById("menu-ai").addEventListener("click", () => GiaoDien.hienThiManHinh("screen-ai-setup"));
    document.getElementById("menu-morale").addEventListener("click", () => GiaoDien.hienThiManHinh("screen-morale-setup"));
    document.getElementById("menu-settings").addEventListener("click", () => GiaoDien.hienHopThoaiCaiDat());
    document.getElementById("menu-howto").addEventListener("click", () => GiaoDien.hienHopThoaiHuongDan());
  }

  function ganThanhTren(){
    document.getElementById("btn-lang").addEventListener("click", () => {
      NgonNgu.datNgonNgu(NgonNgu.hienTai === "vi" ? "en" : "vi");
      lamMoiVanBanDong();
    });
    document.getElementById("btn-settings-quick").addEventListener("click", () => GiaoDien.hienHopThoaiCaiDat());

    const nutGiaoDien = document.getElementById("btn-theme");
    if(nutGiaoDien){
      nutGiaoDien.addEventListener("click", () => {
        const giaoDienMoi = CaiDat.lay("giaoDien") === "dark" ? "light" : "dark";
        CaiDat.dat("giaoDien", giaoDienMoi);
        capNhatBieuTuongGiaoDien();
      });
      capNhatBieuTuongGiaoDien();
    }
  }

  function capNhatBieuTuongGiaoDien(){
    const nutGiaoDien = document.getElementById("btn-theme");
    if(!nutGiaoDien) return;
    const dangToi = CaiDat.lay("giaoDien") === "dark";
    nutGiaoDien.textContent = dangToi ? "☀" : "☾";
    nutGiaoDien.title = NgonNgu.dich(dangToi ? "lightMode" : "darkMode");
  }

  /* =====================================================
     MAN HINH THIET LAP (cac hang lua chon)
     ===================================================== */
  const thietLapAI = { mau: "random", doKho: "medium", henGio: "none" };
  const thietLapNoiBo = { henGio: "none" };

  function ganHangLuaChon(idKhung, doiTuongDich, khoa){
    const khung = document.getElementById(idKhung);
    khung.querySelectorAll(".option-btn").forEach(nut => {
      nut.addEventListener("click", () => {
        khung.querySelectorAll(".option-btn").forEach(n => n.classList.remove("active"));
        nut.classList.add("active");
        doiTuongDich[khoa] = nut.getAttribute("data-value");
      });
    });
  }

  function ganManHinhThietLap(){
    ganHangLuaChon("setup-color", thietLapAI, "mau");
    ganHangLuaChon("setup-difficulty", thietLapAI, "doKho");
    ganHangLuaChon("setup-timer", thietLapAI, "henGio");
    ganHangLuaChon("setup-local-timer", thietLapNoiBo, "henGio");

    document.getElementById("setup-ai-back").addEventListener("click", () => GiaoDien.hienThiManHinh("screen-menu"));
    document.getElementById("setup-local-back").addEventListener("click", () => GiaoDien.hienThiManHinh("screen-menu"));

    document.getElementById("setup-ai-start").addEventListener("click", () => {
      batDauVanAI(thietLapAI.mau, thietLapAI.doKho, thietLapAI.henGio);
    });
    document.getElementById("setup-local-start").addEventListener("click", () => {
      batDauVanNoiBo(thietLapNoiBo.henGio);
    });
  }

  /* ---- Man hinh thiet lap rieng cho Mode Si Khi ---- */
  const thietLapSiKhi = { subMode: "local", mau: "random", doKho: "medium", henGio: "none" };

  function ganManHinhThietLapSiKhi(){
    ganHangLuaChon("setup-morale-submode", thietLapSiKhi, "subMode");
    ganHangLuaChon("setup-morale-color", thietLapSiKhi, "mau");
    ganHangLuaChon("setup-morale-difficulty", thietLapSiKhi, "doKho");
    ganHangLuaChon("setup-morale-timer", thietLapSiKhi, "henGio");

    // An/hien nhom "chi danh cho AI" (mau quan + do kho) theo lua chon doi thu.
    const nhomChiAI = document.querySelectorAll(".setup-morale-ai-only");
    document.querySelectorAll("#setup-morale-submode .option-btn").forEach(nut => {
      nut.addEventListener("click", () => {
        const laAI = nut.getAttribute("data-value") === "ai";
        nhomChiAI.forEach(nhom => nhom.classList.toggle("hidden", !laAI));
      });
    });

    document.getElementById("setup-morale-back").addEventListener("click", () => GiaoDien.hienThiManHinh("screen-menu"));
    document.getElementById("setup-morale-start").addEventListener("click", () => {
      batDauVanSiKhi(thietLapSiKhi.subMode, thietLapSiKhi.mau, thietLapSiKhi.doKho, thietLapSiKhi.henGio);
    });
  }

  /* =====================================================
     DIEU KHIEN VAN CO
     ===================================================== */
  function ganDieuKhienVanCo(){
    document.getElementById("btn-new-game").addEventListener("click", () => {
      if(cauHinhVanTruoc) khoiDongLaiTheoCauHinh(cauHinhVanTruoc);
    });
    document.getElementById("btn-undo").addEventListener("click", xuLyHoanTac);
    document.getElementById("btn-resign").addEventListener("click", xuLyDauHang);
    document.getElementById("btn-back-menu").addEventListener("click", veMenuChinh);
    document.getElementById("gameover-newgame").addEventListener("click", () => {
      GiaoDien.anHopThoaiKetThuc();
      if(cauHinhVanTruoc) khoiDongLaiTheoCauHinh(cauHinhVanTruoc);
    });
    document.getElementById("gameover-menu").addEventListener("click", () => {
      GiaoDien.anHopThoaiKetThuc();
      veMenuChinh();
    });
  }

  function ganHopThoai(){
    document.getElementById("settings-close").addEventListener("click", () => GiaoDien.anHopThoaiCaiDat());
    document.getElementById("howto-close").addEventListener("click", () => GiaoDien.anHopThoaiHuongDan());

    document.getElementById("setting-language").addEventListener("change", (e) => {
      NgonNgu.datNgonNgu(e.target.value);
      lamMoiVanBanDong();
    });
    document.getElementById("setting-board-theme").addEventListener("change", (e) => {
      CaiDat.dat("mauBanCo", e.target.value);
    });
    document.getElementById("setting-sound").addEventListener("change", (e) => {
      CaiDat.dat("amThanhBat", e.target.checked);
    });
    document.getElementById("setting-animation").addEventListener("change", (e) => {
      CaiDat.dat("hieuUngBat", e.target.checked);
    });
    document.getElementById("setting-coords").addEventListener("change", (e) => {
      CaiDat.dat("hienToaDo", e.target.checked);
    });
    document.getElementById("setting-theme").addEventListener("change", (e) => {
      CaiDat.dat("giaoDien", e.target.checked ? "light" : "dark");
      capNhatBieuTuongGiaoDien();
    });
  }

  /** Hop thoai "Nuoc thuong / Dung Skill" — chi xuat hien trong Mode Si Khi. */
  function ganHopThoaiSkill(){
    document.getElementById("morale-btn-normal").addEventListener("click", () => {
      anModalSkill();
      if(oSkillHienTai) GiaoDien.batDauChonThuong(oSkillHienTai);
    });
    document.getElementById("morale-btn-skill").addEventListener("click", () => {
      anModalSkill();
      if(oSkillHienTai && thongTinSkillHienTai) batDauChonSkillTarget(oSkillHienTai, thongTinSkillHienTai);
    });
    document.getElementById("morale-btn-cancel").addEventListener("click", () => anModalSkill());
  }

  function hienModalChonSkill(o, thongTin){
    oSkillHienTai = o;
    thongTinSkillHienTai = thongTin;
    document.getElementById("morale-skill-glyph").textContent = KY_TU_QUAN_CO[thongTin.mau][thongTin.loaiQuan];
    document.getElementById("morale-skill-percent").textContent = thongTin.morale + "%";
    document.getElementById("morale-skill-bar").style.width = thongTin.morale + "%";
    document.getElementById("morale-skill-name").textContent = NgonNgu.dich("skill_" + thongTin.tenSkill);
    document.getElementById("morale-skill-cost").textContent = NgonNgu.dich("skillCost", { cost: thongTin.chiPhi });
    document.getElementById("morale-btn-skill").disabled = thongTin.nuocSkill.length === 0;
    document.getElementById("morale-skill-modal").classList.remove("hidden");
  }

  function anModalSkill(){
    document.getElementById("morale-skill-modal").classList.add("hidden");
    oSkillHienTai = null;
    thongTinSkillHienTai = null;
  }

  /** Nguoi choi vua chon "Dung Skill" — chuyen ban co sang che do cho chon o dich. */
  function batDauChonSkillTarget(o, thongTin){
    dangChonSkillTarget = { o, thongTin };
    GiaoDien.dangChonOSkill = true;
    GiaoDien.khiChonOSkill = (denO) => {
      const ungVien = thongTin.nuocSkill.find(uv => uv.to === denO);
      GiaoDien.dangChonOSkill = false;
      GiaoDien.khiChonOSkill = null;
      GiaoDien.xoaToSangSkill();
      dangChonSkillTarget = null;
      if(!ungVien) return; // click ra ngoai vung hop le => huy Skill
      const nuocDi = trangThai.thucHienSkill(o, denO);
      if(!nuocDi){
        GiaoDien.hienThongBaoLoi(NgonNgu.dich("invalidMove"));
        return;
      }
      sauKhiApDungNuocDi(nuocDi);
    };
    GiaoDien.toSangONuocSkill(thongTin.nuocSkill.map(uv => uv.to));
  }

  function huyDangChonSkill(){
    if(dangChonSkillTarget){
      GiaoDien.dangChonOSkill = false;
      GiaoDien.khiChonOSkill = null;
      GiaoDien.xoaToSangSkill();
      dangChonSkillTarget = null;
    }
    anModalSkill();
  }

  /** Hoi truoc khi chon quan (Mode Si Khi): neu quan co Skill san sang thi
   *  hien hop thoai Nuoc thuong/Skill thay vi vao thang luong chon binh
   *  thuong. Duoc GiaoDien goi qua hook `truocKhiChonO`. */
  function truocKhiChonOSiKhi(o){
    if(trangThai.daKetThuc() || mayDangSuyNghi || dangChoPhongCap || dangChonSkillTarget) return false;
    const quan = trangThai.co.get(o);
    if(!quan || !trangThai.laChuQuanDuocDi(quan.color)) return false;
    const thongTin = trangThai.layThongTinSkillTaiO(o);
    if(!thongTin || !thongTin.sanSang) return false;
    hienModalChonSkill(o, thongTin);
    return true;
  }

  /** Cap nhat nhan Si Khi nho duoi moi quan tren ban co (chi Mode Si Khi). */
  function capNhatBadgeSiKhi(){
    if(!dangTrongCheDoSiKhi()){
      GiaoDien.veBadgeSiKhi(null);
      return;
    }
    const ds = [];
    Object.keys(trangThai.banDoQuanCo).forEach(o => {
      const tt = trangThai.layThongTinSkillTaiO(o);
      if(tt) ds.push({ o, morale: tt.morale, sanSang: tt.sanSang });
    });
    GiaoDien.veBadgeSiKhi(ds);
  }

  /* =====================================================
     BAT DAU VAN DAU
     ===================================================== */
  function batDauVanNoiBo(henGio){
    cauHinhVanTruoc = { cheDo: "local", henGio };
    trangThai = new TrangThai();
    trangThai.batDauVanMoi({ cheDo: "local", thoiGianQuyDinh: henGio });
    mauTren = "b";
    mauDuoi = "w";
    // Hien man hinh van co TRUOC khi khoi tao ban co: chessboard.js do
    // kich thuoc khung chua theo DOM, neu khung dang "hidden" (display:none)
    // no se ve sai kich thuoc/vi tri — day chinh la nguyen nhan phai bam
    // them "Van moi" thi ban co moi hien dung.
    GiaoDien.hienThiManHinh("screen-game");
    thietLapBanCoChoVanMoi();
    GiaoDien.datTenNguoiChoi(NgonNgu.dich("player2"), NgonNgu.dich("player1"));
    GiaoDien.latBanCo("white");
    batDauDongHoVaTrangThai();
  }

  function batDauVanAI(luaChonMau, doKho, henGio){
    cauHinhVanTruoc = { cheDo: "ai", luaChonMau, doKho, henGio };
    trangThai = new TrangThai();
    trangThai.batDauVanMoi({ cheDo: "ai", mauNguoiChoi: luaChonMau, doKhoMay: doKho, thoiGianQuyDinh: henGio });
    mauDuoi = trangThai.mauNguoiChoi;
    mauTren = trangThai.mauMay;
    GiaoDien.hienThiManHinh("screen-game");
    thietLapBanCoChoVanMoi();
    GiaoDien.datTenNguoiChoi(NgonNgu.dich("aiName"), NgonNgu.dich("you"));
    GiaoDien.latBanCo(trangThai.mauNguoiChoi === "w" ? "white" : "black");
    batDauDongHoVaTrangThai();

    GiaoDien.datVanBanTrangThai(NgonNgu.dich("aiThinking"));
    qlStockfish.khoiTao((lyDo) => {
      GiaoDien.hienThongBaoLoi(NgonNgu.dich("engineError"));
      console.error("Khoi tao Stockfish that bai:", lyDo);
    }).then((thanhCong) => {
      if(!thanhCong) return;
      if(trangThai.laLuotMay()) kichHoatNuocDiMay();
    });
  }

  /** Bat dau van dau Mode Si Khi — subMode: "local" | "ai". */
  function batDauVanSiKhi(subMode, luaChonMau, doKho, henGio){
    const cheDo = subMode === "ai" ? "morale-ai" : "morale";
    cauHinhVanTruoc = { cheDo: "morale", subMode, mau: luaChonMau, doKho, henGio };
    trangThai = new TrangThaiSiKhi();
    trangThai.batDauVanMoi({ cheDo, mauNguoiChoi: luaChonMau, doKhoMay: doKho, thoiGianQuyDinh: henGio });

    if(cheDo === "morale-ai"){
      mauDuoi = trangThai.mauNguoiChoi;
      mauTren = trangThai.mauMay;
    }else{
      mauTren = "b";
      mauDuoi = "w";
    }

    GiaoDien.hienThiManHinh("screen-game");
    thietLapBanCoChoVanMoi();

    if(cheDo === "morale-ai"){
      GiaoDien.datTenNguoiChoi(NgonNgu.dich("aiName"), NgonNgu.dich("you"));
      GiaoDien.latBanCo(trangThai.mauNguoiChoi === "w" ? "white" : "black");
    }else{
      GiaoDien.datTenNguoiChoi(NgonNgu.dich("player2"), NgonNgu.dich("player1"));
      GiaoDien.latBanCo("white");
    }
    batDauDongHoVaTrangThai();

    if(cheDo === "morale-ai"){
      GiaoDien.datVanBanTrangThai(NgonNgu.dich("aiThinking"));
      // Luu y: Stockfish khong hieu Skill cua Mode Si Khi. AiSiKhi van choi
      // duoc du engine nay khoi tao that bai — no chi mat di mot tin hieu
      // tham khao, khong phai nguon quyet dinh duy nhat (xem morale-ai.js).
      qlStockfish.khoiTao((lyDo) => {
        console.error("Khoi tao Stockfish (Si Khi) that bai — AI van tiep tuc bang heuristic rieng:", lyDo);
      }).then(() => {
        if(trangThai.laLuotMay()) kichHoatNuocDiMay();
      });
    }
  }

  function khoiDongLaiTheoCauHinh(cauHinh){
    qlStockfish.dung();
    huyDangChonSkill();
    if(cauHinh.cheDo === "local"){
      batDauVanNoiBo(cauHinh.henGio);
    }else if(cauHinh.cheDo === "ai"){
      batDauVanAI(cauHinh.luaChonMau, cauHinh.doKho, cauHinh.henGio);
    }else if(cauHinh.cheDo === "morale"){
      batDauVanSiKhi(cauHinh.subMode, cauHinh.mau, cauHinh.doKho, cauHinh.henGio);
    }
  }

  function thietLapBanCoChoVanMoi(){
    if(GiaoDien.banCo) GiaoDien.banCo.destroy();
    GiaoDien.khoiTaoBanCo(() => trangThai.layFEN());
    GiaoDien.banCo.position(trangThai.layFEN(), false);
    GiaoDien.banCo.resize();
    GiaoDien.kiemTraChoPhepKeo = coTheTuongTacQuan;
    GiaoDien.kiemTraThongTinClick = layThongTinChonKhiClick;
    GiaoDien.khiTuongTacO = xuLyTuongTacO;
    GiaoDien.truocKhiChonO = dangTrongCheDoSiKhi() ? truocKhiChonOSiKhi : null;
    document.getElementById("morale-mode-tag").classList.toggle("hidden", !dangTrongCheDoSiKhi());
    GiaoDien.toSangNuocCuoi(null);
    GiaoDien.toSangChieu(null);
    GiaoDien.veLichSuNuocDi([]);
    capNhatQuanBiAnVaVatChat();
    capNhatBadgeSiKhi();
    mayDangSuyNghi = false;
    dangChoPhongCap = false;
    huyDangChonSkill();
    GiaoDien.tamDungDongBoViTri = false;
    GiaoDien.datTrangThaiMaySuyNghi(false);
  }

  function batDauDongHoVaTrangThai(){
    if(dongHo) dongHo.dung();
    dongHo = new DongHoCo(
      trangThai.thoiGianQuyDinh,
      (mau) => { trangThai.hetGio(mau); xuLyKetThucVan(); },
      (conLai) => GiaoDien.datDongHo(conLai[mauTren], conLai[mauDuoi])
    );
    GiaoDien.datDongHo(dongHo.conLai[mauTren], dongHo.conLai[mauDuoi]);
    dongHo.batDau(trangThai.luot);
    capNhatVanBanTrangThai();
  }

  /* =====================================================
     KIEM SOAT TUONG TAC
     ===================================================== */
  function coTheTuongTacQuan(o, maQuan){
    if(trangThai.daKetThuc() || mayDangSuyNghi || dangChoPhongCap || dangChonSkillTarget) return false;
    const mau = maQuan[0].toLowerCase() === "w" ? "w" : "b";
    return trangThai.laChuQuanDuocDi(mau);
  }

  function layThongTinChonKhiClick(o){
    const quan = trangThai.co.get(o);
    if(!quan) return { chonDuoc: false };
    const choPhep = coTheTuongTacQuan(o, quan.color + quan.type);
    if(!choPhep) return { chonDuoc: false };
    return { chonDuoc: true, nuocDiHopLe: trangThai.layNuocDiHopLe(o) };
  }

  function xuLyTuongTacO(tuO, denO){
    if(trangThai.daKetThuc() || mayDangSuyNghi || dangChoPhongCap || dangChonSkillTarget) return false;
    const quan = trangThai.co.get(tuO);
    if(!quan || !trangThai.laChuQuanDuocDi(quan.color)) return false;

    const hopLe = trangThai.layNuocDiHopLe(tuO);
    const khop = hopLe.find(m => m.to === denO);
    if(!khop) return false;

    if(trangThai.laNuocPhongCap(tuO, denO)){
      dangChoPhongCap = true;
      GiaoDien.tamDungDongBoViTri = true;
      GiaoDien.hienHopThoaiPhongCap(quan.color).then(phongCap => {
        dangChoPhongCap = false;
        GiaoDien.tamDungDongBoViTri = false;
        hoanTatNuocDi(tuO, denO, phongCap);
      });
      return true;
    }

    hoanTatNuocDi(tuO, denO);
    return true;
  }

  function hoanTatNuocDi(tuO, denO, phongCap){
    const nuocDi = trangThai.diNuoc(tuO, denO, phongCap);
    if(!nuocDi){
      GiaoDien.hienThongBaoLoi(NgonNgu.dich("invalidMove"));
      GiaoDien.datViTriBanCo(trangThai.layFEN());
      return;
    }
    sauKhiApDungNuocDi(nuocDi);
  }

  /* =====================================================
     QUY TRINH SAU MOI NUOC DI (dung chung cho nguoi + may)
     ===================================================== */
  function sauKhiApDungNuocDi(nuocDi){
    phatAmThanhChoNuocDi(nuocDi);
    GiaoDien.datViTriBanCo(trangThai.layFEN());
    GiaoDien.toSangNuocCuoi(nuocDi);
    GiaoDien.toSangChieu(trangThai.layOVuaBiChieu());
    GiaoDien.veLichSuNuocDi(trangThai.layLichSuTheoCap());
    capNhatQuanBiAnVaVatChat();
    capNhatBadgeSiKhi();

    if(dongHo) dongHo.doiLuot(nuocDi.color, trangThai.luot);
    GiaoDien.datTheDangDenLuot(trangThai.luot === mauTren);

    if(trangThai.daKetThuc()){
      xuLyKetThucVan();
      return;
    }

    capNhatVanBanTrangThai();

    if(trangThai.laLuotMay()){
      kichHoatNuocDiMay();
    }
  }

  function phatAmThanhChoNuocDi(nuocDi){
    if(nuocDi.flags.includes("k") || nuocDi.flags.includes("q")) AmThanh.nhapThanh();
    else if(nuocDi.flags.includes("p")) AmThanh.phongCap();
    else if(nuocDi.captured) AmThanh.an();
    else AmThanh.di();
    if(trangThai.dangBiChieu()) setTimeout(() => AmThanh.chieu(), 120);
  }

  function capNhatQuanBiAnVaVatChat(){
    const quanDuoi = trangThai.quanBiAn[mauDuoi].map(loai => ({ color: mauTren, type: loai }));
    const quanTren = trangThai.quanBiAn[mauTren].map(loai => ({ color: mauDuoi, type: loai }));
    GiaoDien.datQuanBiAn(quanTren, quanDuoi);
    GiaoDien.datChenhLechVatChat(trangThai.layChenhLechVatChat());
  }

  function capNhatVanBanTrangThai(){
    if(trangThai.daKetThuc()) return;
    let vanBan = NgonNgu.dich(trangThai.luot === "w" ? "turnWhite" : "turnBlack");
    if(trangThai.dangBiChieu()){
      vanBan = NgonNgu.dich("inCheck", { color: NgonNgu.dich(trangThai.luot === "w" ? "white" : "black") });
    }
    GiaoDien.datVanBanTrangThai(vanBan);
  }

  /* =====================================================
     LUOT CUA MAY
     ===================================================== */
  function kichHoatNuocDiMay(){
    if(dangTrongCheDoSiKhi()){
      kichHoatNuocDiMaySiKhi();
      return;
    }
    if(qlStockfish.loi){
      GiaoDien.hienThongBaoLoi(NgonNgu.dich("engineError"));
      return;
    }
    mayDangSuyNghi = true;
    GiaoDien.datTrangThaiMaySuyNghi(true);
    GiaoDien.datVanBanTrangThai(NgonNgu.dich("aiThinking"));

    qlStockfish.yeuCauNuocDiTot(trangThai.layFEN(), trangThai.doKhoMay)
      .then(nuocUci => {
        mayDangSuyNghi = false;
        GiaoDien.datTrangThaiMaySuyNghi(false);
        const nuocDi = trangThai.diNuocUCI(nuocUci);
        if(!nuocDi){
          GiaoDien.hienThongBaoLoi(NgonNgu.dich("invalidMove"));
          return;
        }
        sauKhiApDungNuocDi(nuocDi);
      })
      .catch(loi => {
        mayDangSuyNghi = false;
        GiaoDien.datTrangThaiMaySuyNghi(false);
        if(!trangThai.daKetThuc()){
          console.error("Nuoc di cua may that bai:", loi);
          GiaoDien.hienThongBaoLoi(NgonNgu.dich("engineError"));
        }
      });
  }

  /** Luot cua AI trong Mode Si Khi — dung AiSiKhi (chuan + Skill), khong
   *  phai truc tiep goi Stockfish (xem giai thich trong morale-ai.js). */
  function kichHoatNuocDiMaySiKhi(){
    mayDangSuyNghi = true;
    GiaoDien.datTrangThaiMaySuyNghi(true);
    GiaoDien.datVanBanTrangThai(NgonNgu.dich("aiThinking"));

    aiSiKhi.chonNuocDi(trangThai, trangThai.doKhoMay)
      .then(ungVien => {
        mayDangSuyNghi = false;
        GiaoDien.datTrangThaiMaySuyNghi(false);
        if(!ungVien){
          GiaoDien.hienThongBaoLoi(NgonNgu.dich("invalidMove"));
          return;
        }
        const nuocDi = ungVien.loai === "skill"
          ? trangThai.thucHienSkill(ungVien.from, ungVien.to)
          : trangThai.diNuoc(ungVien.from, ungVien.to, ungVien.promotion);
        if(!nuocDi){
          GiaoDien.hienThongBaoLoi(NgonNgu.dich("invalidMove"));
          return;
        }
        sauKhiApDungNuocDi(nuocDi);
      })
      .catch(loi => {
        mayDangSuyNghi = false;
        GiaoDien.datTrangThaiMaySuyNghi(false);
        if(!trangThai.daKetThuc()){
          console.error("AI Si Khi that bai:", loi);
          GiaoDien.hienThongBaoLoi(NgonNgu.dich("engineError"));
        }
      });
  }

  /* =====================================================
     HOAN TAC / DAU HANG / KET THUC VAN
     ===================================================== */
  function xuLyHoanTac(){
    if(mayDangSuyNghi || dangChoPhongCap){
      GiaoDien.hienThongBaoLoi(NgonNgu.dich("cannotActWhileAI"));
      return;
    }
    huyDangChonSkill();
    qlStockfish.dung();
    const soLan = trangThai.hoanTac();
    if(soLan === 0) return;

    GiaoDien.anHopThoaiKetThuc();
    GiaoDien.datViTriBanCo(trangThai.layFEN());
    const cacCap = trangThai.layLichSuTheoCap();
    GiaoDien.veLichSuNuocDi(cacCap);
    const nuocCuoi = trangThai.danhSachNuocDi[trangThai.danhSachNuocDi.length - 1] || null;
    GiaoDien.toSangNuocCuoi(nuocCuoi);
    GiaoDien.toSangChieu(trangThai.layOVuaBiChieu());
    capNhatQuanBiAnVaVatChat();
    capNhatBadgeSiKhi();
    GiaoDien.datTheDangDenLuot(trangThai.luot === mauTren);
    capNhatVanBanTrangThai();
    if(dongHo){
      dongHo.tamDung();
      dongHo.mauDangChay = trangThai.luot;
      dongHo.batDau(trangThai.luot);
    }
  }

  function xuLyDauHang(){
    if(trangThai.daKetThuc()) return;
    const mauDauHang = laCheDoAI(trangThai.cheDo) ? trangThai.mauNguoiChoi : trangThai.luot;
    huyDangChonSkill();
    qlStockfish.dung();
    trangThai.dauHang(mauDauHang);
    xuLyKetThucVan();
  }

  function xuLyKetThucVan(){
    if(dongHo) dongHo.dung();
    qlStockfish.dung();
    AmThanh.ketThucVan();

    const nhanNguoiThang = trangThai.nguoiThang ? NgonNgu.dich(trangThai.nguoiThang === "w" ? "white" : "black") : null;
    let vanBanLyDo = "";
    let vanBanTieuDe = NgonNgu.dich("gameOver");

    switch(trangThai.lyDoKetThuc){
      case "checkmate":
        vanBanLyDo = NgonNgu.dich("checkmate", { winner: nhanNguoiThang });
        break;
      case "stalemate":
        vanBanLyDo = NgonNgu.dich("stalemate");
        break;
      case "insufficient":
        vanBanLyDo = NgonNgu.dich("drawInsufficient");
        break;
      case "repetition":
        vanBanLyDo = NgonNgu.dich("drawRepetition");
        break;
      case "fifty":
        vanBanLyDo = NgonNgu.dich("drawFiftyMove");
        break;
      case "resign":
        vanBanLyDo = NgonNgu.dich("resignWin", { winner: nhanNguoiThang });
        break;
      case "timeout":
        vanBanLyDo = NgonNgu.dich("timeoutWin", { winner: nhanNguoiThang });
        break;
      default:
        vanBanLyDo = NgonNgu.dich("drawGeneric");
    }

    GiaoDien.datVanBanTrangThai(vanBanLyDo);
    GiaoDien.hienHopThoaiKetThuc(vanBanTieuDe, vanBanLyDo);
  }

  function veMenuChinh(){
    huyDangChonSkill();
    qlStockfish.dung();
    qlStockfish.huyBo();
    if(dongHo) dongHo.dung();
    GiaoDien.hienThiManHinh("screen-menu");
  }

  function lamMoiVanBanDong(){
    if(!document.getElementById("screen-game").classList.contains("hidden")){
      capNhatVanBanTrangThai();
      GiaoDien.datTenNguoiChoi(
        laCheDoAI(trangThai.cheDo) ? NgonNgu.dich("aiName") : NgonNgu.dich("player2"),
        laCheDoAI(trangThai.cheDo) ? NgonNgu.dich("you") : NgonNgu.dich("player1")
      );
    }
  }
})();
