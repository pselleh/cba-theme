// Navigation JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Dark/light theme is handled inline in lms/templates/main.html (data-theme on <html>).

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
    
    // Add active state to navigation links based on scroll position
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const sectionTop = targetSection.offsetTop - 100;
                const sectionBottom = sectionTop + targetSection.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    // Remove active class from all links
                    navLinks.forEach(l => l.classList.remove('active'));
                    // Add active class to current link
                    link.classList.add('active');
                }
            }
        });
    });
    
    // Mobile menu improvements
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        }
    });
    
    // Add loading animation for buttons
    const authButtons = document.querySelectorAll('.auth-buttons .btn');
    
    authButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add loading state
            const originalText = this.textContent;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;
            
            // Simulate loading (replace with actual functionality)
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 2000);
        });
    });
    
    // Add scroll effect to navbar
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.querySelector('.custom-navbar');
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add navbar transition
    const navbar = document.querySelector('.custom-navbar');
    navbar.style.transition = 'transform 0.3s ease-in-out';
    
    // Initialize tooltips if Bootstrap tooltips are available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu on Escape key
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        }
    });
    
    // Performance optimization: Throttle scroll events
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
    
    // Apply throttling to scroll events
    const throttledScrollHandler = throttle(function() {
        // Scroll handling logic here
    }, 16); // ~60fps
    
    // Replace the scroll event listener with throttled version if needed
    // window.removeEventListener('scroll', scrollHandler);
    // window.addEventListener('scroll', throttledScrollHandler);
});

// Utility function for smooth animations
function animateElement(element, animation, duration = 300) {
    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    setTimeout(() => {
        element.style.animation = '';
    }, duration);
}

// Export functions for potential external use
window.NavigationUtils = {
    toggleTheme: function() {
        document.getElementById('themeToggle').click();
    },
    scrollToSection: function(sectionId) {
        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
};
