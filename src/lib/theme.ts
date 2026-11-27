// Le thème clair ou sombre : un attribut sur <html> que lisent les variables CSS (styles/tokens.css).
// index.html le pose déjà avant le premier affichage ; ici, on le change quand le joueur bascule l'interrupteur.
const BAR_COLORS = { light: '#f9f5f1', dark: '#43150c' } // barre du navigateur, assortie au fond

export function applyTheme(dark: boolean) {
  const theme = dark ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLORS[theme])
}
