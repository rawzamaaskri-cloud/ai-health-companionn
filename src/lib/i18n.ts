import { useState, useEffect } from "react";

export type Locale = "fr" | "ar" | "en";

// Simple pub-sub store to sync locale state across components without forcing a heavy context provider
type Listener = (locale: Locale) => void;
let currentLocale: Locale = "fr";
const listeners = new Set<Listener>();

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("aisante_locale") as Locale;
  if (saved === "fr" || saved === "ar" || saved === "en") {
    currentLocale = saved;
    // Set html dir attribute for Arabic RTL support
    document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = saved;
  }
}

export const setLocale = (locale: Locale) => {
  if (locale === currentLocale) return;
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("aisante_locale", locale);
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }
  listeners.forEach((l) => l(locale));
};

export const getLocale = (): Locale => currentLocale;

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(currentLocale);

  useEffect(() => {
    const listener = (newLocale: Locale) => setLocaleState(newLocale);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const t = (key: keyof typeof TRANSLATIONS["fr"]) => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS["fr"];
    return dict[key] || TRANSLATIONS["fr"][key] || key;
  };

  return { t, locale, setLocale };
}

export const TRANSLATIONS = {
  fr: {
    // Navbar
    features: "Fonctionnalités",
    spaces: "Espaces",
    bracelet: "Bracelet",
    ai: "IA",
    login: "Se connecter",
    start: "Commencer",
    logout: "Déconnexion",
    
    // Hero
    hero_tag: "Plateforme Intelligente · Sécurisée · Algérie",
    hero_title_1: "Votre santé, ",
    hero_title_2: "augmentée",
    hero_title_3: " par l'IA",
    hero_desc: "AISANTÉ est la plateforme de santé numérique qui connecte patients, médecins et pharmacies dans un écosystème intelligent, sécurisé et accessible.",
    hero_cta_create: "Créer mon compte",
    hero_cta_discover: "Découvrir la plateforme",
    
    // Stats
    stat_availability: "Disponibilité",
    stat_patients: "Patients actifs",
    stat_support: "Support IA",
    stat_encrypted: "Données chiffrées",
    
    // Spaces Section
    spaces_title: "Un espace pour chaque acteur",
    space_patient_title: "Espace Patient",
    space_patient_desc: "Consultez votre dossier, réservez des rendez-vous, recevez des prescriptions et suivez vos constantes via le bracelet connecté.",
    space_doctor_title: "Espace Médecin",
    space_doctor_desc: "Gerez vos patients, consultez l'historique medical, emettez des prescriptions et utilisez l'IA pour l'aide a la decision.",
    space_pharmacy_title: "Espace Pharmacie",
    space_pharmacy_desc: "Recevez les ordonnances electroniques, gerez les stocks et communiquez avec les patients et medecins.",
    
    // Features Section
    features_title: "Tout ce dont vous avez besoin",
    features_subtitle: "Une solution complete pour digitaliser et ameliorer les services de sante.",
    feat_patient: "Espace Patient",
    feat_patient_desc: "Dossier medical numerique, rappels de medicaments et suivi personnalise.",
    feat_doctor: "Espace Medecin",
    feat_doctor_desc: "Gestion des patients, prescriptions numeriques et aide IA a la decision.",
    feat_pharmacy: "Espace Pharmacie",
    feat_pharmacy_desc: "Reception d'ordonnances electroniques et gestion des disponibilites.",
    feat_bracelet: "Bracelet Connecte",
    feat_bracelet_desc: "Surveillance des constantes vitales et alertes en temps reel.",
    feat_ai: "Intelligence Artificielle",
    feat_ai_desc: "Analyse medicale, alertes intelligentes et recommandations personnalisees.",
    feat_security: "Securite Avancee",
    feat_security_desc: "Chiffrement des donnees, authentification securisee et acces par role.",

    // AI Section
    ai_title: "L'IA au cœur de votre santé",
    ai_desc: "Notre intelligence artificielle analyse vos donnees, genere des alertes et assiste les medecins pour un suivi optimal.",
    ai_consultant: "Consultant IA",
    ai_consultant_desc: "Posez vos questions sante et recevez des explications personnalisees.",
    ai_predictive: "Analyse prédictive",
    ai_predictive_desc: "Détection précoce des anomalies grâce au machine learning.",
    ai_auto: "Automatisation",
    ai_auto_desc: "Rappels, tâches administratives et suivi optimisés automatiquement.",

    // Bracelet Section
    bracelet_title: "Surveillance continue de votre santé",
    bracelet_desc: "Le bracelet AISANTÉ surveille vos constantes vitales 24h/24 et transmet les données en temps réel vers la plateforme. En cas d'anomalie, une alerte est envoyée à votre médecin.",
    bracelet_hr: "Rythme cardiaque",
    bracelet_hr_desc: "En continu",
    bracelet_activity: "Activité physique",
    bracelet_activity_desc: "Pas & calories",
    bracelet_alerts: "Alertes anomalies",
    bracelet_alerts_desc: "Instantanées",
    bracelet_emergency: "Accès urgence",
    bracelet_emergency_desc: "QR / NFC",

    // Dashboard
    db_welcome: "Bonjour",
    db_summary: "Voici un résumé de votre santé aujourd'hui.",
    db_pulse: "Pouls",
    db_glucose: "Glycémie",
    db_tension: "Tension",
    db_spo2: "SpO₂",
    db_steps: "Pas (aujourd'hui)",
    db_sleep: "Sommeil",
    db_ai_summary: "Résumé IA de votre santé",
    db_ai_gen: "Synthèse personnalisée à partir de votre carnet santé",
    db_chart_tension: "Tension artérielle",
    db_chart_glucose: "Glycémie",
    db_chart_heart: "Fréquence cardiaque",
    db_chart_activity: "Activité",
    db_chart_days: "14 derniers jours",
    db_chart_steps_day: "pas par jour",
    db_tip_title: "Conseil santé du jour",
    db_tip_desc: "Buvez 1,5L d'eau aujourd'hui et marchez au moins 30 minutes. Demandez à votre Consultant IA de vous expliquer vos dernières analyses.",
    
    // Auth / general
    connexion: "Connexion",
    choose_space: "Choisissez votre espace.",
    email: "Email",
    password: "Mot de passe",
    forgot_password: "Mot de passe oublié ?",
    no_account: "Pas de compte ?",
    create_account: "Créer un compte",
    demo_accounts: "Comptes Démo",
    demo_desc: "Accès rapide pour la démonstration",
    welcome_back: "Bienvenue !",
  },
  ar: {
    // Navbar
    features: "الميزات",
    spaces: "المساحات",
    bracelet: "السوار الذكي",
    ai: "الذكاء الاصطناعي",
    login: "تسجيل الدخول",
    start: "ابدأ الآن",
    logout: "تسجيل الخروج",
    
    // Hero
    hero_tag: "منصة ذكية · آمنة · صنعت في الجزائر",
    hero_title_1: "صحتك، ",
    hero_title_2: "مُعززة",
    hero_title_3: " بالذكاء الاصطناعي",
    hero_desc: "AISANTÉ هي منصة الصحة الرقمية التي تربط المرضى والأطباء والصيدليات في نظام بيئي ذكي وآمن وسهل الاستخدام.",
    hero_cta_create: "أنشئ حسابي",
    hero_cta_discover: "اكتشف المنصة",
    
    // Stats
    stat_availability: "التوفر والتشغيل",
    stat_patients: "المرضى النشطون",
    stat_support: "دعم الذكاء الاصطناعي",
    stat_encrypted: "بيانات مشفرة",
    
    // Spaces Section
    spaces_title: "مساحة مخصصة لكل شريك",
    space_patient_title: "مساحة المريض",
    space_patient_desc: "اطلع على ملفك الطبي، احجز المواعيد، استلم الوصفات الطبية وتتبع مؤشراتك الحيوية عبر السوار المتصل.",
    space_doctor_title: "مساحة الطبيب",
    space_doctor_desc: "إدارة المرضى، الاطلاع على السجل الطبي، إصدار الوصفات الرقمية واستخدام الذكاء الاصطناعي للمساعدة في اتخاذ القرار.",
    space_pharmacy_title: "مساحة الصيدلية",
    space_pharmacy_desc: "استلام الوصفات الإلكترونية، إدارة المخزون والتواصل السريع مع المرضى والأطباء.",
    
    // Features Section
    features_title: "كل ما تحتاجه لرعاية صحتك",
    features_subtitle: "حل متكامل لرقمنة الخدمات الصحية وتحسينها.",
    feat_patient: "مساحة المريض",
    feat_patient_desc: "ملف طبي رقمي، تذكير بالمواعيد والأدوية ومتابعة مخصصة.",
    feat_doctor: "مساحة الطبيب",
    feat_doctor_desc: "إدارة المرضى، وصفات طبية رقمية ومساعد ذكي للطبيب.",
    feat_pharmacy: "مساحة الصيدلية",
    feat_pharmacy_desc: "استلام الوصفات الطبية الإلكترونية وتتبع توفر الأدوية.",
    feat_bracelet: "السوار المتصل",
    feat_bracelet_desc: "مراقبة المؤشرات الحيوية والتنبيهات الذكية في الوقت الفعلي.",
    feat_ai: "الذكاء الاصطناعي",
    feat_ai_desc: "تحليل طبي ذكي، تنبيهات استباقية وتوصيات صحية مخصصة.",
    feat_security: "أمان متقدم",
    feat_security_desc: "تشفير كامل للبيانات، تسجيل دخول آمن وصلاحيات حسب الدور.",

    // AI Section
    ai_title: "الذكاء الاصطناعي في قلب صحتك",
    ai_desc: "يقوم ذكاؤنا الاصطناعي بتحليل بياناتك، وإرسال التنبيهات، ومساعدة الأطباء في المتابعة المثالية.",
    ai_consultant: "مستشار الذكاء الاصطناعي",
    ai_consultant_desc: "اطرح أسئلتك الصحية واحصل على تفسيرات مخصصة فوراً.",
    ai_predictive: "التحليل التنبؤي",
    ai_predictive_desc: "الكشف المبكر عن المشاكل الصحية باستخدام التعلم الآلي.",
    ai_auto: "الأتمتة الذكية",
    ai_auto_desc: "تذكيرات وتنسيق إداري ومتابعة تلقائية ومريحة.",

    // Bracelet Section
    bracelet_title: "متابعة مستمرة لصحتك",
    bracelet_desc: "يقوم سوار AISANTÉ بمراقبة مؤشراتك الحيوية على مدار الساعة وإرسال البيانات مباشرة للمنصة. في حال وجود خلل، يتم تنبيه طبيبك فوراً.",
    bracelet_hr: "نبضات القلب",
    bracelet_hr_desc: "مستمر",
    bracelet_activity: "النشاط البدني",
    bracelet_activity_desc: "الخطوات والسعرات الحرارية",
    bracelet_alerts: "تنبيهات الطوارئ",
    bracelet_alerts_desc: "فورية",
    bracelet_emergency: "بيانات الطوارئ",
    bracelet_emergency_desc: "رمز QR / NFC",

    // Dashboard
    db_welcome: "مرحباً",
    db_summary: "إليك ملخص حالتك الصحية اليوم.",
    db_pulse: "النبض",
    db_glucose: "السكر في الدم",
    db_tension: "ضغط الدم",
    db_spo2: "الأكسجين SpO₂",
    db_steps: "الخطوات (اليوم)",
    db_sleep: "النوم",
    db_ai_summary: "ملخص صحتك بالذكاء الاصطناعي",
    db_ai_gen: "تحليل ذكي مخصص بناءً على سجلاتك الصحية",
    db_chart_tension: "ضغط الدم",
    db_chart_glucose: "السكر في الدم",
    db_chart_heart: "معدل ضربات القلب",
    db_chart_activity: "النشاط",
    db_chart_days: "الـ 14 يوماً الماضية",
    db_chart_steps_day: "خطوة في اليوم",
    db_tip_title: "نصيحة اليوم الصحية",
    db_tip_desc: "اشرب 1.5 لتر من الماء اليوم وامشِ لمدة 30 دقيقة على الأقل. اطلب من مستشار الذكاء الاصطناعي شرح تحاليلك الأخيرة.",
    
    // Auth / general
    connexion: "تسجيل الدخول",
    choose_space: "اختر مساحتك الخاصة.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgot_password: "هل نسيت كلمة المرور؟",
    no_account: "ليس لديك حساب؟",
    create_account: "إنشاء حساب جديد",
    demo_accounts: "حسابات تجريبية",
    demo_desc: "دخول سريع للتجربة والمعاينة",
    welcome_back: "مرحباً بك مجدداً!",
  },
  en: {
    // Navbar
    features: "Features",
    spaces: "Spaces",
    bracelet: "Bracelet",
    ai: "AI",
    login: "Log In",
    start: "Get Started",
    logout: "Log Out",
    
    // Hero
    hero_tag: "Intelligent · Secure · Made in Algeria",
    hero_title_1: "Your health, ",
    hero_title_2: "augmented",
    hero_title_3: " by AI",
    hero_desc: "AISANTÉ is the digital health platform connecting patients, doctors, and pharmacies in an intelligent, secure, and accessible ecosystem.",
    hero_cta_create: "Create my account",
    hero_cta_discover: "Discover the platform",
    
    // Stats
    stat_availability: "Availability",
    stat_patients: "Active patients",
    stat_support: "24/7 AI Support",
    stat_encrypted: "Encrypted data",
    
    // Spaces Section
    spaces_title: "A dedicated space for everyone",
    space_patient_title: "Patient Space",
    space_patient_desc: "Access your medical record, book appointments, receive electronic prescriptions, and track vitals via the connected bracelet.",
    space_doctor_title: "Doctor Space",
    space_doctor_desc: "Manage patients, view medical history, issue digital prescriptions, and use AI for clinical decision support.",
    space_pharmacy_title: "Pharmacy Space",
    space_pharmacy_desc: "Receive e-prescriptions, manage inventories, and communicate instantly with patients and doctors.",
    
    // Features Section
    features_title: "Everything you need",
    features_subtitle: "A comprehensive solution to digitize and improve healthcare services.",
    feat_patient: "Patient Portal",
    feat_patient_desc: "Digital health record, medication reminders, and personalized monitoring.",
    feat_doctor: "Doctor Portal",
    feat_doctor_desc: "Patient management, digital prescriptions, and AI decision support.",
    feat_pharmacy: "Pharmacy Portal",
    feat_pharmacy_desc: "E-prescription reception and drug availability management.",
    feat_bracelet: "Smart Bracelet",
    feat_bracelet_desc: "Continuous vital signs monitoring and real-time emergency alerts.",
    feat_ai: "Artificial Intelligence",
    feat_ai_desc: "Medical analysis, intelligent alerts, and personalized recommendations.",
    feat_security: "Advanced Security",
    feat_security_desc: "End-to-end data encryption, secure login, and role-based access.",

    // AI Section
    ai_title: "AI at the Core of Your Health",
    ai_desc: "Our AI analyzes your data, triggers alerts, and supports doctors for optimal healthcare management.",
    ai_consultant: "AI Consultant",
    ai_consultant_desc: "Ask health questions and get instant, personalized explanations.",
    ai_predictive: "Predictive Analysis",
    ai_predictive_desc: "Early detection of health anomalies using machine learning.",
    ai_auto: "Smart Automation",
    ai_auto_desc: "Reminders, administrative tasks, and follow-ups optimized automatically.",

    // Bracelet Section
    bracelet_title: "Continuous Health Monitoring",
    bracelet_desc: "The AISANTÉ bracelet monitors vitals 24/7 and streams data to the platform. In case of anomalies, alerts are sent to your doctor.",
    bracelet_hr: "Heart Rate",
    bracelet_hr_desc: "Continuous tracking",
    bracelet_activity: "Physical Activity",
    bracelet_activity_desc: "Steps & calories",
    bracelet_alerts: "Anomaly Alerts",
    bracelet_alerts_desc: "Instant notifications",
    bracelet_emergency: "Emergency Access",
    bracelet_emergency_desc: "QR / NFC",

    // Dashboard
    db_welcome: "Welcome",
    db_summary: "Here is your health summary today.",
    db_pulse: "Pulse",
    db_glucose: "Glucose",
    db_tension: "Pressure",
    db_spo2: "SpO₂",
    db_steps: "Steps (today)",
    db_sleep: "Sleep",
    db_ai_summary: "AI Health Summary",
    db_ai_gen: "Personalized insights generated from your health records",
    db_chart_tension: "Blood Pressure",
    db_chart_glucose: "Blood Glucose",
    db_chart_heart: "Heart Rate",
    db_chart_activity: "Activity",
    db_chart_days: "Last 14 Days",
    db_chart_steps_day: "steps per day",
    db_tip_title: "Daily Health Tip",
    db_tip_desc: "Drink 1.5L of water today and walk for at least 30 minutes. Ask your AI Consultant to explain your latest lab results.",
    
    // Auth / general
    connexion: "Log In",
    choose_space: "Choose your space.",
    email: "Email",
    password: "Password",
    forgot_password: "Forgot Password?",
    no_account: "Don't have an account?",
    create_account: "Create an account",
    demo_accounts: "Demo Accounts",
    demo_desc: "Quick access for presentation",
    welcome_back: "Welcome back!",
  }
};
