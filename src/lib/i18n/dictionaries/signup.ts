import { Dict } from "../dictionary";

export interface SignupDict {
  ttl: string;
  ttlSub: string;
  google: string;
  apple: string;
  or: string;
  email: string;
  pw: string;
  pwHint: string;
  submit: string;
  toLogin: string;
  login: string;
  tos: string;
  toast: string;
}

export const signupDict: Dict<SignupDict> = {
  ja: { ttl: "アカウントを作成", ttlSub: "あなたの revo を、はじめましょう。", google: "Google で続ける", apple: "Apple で続ける", or: "または", email: "メールアドレス", pw: "パスワード", pwHint: "8文字以上。英字と数字を含めてください。", submit: "登録する", toLogin: "すでにアカウントをお持ちですか？ ", login: "ログイン", tos: "登録することで、利用規約とプライバシーポリシーに同意したものとみなされます。", toast: "確認メールを送信しました" },
  en: { ttl: "Create account", ttlSub: "Let's begin your revo.", google: "Continue with Google", apple: "Continue with Apple", or: "or", email: "Email", pw: "Password", pwHint: "At least 8 characters, with letters and numbers.", submit: "Sign up", toLogin: "Already have an account? ", login: "Log in", tos: "By signing up, you agree to the Terms and Privacy Policy.", toast: "Confirmation email sent" },
  "zh-Hans": { ttl: "创建账户", ttlSub: "开始你的 revo。", google: "使用 Google 继续", apple: "使用 Apple 继续", or: "或", email: "邮箱", pw: "密码", pwHint: "至少8位，需含字母和数字。", submit: "注册", toLogin: "已有账户？ ", login: "登录", tos: "注册即表示你同意条款与隐私政策。", toast: "确认邮件已发送" },
  "zh-Hant": { ttl: "建立帳戶", ttlSub: "開始你的 revo。", google: "使用 Google 繼續", apple: "使用 Apple 繼續", or: "或", email: "電子郵件", pw: "密碼", pwHint: "至少8位，需含字母和數字。", submit: "註冊", toLogin: "已有帳戶？ ", login: "登入", tos: "註冊即表示你同意條款與隱私政策。", toast: "確認郵件已發送" },
  ko: { ttl: "계정 만들기", ttlSub: "당신의 revo를 시작해요.", google: "Google로 계속", apple: "Apple로 계속", or: "또는", email: "이메일", pw: "비밀번호", pwHint: "8자 이상, 영문과 숫자 포함.", submit: "가입하기", toLogin: "이미 계정이 있나요? ", login: "로그인", tos: "가입하면 약관과 개인정보 정책에 동의한 것으로 간주돼요.", toast: "확인 이메일을 보냈어요" },
  fr: { ttl: "Créer un compte", ttlSub: "Commençons votre revo.", google: "Continuer avec Google", apple: "Continuer avec Apple", or: "ou", email: "E-mail", pw: "Mot de passe", pwHint: "Au moins 8 caractères, lettres et chiffres.", submit: "S'inscrire", toLogin: "Vous avez déjà un compte ? ", login: "Se connecter", tos: "En vous inscrivant, vous acceptez les CGU et la politique de confidentialité.", toast: "E-mail de confirmation envoyé" },
  es: { ttl: "Crear cuenta", ttlSub: "Empecemos tu revo.", google: "Continuar con Google", apple: "Continuar con Apple", or: "o", email: "Correo", pw: "Contraseña", pwHint: "Al menos 8 caracteres, con letras y números.", submit: "Registrarse", toLogin: "¿Ya tienes cuenta? ", login: "Iniciar sesión", tos: "Al registrarte, aceptas los Términos y la Política de privacidad.", toast: "Correo de confirmación enviado" },
  de: { ttl: "Konto erstellen", ttlSub: "Starten wir dein revo.", google: "Mit Google fortfahren", apple: "Mit Apple fortfahren", or: "oder", email: "E-Mail", pw: "Passwort", pwHint: "Mindestens 8 Zeichen, mit Buchstaben und Zahlen.", submit: "Registrieren", toLogin: "Schon ein Konto? ", login: "Anmelden", tos: "Mit der Registrierung stimmst du den AGB und der Datenschutzerklärung zu.", toast: "Bestätigungs-E-Mail gesendet" },
  it: { ttl: "Crea account", ttlSub: "Iniziamo il tuo revo.", google: "Continua con Google", apple: "Continua con Apple", or: "o", email: "E-mail", pw: "Password", pwHint: "Almeno 8 caratteri, con lettere e numeri.", submit: "Registrati", toLogin: "Hai già un account? ", login: "Accedi", tos: "Registrandoti, accetti i Termini e la Privacy.", toast: "E-mail di conferma inviata" },
  pt: { ttl: "Criar conta", ttlSub: "Vamos começar seu revo.", google: "Continuar com Google", apple: "Continuar com Apple", or: "ou", email: "E-mail", pw: "Senha", pwHint: "Pelo menos 8 caracteres, com letras e números.", submit: "Cadastrar", toLogin: "Já tem uma conta? ", login: "Entrar", tos: "Ao cadastrar, você aceita os Termos e a Política de Privacidade.", toast: "E-mail de confirmação enviado" },
  th: { ttl: "สร้างบัญชี", ttlSub: "เริ่ม revo ของคุณกันเถอะ", google: "ดำเนินการต่อด้วย Google", apple: "ดำเนินการต่อด้วย Apple", or: "หรือ", email: "อีเมล", pw: "รหัสผ่าน", pwHint: "อย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข", submit: "สมัคร", toLogin: "มีบัญชีอยู่แล้ว? ", login: "เข้าสู่ระบบ", tos: "การสมัครถือว่าคุณยอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว", toast: "ส่งอีเมลยืนยันแล้ว" },
  hi: { ttl: "खाता बनाएं", ttlSub: "अपना revo शुरू करें।", google: "Google से जारी रखें", apple: "Apple से जारी रखें", or: "या", email: "ईमेल", pw: "पासवर्ड", pwHint: "कम से कम 8 अक्षर, अक्षर और अंक सहित।", submit: "साइन अप", toLogin: "पहले से खाता है? ", login: "लॉग इन", tos: "साइन अप करने पर आप शर्तें और गोपनीयता नीति स्वीकार करते हैं।", toast: "पुष्टिकरण ईमेल भेजा गया" },
  vi: { ttl: "Tạo tài khoản", ttlSub: "Bắt đầu revo của bạn.", google: "Tiếp tục với Google", apple: "Tiếp tục với Apple", or: "hoặc", email: "Email", pw: "Mật khẩu", pwHint: "Ít nhất 8 ký tự, gồm chữ và số.", submit: "Đăng ký", toLogin: "Đã có tài khoản? ", login: "Đăng nhập", tos: "Khi đăng ký, bạn đồng ý với Điều khoản và Chính sách bảo mật.", toast: "Đã gửi email xác nhận" },
  id: { ttl: "Buat akun", ttlSub: "Mari mulai revo-mu.", google: "Lanjut dengan Google", apple: "Lanjut dengan Apple", or: "atau", email: "Email", pw: "Kata sandi", pwHint: "Minimal 8 karakter, dengan huruf dan angka.", submit: "Daftar", toLogin: "Sudah punya akun? ", login: "Masuk", tos: "Dengan mendaftar, kamu menyetujui Ketentuan dan Kebijakan Privasi.", toast: "Email konfirmasi terkirim" }
};
