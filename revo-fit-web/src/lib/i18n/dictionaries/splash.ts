import { Dict } from "../dictionary";

export interface SplashDict {
  consent: string; // "By continuing, you agree to the Terms and Privacy Policy."
  apple: string;
  google: string;
  or: string;
  email: string;
  foot: string; // "Already have an account? "
  login: string;
}

export const splashDict: Dict<SplashDict> = {
  ja: { consent: "続けると、利用規約とプライバシーポリシーに同意したものとみなされます。", apple: "Appleで続ける", google: "Googleで続ける", or: "または", email: "メールで続ける", foot: "アカウントをお持ちですか？", login: "ログイン" },
  en: { consent: "By continuing, you agree to the Terms and Privacy Policy.", apple: "Continue with Apple", google: "Continue with Google", or: "or", email: "Continue with email", foot: "Already have an account?", login: "Log in" },
  "zh-Hans": { consent: "继续即表示同意服务条款与隐私政策。", apple: "通过 Apple 继续", google: "通过 Google 继续", or: "或", email: "用邮箱继续", foot: "已有账号？", login: "登录" },
  "zh-Hant": { consent: "繼續即表示同意服務條款與隱私政策。", apple: "透過 Apple 繼續", google: "透過 Google 繼續", or: "或", email: "用電子郵件繼續", foot: "已有帳號？", login: "登入" },
  ko: { consent: "계속하면 이용약관과 개인정보 정책에 동의하는 것으로 간주됩니다.", apple: "Apple로 계속", google: "Google로 계속", or: "또는", email: "이메일로 계속", foot: "이미 계정이 있나요?", login: "로그인" },
  fr: { consent: "En continuant, vous acceptez les Conditions et la Politique de confidentialité.", apple: "Continuer avec Apple", google: "Continuer avec Google", or: "ou", email: "Continuer avec l'e-mail", foot: "Vous avez déjà un compte ?", login: "Se connecter" },
  es: { consent: "Al continuar, aceptas los Términos y la Política de privacidad.", apple: "Continuar con Apple", google: "Continuar con Google", or: "o", email: "Continuar con correo", foot: "¿Ya tienes una cuenta?", login: "Iniciar sesión" },
  de: { consent: "Mit dem Fortfahren stimmst du den AGB und der Datenschutzerklärung zu.", apple: "Weiter mit Apple", google: "Weiter mit Google", or: "oder", email: "Weiter mit E-Mail", foot: "Schon ein Konto?", login: "Anmelden" },
  it: { consent: "Continuando, accetti i Termini e la Privacy Policy.", apple: "Continua con Apple", google: "Continua con Google", or: "oppure", email: "Continua con email", foot: "Hai già un account?", login: "Accedi" },
  pt: { consent: "Ao continuar, você concorda com os Termos e a Política de Privacidade.", apple: "Continuar com Apple", google: "Continuar com Google", or: "ou", email: "Continuar com e-mail", foot: "Já tem uma conta?", login: "Entrar" },
  th: { consent: "การดำเนินการต่อถือว่ายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว", apple: "ดำเนินการต่อด้วย Apple", google: "ดำเนินการต่อด้วย Google", or: "หรือ", email: "ดำเนินการต่อด้วยอีเมล", foot: "มีบัญชีอยู่แล้ว?", login: "เข้าสู่ระบบ" },
  hi: { consent: "जारी रखने पर आप शर्तें और गोपनीयता नीति से सहमत होते हैं।", apple: "Apple से जारी रखें", google: "Google से जारी रखें", or: "या", email: "ईमेल से जारी रखें", foot: "पहले से खाता है?", login: "लॉग इन" },
  vi: { consent: "Khi tiếp tục, bạn đồng ý với Điều khoản và Chính sách bảo mật.", apple: "Tiếp tục với Apple", google: "Tiếp tục với Google", or: "hoặc", email: "Tiếp tục với email", foot: "Đã có tài khoản?", login: "Đăng nhập" },
  id: { consent: "Dengan melanjutkan, kamu menyetujui Ketentuan dan Kebijakan Privasi.", apple: "Lanjut dengan Apple", google: "Lanjut dengan Google", or: "atau", email: "Lanjut dengan email", foot: "Sudah punya akun?", login: "Masuk" }
};
