// =========================================
// NAVBAR: solid background after scroll
// =========================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// =========================================
// BUTTON RIPPLE ANIMATION
// .power-btn aur .btn-outline pe click karte hi
// ek chhota ripple circle expand hoke fade hota hai
// =========================================
const rippleButtons = document.querySelectorAll('.power-label, .btn-outline, .hero-cta');

rippleButtons.forEach(btn => {
  btn.addEventListener('click', function (e) {
    const circle = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    circle.style.position = 'absolute';
    circle.style.width = circle.style.height = size + 'px';
    circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
    circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
    circle.style.borderRadius = '50%';
    circle.style.background = 'rgba(184,147,95,0.35)';
    circle.style.pointerEvents = 'none';
    circle.style.transform = 'scale(0)';
    circle.style.transition = 'transform 0.6s ease, opacity 0.6s ease';

   if (getComputedStyle(btn).position === 'static') {
  btn.style.position = 'relative';
}
    btn.style.overflow = 'hidden';
    btn.appendChild(circle);

    requestAnimationFrame(() => {
      circle.style.transform = 'scale(2)';
      circle.style.opacity = '0';
    });

    setTimeout(() => circle.remove(), 600);
  });
});

// =========================================
// BOOKING SYSTEM (mock data — real backend nahi hai,
// college project ke liye browser-hi-browser logic)
// =========================================

// Sabhi rooms ka data — image, price, capacity
const roomsData = [
  { id: 'luxury',    name: 'Luxury Room',     price: 200, guests: 2, beds: '1 Queen or 2 Single Beds', img: '#' },
  { id: 'deluxe',    name: 'Deluxe Room',     price: 250, guests: 2, beds: '1 Queen or 2 Single Beds', img: '#' },
  { id: 'studio',    name: 'Studio Suite',    price: 300, guests: 2, beds: '1 Queen or 1 King Bed',    img: '#' },
  { id: 'executive', name: 'Executive Suite', price: 350, guests: 2, beds: '1 King Bed or 2 Single',   img: '#' },
  { id: 'premier',   name: 'Premier Suite',   price: 450, guests: 4, beds: '2 Queen Beds',             img: '#' },
  { id: 'penthouse', name: 'Penthouse Suite', price: 500, guests: 4, beds: '2 King Beds',              img: '#' }
];

// Fake "already booked" date ranges per room (demo ke liye hardcoded)
// Format: [checkin, checkout] — in dates ke beech overlap ho to room unavailable
const bookedRanges = {
  luxury:    [['2026-09-10', '2026-09-14']],
  deluxe:    [],
  studio:    [['2026-09-05', '2026-09-08']],
  executive: [],
  premier:   [['2026-09-20', '2026-09-25']],
  penthouse: []
};

let selectedRoom = null;

// Do date-ranges overlap karte hain kya, check karta hai
function rangesOverlap(startA, endA, startB, endB) {
  return new Date(startA) < new Date(endB) && new Date(startB) < new Date(endA);
}

function isRoomAvailable(roomId, checkin, checkout) {
  const ranges = bookedRanges[roomId] || [];
  return !ranges.some(([bStart, bEnd]) => rangesOverlap(checkin, checkout, bStart, bEnd));
}

// ---- Modal elements ----
const bookingOverlay = document.getElementById('bookingOverlay');
const bookingClose = document.getElementById('bookingClose');
const checkinInput = document.getElementById('checkinInput');
const checkoutInput = document.getElementById('checkoutInput');
const dateHint = document.getElementById('dateHint');
const stepRooms = document.getElementById('stepRooms');
const roomList = document.getElementById('roomList');
const stepConfirm = document.getElementById('stepConfirm');
const bookingSummary = document.getElementById('bookingSummary');
const confirmBookingBtn = document.getElementById('confirmBookingBtn');
const stepSuccess = document.getElementById('stepSuccess');
const successMsg = document.getElementById('successMsg');
const doneBtn = document.getElementById('doneBtn');
const stepDates = document.getElementById('stepDates');

// Har "Book Now" button modal khole
document.querySelectorAll('.book-now-btn').forEach(btn => {
  btn.addEventListener('click', () => openBookingModal());
});

function openBookingModal() {
  bookingOverlay.classList.add('open');
  resetBookingModal();
}

function closeBookingModal() {
  bookingOverlay.classList.remove('open');
}

bookingClose.addEventListener('click', closeBookingModal);
bookingOverlay.addEventListener('click', (e) => {
  if (e.target === bookingOverlay) closeBookingModal();
});

function resetBookingModal() {
  checkinInput.value = '';
  checkoutInput.value = '';
  stepRooms.style.display = 'none';
  stepConfirm.style.display = 'none';
  stepSuccess.style.display = 'none';
  stepDates.style.display = 'block';
  selectedRoom = null;
}

// Jab dono dates fill ho jaayein, room list dikhao
[checkinInput, checkoutInput].forEach(input => {
  input.addEventListener('change', () => {
    if (checkinInput.value && checkoutInput.value) {
      if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
        dateHint.textContent = 'Check-out date check-in ke baad honi chahiye.';
        stepRooms.style.display = 'none';
        return;
      }
      dateHint.textContent = '';
      renderRoomList(checkinInput.value, checkoutInput.value);
      stepRooms.style.display = 'block';
    }
  });
});

function renderRoomList(checkin, checkout) {
  roomList.innerHTML = '';

  roomsData.forEach(room => {
    const available = isRoomAvailable(room.id, checkin, checkout);

    const item = document.createElement('div');
    item.className = 'booking-room-item' + (available ? '' : ' unavailable');

    item.innerHTML = `
      <img src="${room.img}" alt="${room.name}">
      <div class="booking-room-details">
        <h5>${room.name}</h5>
        <span>${room.beds} · Max ${room.guests} guests</span>
        <span>$${room.price} / night</span>
      </div>
      <button class="room-select-btn" ${available ? '' : 'disabled'}>
        ${available ? 'Select' : 'Unavailable'}
      </button>
    `;

    if (available) {
      item.querySelector('.room-select-btn').addEventListener('click', () => {
        selectedRoom = { ...room, checkin, checkout };
        showConfirmStep();
      });
    }

    roomList.appendChild(item);
  });
}

function showConfirmStep() {
  const nights = Math.round(
    (new Date(selectedRoom.checkout) - new Date(selectedRoom.checkin)) / (1000 * 60 * 60 * 24)
  );
  const total = nights * selectedRoom.price;

  bookingSummary.innerHTML = `
    <strong>${selectedRoom.name}</strong><br>
    Check-in: ${selectedRoom.checkin}<br>
    Check-out: ${selectedRoom.checkout}<br>
    ${nights} night(s) &times; $${selectedRoom.price} = <strong>$${total}</strong>
  `;

  stepDates.style.display = 'none';
  stepRooms.style.display = 'none';
  stepConfirm.style.display = 'block';
}

confirmBookingBtn.addEventListener('click', () => {
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const paymentLabel = paymentMethod === 'upi' ? 'UPI' : 'Cash at Hotel';

  successMsg.innerHTML = `
    Booking confirmed for <strong>${selectedRoom.name}</strong>.<br>
    Payment method: <strong>${paymentLabel}</strong>.<br>
    We look forward to hosting you at Antarang.
  `;

  stepConfirm.style.display = 'none';
  stepSuccess.style.display = 'block';
});

doneBtn.addEventListener('click', closeBookingModal);

// =========================================
// HAMBURGER (mobile menu) — abhi sirf class toggle
// =========================================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
  hamburger.classList.toggle('active');
});

// =========================================
// SCROLL REVEAL ANIMATION
// Har element jiski class "reveal" hai, wo
// screen me aate hi fade+slide up hoga
// =========================================
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target); // sirf ek baar animate ho
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// Hero ke reveal elements page load hote hi turant dikhein
// (kyunki wo already viewport me hain, IntersectionObserver
// scroll na hone par bhi load par trigger kar dega — but
// safety ke liye chhota delay dete hain taaki animation dikhe)
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('active'), 300 + i * 200);
  });
});