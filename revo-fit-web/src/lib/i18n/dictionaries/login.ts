import { Dict } from "../dictionary";

export interface LoginDict {
  ttl: string;
  ttlSub: string;
  google: string;
  apple: string;
  or: string;
  email: string;
  pw: string;
  forgot: string;
  submit: string;
  toSignup: string;
  signup: string;
  toast: string;
  forgotToast: string;
}

export const loginDict: Dict<LoginDict> = {
  ja: { ttl: "おかえりなさい", ttlSub: "revo に、ログインしましょう。", google: "Google でログイン", apple: "Apple でログイン", or: "または", email: "メールアドレス", pw: "パスワード", forgot: "お忘れですか？", submit: "ログイン", toSignup: "アカウントをお持ちでないですか？ ", signup: "新規登録", toast: "ログインしました", forgotToast: "再設定メールを送信しました" },
  en: { ttl: "Welcome back", ttlSub: "Log in to revo.", google: "Log in with Google", apple: "Log in with Apple", or: "or", email: "Email", pw: "Password", forgot: "Forgot?", submit: "Log in", toSignup: "Don't have an account? ", signup: "Sign up", toast: "Logged in", forgotToast: "Reset email sent" },
  "zh-Hans": { ttl: "欢迎回来", ttlSub: "登录 revo。", google: "使用 Google 登录", apple: "使用 Apple 登录", or: "或", email: "邮箱", pw: "密码", forgot: "忘记了？", submit: "登录", toSignup: "还没有账户？ ", signup: "注册", toast: "已登录", forgotToast: "重置邮件已发送" },
  "zh-Hant": { ttl: "歡迎回來", ttlSub: "登入 revo。", google: "使用 Google 登入", apple: "使用 Apple 登入", or: "或", email: "電子郵件", pw: "密碼", forgot: "忘記了？", submit: "登入", toSignup: "還沒有帳戶？ ", signup: "註冊", toast: "已登入", forgotToast: "重設郵件已發送" },
  ko: { ttl: "다시 오셨네요", ttlSub: "revo에 로그인해요.", google: "Google로 로그인", apple: "Apple로 로그인", or: "또는", email: "이메일", pw: "비밀번호", forgot: "잊으셨나요?", submit: "로그인", toSignup: "계정이 없나요? ", signup: "가입하기", toast: "로그인했어요", forgotToast: "재설정 이메일을 보냈어요" },
  fr: { ttl: "Bon retour", ttlSub: "Connectez-vous à revo.", google: "Se connecter avec Google", apple: "Se connecter avec Apple", or: "ou", email: "E-mail", pw: "Mot de passe", forgot: "Oublié ?", submit: "Se connecter", toSignup: "Pas de compte ? ", signup: "S'inscrire", toast: "Connecté", forgotToast: "E-mail de réinitialisation envoyé" },
  es: { ttl: "Bienvenido de nuevo", ttlSub: "Inicia sesión en revo.", google: "Iniciar con Google", apple: "Iniciar con Apple", or: "o", email: "Correo", pw: "Contraseña", forgot: "¿Olvidaste?", submit: "Iniciar sesión", toSignup: "¿No tienes cuenta? ", signup: "Registrarse", toast: "Sesión iniciada", forgotToast: "Correo de restablecimiento enviado" },
  de: { ttl: "Willkommen zurück", ttlSub: "Melde dich bei revo an.", google: "Mit Google anmelden", apple: "Mit Apple anmelden", or: "oder", email: "E-Mail", pw: "Passwort", forgot: "Vergessen?", submit: "Anmelden", toSignup: "Kein Konto? ", signup: "Registrieren", toast: "Angemeldet", forgotToast: "Zurücksetz-E-Mail gesendet" },
  it: { ttl: "Bentornato", ttlSub: "Accedi a revo.", google: "Accedi con Google", apple: "Accedi con Apple", or: "o", email: "E-mail", pw: "Password", forgot: "Dimenticata?", submit: "Accedi", toSignup: "Non hai un account? ", signup: "Registrati", toast: "Accesso effettuato", forgotToast: "E-mail di reimpostazione inviata" },
  pt: { ttl: "Bem-vindo de volta", ttlSub: "Entre no revo.", google: "Entrar com Google", apple: "Entrar com Apple", or: "ou", email: "E-mail", pw: "Senha", forgot: "Esqueceu?", submit: "Entrar", toSignup: "Não tem uma conta? ", signup: "Cadastrar", toast: "Conectado", forgotToast: "E-mail de redefinição enviado" },
  th: { ttl: "ยินดีต้อนรับกลับ", ttlSub: "เข้าสู่ระบบ revo", google: "เข้าสู่ระบบด้วย Google", apple: "เข้าสู่ระบบด้วย Apple", or: "หรือ", email: "อีเมล", pw: "รหัสผ่าน", forgot: "ลืม?", submit: "เข้าสู่ระบบ", toSignup: "ยังไม่มีบัญชี? ", signup: "สมัคร", toast: "เข้าสู่ระบบแล้ว", forgotToast: "ส่งอีเมลรีเซ็ตแล้ว" },
  hi: { ttl: "वापसी पर स्वागत है", ttlSub: "revo में लॉग इन करें।", google: "Google से लॉग इन", apple: "Apple से लॉग इन", or: "या", email: "ईमेल", pw: "पासवर्ड", forgot: "भूल गए?", submit: "लॉग इन", toSignup: "खाता नहीं है? ", signup: "साइन अप", toast: "लॉग इन हो गया", forgotToast: "रीसेट ईमेल भेजा गया" },
  vi: { ttl: "Chào mừng trở lại", ttlSub: "Đăng nhập vào revo.", google: "Đăng nhập với Google", apple: "Đăng nhập với Apple", or: "hoặc", email: "Email", pw: "Mật khẩu", forgot: "Quên?", submit: "Đăng nhập", toSignup: "Chưa có tài khoản? ", signup: "Đăng ký", toast: "Đã đăng nhập", forgotToast: "Đã gửi email đặt lại" },
  id: { ttl: "Selamat datang kembali", ttlSub: "Masuk ke revo.", google: "Masuk dengan Google", apple: "Masuk dengan Apple", or: "atau", email: "Email", pw: "Kata sandi", forgot: "Lupa?", submit: "Masuk", toSignup: "Belum punya akun? ", signup: "Daftar", toast: "Berhasil masuk", forgotToast: "Email atur ulang terkirim" }
};
