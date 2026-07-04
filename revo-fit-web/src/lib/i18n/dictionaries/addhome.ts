import { Dict } from "../dictionary";

export interface AddHomeDict {
  ttl: string;
  sub: string;
  ios: [string, string][];
  android: [string, string][];
  got: string;
  later: string;
  toast: string;
}

export const addHomeDict: Dict<AddHomeDict> = {
  ja: { ttl: "ホーム画面に追加", sub: "いつでも、あなたの生活のそばに。", ios: [["共有ボタンを開く", "画面下の共有アイコンから"], ["ホーム画面に追加", "メニューの中ほどにあります"]], android: [["メニューを開く", "右上の ⋮ から"], ["アプリをインストール", "または「ホーム画面に追加」"]], got: "追加しました", later: "あとで、ブラウザで続ける", toast: "ようこそ、revo へ" },
  en: { ttl: "Add to Home Screen", sub: "Always close to your everyday life.", ios: [["Open the share menu", "The share icon at the bottom"], ["Add to Home Screen", "Partway down the menu"]], android: [["Open the menu", "The ⋮ at the top right"], ["Install app", 'Or "Add to Home screen"']], got: "I've added it", later: "Later, continue in browser", toast: "Welcome to revo" },
  "zh-Hans": { ttl: "添加到主屏幕", sub: "始终陪伴你的日常。", ios: [["打开分享菜单", "底部的分享图标"], ["添加到主屏幕", "在菜单中部"]], android: [["打开菜单", "右上角的 ⋮"], ["安装应用", '或"添加到主屏幕"']], got: "已添加", later: "稍后在浏览器中继续", toast: "欢迎来到 revo" },
  "zh-Hant": { ttl: "加入主畫面", sub: "始終陪伴你的日常。", ios: [["開啟分享選單", "底部的分享圖示"], ["加入主畫面", "在選單中間"]], android: [["開啟選單", "右上角的 ⋮"], ["安裝應用程式", "或「加入主畫面」"]], got: "已加入", later: "稍後在瀏覽器中繼續", toast: "歡迎來到 revo" },
  ko: { ttl: "홈 화면에 추가", sub: "언제나 당신의 일상 곁에.", ios: [["공유 메뉴 열기", "하단의 공유 아이콘"], ["홈 화면에 추가", "메뉴 중간쯤에 있어요"]], android: [["메뉴 열기", "오른쪽 상단의 ⋮"], ["앱 설치", "또는 '홈 화면에 추가'"]], got: "추가했어요", later: "나중에 브라우저로 계속", toast: "revo에 오신 걸 환영해요" },
  fr: { ttl: "Ajouter à l'écran d'accueil", sub: "Toujours près de votre quotidien.", ios: [["Ouvrez le partage", "L'icône de partage en bas"], ["Sur l'écran d'accueil", "Au milieu du menu"]], android: [["Ouvrez le menu", "Le ⋮ en haut à droite"], ["Installer l'appli", "Ou « écran d'accueil »"]], got: "C'est ajouté", later: "Plus tard, dans le navigateur", toast: "Bienvenue sur revo" },
  es: { ttl: "Añadir a la pantalla de inicio", sub: "Siempre cerca de tu día a día.", ios: [["Abre compartir", "El icono de compartir abajo"], ["Añadir a inicio", "A media altura del menú"]], android: [["Abre el menú", "El ⋮ arriba a la derecha"], ["Instalar app", "O «Añadir a inicio»"]], got: "Ya lo añadí", later: "Más tarde, en el navegador", toast: "Bienvenido a revo" },
  de: { ttl: "Zum Startbildschirm hinzufügen", sub: "Immer nah an deinem Alltag.", ios: [["Teilen-Menü öffnen", "Das Teilen-Symbol unten"], ["Zum Home-Bildschirm", "Etwa in der Menümitte"]], android: [["Menü öffnen", "Das ⋮ oben rechts"], ["App installieren", "Oder „Zum Startbildschirm“"]], got: "Hinzugefügt", later: "Später, im Browser", toast: "Willkommen bei revo" },
  it: { ttl: "Aggiungi alla schermata Home", sub: "Sempre vicino alla tua giornata.", ios: [["Apri condivisione", "L'icona condividi in basso"], ["Aggiungi a Home", "A metà del menu"]], android: [["Apri il menu", "Il ⋮ in alto a destra"], ["Installa app", "O «Aggiungi a Home»"]], got: "Aggiunta", later: "Più tardi, nel browser", toast: "Benvenuto su revo" },
  pt: { ttl: "Adicionar à Tela de Início", sub: "Sempre perto do seu dia a dia.", ios: [["Abra compartilhar", "O ícone de compartilhar abaixo"], ["Adicionar à Tela", "No meio do menu"]], android: [["Abra o menu", "O ⋮ no canto superior direito"], ["Instalar app", 'Ou "Adicionar à tela"']], got: "Adicionei", later: "Depois, no navegador", toast: "Bem-vindo ao revo" },
  th: { ttl: "เพิ่มไปยังหน้าจอหลัก", sub: "อยู่ใกล้ทุกวันของคุณเสมอ", ios: [["เปิดเมนูแชร์", "ไอคอนแชร์ด้านล่าง"], ["เพิ่มไปหน้าจอโฮม", "อยู่กลางเมนู"]], android: [["เปิดเมนู", "⋮ มุมขวาบน"], ["ติดตั้งแอป", 'หรือ "เพิ่มไปหน้าจอหลัก"']], got: "เพิ่มแล้ว", later: "ภายหลัง ใช้ต่อในเบราว์เซอร์", toast: "ยินดีต้อนรับสู่ revo" },
  hi: { ttl: "होम स्क्रीन में जोड़ें", sub: "हमेशा आपके रोज़मर्रा के पास।", ios: [["शेयर मेनू खोलें", "नीचे शेयर आइकन"], ["होम स्क्रीन में जोड़ें", "मेनू के बीच में"]], android: [["मेनू खोलें", "ऊपर दाएं ⋮"], ["ऐप इंस्टॉल करें", 'या "होम स्क्रीन में जोड़ें"']], got: "जोड़ लिया", later: "बाद में, ब्राउज़र में जारी रखें", toast: "revo में स्वागत है" },
  vi: { ttl: "Thêm vào Màn hình chính", sub: "Luôn bên cạnh ngày thường của bạn.", ios: [["Mở menu chia sẻ", "Biểu tượng chia sẻ ở dưới"], ["Thêm vào MH chính", "Ở giữa menu"]], android: [["Mở menu", "Dấu ⋮ góc trên phải"], ["Cài đặt ứng dụng", 'Hoặc "Thêm vào màn hình chính"']], got: "Đã thêm", later: "Để sau, tiếp tục trên trình duyệt", toast: "Chào mừng đến revo" },
  id: { ttl: "Tambahkan ke Layar Utama", sub: "Selalu dekat dengan keseharianmu.", ios: [["Buka menu bagikan", "Ikon bagikan di bawah"], ["Tambah ke Layar Utama", "Di tengah menu"]], android: [["Buka menu", "Tanda ⋮ di kanan atas"], ["Instal aplikasi", 'Atau "Tambah ke layar utama"']], got: "Sudah ditambahkan", later: "Nanti, lanjut di browser", toast: "Selamat datang di revo" }
};
