/**
 * settings.js
 * Noi luu cai dat cua nguoi dung (am thanh, hieu ung, giao dien sang/toi,
 * mau ban co, toa do). Duoc luu vao localStorage; khong dung backend/CSDL.
 */

const KHOA_LUU_CAI_DAT = "chess_settings";

const CAI_DAT_MAC_DINH = {
  amThanhBat: true,
  hieuUngBat: true,
  hienToaDo: true,
  mauBanCo: "classic-green",
  kieuQuanCo: "wikipedia",
  giaoDien: "dark" // "dark" | "light"
};

const CaiDat = {
  duLieu: { ...CAI_DAT_MAC_DINH },

  taiCaiDat(){
    try{
      const raw = localStorage.getItem(KHOA_LUU_CAI_DAT);
      if(raw){
        const daPhanTich = JSON.parse(raw);
        this.duLieu = { ...CAI_DAT_MAC_DINH, ...daPhanTich };
      }
    }catch(loi){
      console.warn("CaiDat: khong doc duoc cai dat da luu, dung mac dinh.", loi);
      this.duLieu = { ...CAI_DAT_MAC_DINH };
    }
    this.apDungVaoTrang();
    return this.duLieu;
  },

  luuCaiDat(){
    try{
      localStorage.setItem(KHOA_LUU_CAI_DAT, JSON.stringify(this.duLieu));
    }catch(loi){
      console.warn("CaiDat: khong luu duoc cai dat.", loi);
    }
  },

  dat(khoa, giaTri){
    if(!(khoa in CAI_DAT_MAC_DINH)){
      console.warn(`CaiDat: khoa "${khoa}" khong hop le, bo qua.`);
      return;
    }
    this.duLieu[khoa] = giaTri;
    this.luuCaiDat();
    this.apDungVaoTrang();
  },

  lay(khoa){
    return this.duLieu[khoa];
  },

  apDungVaoTrang(){
    document.documentElement.setAttribute("data-board-theme", this.duLieu.mauBanCo);
    document.documentElement.setAttribute("data-theme", this.duLieu.giaoDien);
  },

  /** Dong bo cac o dieu khien trong hop thoai cai dat voi gia tri hien tai. */
  dongBoFormDieuKhien(){
    const oAmThanh = document.getElementById("setting-sound");
    const oHieuUng = document.getElementById("setting-animation");
    const oToaDo = document.getElementById("setting-coords");
    const oMauBanCo = document.getElementById("setting-board-theme");
    const oGiaoDien = document.getElementById("setting-theme");
    if(oAmThanh) oAmThanh.checked = this.duLieu.amThanhBat;
    if(oHieuUng) oHieuUng.checked = this.duLieu.hieuUngBat;
    if(oToaDo) oToaDo.checked = this.duLieu.hienToaDo;
    if(oMauBanCo) oMauBanCo.value = this.duLieu.mauBanCo;
    if(oGiaoDien) oGiaoDien.checked = this.duLieu.giaoDien === "light";
  }
};
