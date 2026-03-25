// Tab functionality for Learning Tabs Section
document.addEventListener('DOMContentLoaded', function() {
    
    // Get all tab elements
    const tabLinks = document.querySelectorAll('.nav-pills .nav-link');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Add click event listeners to all tabs
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target tab content
            const targetId = this.getAttribute('href');
            const targetPane = document.querySelector(targetId);
            
            if (targetPane) {
                // Remove active class from all tabs and panes
                tabLinks.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(p => {
                    p.classList.remove('show', 'active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show target content
                targetPane.classList.add('show', 'active');
                
                // Add fade-in animation
                targetPane.style.opacity = '0';
                targetPane.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    targetPane.style.transition = 'all 0.3s ease-in-out';
                    targetPane.style.opacity = '1';
                    targetPane.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });
    
    // Add hover effects for better UX
    tabLinks.forEach(tab => {
        tab.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }
        });
        
        tab.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            }
        });
    });
    
    // Initialize first tab as active
    if (tabLinks.length > 0) {
        const firstTab = tabLinks[0];
        const firstPane = document.querySelector(firstTab.getAttribute('href'));
        
        if (firstPane) {
            firstTab.classList.add('active');
            firstPane.classList.add('show', 'active');
        }
    }
    
    // Add keyboard navigation support
    tabLinks.forEach((tab, index) => {
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextTab = tabLinks[(index + 1) % tabLinks.length];
                nextTab.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevTab = tabLinks[(index - 1 + tabLinks.length) % tabLinks.length];
                prevTab.focus();
            }
        });
        
        // Add tabindex for keyboard navigation
        tab.setAttribute('tabindex', '0');
    });
    
    // Add smooth transitions for tab content
    tabPanes.forEach(pane => {
        pane.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
    });
    
    // Add accessibility attributes
    tabLinks.forEach(tab => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', 'false');
    });
    
    tabPanes.forEach(pane => {
        pane.setAttribute('role', 'tabpanel');
        pane.setAttribute('aria-hidden', 'true');
    });
    
    // Update aria attributes when tabs change
    function updateAriaAttributes(activeTab) {
        tabLinks.forEach(tab => {
            const isActive = tab === activeTab;
            tab.setAttribute('aria-selected', isActive.toString());
        });
        
        tabPanes.forEach(pane => {
            const isVisible = pane.classList.contains('show');
            pane.setAttribute('aria-hidden', (!isVisible).toString());
        });
    }
    
    // Enhanced click handler with aria updates
    tabLinks.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetPane = document.querySelector(targetId);
            
            if (targetPane) {
                // Remove active class from all tabs and panes
                tabLinks.forEach(t => t.classList.remove('active'));
                tabPanes.forEach(p => {
                    p.classList.remove('show', 'active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show target content
                targetPane.classList.add('show', 'active');
                
                // Update aria attributes
                updateAriaAttributes(this);
                
                // Add animation
                targetPane.style.opacity = '0';
                targetPane.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    targetPane.style.opacity = '1';
                    targetPane.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });
    
    // Add focus management for better accessibility
    tabLinks.forEach(tab => {
        tab.addEventListener('focus', function() {
            this.style.outline = '2px solid #005EB8';
            this.style.outlineOffset = '2px';
        });
        
        tab.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Add touch support for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const activeTabIndex = Array.from(tabLinks).findIndex(tab => tab.classList.contains('active'));
            
            if (diff > 0 && activeTabIndex < tabLinks.length - 1) {
                // Swipe left - next tab
                tabLinks[activeTabIndex + 1].click();
            } else if (diff < 0 && activeTabIndex > 0) {
                // Swipe right - previous tab
                tabLinks[activeTabIndex - 1].click();
            }
        }
    }
    
    console.log('Tabs functionality loaded successfully!');
});

// Export for potential external use
window.TabsManager = {
    switchTab: function(tabIndex) {
        const tabs = document.querySelectorAll('.nav-pills .nav-link');
        if (tabs[tabIndex]) {
            tabs[tabIndex].click();
        }
    },
    
    getActiveTab: function() {
        const activeTab = document.querySelector('.nav-pills .nav-link.active');
        return activeTab ? Array.from(document.querySelectorAll('.nav-pills .nav-link')).indexOf(activeTab) : 0;
    }
};
