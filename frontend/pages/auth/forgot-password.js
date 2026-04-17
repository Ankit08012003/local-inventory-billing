document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const btn = document.getElementById('sendOtpBtn');
    
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        const data = await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        if (data) {
            showToast(data.message);
            localStorage.setItem('resetEmail', email);
            setTimeout(() => {
                window.location.href = '/pages/auth/reset-password.html';
            }, 1500);
        }
    } catch (error) {
        // utils.js already handles showing the toast
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send OTP';
    }
});
