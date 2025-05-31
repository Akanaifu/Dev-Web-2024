// Script de test pour vérifier les routes game-sessions
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRoutes() {
  try {
    console.log('🧪 Test des routes game-sessions...\n');

    // Test 1: Récupérer les sessions existantes
    console.log('1. Test GET /game-sessions');
    try {
      const response = await axios.get(`${BASE_URL}/game-sessions`);
      console.log('✅ Success - Sessions existantes:', response.data.length);
    } catch (error) {
      console.log('❌ Erreur:', error.message);
    }

    // Test 2: Créer une nouvelle session
    console.log('\n2. Test POST /game-sessions/create');
    try {
      const sessionData = {
        name: 'Test Session',
        bet_min: 5,
        bet_max: 500,
        gameType: 'TS'
      };
      const response = await axios.post(`${BASE_URL}/game-sessions/create`, sessionData);
      console.log('✅ Success - Session créée:', response.data.session.game_session_id);
      
      // Test 3: Rejoindre la session créée
      console.log('\n3. Test POST /game-sessions/join');
      const joinResponse = await axios.post(`${BASE_URL}/game-sessions/join`, {
        sessionId: response.data.session.game_session_id
      });
      console.log('✅ Success - Session rejointe:', joinResponse.data.session.game_session_id);
      
    } catch (error) {
      console.log('❌ Erreur:', error.response?.data || error.message);
    }

    console.log('\n🎉 Tests terminés!');
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

// Attendre un peu que le serveur démarre puis exécuter les tests
setTimeout(testRoutes, 3000); 