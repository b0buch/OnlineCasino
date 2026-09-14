const translations = {
  de: {
    pageTitle: "Info & Impressum - PurplePanda",
    navInfo: "Info",
    navHome: "Home",
    aboutTitle: "Über PurplePanda",
    aboutText: 'Willkommen bei <strong>PurplePanda</strong>! Wir bieten Unterhaltung und Spielspaß rund um beliebte Casino-Klassiker wie Blackjack – komplett ohne finanzielles Risiko.',
    discTitle: "Wichtiger Hinweis: Rein fiktives Spielgut",
    discText: 'PurplePanda ist eine reine <strong>Spielgeld-Plattform</strong>. Alle Einsätze, Gewinne und Guthaben sind virtuell und besitzen keinerlei realen Gegenwert. Es kann kein echtes Geld eingezahlt, eingesetzt oder ausgezahlt werden.',
    legalTitle: "Rechtliche Hinweise & Disclaimer",
    legal1Title: "1. Kein Glücksspiel im Sinne des Gesetzgebers",
    legal1Text: "Da auf dieser Plattform zu keinem Zeitpunkt um Vermögenswerte gespielt wird, handelt es sich nicht um ein konzessionspflichtiges Glücksspiel. Das Angebot dient ausschließlich der Unterhaltung.",
    legal2Title: "2. Jugendschutz & Prävention",
    legal2Text: "Obwohl kein Echtgeld im Spiel ist, empfehlen wir die Nutzung unserer Plattform erst ab 18 Jahren. Auch das Spielen mit virtuellem Guthaben sollte stets mit Maß erfolgen.",
    legal3Title: "3. Haftung für Inhalte",
    legal3Text: "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.",
    imprintTitle: "Impressum",
    lblProject: "Projektname:",
    lblTeam: "Entwicklerteam:",
    lblContact: "Kontakt:",
    valProject: "PurplePanda Online-Casino",
    valTeam: "Schulprojekt-Team - Die Gamblers",
    projectNote: "Diese Website entstand im Rahmen eines IT-Ausbildungsprojekts."
  },
  en: {
    pageTitle: "Info & Imprint - PurplePanda",
    navInfo: "Info",
    navHome: "Home",
    aboutTitle: "About PurplePanda",
    aboutText: 'Welcome to <strong>PurplePanda</strong>! We provide entertainment and fun around popular casino classics like Blackjack – completely risk-free.',
    discTitle: "Important Notice: Purely Fictional Play Money",
    discText: 'PurplePanda is a <strong>play-money platform</strong>. All bets, winnings, and balances are virtual and hold no real-world value. No real money can be deposited, wagered, or withdrawn.',
    legalTitle: "Legal Information & Disclaimer",
    legal1Title: "1. No Gambling Under Legal Definitions",
    legal1Text: "Since no real monetary assets are wagered on this platform at any time, it does not constitute licensed gambling. This platform is strictly for entertainment.",
    legal2Title: "2. Youth Protection & Prevention",
    legal2Text: "Although no real money is involved, we recommend using our platform only if you are 18 or older. Play-money gaming should also always be enjoyed responsibly.",
    legal3Title: "3. Liability for Content",
    legal3Text: "The content on our pages has been created with great care. However, we cannot guarantee the correctness, completeness, or timeliness of the content.",
    imprintTitle: "Imprint",
    lblProject: "Project Name:",
    lblTeam: "Development Team:",
    lblContact: "Contact:",
    valProject: "PurplePanda Online Casino",
    valTeam: "School Project - Die Gamblers",
    projectNote: "This website was created as part of an IT educational project."
  }
};

function setLanguage(lang) {
  const t = translations[lang];

  document.getElementById("page-title").textContent = t.pageTitle;
  document.getElementById("nav-info").textContent = t.navInfo;
  document.getElementById("nav-home").textContent = t.navHome;
  
  document.getElementById("about-title").textContent = t.aboutTitle;
  document.getElementById("about-text").innerHTML = t.aboutText;
  
  document.getElementById("disc-title").textContent = t.discTitle;
  document.getElementById("disc-text").innerHTML = t.discText;
  
  document.getElementById("legal-title").textContent = t.legalTitle;
  document.getElementById("legal-1-title").textContent = t.legal1Title;
  document.getElementById("legal-1-text").textContent = t.legal1Text;
  document.getElementById("legal-2-title").textContent = t.legal2Title;
  document.getElementById("legal-2-text").textContent = t.legal2Text;
  document.getElementById("legal-3-title").textContent = t.legal3Title;
  document.getElementById("legal-3-text").textContent = t.legal3Text;

  document.getElementById("imprint-title").textContent = t.imprintTitle;
  document.getElementById("lbl-project").parentNode.innerHTML = `<strong id="lbl-project">${t.lblProject}</strong> ${t.valProject}`;
  document.getElementById("lbl-team").parentNode.innerHTML = `<strong id="lbl-team">${t.lblTeam}</strong> ${t.valTeam}`;
  document.getElementById("lbl-contact").parentNode.innerHTML = `<strong id="lbl-contact">${t.lblContact}</strong> nbo164712@stud.gibb.ch`;
  document.getElementById("project-note").textContent = t.projectNote;
}