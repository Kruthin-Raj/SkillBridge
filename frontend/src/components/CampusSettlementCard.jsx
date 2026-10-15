import { useState, useEffect } from 'react';
import ImageModal from './ImageModal';

/**
 * React component for CampusSettlementCard (Direct UPI & Cash Settlement).
 * @author = kruthinraj
 * @date = 2026-10-15
 */

export default function CampusSettlementCard({
  listing,
  acceptedBid,
  currentUser,
  isOwner,
  freelancer,
  onNotifyChat,
}) {
  const amount = acceptedBid?.amount || listing.budget || 0;
  const isFreelancer = currentUser && freelancer && currentUser.id === freelancer.id;

  // Local settlement state key per listing
  const storageKey = `skillbridge_settlement_${listing.id}`;

  const [settlement, setSettlement] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      status: 'pending', // 'pending' | 'sent' | 'confirmed'
      method: 'upi',     // 'upi' | 'cash'
      upiId: freelancer?.upi_id || '',
      qrUrl: freelancer?.upi_qr_url || '',
    };
  });

  const [customUpi, setCustomUpi] = useState(settlement.upiId || freelancer?.upi_id || '');
  const [editingUpi, setEditingUpi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settlement));
    } catch (_) {}
  }, [settlement, storageKey]);

  // Sync if freelancer profile has upi_id
  useEffect(() => {
    if (freelancer?.upi_id && !settlement.upiId) {
      setSettlement((prev) => ({ ...prev, upiId: freelancer.upi_id }));
      setCustomUpi(freelancer.upi_id);
    }
    if (freelancer?.upi_qr_url && !settlement.qrUrl) {
      setSettlement((prev) => ({ ...prev, qrUrl: freelancer.upi_qr_url }));
    }
  }, [freelancer]);

  const handleCopyUpi = () => {
    const upiToCopy = customUpi || settlement.upiId;
    if (!upiToCopy) return;
    navigator.clipboard.writeText(upiToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUpi = (e) => {
    e.preventDefault();
    setSettlement((prev) => ({ ...prev, upiId: customUpi.trim() }));
    setEditingUpi(false);
    if (onNotifyChat && customUpi.trim()) {
      onNotifyChat(`💳 Freelancer updated UPI ID to: ${customUpi.trim()}`);
    }
  };

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setSettlement((prev) => ({ ...prev, qrUrl: dataUrl }));
      if (onNotifyChat) {
        onNotifyChat(`📷 Freelancer uploaded a UPI QR Code for payment.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMarkAsSent = (method = 'upi') => {
    const updated = { ...settlement, status: 'sent', method };
    setSettlement(updated);
    if (onNotifyChat) {
      const msg =
        method === 'cash'
          ? `💵 Payment Notice: Task owner marked ₹${amount} as paid in Cash. Please verify and confirm below!`
          : `💳 Payment Notice: Task owner marked ₹${amount} as sent via UPI. Please check your GPay/PhonePe and confirm!`;
      onNotifyChat(msg);
    }
  };

  const handleConfirmReceived = () => {
    const updated = { ...settlement, status: 'confirmed' };
    setSettlement(updated);
    if (onNotifyChat) {
      onNotifyChat(`✅ Payment Confirmed: Freelancer verified that ₹${amount} has been received successfully! Task is ready for completion.`);
    }
  };

  const activeUpi = customUpi || settlement.upiId;
  const activeQr = settlement.qrUrl;

  // Mobile UPI deep link: opens PhonePe / GPay / Paytm with pre-filled amount
  const upiDeepLink = activeUpi
    ? `upi://pay?pa=${encodeURIComponent(activeUpi)}&pn=${encodeURIComponent(
        freelancer?.full_name || 'Freelancer'
      )}&am=${amount}&cu=INR&tn=${encodeURIComponent('SkillBridge Task: ' + listing.title.slice(0, 20))}`
    : null;

  // Live dynamic UPI QR code fallback (allows desktop users to scan directly off the monitor)
  const dynamicQrUrl = upiDeepLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiDeepLink)}`
    : null;

  const displayQr = activeQr || dynamicQrUrl;

  return (
    <div className="card border-cw-accent/30 bg-gradient-to-b from-cw-surface to-cw-bg-alt/60 p-4 space-y-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-cw-border/60 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🤝</span>
            <h4 className="font-bold text-cw-text-1 text-sm">Direct Campus Settlement</h4>
          </div>
          <p className="text-[11px] text-cw-text-3 mt-0.5">
            Peer-to-peer settlement &bull; 0% platform fee
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            settlement.status === 'confirmed'
              ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
              : settlement.status === 'sent'
              ? 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
              : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
          }`}
        >
          {settlement.status === 'confirmed'
            ? '✓ Settled'
            : settlement.status === 'sent'
            ? 'Marked as Sent'
            : 'Payment Pending'}
        </span>
      </div>

      {/* Agreed Settlement Amount */}
      <div className="rounded-xl bg-cw-surface p-3 border border-cw-border flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-cw-text-3 uppercase tracking-wider">
            Agreed Bid Amount
          </span>
          <div className="text-2xl font-extrabold text-cw-text-1">₹{amount}</div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-cw-text-3 block">Task Recipient</span>
          <span className="text-xs font-semibold text-cw-text-1 truncate max-w-[120px] block">
            {freelancer?.full_name || 'Freelancer'}
          </span>
        </div>
      </div>

      {/* FREELANCER VIEW: Manage your payment info */}
      {isFreelancer && (
        <div className="space-y-3">
          <div className="rounded-lg bg-cw-bg-alt/80 p-3 border border-cw-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cw-text-1">Your Receiving UPI</span>
              <button
                type="button"
                onClick={() => setEditingUpi(!editingUpi)}
                className="text-[11px] text-cw-accent font-medium hover:underline"
              >
                {editingUpi ? 'Cancel' : activeUpi ? 'Edit UPI' : '+ Add UPI ID'}
              </button>
            </div>

            {editingUpi ? (
              <form onSubmit={handleSaveUpi} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="e.g. name@okhdfcbank"
                  value={customUpi}
                  onChange={(e) => setCustomUpi(e.target.value)}
                  className="field py-1 text-xs flex-1"
                  required
                />
                <button type="submit" className="btn-primary py-1 px-3 text-xs">
                  Save
                </button>
              </form>
            ) : activeUpi ? (
              <div className="flex items-center justify-between bg-cw-surface px-2.5 py-1.5 rounded border border-cw-border">
                <code className="text-xs font-mono font-medium text-cw-text-1">{activeUpi}</code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-[11px] text-cw-text-3 hover:text-cw-accent"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-cw-text-3">
                No UPI ID added yet. Add it so the task poster can pay you via GPay/PhonePe!
              </p>
            )}

            {/* QR Code section */}
            <div className="pt-2 flex items-center justify-between border-t border-cw-border/50 text-xs">
              <span className="text-cw-text-2">UPI QR Code:</span>
              <div className="flex items-center gap-2">
                {displayQr && (
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="text-xs text-cw-accent font-medium hover:underline"
                  >
                    Preview QR
                  </button>
                )}
                <label className="text-xs text-cw-accent hover:underline cursor-pointer">
                  {activeQr ? 'Change Custom QR' : '+ Upload Custom QR'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Freelancer Confirmation Button */}
          {settlement.status !== 'confirmed' && (
            <button
              type="button"
              onClick={handleConfirmReceived}
              className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <span>✓</span>
              <span>Confirm Payment Received (₹{amount})</span>
            </button>
          )}

          {settlement.status === 'confirmed' && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ Payment confirmed! You and the poster can complete the task.
            </div>
          )}
        </div>
      )}

      {/* POSTER VIEW: Pay the Freelancer */}
      {isOwner && (
        <div className="space-y-3">
          {/* Method 1: UPI Transfer */}
          <div className="rounded-lg bg-cw-bg-alt/80 p-3 border border-cw-border space-y-2">
            <span className="text-xs font-semibold text-cw-text-1 block">
              Pay via UPI (PhonePe / GPay / Paytm)
            </span>

            {activeUpi ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-cw-surface px-2.5 py-1.5 rounded border border-cw-border">
                  <code className="text-xs font-mono font-medium text-cw-text-1 select-all">
                    {activeUpi}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="text-xs font-semibold text-cw-accent hover:underline"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {upiDeepLink && (
                    <a
                      href={upiDeepLink}
                      className="btn-primary flex-1 py-2 text-xs text-center flex items-center justify-center gap-1.5 font-semibold"
                    >
                      <span>⚡</span>
                      <span>Pay in UPI App</span>
                    </a>
                  )}

                  {displayQr && (
                    <button
                      type="button"
                      onClick={() => setShowQrModal(true)}
                      className="btn-ghost py-2 px-3 text-xs flex items-center justify-center gap-1 border border-cw-border"
                      title="Show scannable QR code"
                    >
                      <span>📷</span>
                      <span>Show QR</span>
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-cw-text-3 flex items-center justify-between px-0.5">
                  <span>📱 Phone: Opens UPI app</span>
                  <span>💻 PC: Click "Show QR" to scan</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-cw-text-3">
                Freelancer hasn't added a UPI ID yet. You can ask for their QR code in chat or pay in cash.
              </div>
            )}
          </div>

          {/* Method 2: Cash in Person */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-cw-surface border border-cw-border text-xs text-cw-text-2">
            <span>💵 Cash in Person</span>
            <span className="text-cw-text-3 text-[11px]">Hand over in campus</span>
          </div>

          {/* Poster Action Buttons */}
          {settlement.status === 'pending' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleMarkAsSent('upi')}
                className="btn-primary py-2 text-xs text-center"
              >
                Mark Paid (UPI)
              </button>
              <button
                type="button"
                onClick={() => handleMarkAsSent('cash')}
                className="btn-ghost py-2 text-xs text-center border-cw-border"
              >
                Paid in Cash
              </button>
            </div>
          )}

          {settlement.status === 'sent' && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-center text-xs text-blue-700 dark:text-blue-400 font-medium">
              You marked ₹{amount} as sent via {settlement.method.toUpperCase()}. Waiting for freelancer to confirm!
            </div>
          )}

          {settlement.status === 'confirmed' && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-center text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ Freelancer confirmed receipt of ₹{amount}!
            </div>
          )}
        </div>
      )}

      {/* Helpful Tip */}
      <p className="text-[10px] text-cw-text-3 text-center border-t border-cw-border/40 pt-2">
        Tip: You can also attach payment screenshots or QR images directly in the Workspace Chat below.
      </p>

      {/* Dynamic & Custom UPI QR Modal */}
      {showQrModal && displayQr && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-cw-surface border border-cw-border p-5 sm:p-6 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 text-cw-text-3 hover:text-cw-text-1 p-1.5 rounded-lg hover:bg-cw-bg-alt transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cw-text-3">
                Scan & Pay with any UPI App
              </span>
              <h3 className="text-2xl font-black text-cw-text-1 mt-0.5">₹{amount}</h3>
              <p className="text-xs text-cw-text-2 mt-0.5">
                Payee: <strong className="text-cw-text-1">{freelancer?.full_name || 'Freelancer'}</strong>
              </p>
            </div>

            {/* QR Image in high-contrast white card */}
            <div className="mx-auto w-52 h-52 sm:w-64 sm:h-64 bg-white p-3 rounded-2xl shadow-inner border border-gray-200 flex items-center justify-center">
              <img
                src={displayQr}
                alt={`UPI QR Code for ${freelancer?.full_name || 'Freelancer'}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* UPI ID with copy */}
            {activeUpi && (
              <div className="flex items-center justify-between bg-cw-bg-alt px-3 py-2 rounded-lg border border-cw-border text-xs">
                <span className="text-cw-text-3 text-[11px]">UPI ID:</span>
                <code className="font-mono font-bold text-cw-text-1 select-all">{activeUpi}</code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-cw-accent font-semibold text-[11px] hover:underline"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}

            {/* Supported PSP Badges */}
            <div className="text-[11px] text-cw-text-3 flex items-center justify-center gap-2 pt-1 border-t border-cw-border/60">
              <span>Google Pay</span> &bull;
              <span>PhonePe</span> &bull;
              <span>Paytm</span> &bull;
              <span>CRED / BHIM</span>
            </div>

            {/* Mobile direct link fallback & Mark Paid */}
            <div className="space-y-2 pt-2">
              {upiDeepLink && (
                <a
                  href={upiDeepLink}
                  className="btn-primary w-full py-2 text-xs text-center block font-semibold"
                >
                  ⚡ Open in UPI App (Mobile)
                </a>
              )}
              {isOwner && settlement.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => {
                    handleMarkAsSent('upi');
                    setShowQrModal(false);
                  }}
                  className="btn-ghost w-full py-1.5 text-xs border-cw-border"
                >
                  Mark as Paid via UPI
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
