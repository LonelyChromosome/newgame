# Cờ Vua Trên Trình Duyệt — Nhóm 10

Một game cờ vua chạy hoàn toàn phía client, chơi được offline ngay trên
trình duyệt. Không có backend, không có cơ sở dữ liệu, không có đấu mạng
nhiều người — mọi thứ chạy cục bộ bằng Chess.js, Chessboard.js và
Stockfish.js (trong một Web Worker).

## Thành viên

- Nguyễn Minh Đạo – 24100222 – Trưởng nhóm
- Đặng Văn Nam Khán – 24100041
- Nguyễn Thanh Hải – 21011491

## Tính năng

- **Đấu nội bộ (2 người)** — hai người luân phiên chơi trên cùng một máy.
- **Đấu với máy** — chơi với Stockfish, có thể chọn màu quân
  (Trắng / Đen / Ngẫu nhiên) và 5 mức độ khó (Beginner → Expert).
- Engine Stockfish chạy trong một **Web Worker** riêng nên giao diện
  không bao giờ bị đứng khi AI đang tính toán; trạng thái "AI đang suy
  nghĩ..." sẽ chặn thao tác của người chơi cho đến khi engine trả lời.
- Đầy đủ luật chơi nhờ Chess.js: kiểm tra nước đi hợp lệ, chiếu, chiếu
  hết, hết nước đi (stalemate), hòa cờ (không đủ quân, lặp lại 3 lần,
  luật 50 nước), nhập thành (cánh vua/cánh hậu), bắt tốt qua đường, và
  phong cấp tốt với hộp thoại chọn quân (không bao giờ tự động phong hậu).
- Vừa kéo-thả vừa nhấp-để-đi, có tô sáng cho ô đang chọn, các ô đích hợp
  lệ, nước đi vừa thực hiện, và vua đang bị chiếu.
- Bảng lịch sử nước đi (theo cặp SAN có đánh số), khay quân bị ăn, và chỉ
  số chênh lệch vật chất cập nhật theo thời gian thực.
- Ván mới, Hoàn tác (lùi lại cả nước của AI lẫn của người chơi trong chế
  độ đấu máy, hoặc một nửa-nước-đi trong chế độ nội bộ; bị vô hiệu hóa
  khi AI đang suy nghĩ), và Đầu hàng.
- Đồng hồ cờ tùy chọn: Không giới hạn / 5+0 / 10+0 / 10+5 / 15+10, có
  cộng thêm giờ, cảnh báo màu khi sắp hết giờ, và tự động kết thúc ván
  khi hết giờ.
- Đa ngôn ngữ đầy đủ Tiếng Việt / Tiếng Anh, chuyển đổi không cần tải lại
  trang, được lưu trong `localStorage`.
- Giao diện **Sáng / Tối** chuyển đổi được (nút trên thanh trên cùng
  hoặc trong hộp thoại Cài đặt), cùng với màu bàn cờ, bật/tắt âm thanh,
  bật/tắt hiệu ứng chuyển động, và hiện/ẩn tọa độ — tất cả đều được lưu
  trong `localStorage`.
- Âm thanh được tổng hợp trực tiếp (di chuyển, ăn quân, chiếu, nhập
  thành, phong cấp, kết thúc ván) bằng Web Audio API — không cần file âm
  thanh, và không gặp vấn đề với chính sách tự-động-phát-âm-thanh vì mọi
  âm thanh đều do một hành động thật của người dùng kích hoạt.
- Xử lý lỗi chủ động: engine tải thất bại, worker bị crash, và nước đi
  của AI không hợp lệ/thất bại đều được bắt lại và hiển thị thành một
  thông báo rõ ràng trên màn hình thay vì làm treo trang.

## Công nghệ sử dụng

| Mục đích        | Thư viện                | Ghi chú |
|------------------|--------------------------|---------|
| Cấu trúc/giao diện | HTML5, CSS3            | Giao diện tối tùy biến, bố cục responsive |
| Tương tác        | JavaScript (ES6+), jQuery 3.7.1 | jQuery chỉ dùng cho các hook DOM của chessboard.js |
| Luật cờ          | **Chess.js** 0.10.3      | tải từ cdnjs |
| Giao diện bàn cờ | **Chessboard.js** 1.0.0  | tải từ cdnjs |
| Engine AI        | **Stockfish.js** 10.0.2  | tải trong `js/stockfish-worker.js` qua `importScripts`, chạy trong Web Worker |

Tất cả thư viện bên thứ ba được tải từ thẻ `<script>`/`<link>` CDN trong
`index.html` (và trong `js/stockfish-worker.js`) — không cần `npm install`
bất cứ thứ gì.

## Cấu trúc dự án

```
chess-game/
├── index.html
├── css/
│   ├── style.css        # theme, bố cục, nút bấm, panel, hộp thoại
│   ├── board.css        # kích thước bàn cờ + tô sáng ô/nước đi hợp lệ
│   └── responsive.css   # các mốc responsive cho tablet/laptop/desktop
├── js/
│   ├── main.js               # điều phối toàn bộ ứng dụng
│   ├── game.js                # TrangThai — bọc quanh chess.js, theo dõi quân bị ăn/trạng thái
│   ├── ui.js                  # render DOM, bàn cờ, tô sáng, hộp thoại, âm thanh
│   ├── settings.js            # cài đặt người dùng + lưu vào localStorage
│   ├── translation.js         # từ điển vi/en + các hàm hỗ trợ đa ngôn ngữ
│   ├── timer.js                # DongHoCo (đồng hồ Fischer: thời gian gốc + cộng thêm)
│   ├── stockfish-manager.js    # API dạng Promise ở luồng chính bao quanh worker
│   └── stockfish-worker.js     # Web Worker: nạp và chuyển tiếp engine Stockfish
├── assets/
│   ├── pieces/    # (không dùng — hình quân cờ lấy từ CDN mặc định của Chessboard.js)
│   ├── sounds/    # (không dùng — âm thanh được tổng hợp lúc chạy, xem ui.js)
│   └── icons/
└── README.md
```

> **Ghi chú về tài nguyên:** hình ảnh quân cờ được tải từ bộ quân mặc định
> trên CDN của Chessboard.js, và mọi hiệu ứng âm thanh đều được tổng hợp
> ngay trong trình duyệt bằng Web Audio API. Các thư mục trong `assets/`
> được giữ lại cho đầy đủ cấu trúc và sẵn sàng chứa bộ hình quân PNG tùy
> chỉnh hoặc file `.mp3` riêng nếu bạn muốn thay thế sau này (cập nhật
> `pieceTheme` trong `ui.js` và đối tượng `AmThanh` tương ứng).

## Cài đặt / Cách chạy

Không cần bước build và không cần `npm install` — đây là HTML/CSS/JS
tĩnh. Tuy nhiên bạn cần **một** máy chủ web cục bộ (không phải `file://`)
vì `Worker` và các lệnh gọi `fetch`/`importScripts` của Stockfish worker
bị hầu hết trình duyệt chặn khi chạy trực tiếp từ `file://`.

**Cách A — VS Code Live Server**
1. Mở thư mục `chess-game/` trong VS Code.
2. Cài extension "Live Server".
3. Chuột phải vào `index.html` → "Open with Live Server".

**Cách B — Máy chủ tích hợp sẵn của Python**
```bash
cd chess-game
python3 -m http.server 8000
```
Sau đó mở `http://localhost:8000` trên trình duyệt.

**Cách C — `serve` của Node**
```bash
npx serve chess-game
```

Cần có kết nối Internet ở **lần tải trang đầu tiên** (để tải jQuery,
Chess.js, Chessboard.js và Stockfish.js từ CDN); sau đó, toàn bộ quá
trình chơi thật sự — kiểm tra nước đi, AI tính toán, đồng hồ, cài đặt —
đều chạy 100% cục bộ, không cần gọi lại máy chủ.

## Cách kiểm thử

1. **Đấu nội bộ (2 người)**
   - Bắt đầu một ván nội bộ, đi vài nước cho cả Trắng và Đen, xác nhận
     chỉ báo lượt đi và lịch sử nước đi cập nhật đúng.
2. **Đấu với máy**
   - Bắt đầu ván đấu máy với màu Trắng ở mức "Beginner" — kiểm tra AI trả
     lời nhanh và đi những nước yếu/dễ sai lầm.
   - Bắt đầu lại với màu Đen — kiểm tra AI tự động đi nước đầu tiên trước
     khi bạn có thể thao tác.
   - Thử mức "Expert" — kiểm tra trạng thái "AI đang suy nghĩ..." hiện ra
     và bàn cờ không thể tương tác cho đến khi engine trả lời.
3. **Phủ luật chơi**
   - Nhập thành cả hai cánh; kiểm tra bị chặn nếu vua đã di chuyển, đang
     bị chiếu, hoặc đi qua ô đang bị tấn công.
   - Dàn một thế cờ có bắt tốt qua đường và xác nhận nó chỉ khả dụng ở
     đúng nước đi ngay sau đó.
   - Phong cấp một quân tốt và xác nhận hộp thoại hiện ra, chặn nước đi
     cho đến khi bạn chọn quân (không bao giờ tự động phong hậu).
   - Dẫn một thế cờ đến chiếu hết, hết nước đi, và hòa cờ (ví dụ do không
     đủ quân) rồi xác nhận thông báo hiển thị đúng.
4. **Hoàn tác**
   - Ở chế độ đấu máy, đi một nước, để AI đáp trả, rồi bấm Hoàn tác —
     kiểm tra lại đúng lượt của bạn và nước đi của AI cũng được lùi lại.
   - Thử bấm Hoàn tác khi đang hiện "AI đang suy nghĩ..." — kiểm tra bị
     chặn.
5. **Đồng hồ**
   - Bắt đầu ván "5+0" và để đồng hồ chạy về 0 — kiểm tra ván đấu kết
     thúc ngay với thông báo "thắng do hết giờ" và cả hai đồng hồ dừng.
6. **Cài đặt / đa ngôn ngữ**
   - Chuyển đổi ngôn ngữ — xác nhận toàn bộ văn bản hiển thị cập nhật mà
     không cần tải lại trang.
   - Chuyển đổi giao diện Sáng/Tối — xác nhận màu sắc toàn trang đổi
     đúng và mượt.
   - Bật/tắt âm thanh, hiệu ứng, đổi màu bàn cờ, tải lại trang, và xác
     nhận các lựa chọn được giữ nguyên.
7. **Khả năng chịu lỗi**
   - Tạm thời chặn request đến CDN của Stockfish (ví dụ qua devtools →
     network throttling → offline, hoặc một extension chặn mạng) rồi bắt
     đầu ván đấu máy — xác nhận bạn thấy "Không thể tải AI engine." thay
     vì trang bị treo hoặc crash.

## Thư viện / Phiên bản tương thích

- jQuery 3.7.1
- Chess.js 0.10.3 (API dạng snake_case: `in_checkmate()`, `in_stalemate()`,
  `insufficient_material()`, `in_threefold_repetition()`, `in_draw()`,
  `in_check()`)
- Chessboard.js 1.0.0
- Stockfish.js 10.0.2 (bản build asm.js đơn luồng, giao thức UCI)

Đã kiểm thử trên Chrome/Edge/Firefox desktop bản mới. Cần trình duyệt hỗ
trợ Web Worker và Web Audio API (mọi trình duyệt hiện đại đều hỗ trợ).

## TÍNH NĂNG TƯƠNG LAI (TÙY CHỌN)

*(Chưa triển khai — chỉ liệt kê như ý tưởng, nằm ngoài phạm vi đồ án.
Đấu mạng nhiều người rõ ràng nằm ngoài phạm vi bài tập này.)*

- Xuất/nhập PGN của một ván đấu đã hoàn thành.
- Nút lật bàn cờ (thủ công, độc lập với màu quân của AI).
- Mũi tên phân tích / thanh đánh giá nước đi dùng output "info" của Stockfish.
- Bộ quân cờ tùy chỉnh và file âm thanh lưu cục bộ.
- Chế độ luyện tập/giải cờ thế bằng các FEN dựng sẵn.
