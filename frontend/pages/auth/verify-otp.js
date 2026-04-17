const email = localStorage.getItem('pendingEmail');
if (!email) {
    window.location.href = '/pages/auth/login.html';
}

document.getElementById('userEmail').textContent = email;

document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const otp = document.getElementById('otp').value;
    const btn = document.getElementById('verifyBtn');
    
    btn.disabled = true;
    btn.textContent = 'Verifying...';

    try {
        const data = await apiFetch('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp })
        });

        if (data) {
            localStorage.removeItem('pendingEmail');
            localStorage.setItem('token', data.token);
            showToast('Email verified successfully!');
            setTimeout(() => {
                window.location.href = '/pages/dashboard/dashboard.html';
            }, 1500);
        }
    } catch (error) {
        // Error handled in utils.js
    } finally {
        btn.disabled = false;
        btn.textContent = 'Verify';
    }
});
