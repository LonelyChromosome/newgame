/**
 * stockfish-worker.js
 *
 * Chay ben trong mot Web Worker rieng (duoc tao boi stockfish-manager.js)
 * de qua trinh tim kiem nang cua engine khong bao gio lam treo giao dien.
 * File nay chi co mot nhiem vu: nap engine Stockfish that su va de no tu
 * xu ly cac thong diep cua worker — ban than engine thuc hien giao thuc
 * chuan cua Worker: "gui vao mot lenh UCI, nhan ve cac dong van ban UCI".
 *
 * Neu khong tai duoc script engine (vi du: moi truong offline khong co
 * ban sao luu trong bo nho dem), ta bao loi ro rang ve luong chinh thay
 * vi de no cho mai mai.
 */

// Thu vai dia chi CDN da biet phong khi mot cai khong kha dung trong moi
// truong trien khai; dia chi dau tien tai thanh cong se duoc su dung.
const DUONG_DAN_ENGINE = [
  "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js",
  "https://unpkg.com/stockfish@10.0.2/src/stockfish.js"
];

let daTai = false;
for (const duongDan of DUONG_DAN_ENGINE) {
  try {
    importScripts(duongDan);
    daTai = true;
    break;
    // Tu diem nay tro di, script engine da nap se lam chu `self.onmessage`
    // va giao tiep bang cac dong van ban UCI thuan tuy qua postMessage —
    // giong het bat ky engine UCI nao khac, chi la duoc truyen qua kenh
    // cua Worker.
  } catch (loi) {
    // Thu dia chi tiep theo.
  }
}

if (!daTai) {
  // Bao cho luong chinh biet viec khoi tao engine that bai de no co the
  // hien "Khong the tai AI engine." thay vi treo o "AI dang suy nghi...".
  postMessage("error:engine-load-failed");
}
