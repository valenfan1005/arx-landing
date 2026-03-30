// ============================================
// WAITLIST SIGNUP & REFERRAL
// ============================================

// Parse referral from URL
(function() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    localStorage.setItem('arx_ref', ref);
    const refInput = document.getElementById('ref-input');
    if (refInput) refInput.value = ref;
  } else {
    const stored = localStorage.getItem('arx_ref');
    if (stored) {
      const refInput = document.getElementById('ref-input');
      if (refInput) refInput.value = stored;
    }
  }
})();

// Signup handler — posts to Google Sheets
const WAITLIST_API = 'https://script.google.com/macros/s/AKfycbzwylSB77ZBgMgRPcYFS9VYvigKkWURtJWJyNHD7IHD3HB_PNTXFCItcUO5aYN3gzhlnA/exec';

async function handleSignup() {
  const email = document.getElementById('email-input').value.trim();
  const wallet = document.getElementById('wallet-input').value.trim();
  const refCode = document.getElementById('ref-input').value.trim();
  const btn = document.getElementById('submit-btn');

  // Validate email
  if (!email || !email.includes('@') || !email.includes('.')) {
    document.getElementById('email-input').style.borderColor = '#EF4444';
    document.getElementById('email-input').focus();
    return;
  }

  // Validate wallet format if provided
  if (wallet && !wallet.startsWith('0x')) {
    document.getElementById('wallet-input').style.borderColor = '#EF4444';
    document.getElementById('wallet-input').focus();
    return;
  }

  // Show loading state
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    await fetch(WAITLIST_API, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, wallet, referrer: refCode })
    });

    // Generate ref link from email
    const slug = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    document.getElementById('ref-link').value = `arx.trade?ref=${slug}`;

    // Clear stored ref code after signup
    localStorage.removeItem('arx_ref');

    // Show success
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signup-success').classList.add('show');
  } catch (err) {
    // Still show success — data may have been saved (no-cors doesn't return response)
    const slug = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    document.getElementById('ref-link').value = `arx.trade?ref=${slug}`;
    localStorage.removeItem('arx_ref');
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signup-success').classList.add('show');
  }
}

// Copy ref link
function copyRefLink() {
  const input = document.getElementById('ref-link');
  navigator.clipboard.writeText(input.value);
  const btn = input.nextElementSibling;
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy', 2000);
}

// Share handlers
function shareTwitter() {
  const link = document.getElementById('ref-link').value;
  const text = encodeURIComponent(`I just joined the @araborx waitlist. Institutional-grade copy trading on Hyperliquid is coming.\n\nJoin me: https://${link}`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareTelegram() {
  const link = document.getElementById('ref-link').value;
  const text = encodeURIComponent(`Join me on the ARX waitlist — institutional-grade copy trading on Hyperliquid: https://${link}`);
  window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
}
