document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');
    
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data) {
            localStorage.setItem('token', data.token);
            showToast('Login successful!');
            window.location.href = '/pages/dashboard/dashboard.html';
        }
    } catch (error) {
        // Error handled in utils.js
        if (error.message === 'Please verify your email first') {
            localStorage.setItem('pendingEmail', email);
            setTimeout(() => {
                window.location.href = '/pages/auth/verify-otp.html';
            }, 1500);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
});
