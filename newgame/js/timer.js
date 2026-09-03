/**
 * timer.js
 * Dong ho co kieu Fischer don gian: thoi gian goc + cong them moi nuoc.
 * Dem lui moi giay cho ben dang den luot; dung han khi van dau ket thuc.
 * Doc lap voi chess.js / giao dien nen co the test rieng hoac thay the de dang.
 */

class DongHoCo {
  /**
   * @param {string} thoiGianQuyDinh vi du "10+5", "5+0", hoac "none"
   * @param {(mau:string)=>void} khiHetGio goi khi mot ben het thoi gian
   * @param {(trangThai:object)=>void} khiDem goi moi giay voi {w,b} giay con lai
   */
  constructor(thoiGianQuyDinh, khiHetGio, khiDem){
    this.coBatGio = thoiGianQuyDinh && thoiGianQuyDinh !== "none";
    this.khiHetGio = khiHetGio;
    this.khiDem = khiDem;
    this.maBoDem = null;
    this.mauDangChay = "w";
    this.dangChay = false;

    if(this.coBatGio){
      const [phutGoc, giayCongThem] = thoiGianQuyDinh.split("+").map(Number);
      this.congThem = giayCongThem || 0;
      this.conLai = { w: phutGoc * 60, b: phutGoc * 60 };
    }else{
      this.congThem = 0;
      this.conLai = { w: null, b: null };
    }
  }

  batDau(mauDangChay){
    if(!this.coBatGio) return;
    this.mauDangChay = mauDangChay;
    this.dangChay = true;
    this._xoaBoDem();
    this.maBoDem = setInterval(() => this._dem(), 1000);
  }

  /** Doi ben nao dang chay dong ho, cong them thoi gian cho ben vua di. */
  doiLuot(mauVuaDi, mauTiepTheo){
    if(!this.coBatGio) return;
    this.conLai[mauVuaDi] += this.congThem;
    this.mauDangChay = mauTiepTheo;
    if(this.khiDem) this.khiDem({ ...this.conLai });
  }

  tamDung(){
    this.dangChay = false;
    this._xoaBoDem();
  }

  dung(){
    this.dangChay = false;
    this._xoaBoDem();
  }

  datLai(thoiGianQuyDinh){
    this.dung();
    const batGio = thoiGianQuyDinh && thoiGianQuyDinh !== "none";
    this.coBatGio = batGio;
    if(batGio){
      const [phutGoc, giayCongThem] = thoiGianQuyDinh.split("+").map(Number);
      this.congThem = giayCongThem || 0;
      this.conLai = { w: phutGoc * 60, b: phutGoc * 60 };
    }else{
      this.congThem = 0;
      this.conLai = { w: null, b: null };
    }
  }

  _dem(){
    if(!this.dangChay) return;
    this.conLai[this.mauDangChay] = Math.max(0, this.conLai[this.mauDangChay] - 1);
    if(this.khiDem) this.khiDem({ ...this.conLai });
    if(this.conLai[this.mauDangChay] === 0){
      this.dung();
      if(this.khiHetGio) this.khiHetGio(this.mauDangChay);
    }
  }

  _xoaBoDem(){
    if(this.maBoDem){
      clearInterval(this.maBoDem);
      this.maBoDem = null;
    }
  }

  static dinhDangThoiGian(giay){
    if(giay === null || giay === undefined) return "--:--";
    const p = Math.floor(giay / 60);
    const s = giay % 60;
    return `${String(p).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }
}
