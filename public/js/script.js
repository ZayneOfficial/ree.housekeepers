// ==========================
// MOBILE MENU TOGGLE
// ==========================
const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');

if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navbar.classList.toggle('active');
    });
}

document.addEventListener('click', function(e) {
    if (navbar && !navbar.contains(e.target) && !menuToggle.contains(e.target)) {
        navbar.classList.remove('active');
    }
});

// ==========================
// SCROLL TO TOP BUTTON
// ==========================
const topBtn = document.getElementById('topBtn');

window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
        topBtn.style.display = 'block';
    } else {
        topBtn.style.display = 'none';
    }
});

if (topBtn) {
    topBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==========================
// CONTACT FORM HANDLING
// ==========================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value;

        // Simple validation
        if (!name || !email || !phone || !service) {
            alert('Please fill in all required fields.');
            return;
        }

        // Build WhatsApp message
        const whatsappMessage = `Hello Ree Cleaning Services,%0A%0A*Name:* ${name}%0A*Email:* ${email}%0A*Phone:* ${phone}%0A*Service:* ${service}%0A*Message:* ${message}`;

        // Redirect to WhatsApp
        const phoneNumber = '2773627946';
        window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
    });
}

// ==========================
// SMOOTH SCROLL FOR NAV LINKS
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            navbar.classList.remove('active');
        }
    });
});

// ==========================
// ACTIVE NAV LINK
// ==========================
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});