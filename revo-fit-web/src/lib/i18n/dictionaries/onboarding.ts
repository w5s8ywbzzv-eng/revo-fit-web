import { Dict } from "../dictionary";

export interface OnboardingDict {
  welcome: string;
  welcomeSub: string; // may contain <br>
  langLbl: string;
  regionLbl: string;
  regionPh: string;
  start: string;
  disc: string; // may contain <br>
  /** whether region names should be shown in the local script (true) or in English (false) */
  local: boolean;
}

export const onboardingDict: Dict<OnboardingDict> = {
  ja: { welcome: "ようこそ", welcomeSub: "言語と国・地域を選んでください。<br>あとから設定でいつでも変更できます。", langLbl: "言語", regionLbl: "国・地域", regionPh: "選択してください", start: "はじめる", disc: "revo は健康の維持・増進のためのアプリで、医療行為・診断・治療を目的とするものではありません。<br>「はじめる」を押すと、利用規約とプライバシーポリシーに同意したものとみなされます。", local: true },
  en: { welcome: "Welcome", welcomeSub: "Choose your language and region.<br>You can change these anytime in settings.", langLbl: "Language", regionLbl: "Country / region", regionPh: "Select", start: "Get started", disc: 'revo supports maintaining and improving health and is not intended for medical practice, diagnosis, or treatment.<br>By tapping "Get started," you agree to the Terms of Use and Privacy Policy.', local: false },
  "zh-Hans": { welcome: "欢迎", welcomeSub: "请选择语言和国家·地区。<br>以后可在设置中随时更改。", langLbl: "语言", regionLbl: "国家·地区", regionPh: "请选择", start: "开始", disc: "revo 是维持和增进健康的应用，并非以医疗行为、诊断或治疗为目的。<br>点击『开始』即视为您同意使用条款和隐私政策。", local: true },
  "zh-Hant": { welcome: "歡迎", welcomeSub: "請選擇語言和國家·地區。<br>之後可在設定中隨時更改。", langLbl: "語言", regionLbl: "國家·地區", regionPh: "請選擇", start: "開始", disc: "revo 是維持和增進健康的應用，並非以醫療行為、診斷或治療為目的。<br>點擊『開始』即視為您同意使用條款和隱私政策。", local: true },
  ko: { welcome: "환영합니다", welcomeSub: "언어와 국가·지역을 선택하세요.<br>나중에 설정에서 언제든 바꿀 수 있어요.", langLbl: "언어", regionLbl: "국가·지역", regionPh: "선택하세요", start: "시작하기", disc: "revo는 건강 유지·증진을 위한 앱이며, 의료 행위·진단·치료를 목적으로 하지 않습니다.<br>'시작하기'를 누르면 이용약관과 개인정보 처리방침에 동의한 것으로 간주됩니다.", local: true },
  fr: { welcome: "Bienvenue", welcomeSub: "Choisissez votre langue et région.<br>Modifiable à tout moment dans les réglages.", langLbl: "Langue", regionLbl: "Pays / région", regionPh: "Sélectionner", start: "Commencer", disc: "revo soutient le maintien et l'amélioration de la santé et n'est pas destiné à un acte médical, un diagnostic ou un traitement.<br>En appuyant sur « Commencer », vous acceptez les Conditions d'utilisation et la Politique de confidentialité.", local: false },
  es: { welcome: "Bienvenido", welcomeSub: "Elige tu idioma y región.<br>Puedes cambiarlos cuando quieras en ajustes.", langLbl: "Idioma", regionLbl: "País / región", regionPh: "Seleccionar", start: "Empezar", disc: "revo apoya el mantenimiento y la mejora de la salud y no está destinado a actos médicos, diagnóstico ni tratamiento.<br>Al pulsar «Empezar», aceptas los Términos de uso y la Política de privacidad.", local: false },
  de: { welcome: "Willkommen", welcomeSub: "Wähle Sprache und Region.<br>Jederzeit in den Einstellungen änderbar.", langLbl: "Sprache", regionLbl: "Land / Region", regionPh: "Auswählen", start: "Loslegen", disc: "revo unterstützt die Erhaltung und Förderung der Gesundheit und ist nicht für medizinische Behandlung, Diagnose oder Therapie bestimmt.<br>Mit „Loslegen“ stimmst du den Nutzungsbedingungen und der Datenschutzrichtlinie zu.", local: false },
  it: { welcome: "Benvenuto", welcomeSub: "Scegli lingua e regione.<br>Modificabili in qualsiasi momento nelle impostazioni.", langLbl: "Lingua", regionLbl: "Paese / regione", regionPh: "Seleziona", start: "Inizia", disc: "revo sostiene il mantenimento e il miglioramento della salute e non è destinato ad atti medici, diagnosi o trattamenti.<br>Toccando «Inizia», accetti i Termini d'uso e la Privacy policy.", local: false },
  pt: { welcome: "Bem-vindo", welcomeSub: "Escolha seu idioma e região.<br>Pode mudar quando quiser nas configurações.", langLbl: "Idioma", regionLbl: "País / região", regionPh: "Selecionar", start: "Começar", disc: "revo apoia a manutenção e melhoria da saúde e não tem finalidade de ato médico, diagnóstico ou tratamento.<br>Ao tocar em «Começar», você aceita os Termos de uso e a Política de privacidade.", local: false },
  th: { welcome: "ยินดีต้อนรับ", welcomeSub: "เลือกภาษาและประเทศ·ภูมิภาค<br>เปลี่ยนได้ทุกเมื่อในการตั้งค่า", langLbl: "ภาษา", regionLbl: "ประเทศ·ภูมิภาค", regionPh: "เลือก", start: "เริ่ม", disc: "revo เป็นแอปเพื่อรักษาและส่งเสริมสุขภาพ ไม่ได้มีวัตถุประสงค์เพื่อการรักษาพยาบาล การวินิจฉัย หรือการรักษาโรค<br>การกด 'เริ่ม' ถือว่าคุณยอมรับข้อกำหนดการใช้และนโยบายความเป็นส่วนตัว", local: true },
  hi: { welcome: "स्वागत है", welcomeSub: "अपनी भाषा और देश·क्षेत्र चुनें।<br>सेटिंग में कभी भी बदल सकते हैं।", langLbl: "भाषा", regionLbl: "देश·क्षेत्र", regionPh: "चुनें", start: "शुरू करें", disc: "revo स्वास्थ्य के रखरखाव और संवर्धन के लिए ऐप है, चिकित्सा कार्य, निदान या उपचार के लिए नहीं।<br>'शुरू करें' दबाने पर आप उपयोग की शर्तें और गोपनीयता नीति से सहमत माने जाएंगे।", local: true },
  vi: { welcome: "Chào mừng", welcomeSub: "Chọn ngôn ngữ và khu vực.<br>Có thể đổi bất cứ lúc nào trong cài đặt.", langLbl: "Ngôn ngữ", regionLbl: "Quốc gia / khu vực", regionPh: "Chọn", start: "Bắt đầu", disc: "revo hỗ trợ duy trì và cải thiện sức khỏe, không nhằm mục đích khám chữa bệnh, chẩn đoán hay điều trị.<br>Khi nhấn 'Bắt đầu', bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật.", local: false },
  id: { welcome: "Selamat datang", welcomeSub: "Pilih bahasa dan wilayah.<br>Bisa diubah kapan saja di pengaturan.", langLbl: "Bahasa", regionLbl: "Negara / wilayah", regionPh: "Pilih", start: "Mulai", disc: "revo mendukung pemeliharaan dan peningkatan kesehatan dan bukan untuk tindakan medis, diagnosis, atau pengobatan.<br>Dengan menekan 'Mulai', kamu menyetujui Ketentuan Penggunaan dan Kebijakan Privasi.", local: false }
};

export interface RegionOption {
  code: string;
  name: string; // local script
  en: string; // English
}

export const REGIONS: RegionOption[] = [
  { code: "JP", name: "日本", en: "Japan" }, { code: "KR", name: "대한민국", en: "South Korea" }, { code: "CN", name: "中国", en: "China" }, { code: "TW", name: "台灣", en: "Taiwan" }, { code: "HK", name: "香港", en: "Hong Kong" }, { code: "TH", name: "ไทย", en: "Thailand" }, { code: "VN", name: "Việt Nam", en: "Vietnam" }, { code: "ID", name: "Indonesia", en: "Indonesia" }, { code: "MY", name: "Malaysia", en: "Malaysia" }, { code: "PH", name: "Philippines", en: "Philippines" }, { code: "SG", name: "Singapore", en: "Singapore" }, { code: "IN", name: "भारत", en: "India" }, { code: "PK", name: "Pakistan", en: "Pakistan" }, { code: "BD", name: "Bangladesh", en: "Bangladesh" }, { code: "LK", name: "Sri Lanka", en: "Sri Lanka" }, { code: "NP", name: "Nepal", en: "Nepal" }, { code: "KH", name: "Cambodia", en: "Cambodia" }, { code: "MM", name: "Myanmar", en: "Myanmar" },
  { code: "AE", name: "الإمارات", en: "UAE" }, { code: "SA", name: "السعودية", en: "Saudi Arabia" }, { code: "QA", name: "قطر", en: "Qatar" }, { code: "KW", name: "الكويت", en: "Kuwait" }, { code: "IL", name: "ישראל", en: "Israel" }, { code: "TR", name: "Türkiye", en: "Turkey" }, { code: "IR", name: "ایران", en: "Iran" },
  { code: "GB", name: "United Kingdom", en: "United Kingdom" }, { code: "IE", name: "Ireland", en: "Ireland" }, { code: "FR", name: "France", en: "France" }, { code: "DE", name: "Deutschland", en: "Germany" }, { code: "ES", name: "España", en: "Spain" }, { code: "IT", name: "Italia", en: "Italy" }, { code: "PT", name: "Portugal", en: "Portugal" }, { code: "NL", name: "Nederland", en: "Netherlands" }, { code: "BE", name: "België", en: "Belgium" }, { code: "CH", name: "Schweiz", en: "Switzerland" }, { code: "AT", name: "Österreich", en: "Austria" }, { code: "SE", name: "Sverige", en: "Sweden" }, { code: "NO", name: "Norge", en: "Norway" }, { code: "DK", name: "Danmark", en: "Denmark" }, { code: "FI", name: "Suomi", en: "Finland" }, { code: "PL", name: "Polska", en: "Poland" }, { code: "CZ", name: "Česko", en: "Czechia" }, { code: "GR", name: "Ελλάδα", en: "Greece" }, { code: "RO", name: "România", en: "Romania" }, { code: "HU", name: "Magyarország", en: "Hungary" }, { code: "UA", name: "Україна", en: "Ukraine" }, { code: "RU", name: "Россия", en: "Russia" },
  { code: "US", name: "United States", en: "United States" }, { code: "CA", name: "Canada", en: "Canada" }, { code: "MX", name: "México", en: "Mexico" },
  { code: "BR", name: "Brasil", en: "Brazil" }, { code: "AR", name: "Argentina", en: "Argentina" }, { code: "CL", name: "Chile", en: "Chile" }, { code: "CO", name: "Colombia", en: "Colombia" }, { code: "PE", name: "Perú", en: "Peru" },
  { code: "AU", name: "Australia", en: "Australia" }, { code: "NZ", name: "New Zealand", en: "New Zealand" },
  { code: "ZA", name: "South Africa", en: "South Africa" }, { code: "EG", name: "مصر", en: "Egypt" }, { code: "NG", name: "Nigeria", en: "Nigeria" }, { code: "KE", name: "Kenya", en: "Kenya" }, { code: "MA", name: "المغرب", en: "Morocco" },
  { code: "OTHER", name: "その他", en: "Other" }
];
