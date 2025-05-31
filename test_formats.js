// Script de test pour valider les formats d'ID de session
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testFormats() {
  try {
    console.log('🧪 Test des formats d\'ID de session...\n');

    const tests = [
      { name: 'Roulette', gameType: 'RO', expectedFormat: 'ROxx' },
      { name: 'Salon', gameType: 'SA', expectedFormat: 'SAxx' },
      { name: 'Machine', gameType: 'MA', expectedFormat: 'MAxx' }
    ];

    for (const test of tests) {
      console.log(`🎯 Test ${test.name} (format ${test.expectedFormat}):`);
      
      try {
        const sessionData = {
          name: `Test ${test.name}`,
          bet_min: 1,
          bet_max: 100,
          gameType: test.gameType
        };
        
        const response = await axios.post(`${BASE_URL}/game-sessions/create`, sessionData);
        const sessionId = response.data.session.game_session_id;
        
        if (sessionId.startsWith(test.gameType)) {
          console.log(`✅ Format correct: ${sessionId}`);
        } else {
          console.log(`❌ Format incorrect: ${sessionId} (attendu: ${test.gameType}xx)`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur ${test.name}:`, error.response?.data || error.message);
      }
    }

    // Afficher toutes les sessions par type
    console.log('\n📋 Récapitulatif des sessions par type:');
    try {
      const response = await axios.get(`${BASE_URL}/game-sessions`);
      const sessions = response.data;
      
      const byType = {
        'RO': sessions.filter(s => s.game_session_id.startsWith('RO')),
        'SA': sessions.filter(s => s.game_session_id.startsWith('SA')),
        'MA': sessions.filter(s => s.game_session_id.startsWith('MA'))
      };
      
      Object.entries(byType).forEach(([type, sessions]) => {
        console.log(`${type}: ${sessions.length} session(s)`);
        sessions.forEach(s => console.log(`  - ${s.game_session_id}: ${s.name}`));
      });
      
    } catch (error) {
      console.log('❌ Erreur récupération:', error.message);
    }

    console.log('\n🎉 Test des formats terminé!');
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

// Attendre un peu que le serveur démarre puis exécuter les tests
setTimeout(testFormats, 1500); 