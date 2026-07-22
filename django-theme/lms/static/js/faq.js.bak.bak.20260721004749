/**
 * FAQ Accordion and Contact Form Validation
 */

(function() {
    'use strict';
    var RECAPTCHA_SITE_KEY = '6LfKR8EsAAAAAKgwPEkhC2k97upjknJxXJ2u-Jm7';

    // FAQ: delegate on #faq so clicks on .faq-icon / text always hit the handler;
    // toggle display via inline !important so no stylesheet can keep answers hidden.
    function initFAQ() {
        var root = document.getElementById('faq');
        if (!root) {
            return;
        }

        root.addEventListener('click', function(e) {
            var question = e.target.closest('.faq-question');
            if (!question || !root.contains(question)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var answer = question.nextElementSibling;
            if (!answer || !answer.classList.contains('faq-answer')) {
                answer = question.parentElement
                    ? question.parentElement.querySelector(':scope > .faq-answer')
                    : null;
            }
            if (!answer) {
                return;
            }

            var wasActive = question.classList.contains('active');

            root.querySelectorAll('.faq-question').forEach(function(q) {
                q.classList.remove('active');
                q.setAttribute('aria-expanded', 'false');
            });
            root.querySelectorAll('.faq-answer').forEach(function(a) {
                a.classList.remove('active');
                a.style.removeProperty('display');
            });

            if (!wasActive) {
                question.classList.add('active');
                answer.classList.add('active');
                answer.style.setProperty('display', 'block', 'important');
                question.setAttribute('aria-expanded', 'true');
            }
        });

        root.querySelectorAll('.faq-question').forEach(function(q) {
            if (!q.hasAttribute('aria-expanded')) {
                q.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Contact Form Validation
    function initContactForm() {
        var form = document.getElementById('contactForm');

        if (!form) {
            return;
        }
        var recaptchaWidgetId = null;

        function ensureRecaptchaWidget() {
            if (recaptchaWidgetId !== null) return;
            if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise || !grecaptcha.enterprise.render) return;
            var slot = document.getElementById('contact-recaptcha-slot');
            if (!slot) return;
            recaptchaWidgetId = grecaptcha.enterprise.render(slot, {
                sitekey: RECAPTCHA_SITE_KEY,
                action: 'CONTACT'
            });
        }

        var renderLoop = window.setInterval(ensureRecaptchaWidget, 350);
        ensureRecaptchaWidget();

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Reset validation
            form.classList.remove('was-validated');
            var invalidInputs = form.querySelectorAll('.is-invalid');
            invalidInputs.forEach(function(input) {
                input.classList.remove('is-invalid');
            });

            var isValid = true;

            // Validate required fields
            var requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(function(field) {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                }
            });

            // Validate email
            var email = document.getElementById('email');
            var confirmEmail = document.getElementById('confirmEmail');
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email && !emailRegex.test(email.value)) {
                email.classList.add('is-invalid');
                isValid = false;
            }

            if (confirmEmail && email && email.value !== confirmEmail.value) {
                confirmEmail.classList.add('is-invalid');
                isValid = false;
            }

            // Validate reCAPTCHA widget response
            var recaptchaError = document.getElementById('recaptcha-error');
            var recaptchaResponse = '';
            if (recaptchaWidgetId !== null && typeof grecaptcha !== 'undefined' && grecaptcha.enterprise && grecaptcha.enterprise.getResponse) {
                recaptchaResponse = grecaptcha.enterprise.getResponse(recaptchaWidgetId);
            }

            if (!recaptchaResponse) {
                if (recaptchaError) recaptchaError.style.display = 'block';
                isValid = false;
            } else {
                if (recaptchaError) recaptchaError.style.display = 'none';
            }

            if (isValid) {
                console.log('Form is valid - submitting...');
                alert('Thank you for your message! We will get back to you soon.');
                form.reset();
                if (recaptchaWidgetId !== null && typeof grecaptcha !== 'undefined' && grecaptcha.enterprise && grecaptcha.enterprise.reset) {
                    grecaptcha.enterprise.reset(recaptchaWidgetId);
                }
            } else {
                var firstError = form.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });

        // Real-time validation
        var inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }

                if (this.type === 'email' && this.value) {
                    var er = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!er.test(this.value)) {
                        this.classList.add('is-invalid');
                    } else {
                        this.classList.remove('is-invalid');
                    }
                }

                if (this.id === 'confirmEmail') {
                    var em = document.getElementById('email');
                    if (em && this.value !== em.value) {
                        this.classList.add('is-invalid');
                    } else {
                        this.classList.remove('is-invalid');
                    }
                }
            });
        });

        window.addEventListener('beforeunload', function() {
            window.clearInterval(renderLoop);
        });
    }

    function boot() {
        initFAQ();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
