// --- 0. LOADER & EARLY UNLOCK --- //
const loaderWrapper = document.getElementById('loader-wrapper');

// Unlock scroll immediately on first paint (DOMContentLoaded) to prevent blocking
document.addEventListener('DOMContentLoaded', () => {
    // Remove scroll lock class if set
    document.body.classList.remove('no-scroll');
});

// Handle loader removal via CSS animation - called when slideUp animation finishes
if (loaderWrapper) {
    loaderWrapper.addEventListener('animationend', () => {
        loaderWrapper.setAttribute('aria-hidden', 'true');
        loaderWrapper.style.display = 'none';
    }, { once: true });
}

// Fallback: ensure scroll is unlocked after a reasonable time
setTimeout(() => {
    document.body.classList.remove('no-scroll');
}, 3000);

// --- 1. CURSOR ANIMATION (WITH TOUCH THROTTLING & DOC HIDDEN PAUSE) --- //
const startX = 358;
const startY = 868;
let mouseX = startX;
let mouseY = startY;
let line1X = startX;
let line1Y = startY;
let line2X = startX;
let line2Y = startY;

const lineOneEl = document.getElementById('line-one');
const lineTwoEl = document.getElementById('line-two');

// Detect if device uses touch/coarse pointer
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
let isThrottlingCursorAnim = isTouchDevice();
let lastAnimFrameTime = 0;
const TOUCH_THROTTLE_FPS = 15; // Throttle to ~15 FPS on touch devices
const TOUCH_FRAME_INTERVAL = 1000 / TOUCH_THROTTLE_FPS;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    mouseX = touch.clientX;
    mouseY = touch.clientY;
}, { passive: true });

function animate() {
    // Pause animation if document is hidden (tab not active)
    if (document.hidden) {
        requestAnimationFrame(animate);
        return;
    }

    // Throttle on touch devices to reduce CPU usage
    if (isThrottlingCursorAnim) {
        const now = performance.now();
        if (now - lastAnimFrameTime < TOUCH_FRAME_INTERVAL) {
            requestAnimationFrame(animate);
            return;
        }
        lastAnimFrameTime = now;
    }

    line1X += (mouseX - line1X) * 0.05;
    line1Y += (mouseY - line1Y) * 0.05;
    line2X += (mouseX - line2X) * 0.2;
    line2Y += (mouseY - line2Y) * 0.2;

    if (lineOneEl && lineTwoEl) {
        lineOneEl.style.transform = `translate(${line1X}px, ${line1Y}px) translate(-50%, -50%) rotate(45deg)`;
        lineTwoEl.style.transform = `translate(${line2X}px, ${line2Y}px) translate(-50%, -50%) rotate(-45deg)`;
    }

    requestAnimationFrame(animate);
}

animate();

// --- RAZORPAY SCRIPT DEFERRED LOADING --- //
// Load Razorpay script after first paint via requestIdleCallback (or after FCP)
const loadRazorpayScript = () => {
    if (window.Razorpay) return; // Already loaded
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
};

// Use requestIdleCallback if available, otherwise load after short delay
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadRazorpayScript(), { timeout: 2000 });
} else {
    // Fallback: load after first paint
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(loadRazorpayScript, 100);
        });
    } else {
        setTimeout(loadRazorpayScript, 100);
    }
}


// --- 2. DYNAMIC LEGAL CONTENT (JSON DATA) --- //
const LEGAL_CONTENT = [
    {
        id: "terms",
        title: "Terms & Conditions",
        updated: "February 04, 2026",
        content: `
            <h3>1. Introduction & Acceptance</h3>
            <p>Welcome to the portfolio and digital services platform of Akash Chaudhari ("we," "us," or "our"). By accessing this website, purchasing services, or downloading digital resources, you explicitly agree to comply with and be bound by these Terms and Conditions. If you disagree with any part of these terms, you must discontinue use immediately.</p>
            
            <h3>2. Intellectual Property Rights</h3>
            <p>Unless otherwise indicated, the website and its entire contents, features, and functionality (including but not limited to all information, software, code, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Akash Chaudhari and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
            <p>You are granted a limited license only for purposes of viewing the material contained on this website. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website.</p>

            <h3>3. Service Usage & Client Obligations</h3>
            <p>When engaging our services (Web Development, Data Engineering, AI Consulting), you agree to:</p>
            <ul>
                <li>Provide accurate, current, and complete information during the onboarding process.</li>
                <li>Ensure you have the necessary rights to any assets (logos, text, images) you provide for use in your project.</li>
                <li>Respond to approval requests and queries in a timely manner to prevent project delays.</li>
            </ul>

            <h3>4. Payment Terms</h3>
            <p>All prices listed on the website or in proposals are in Indian Rupees (INR) unless stated otherwise. Payment obligations are non-cancelable, and fees paid are non-refundable except as provided in our Refund Policy. We reserve the right to suspend or terminate services for non-payment.</p>

            <h3>5. Limitation of Liability</h3>
            <p>To the fullest extent permitted by law, in no event will Akash Chaudhari, affiliates, or licensors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the website or services, including any direct, indirect, special, incidental, consequential, or punitive damages.</p>
            
            <h3>6. Governing Law</h3>
            <p>These terms shall be governed by and construed in accordance with the laws of India, specifically within the jurisdiction of the courts in Maharashtra, without regard to its conflict of law provisions.</p>
        `
    },
    {
        id: "privacy",
        title: "Privacy Policy",
        updated: "February 04, 2026",
        content: `
            <h3>1. Data Collection</h3>
            <p>We are committed to protecting your privacy. We collect information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website, or otherwise when you contact us.</p>
            <p><strong>Personal Information Provided by You:</strong> Names; phone numbers; email addresses; billing addresses; debit/credit card numbers (processed via secure third-party gateways).</p>
            <p><strong>Automatically Collected Data:</strong> IP address, browser type, device characteristics, operating system, language preferences, referring URLs, and country location.</p>

            <h3>2. Use of Your Information</h3>
            <p>We use personal information collected via our Website for a variety of business purposes described below:</p>
            <ul>
                <li>To facilitate account creation and logon processes.</li>
                <li>To send administrative information to you (product, service, and new feature information).</li>
                <li>To fulfill and manage your orders.</li>
                <li>To protect our Services (fraud monitoring and prevention).</li>
            </ul>

            <h3>3. Data Sharing & Third Parties</h3>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal basis: Consent, Legitimate Interests, Performance of a Contract, and Legal Obligations.</p>

            <h3>4. Security of Your Information</h3>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
        `
    },
    {
        id: "refunds",
        title: "Refunds & Cancellations",
        updated: "February 04, 2026",
        content: `
            <h3>1. Service Cancellation</h3>
            <p><strong>Pre-Work Cancellation:</strong> You are entitled to a full refund if you cancel your service request within 24 hours of payment, provided that our team has not yet initiated the onboarding or design process.</p>
            <p><strong>Mid-Project Cancellation:</strong> Once the project has commenced, the initial deposit or first milestone payment is non-refundable. This covers the time, resources, and administrative costs allocated to your project.</p>

            <h3>2. Digital Products</h3>
            <p>Due to the immediate nature of digital downloads (e.g., templates, code snippets, e-books), all sales of digital products are final and non-refundable. Please review the product description and compatibility requirements carefully before purchase.</p>

            <h3>3. Refund Process</h3>
            <p>To request a refund, contact us at akashchaudhari1012@gmail.com with your Order ID and reason for the request. Eligible refunds are processed within 5-7 business days and credited back to the original payment method.</p>
        `
    },
    {
        id: "contact",
        title: "Contact",
        updated: "",
        content: `
             <h3>Get in Touch</h3>
             <p>If you have questions or comments about this policy, you may contact us by email at akashchaudhari1012@gmail.com, by phone at +91 9545441133, or by post to:</p>
             <p>Akash Chaudhari<br>Aurangabad, Maharashtra, India</p>
        `
    }
];

function renderLegalContent() {
    const navList = document.getElementById('dynamic-nav-list');
    const contentArea = document.getElementById('dynamic-content-area');

    if (!navList || !contentArea) return;

    // Clear existing
    navList.innerHTML = '';
    contentArea.innerHTML = '';

    LEGAL_CONTENT.forEach((item, index) => {
        // 1. Create Nav Link
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#legal-${item.id}`;
        link.textContent = item.title;
        link.className = 'nav-link';
        link.dataset.target = `legal-${item.id}`;
        
        // Make first link active by default
        if (index === 0) link.classList.add('active');

        // Smooth scroll click handler
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetEl = document.getElementById(`legal-${item.id}`);
            if(targetEl) {
                // Adjust scroll offset based on screen size (for sticky headers)
                const headerOffset = window.innerWidth <= 800 ? 120 : 0;
                const elementPosition = targetEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                // Use scrollIntoView logic
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        li.appendChild(link);
        navList.appendChild(li);

        // 2. Create Content Section
        const section = document.createElement('section');
        section.id = `legal-${item.id}`;
        section.className = 'policy-group';

        let dateHtml = item.updated ? `<span class="last-updated">Last Updated: ${item.updated}</span>` : '';

        section.innerHTML = `
            <h2>${item.title}</h2>
            ${dateHtml}
            <div class="text-block">
                ${item.content}
            </div>
        `;
        contentArea.appendChild(section);
    });
}

function initScrollSpy() {
    const contentArea = document.querySelector('.modal-content');
    const sections = document.querySelectorAll('.policy-group');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: contentArea,
        rootMargin: '-10% 0px -60% 0px', // Trigger when section is near top
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding link
                const id = entry.target.id;
                const activeLink = document.querySelector(`.nav-link[data-target="${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

// --- 3. ACCESSIBILITY & MODAL FOCUS MANAGEMENT --- //
// Helper function to focus first focusable element in a container
const focusFirstElement = (container) => {
    const focusables = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length > 0) {
        focusables[0].focus();
    }
};

// Helper function to trap focus within a modal (optional - enhanced UX)
const createFocusTrap = (modal) => {
    const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
        // Close modal on Escape key
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
};

// --- 4. LEGAL MODAL INITIALIZATION --- //
const policyModal = document.getElementById('policy-overlay');
const policyOpenBtn = document.getElementById('terms-trigger');
const policyCloseBtn = document.getElementById('close-modal');

// Init Content
renderLegalContent();
initScrollSpy();

if(policyOpenBtn && policyModal) {
    policyOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        policyModal.classList.add('active');
        document.body.classList.add('no-scroll');
        const tabs = document.querySelector('.modal-tabs');
        if (tabs) tabs.scrollLeft = 0;
        
        // Focus management: Set focus to close button for accessibility
        const closeBtn = policyModal.querySelector('.close-btn');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
        
        // Set up focus trap for keyboard navigation and Escape key handling
        createFocusTrap(policyModal);
    });

    policyCloseBtn.addEventListener('click', () => {
        policyModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        // Return focus to the trigger button
        policyOpenBtn.focus();
    });
}


// --- 4. DYNAMIC PAYMENT SYSTEM (RAZORPAY) --- //
const paymentModal = document.getElementById('payment-overlay');
const coffeeBtn = document.getElementById('coffee-trigger-btn'); // Matches ID in HTML
const closePaymentBtn = document.getElementById('close-payment');
const proceedBtn = document.getElementById('proceed-payment-btn');
const amountInput = document.getElementById('custom-amount');

// Check if elements exist before attaching listeners
if (coffeeBtn && paymentModal && proceedBtn && amountInput) {

    // A. Open Payment Modal
    coffeeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        paymentModal.classList.add('active');
        document.body.classList.add('no-scroll');
        
        // Auto-focus input for better UX
        setTimeout(() => {
            amountInput.focus();
            amountInput.select();
        }, 100);
        
        // Set up focus trap for keyboard navigation and Escape key handling
        createFocusTrap(paymentModal);
    });

    // B. Close Payment Modal
    const closePayment = () => {
        paymentModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        // Return focus to trigger button
        coffeeBtn.focus();
    };

    if (closePaymentBtn) {
        closePaymentBtn.addEventListener('click', closePayment);
    }
    
    // Close on click outside the box
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) closePayment();
    });

    // C. Process Payment
    proceedBtn.addEventListener('click', async () => {
        const keyId = coffeeBtn.dataset.razorpayKey || '';
        
        if (!keyId || typeof Razorpay === 'undefined') {
            alert("Payment system initializing. Please try again in a moment.");
            return;
        }

        const amountVal = parseFloat(amountInput.value);
        if (!amountVal || amountVal < 1) {
            alert("Please enter a valid amount (minimum ₹1).");
            return;
        }

        // Disable button to prevent double clicks
        const originalText = proceedBtn.textContent;
        proceedBtn.disabled = true;
        proceedBtn.textContent = 'Processing...';

        try {
            // 1. Create Order on Server
            const orderResponse = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: amountVal,
                    source: 'portfolio-coffee' 
                })
            });

            let orderData = {};
            try {
                orderData = await orderResponse.json();
            } catch (err) {
                throw new Error("Invalid response from server.");
            }

            if (!orderResponse.ok || !orderData.ok || !orderData.orderId) {
                throw new Error(orderData.message || 'Could not start payment.');
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: orderData.name,
                description: orderData.description,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment on Server
                        const verifyResponse = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(response)
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData.ok) {
                            throw new Error(verifyData.message || 'Verification failed.');
                        }
                        
                        closePayment();
                        alert('Thank you for your support! Payment Successful.');
                        
                    } catch (err) {
                        alert(`Payment Verification Error: ${err.message}`);
                    }
                },
                prefill: {
                    name: "",   // Let user fill this in Razorpay modal
                    email: ""
                },
                theme: { 
                    color: '#1b7a6b' 
                },
                modal: {
                    ondismiss: function() {
                        proceedBtn.disabled = false;
                        proceedBtn.textContent = originalText;
                    }
                }
            };

            const razorpayInstance = new Razorpay(options);
            
            razorpayInstance.on('payment.failed', function (response) {
                alert(`Payment failed: ${response.error.description}`);
                proceedBtn.disabled = false;
                proceedBtn.textContent = originalText;
            });
            
            razorpayInstance.open();

        } catch (err) {
            alert(err.message);
            proceedBtn.disabled = false;
            proceedBtn.textContent = originalText;
        }
    });
}


// --- 5. NOTIFY FORM (AJAX) --- //
const notifyForm = document.querySelector('.notify-form');
if (notifyForm) {
    const notifyInput = notifyForm.querySelector('input[name="email"]');
    const notifyButton = notifyForm.querySelector('.notify-btn');
    const notifyStatus = document.querySelector('.notify-status');
    const defaultBtnText = notifyButton ? notifyButton.textContent : '';
    let statusTimer = null;

    const setStatus = (message, isError = false) => {
        if (!notifyStatus) return;
        notifyStatus.textContent = message;
        notifyStatus.classList.toggle('is-error', isError);
        notifyStatus.classList.add('is-visible');
        if (statusTimer) clearTimeout(statusTimer);
        statusTimer = setTimeout(() => {
            notifyStatus.classList.remove('is-visible');
        }, 2800);
    };

    notifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!notifyInput || !notifyButton) return;

        const email = notifyInput.value.trim();
        if (!email) {
            setStatus('Please enter a valid email.', true);
            return;
        }

        notifyButton.disabled = true;
        notifyButton.textContent = 'Saving...';

        try {
            const body = new URLSearchParams(new FormData(notifyForm));
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body
            });
            let data = null;
            try {
                data = await response.json();
            } catch (err) {
                data = null;
            }

            if (!response.ok || (data && data.ok === false)) {
                const message = (data && data.message) ? data.message : 'I think you are already on the list.?';
                setStatus(message, true);
            } else {
                const message = (data && data.message) ? data.message : 'Thanks! You are on the list.';
                setStatus(message, false);
                notifyInput.value = '';
            }
        } catch (err) {
            setStatus('Network error. Try again.', true);
        } finally {
            notifyButton.disabled = false;
            notifyButton.textContent = defaultBtnText;
        }
    });
}