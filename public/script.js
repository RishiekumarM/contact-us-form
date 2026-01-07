document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const statusMessage = document.getElementById('statusMessage');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Client-side Validation
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Lock button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        statusMessage.className = 'status-message'; // Reset classes
        statusMessage.style.display = 'none';

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                statusMessage.textContent = 'Thank you! Your message has been sent.';
                statusMessage.classList.add('success');
                form.reset();
            } else {
                // API Error
                throw new Error(result.error || 'Something went wrong.');
            }
        } catch (error) {
            // Network/API Error
            statusMessage.textContent = error.message;
            statusMessage.classList.add('error');
        } finally {
            // Unlock button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            statusMessage.style.display = 'block'; // Ensure it's visible if class set
        }
    });
});
