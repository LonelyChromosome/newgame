/**
 * stockfish-manager.js
 *
 * Giao tiep voi Stockfish Web Worker qua UCI. Cung cap mot API dua tren
 * Promise cho phan con lai cua ung dung de game.js/ui.js khong bao gio
 * dung truc tiep postMessage. Xu ly anh xa do kho -> suc manh engine,
 * dung/khoi dong lai, va loi worker.
 *
 *   Luong chinh                  Stockfish Worker
 *   ------------                 ----------------
 *   yeuCauNuocDiTot(fen, do)  -->  position fen ...
 *                                   go movetime N / depth N
 *                              <--  bestmove e2e4
 *   Promise tra ve "e2e4"
 */

const MUC_DO_KHO = {
  beginner: { mucKyNang: 0,  doSau: 1,  thoiGianDiMs: 50   },
  easy:     { mucKyNang: 3,  doSau: 5,  thoiGianDiMs: 300  },
  medium:   { mucKyNang: 8,  doSau: 10, thoiGianDiMs: 800  },
  hard:     { mucKyNang: 14, doSau: 14, thoiGianDiMs: 1500 },
  expert:   { mucKyNang: 20, doSau: 18, thoiGianDiMs: 3000 },
};

class QuanLyStockfish {
  constructor(){
    this.luong = null;
    this.sanSang = false;
    this.loi = false;
    this.dangChoGiaiQuyet = null;
    this.dangChoTuChoi = null;
    this.promiseSanSang = null;
    this.goiLaiKhiLoi = null;
  }

  /** Khoi dong worker va cho engine tra loi "uciok"/"readyok". */
  khoiTao(khiLoi){
    this.goiLaiKhiLoi = khiLoi || function(){};
    this.loi = false;
    this.sanSang = false;

    this.promiseSanSang = new Promise((giaiQuyet) => {
      try{
        this.luong = new Worker("js/stockfish-worker.js");
      }catch(loi){
        this._xuLyLoi("Khong tao duoc worker: " + loi.message);
        giaiQuyet(false);
        return;
      }

      const hetGioChoSanSang = setTimeout(() => {
        if(!this.sanSang){
          this._xuLyLoi("Engine khong phan hoi kip thoi gian.");
          giaiQuyet(false);
        }
      }, 8000);

      this.luong.onerror = (loi) => {
        clearTimeout(hetGioChoSanSang);
        this._xuLyLoi("Loi runtime cua worker: " + (loi.message || "khong ro"));
        giaiQuyet(false);
      };

      this.luong.onmessage = (suKien) => {
        const dong = typeof suKien.data === "string" ? suKien.data : "";

        if(dong === "error:engine-load-failed"){
          clearTimeout(hetGioChoSanSang);
          this._xuLyLoi("Khong tai duoc script engine.");
          giaiQuyet(false);
          return;
        }

        if(dong === "uciok"){
          this.luong.postMessage("isready");
          return;
        }

        if(dong === "readyok" && !this.sanSang){
          clearTimeout(hetGioChoSanSang);
          this.sanSang = true;
          giaiQuyet(true);
          return;
        }

        if(dong.startsWith("bestmove")){
          this._giaiQuyetNuocDiTot(dong);
        }
      };

      this.luong.postMessage("uci");
    });

    return this.promiseSanSang;
  }

  _xuLyLoi(lyDo){
    this.loi = true;
    this.sanSang = false;
    console.error("QuanLyStockfish:", lyDo);
    if(this.dangChoTuChoi) this.dangChoTuChoi(new Error(lyDo));
    this._xoaDangCho();
    this.goiLaiKhiLoi(lyDo);
  }

  _xoaDangCho(){
    this.dangChoGiaiQuyet = null;
    this.dangChoTuChoi = null;
  }

  _giaiQuyetNuocDiTot(dong){
    // Vi du dong: "bestmove e2e4 ponder e7e5"
    const phan = dong.split(" ");
    const nuocDi = phan[1];
    if(this.dangChoGiaiQuyet){
      if(nuocDi && nuocDi !== "(none)"){
        this.dangChoGiaiQuyet(nuocDi);
      }else{
        this.dangChoTuChoi(new Error("Engine khong tra ve nuoc di hop le."));
      }
    }
    this._xoaDangCho();
  }

  /**
   * Yeu cau nuoc di tot nhat cho mot FEN o mot do kho cho truoc.
   * Tra ve Promise voi chuoi UCI nhu "e2e4" hoac "e7e8q".
   */
  yeuCauNuocDiTot(fen, doKho){
    if(this.loi){
      return Promise.reject(new Error("Engine khong kha dung."));
    }
    if(!this.sanSang){
      return Promise.reject(new Error("Engine chua san sang."));
    }
    if(this.dangChoGiaiQuyet){
      // Chi mot luot tim kiem duoc chay tai mot thoi diem.
      this.dung();
    }

    const cauHinh = MUC_DO_KHO[doKho] || MUC_DO_KHO.medium;

    return new Promise((giaiQuyet, tuChoi) => {
      this.dangChoGiaiQuyet = giaiQuyet;
      this.dangChoTuChoi = tuChoi;

      this.luong.postMessage("ucinewgame");
      this.luong.postMessage(`setoption name Skill Level value ${cauHinh.mucKyNang}`);
      this.luong.postMessage(`position fen ${fen}`);
      this.luong.postMessage(`go depth ${cauHinh.doSau} movetime ${cauHinh.thoiGianDiMs}`);
    });
  }

  /** Dung luot tim kiem dang chay (dung khi khoi dong lai / doi che do / hoan tac). */
  dung(){
    if(this.luong && this.sanSang){
      this.luong.postMessage("stop");
    }
    if(this.dangChoTuChoi){
      this.dangChoTuChoi(new Error("Da dung tim kiem."));
    }
    this._xoaDangCho();
  }

  /** Huy hoan toan va tao lai worker (dung khi bam Van moi). */
  khoiDongLai(khiLoi){
    this.huyBo();
    return this.khoiTao(khiLoi);
  }

  huyBo(){
    if(this.luong){
      try{ this.luong.postMessage("quit"); }catch(e){ /* bo qua */ }
      this.luong.terminate();
      this.luong = null;
    }
    this.sanSang = false;
    this._xoaDangCho();
  }
}
