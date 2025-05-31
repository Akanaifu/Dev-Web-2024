// Script de test pour créer des sessions de roulette au format ROxx
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRouletteSession() {
  try {
    console.log('🎯 Test de création de sessions de roulette (format ROxx)...\n');

    // Test : Créer plusieurs sessions de roulette
    for (let i = 1; i <= 3; i++) {
      console.log(`${i}. Création session de roulette #${i}`);
      try {
        const sessionData = {
          name: `Session Roulette ${i}`,
          bet_min: 1,
          bet_max: 500,
          gameType: 'RO'
        };
        
        const response = await axios.post(`${BASE_URL}/game-sessions/create`, sessionData);
        console.log(`✅ Session créée: ${response.data.session.game_session_id} - ${response.data.session.name}`);
        
      } catch (error) {
        console.log(`❌ Erreur session ${i}:`, error.response?.data || error.message);
      }
    }

    // Test : Récupérer toutes les sessions pour voir les ROxx
    console.log('\n4. Liste de toutes les sessions:');
    try {
      const response = await axios.get(`${BASE_URL}/game-sessions`);
      const rouletteSessions = response.data.filter(session => 
        session.game_session_id.startsWith('RO')
      );
      
      console.log(`✅ Sessions de roulette trouvées: ${rouletteSessions.length}`);
      rouletteSessions.forEach(session => {
        console.log(`  - ${session.game_session_id}: ${session.name} (${session.bet_min}€ - ${session.bet_max}€)`);
      });
      
    } catch (error) {
      console.log('❌ Erreur liste:', error.message);
    }

    console.log('\n🎯 Test roulette terminé!');
  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

// Attendre un peu que le serveur démarre puis exécuter les tests
setTimeout(testRouletteSession, 2000); 