import { Dict } from "../dictionary";

export interface WelcomeDict {
  tag: string;
  lead: string; // may contain <br>
  sub: string; // may contain <br>
  start: string;
  login: string;
  tos: string;
}

export const welcomeDict: Dict<WelcomeDict> = {
  ja: { tag: "revo in your life", lead: "あなたの毎日を、<br>動きで満たしていく。", sub: "鍛える、生活、走る。<br>revo が、そのすべてのそばに。", start: "はじめる", login: "ログイン", tos: "続けることで、利用規約とプライバシーポリシーに同意したものとみなされます。" },
  en: { tag: "revo in your life", lead: "Fill your every day<br>with movement.", sub: "Train, life, run.<br>revo stays close to it all.", start: "Get started", login: "Log in", tos: "By continuing, you agree to the Terms and Privacy Policy." },
  "zh-Hans": { tag: "revo in your life", lead: "让运动，<br>充盈你的每一天。", sub: "锻炼、生活、跑步。<br>revo 陪伴这一切。", start: "开始", login: "登录", tos: "继续即表示你同意条款与隐私政策。" },
  "zh-Hant": { tag: "revo in your life", lead: "讓運動，<br>充盈你的每一天。", sub: "鍛鍊、生活、跑步。<br>revo 陪伴這一切。", start: "開始", login: "登入", tos: "繼續即表示你同意條款與隱私政策。" },
  ko: { tag: "revo in your life", lead: "당신의 매일을<br>움직임으로 채워요.", sub: "단련하기, 생활, 달리기.<br>revo가 그 곁에 있어요.", start: "시작하기", login: "로그인", tos: "계속하면 약관과 개인정보 정책에 동의한 것으로 간주돼요." },
  fr: { tag: "revo in your life", lead: "Remplissez chaque jour<br>de mouvement.", sub: "Entraînement, vie, course.<br>revo reste tout près.", start: "Commencer", login: "Se connecter", tos: "En continuant, vous acceptez les CGU et la politique de confidentialité." },
  es: { tag: "revo in your life", lead: "Llena tu día a día<br>de movimiento.", sub: "Entrenamiento, vida, carrera.<br>revo está cerca de todo.", start: "Empezar", login: "Iniciar sesión", tos: "Al continuar, aceptas los Términos y la Política de privacidad." },
  de: { tag: "revo in your life", lead: "Füll deinen Alltag<br>mit Bewegung.", sub: "Training, Leben, Lauf.<br>revo bleibt ganz nah.", start: "Loslegen", login: "Anmelden", tos: "Mit dem Fortfahren stimmst du den AGB und der Datenschutzerklärung zu." },
  it: { tag: "revo in your life", lead: "Riempi ogni giorno<br>di movimento.", sub: "Allenamento, vita, corsa.<br>revo è vicino a tutto.", start: "Inizia", login: "Accedi", tos: "Continuando, accetti i Termini e la Privacy." },
  pt: { tag: "revo in your life", lead: "Preencha cada dia<br>com movimento.", sub: "Treino, vida, corrida.<br>revo fica perto de tudo.", start: "Começar", login: "Entrar", tos: "Ao continuar, você aceita os Termos e a Política de Privacidade." },
  th: { tag: "revo in your life", lead: "เติมทุกวันของคุณ<br>ด้วยการเคลื่อนไหว", sub: "การฝึก ชีวิต การวิ่ง<br>revo อยู่ใกล้ทุกสิ่ง", start: "เริ่มต้น", login: "เข้าสู่ระบบ", tos: "การดำเนินต่อถือว่าคุณยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว" },
  hi: { tag: "revo in your life", lead: "अपने हर दिन को<br>गति से भरें।", sub: "प्रशिक्षण, जीवन, दौड़।<br>revo हर पल साथ।", start: "शुरू करें", login: "लॉग इन", tos: "जारी रखने पर आप शर्तें और गोपनीयता नीति स्वीकार करते हैं।" },
  vi: { tag: "revo in your life", lead: "Lấp đầy mỗi ngày<br>bằng chuyển động.", sub: "Luyện tập, cuộc sống, chạy bộ.<br>revo luôn ở bên.", start: "Bắt đầu", login: "Đăng nhập", tos: "Tiếp tục nghĩa là bạn đồng ý với Điều khoản và Chính sách bảo mật." },
  id: { tag: "revo in your life", lead: "Isi setiap harimu<br>dengan gerak.", sub: "Latihan, hidup, lari.<br>revo dekat dengan semua.", start: "Mulai", login: "Masuk", tos: "Dengan melanjutkan, kamu menyetujui Ketentuan dan Kebijakan Privasi." }
};
