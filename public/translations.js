// Language translations for AnonXChat
// Default language: Czech (CZ)

const translations = {
  cz: {
    // Main page
    appTitle: 'AnonX Chat',
    startChat: 'Začít chat',
    soundOn: 'Zvuk ZAP',
    soundOff: 'Zvuk VYP',
    
    // Online counter
    online: 'Online',
    
    // Loading and connection states
    lookingForPartner: 'Hledám partnera...',
    partnerFound: '✅ Partner nalezen!',
    partnerLeft: 'Partner odešel',
    disconnected: 'Odpojeno od serveru.',
    
    // Chat interface
    messageInput: 'Napište zprávu...',
    sendButton: 'Odeslat',
    skipButton: 'Přeskočit',
    endButton: 'Ukončit chat',
    
    // Notification buttons
    findNewPartner: 'Najít nového partnera',
    goBack: 'Zpět',
    
    // Theme switcher tooltip
    switchTheme: 'Změnit téma',
    
    // Language switcher tooltip
    switchLanguage: 'Změnit jazyk'
  },
  
  en: {
    // Main page
    appTitle: 'AnonX Chat',
    startChat: 'Start Chat',
    soundOn: 'Sound ON',
    soundOff: 'Sound OFF',
    
    // Online counter
    online: 'Online',
    
    // Loading and connection states
    lookingForPartner: 'Looking for a partner...',
    partnerFound: '✅ Partner found!',
    partnerLeft: 'Partner left',
    disconnected: 'Disconnected from server.',
    
    // Chat interface
    messageInput: 'Type your message...',
    sendButton: 'Send',
    skipButton: 'Skip',
    endButton: 'End Chat',
    
    // Notification buttons
    findNewPartner: 'Find New Partner',
    goBack: 'Go Back',
    
    // Theme switcher tooltip
    switchTheme: 'Switch Theme',
    
    // Language switcher tooltip
    switchLanguage: 'Switch Language'
  }
};

// Language management
class LanguageManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('selectedLanguage') || 'cz';
    this.translations = translations;
  }
  
  // Get current language
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  // Set language and save to localStorage
  setLanguage(lang) {
    if (lang in this.translations) {
      this.currentLanguage = lang;
      localStorage.setItem('selectedLanguage', lang);
      this.updateUI();
    }
  }
  
  // Toggle between Czech and English
  toggleLanguage() {
    const newLang = this.currentLanguage === 'cz' ? 'en' : 'cz';
    this.setLanguage(newLang);
  }
  
  // Get translated text
  t(key) {
    const translation = this.translations[this.currentLanguage];
    return translation && translation[key] ? translation[key] : key;
  }
  
  // Update all UI elements with current language
  updateUI() {
    // Update elements with data-translate attribute
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    elementsToTranslate.forEach(element => {
      const key = element.getAttribute('data-translate');
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = this.t(key);
      } else {
        element.textContent = this.t(key);
      }
    });
    
    // Update elements with data-translate-title attribute
    const elementsWithTitle = document.querySelectorAll('[data-translate-title]');
    elementsWithTitle.forEach(element => {
      const key = element.getAttribute('data-translate-title');
      element.title = this.t(key);
    });
    
    // Update language switcher flag
    this.updateLanguageSwitcher();
  }
  
  // Update language switcher display
  updateLanguageSwitcher() {
    const languageIcon = document.getElementById('languageIcon');
    if (languageIcon) {
      languageIcon.textContent = this.currentLanguage === 'cz' ? '🇨🇿' : '🇬🇧';
    }
  }
}

// Create global language manager instance
const lang = new LanguageManager();