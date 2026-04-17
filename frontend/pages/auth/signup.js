document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const shopName = document.getElementById('shopName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('signupBtn');
    
    btn.disabled = true;
    btn.textContent = 'Creating account...';

    try {
        const data = await apiFetch('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ shopName, email, password })
        });

        if (data) {
            localStorage.setItem('pendingEmail', email);
            showToast('Account created! OTP sent to your email.');
            setTimeout(() => {
                window.location.href = '/pages/auth/verify-otp.html';
            }, 2000);
        }
    } catch (error) {
        // Error handled in utils.js
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign Up';
    }
});
