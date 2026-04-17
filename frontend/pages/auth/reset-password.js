document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = localStorage.getItem('resetEmail');
    if (!email) {
        showToast('Email not found. Please try again.', 'error');
        window.location.href = '/pages/auth/forgot-password.html';
        return;
    }

    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('newPassword').value;
    const btn = document.getElementById('resetBtn');
    
    btn.disabled = true;
    btn.textContent = 'Resetting...';

    try {
        const data = await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword })
        });

        if (data) {
            showToast('Password reset successful! Please login.');
            localStorage.removeItem('resetEmail');
            setTimeout(() => {
                window.location.href = '/pages/auth/login.html';
            }, 1500);
        }
    } catch (error) {
        // utils.js handles toast
    } finally {
        btn.disabled = false;
        btn.textContent = 'Reset Password';
    }
});
