// Lors de la connexion
fetch('http://localhost:3000/sessions/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ben', password: 'ben' })
  })
  .then(response => response.json())
  .then(data => {
    // Stocker les infos
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.user.username);
    localStorage.setItem('userId', data.user.userId);
    
    // Afficher dans le HTML
    document.getElementById('user-email').textContent = data.user.username;
    document.getElementById('user-id').textContent = data.user.userId;
  });

  console.log('test')