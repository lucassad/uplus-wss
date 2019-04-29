/* exported pegaMashupNavigateBack  */
/* global settings app */
/* eslint no-eval: 0 */
import Vue from 'vue';
import VueI18n from 'vue-i18n';

// Directive for dealing out with clicking outside of an overlay
let handleOutsideClick;
Vue.directive('clickoutside', {
  bind(el, binding, vnode) {
    handleOutsideClick = (e) => {
      e.stopPropagation();
      const { handler } = binding.value;
      if (!el.contains(e.target)) {
        vnode.context[handler](e);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
  },
  unbind() {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('touchstart', handleOutsideClick);
  },
});

Vue.use(VueI18n);

let userLang = navigator.language || navigator.userLanguage;
if (userLang.length > 2) userLang = userLang.substring(0, 1);
if (settings.i18n.defaultlocale === 'browser') {
  settings.i18n.defaultlocale = userLang;
}

const messages = {};
const dateTimeFormats = {};
const numberFormats = {};

let isDefaultLocaleLoaded = false;
for (const i in settings.i18n.languages) {
  const lang = settings.i18n.languages[i];
  messages[lang] = {
    message: eval(`lang${lang.toUpperCase()}`),
  };
  dateTimeFormats[lang] = eval(`dateFormat${lang.toUpperCase()}`);
  numberFormats[lang] = eval(`numberFormat${lang.toUpperCase()}`);
  /* Check if the default locale is available in the list of languages - if not, then select the first one */
  if (lang === settings.i18n.defaultlocale) isDefaultLocaleLoaded = true;
}
if (!isDefaultLocaleLoaded) {
  [settings.i18n.defaultlocale] = settings.i18n.languages;
}

const i18n = new VueI18n({
  locale: settings.i18n.defaultlocale,
  messages,
  dateTimeFormats,
  numberFormats,
});

/* Detect if this is a phone */
let isMobilePhone = false;
if (/iPhone/.test(navigator.userAgent) || /Android/.test(navigator.userAgent)) {
  isMobilePhone = true;
}

if (isMobilePhone) {
  document.documentElement.className = 'phone';
}

let mainconfigTmp = Object.assign(
  {},
  {
    settings,
    app,
    isMobilePhone,
    isAuthenticated: false,
    isSidePanelVisible: false,
    phonePageName: 'home',
    userId: -1,
    quickLinkId: -1,
    viewBill: -1,
    toDo: -1,
    homeHeroAction: -1,
    currentLocale: settings.i18n.defaultlocale,
  },
);
// Retrieve the object from storage
const retrievedObject = localStorage.getItem(
  `config_${mainconfigTmp.app.industry}`,
);
if (retrievedObject != null) {
  mainconfigTmp = JSON.parse(retrievedObject);
}

/* Not sure if everything is needed in this object - keeping it as is for backward compatibility */
const PegaCSWSS = {
  Chat: {
    ServerURL: '',
    Token: '',
  },
  Cobrowse: {
    ServerURL: '',
    Token: '',
  },
  SSAConfigName: '',
  WCBConfigName: mainconfigTmp.settings.pega_chat.WCBConfigName,
  WebChatBotID: mainconfigTmp.settings.pega_chat.WebChatBotID,
  ApplicationName: mainconfigTmp.settings.pega_chat.ApplicationName,
  MashupURL: mainconfigTmp.settings.pega_chat.MashupURL,
  ContactID: mainconfigTmp.settings.pega_chat.ContactID,
  AccountNumber: mainconfigTmp.settings.pega_chat.AccountNumber,
  UserName: mainconfigTmp.settings.pega_chat.UserName,
};

window.PegaCSWSS = PegaCSWSS;

// We don't show chat and CoBrowse on the settings page and on a mobile phone
if (
  typeof mainconfigTmp.settings.pega_chat !== 'undefined' &&
  mainconfigTmp.settings.pega_chat.MashupURL !== '' &&
  !isMobilePhone &&
  !`${window.location}`.endsWith('settings.html')
) {
  document.write('<script src="../js/jquery.min.js"></script>');
  document.write('<script src="../js/PegaHelperExtension.js"></script>');
  document.write('<script src="../js/PegaHelper.js"></script>');
}

// Handle the back button support on mobile
// The example iframe will just do a parent.pegaMashupNavigateBack() but the
// real Mashup app will have to use the postMessage() api.
if (isMobilePhone) {
  /* Register global listener for navigate back */
  window.addEventListener('message', (e) => {
    if (e.data === 'pegaMashupNavigateBack') {
      window.pegaMashupNavigateBack();
    }
  });
  window.pegaMashupNavigateBack = function pegaMashupNavigateBack() {
    const elems = document.getElementsByClassName('pi-caret-left');
    if (elems.length > 0) {
      elems[0].click();
    }
  };
}

const mainconfig = mainconfigTmp;
export { mainconfig, i18n };
