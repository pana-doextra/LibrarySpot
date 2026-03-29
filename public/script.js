const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let currentStudent = localStorage.getItem('studentId');

// LOGIN
async function login(studentId, password) {
  const res = await fetch(`${API}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password })
  });
  const data = await res.json();
  if (!res.ok) { showToast('🚫', data.message); return; }

  token = data.token;
  currentStudent = data.studentId;
  localStorage.setItem('token', token);
  localStorage.setItem('studentId', currentStudent);
  showToast('👋', `Welcome, ${currentStudent}!`);
  updateSession();
}

// REGISTER
async function register(studentId, password) {
  const res = await fetch(`${API}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password })
  });
  const data = await res.json();
  if (!res.ok) { showToast('🚫', data.message); return; }

  token = data.token;
  currentStudent = data.studentId;
  localStorage.setItem('token', token);
  localStorage.setItem('studentId', currentStudent);
  showToast('✅', `Account created! Welcome, ${currentStudent}`);
  updateSession();
}

// LOGOUT
function logout() {
  leaveSeat().then(() => {
    token = null;
    currentStudent = null;
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    updateSession();
    showToast('👋', 'Logged out successfully');
    fetchSeats();
  });
}

// Add token to protected requests
async function reserveSeat(seatId) {
  if (!token) { showToast('💡', 'Please log in first'); return; }

  const res = await fetch(`${API}/seats/reserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ✅ sends token
    },
    body: JSON.stringify({ seatId })
  });
  const data = await res.json();
  if (!res.ok) { showToast('🚫', data.message); return; }
  mySeat = seatId;
  showToast('✅', `Seat ${seatId} reserved!`);
  fetchSeats();
}

async function leaveSeat() {
  if (!token) return;

  const res = await fetch(`${API}/seats/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ✅ sends token
    },
    body: JSON.stringify({})
  });
  if (res.ok) {
    mySeat = null;
    showToast('🙌', 'You have left your seat');
    fetchSeats();
  }
}