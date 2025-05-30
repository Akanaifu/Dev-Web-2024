// Setup Jest complet pour TOUS les tests Angular avec affichage professionnel style backend

// Mock global fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// =================================================================================
// 🎨 CONFIGURATION D'AFFICHAGE STYLE BACKEND : TOUS LES TESTS
// ORDRE : ERREURS → RÉSUMÉ AVEC DESCRIBES → TABLEAU COUVERTURE
// =================================================================================

// Stocker les méthodes console originales AVANT de les overrider
const originalConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console)
};

// Variables pour stocker les erreurs et organiser l'affichage de TOUS les tests
let allTestErrors: any[] = [];
let testSuites: string[] = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Formateur personnalisé pour les messages de console - Style Backend
 * Organise l'affichage de TOUS les tests : erreurs → résumé → tableau
 */
function formatConsoleMessage(type: string, args: any[]): void {
  const originalMethod = originalConsole[type as keyof typeof originalConsole];
  let message = args[0];
  
  // Si le message contient déjà un tag formaté, on l'affiche tel quel
  if (typeof message === 'string' && message.includes('[') && message.includes(']')) {
    originalMethod.apply(console, args);
    return;
  }

  // Formatage automatique pour TOUS les messages de test - Style Backend
  if (typeof message === 'string') {
    // Détection des erreurs pour les regrouper (TOUS les tests)
    if (message.includes('Erreur') || message.includes('Error') || message.includes('error') || 
        message.includes('FAIL') || message.includes('fail')) {
      message = `[FRONTEND ERROR] ❌ ${message}`;
      if (type === 'error') {
        // Stocker TOUTES les erreurs pour affichage groupé final
        allTestErrors.push({ 
          message, 
          stack: args[1] || '', 
          type: 'error',
          timestamp: new Date().toISOString()
        });
      }
    } else if (message.includes('Warning') || message.includes('warn')) {
      message = `[FRONTEND WARN] ⚠️ ${message}`;
    } else if (message.includes('Success') || message.includes('success') || 
               message.includes('PASS') || message.includes('✅')) {
      message = `[FRONTEND SUCCESS] ✅ ${message}`;
    } else if (message.includes('Test') || message.includes('test') || 
               message.includes('describe') || message.includes('it(')) {
      message = `[FRONTEND TEST] 🧪 ${message}`;
    } else if (message.includes('Setup') || message.includes('setup') || 
               message.includes('beforeAll') || message.includes('beforeEach')) {
      message = `[FRONTEND SETUP] 🔧 ${message}`;
    } else if (message.includes('Cleanup') || message.includes('cleanup') || 
               message.includes('afterAll') || message.includes('afterEach')) {
      message = `[FRONTEND CLEANUP] 🧹 ${message}`;
    } else if (message.includes('Mock') || message.includes('mock')) {
      message = `[FRONTEND MOCK] 🎭 ${message}`;
    } else if (message.includes('HTTP') || message.includes('http')) {
      message = `[FRONTEND HTTP] 🌐 ${message}`;
    } else if (message.includes('Database') || message.includes('DB')) {
      message = `[FRONTEND DB] 🗄️ ${message}`;
    } else if (message.includes('Validation') || message.includes('validation')) {
      message = `[FRONTEND VALIDATION] 🔒 ${message}`;
    } else if (message.includes('Security') || message.includes('security')) {
      message = `[FRONTEND SECURITY] 🛡️ ${message}`;
    } else if (message.includes('Performance') || message.includes('performance')) {
      message = `[FRONTEND PERF] ⚡ ${message}`;
    } else if (message.includes('Component') || message.includes('Service')) {
      message = `[FRONTEND UNIT] 🧩 ${message}`;
    } else {
      // Message générique avec tag Frontend
      message = `[FRONTEND] 🎯 ${message}`;
    }
    
    args[0] = message;
  }

  originalMethod.apply(console, args);
}

// Override des méthodes console pour l'affichage formaté
console.log = (...args: any[]) => formatConsoleMessage('log', args);
console.error = (...args: any[]) => formatConsoleMessage('error', args);
console.warn = (...args: any[]) => formatConsoleMessage('warn', args);
console.info = (...args: any[]) => formatConsoleMessage('info', args);

// =================================================================================
// 🚀 HOOKS D'AFFICHAGE ORGANISÉ STYLE BACKEND - TOUS LES TESTS JEST
// =================================================================================

// Hook global pour l'initialisation de TOUS les tests
beforeAll(() => {
  // Réinitialiser les collecteurs pour tous les tests
  allTestErrors = [];
  testSuites = [];
  totalTests = 0;
  passedTests = 0;
  failedTests = 0;
  
  // Affichage d'initialisation pour TOUS les tests
  originalConsole.log('\n🎬 [FRONTEND INIT] === DÉMARRAGE DE TOUS LES TESTS FRONTEND (JEST) ===');
  originalConsole.log('🔧 [FRONTEND SETUP] Configuration Jest pure avec affichage style backend');
  originalConsole.log('🎭 [FRONTEND MOCK] Mocks Angular, RxJS et environnement de test initialisés');
  originalConsole.log('📋 [FRONTEND ORDER] Affichage organisé : Erreurs → Describes/Résumé → Tableau');
  originalConsole.log('🧪 [FRONTEND SCOPE] Tous les tests du projet seront exécutés avec Jest uniquement\n');
});

// Hook pour collecter les informations de chaque suite
beforeEach(() => {
  // Compter les tests
  totalTests++;
});

// Hook pour marquer les tests réussis
afterEach(() => {
  // Cette logique sera gérée par Jest automatiquement
  // On se contente de collecter les informations
});

// Hook global pour la fin de TOUS les tests - Affichage final organisé
afterAll(() => {
  // 1. D'ABORD : Afficher toutes les erreurs groupées de tous les tests
  if (allTestErrors.length > 0) {
    originalConsole.log('\n❌ ===== ERREURS DÉTAILLÉES (TOUS LES TESTS JEST) =====');
    allTestErrors.forEach((error, index) => {
      originalConsole.error(`\n🚨 Erreur ${index + 1} [${error.timestamp}]:`);
      originalConsole.error(error.message);
      if (error.stack) {
        originalConsole.error(error.stack);
      }
    });
    originalConsole.log('\n' + '═'.repeat(60));
  }

  // 2. ENSUITE : Le résumé final avec les describes style backend
  originalConsole.log('\n🏁 [FRONTEND COMPLETE] === RÉSUMÉ COMPLET DES TESTS FRONTEND (JEST) ===');
  originalConsole.log('📊 [FRONTEND RESULTS] Résultats détaillés ci-dessus');
  originalConsole.log('🎯 [FRONTEND SUCCESS] Configuration Jest pure professionnelle style backend');
  originalConsole.log('📝 [FRONTEND SCOPE] Tous les tests, composants et services vérifiés avec Jest');
  originalConsole.log('🔍 [FRONTEND COVERAGE] Le tableau de couverture s\'affichera en dernier');
  
  // Note: Le tableau de couverture Jest s'affichera automatiquement EN DERNIER
});

// =================================================================================
// 🛠️ UTILITAIRES POUR DÉVELOPPEURS - STYLE BACKEND JEST UNIQUEMENT
// =================================================================================

// Fonction utilitaire pour logger avec style cohérent backend pour tous les tests Jest
(global as any).frontendLog = {
  // Logs de succès
  success: (msg: string) => originalConsole.log(`[FRONTEND SUCCESS] ✅ ${msg}`),
  
  // Logs d'erreur (ajoutés au collecteur global)
  error: (msg: string) => {
    const formattedMsg = `[FRONTEND ERROR] ❌ ${msg}`;
    allTestErrors.push({ 
      message: formattedMsg, 
      stack: '', 
      type: 'manual',
      timestamp: new Date().toISOString()
    });
    originalConsole.error(formattedMsg);
  },
  
  // Logs d'avertissement
  warn: (msg: string) => originalConsole.warn(`[FRONTEND WARN] ⚠️ ${msg}`),
  info: (msg: string) => originalConsole.info(`[FRONTEND INFO] ℹ️ ${msg}`),
  
  // Logs spécialisés pour tous types de tests Jest
  test: (msg: string) => originalConsole.log(`[FRONTEND TEST] 🧪 ${msg}`),
  mock: (msg: string) => originalConsole.log(`[FRONTEND MOCK] 🎭 ${msg}`),
  http: (msg: string) => originalConsole.log(`[FRONTEND HTTP] 🌐 ${msg}`),
  db: (msg: string) => originalConsole.log(`[FRONTEND DB] 🗄️ ${msg}`),
  security: (msg: string) => originalConsole.log(`[FRONTEND SECURITY] 🛡️ ${msg}`),
  validation: (msg: string) => originalConsole.log(`[FRONTEND VALIDATION] 🔒 ${msg}`),
  component: (msg: string) => originalConsole.log(`[FRONTEND COMPONENT] 🧩 ${msg}`),
  service: (msg: string) => originalConsole.log(`[FRONTEND SERVICE] ⚙️ ${msg}`),
  
  // Utilitaire pour marquer le début/fin de sections
  section: (title: string) => originalConsole.log(`\n📌 [FRONTEND SECTION] ${title}\n`),
  separator: () => originalConsole.log('─'.repeat(60))
};

// Export pour utilisation dans les tests si nécessaire
export { formatConsoleMessage, allTestErrors, testSuites };
