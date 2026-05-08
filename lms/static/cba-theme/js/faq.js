/**
 * FAQ Accordion and Contact Form Validation
 */

(function() {
    'use strict';

    // FAQ Accordion
    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(function(question) {
            question.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                const isActive = this.classList.contains('active');
                
                // Close all FAQ items
                document.querySelectorAll('.faq-question').forEach(function(q) {
                    q.classList.remove('active');
                });
                document.querySelectorAll('.faq-answer').forEach(function(a) {
                    a.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    this.classList.add('active');
                    answer.classList.add('active');
                }
            });
        });
    }

    // Contact Form Validation
    function initContactForm() {
        const form = document.getElementById('contactForm');
        
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset validation
            form.classList.remove('was-validated');
            const invalidInputs = form.querySelectorAll('.is-invalid');
            invalidInputs.forEach(function(input) {
                input.classList.remove('is-invalid');
            });
            
            let isValid = true;
            
            // Validate required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(function(field) {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                }
            });
            
            // Validate email
            const email = document.getElementById('email');
            const confirmEmail = document.getElementById('confirmEmail');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email && !emailRegex.test(email.value)) {
                email.classList.add('is-invalid');
                isValid = false;
            }
            
            if (confirmEmail && email.value !== confirmEmail.value) {
                confirmEmail.classList.add('is-invalid');
                isValid = false;
            }
            
            // Validate reCAPTCHA
            const recaptchaResponse = grecaptcha.getResponse();
            const recaptchaError = document.getElementById('recaptcha-error');
            
            if (!recaptchaResponse) {
                recaptchaError.style.display = 'block';
                isValid = false;
            } else {
                recaptchaError.style.display = 'none';
            }
            
            if (isValid) {
                // Form is valid - submit via AJAX or normal submit
                console.log('Form is valid - submitting...');
                
                // Example: Show success message
                alert('Thank you for your message! We will get back to you soon.');
                form.reset();
                grecaptcha.reset();
            } else {
                // Scroll to first error
                const firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
                
                // Email validation
                if (this.type === 'email' && this.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(this.value)) {
                        this.classList.add('is-invalid');
                    } else {
                        this.classList.remove('is-invalid');
                    }
                }
                
                // Confirm email validation
                if (this.id === 'confirmEmail') {
                    const email = document.getElementById('email');
                    if (email && this.value !== email.value) {
                        this.classList.add('is-invalid');
                    } else {
                        this.classList.remove('is-invalid');
                    }
                }
            });
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initFAQ();
            initContactForm();
        });
    } else {
        initFAQ();
        initContactForm();
    }

})();
