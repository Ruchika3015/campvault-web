import { useState } from 'react';
import {
  HandCoins,
  X,
  Send,
  IndianRupee,
} from 'lucide-react';

export function BargainModal({
  item,
  onClose,
  onSend,
}) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const posterName =
    item?.poster?.name ||
    item?.creator?.name ||
    item?.poster_name ||
    item?.posterName ||
    item?.user?.name ||
    item?.owner?.name ||
    'Student';

  const jugaadId =
    item?.id ??
    item?.jugaad_id ??
    item?.jugaadId;

  const handleSendOffer = async () => {
    setError('');

    if (!jugaadId) {
      setError('Jugaad ID is missing.');
      console.error('BARGAIN: Jugaad ID missing:', item);
      return;
    }

    if (!amount) {
      setError('Please enter your proposed amount.');
      return;
    }

    const proposedPrice = Number(amount);

    if (!Number.isFinite(proposedPrice) || proposedPrice <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    /*
     * The backend requires proposal_message.
     *
     * If the user leaves the optional message empty,
     * we still send a useful bargain message.
     */
    const proposalMessage =
      message.trim() ||
      `I would like to offer ₹${proposedPrice} for this Jugaad.`;

    try {
      setSending(true);

      const payload = {
        item,
        jugaadId,

        proposal_message: proposalMessage,

        proposed_price: proposedPrice,

        estimated_completion: null,
      };

      console.log(
        'BARGAIN - SENDING PROPOSAL:',
        payload
      );

      if (!onSend) {
        throw new Error(
          'Bargain submission handler is not connected.'
        );
      }

      await onSend(payload);

      console.log(
        'BARGAIN - PROPOSAL SENT SUCCESSFULLY'
      );

      setSent(true);
    } catch (err) {
      console.error(
        'BARGAIN - FAILED TO SEND PROPOSAL:',
        err
      );

      setError(
        err?.message ||
          'Unable to send bargain offer. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="workshop-overlay"
      onClick={onClose}
    >
      <div
        className="workshop-panel surface-metal-brushed rounded-2xl p-6 w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-ink-3 hover:text-ink-0"
        >
          <X size={17} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="mx-auto grid place-items-center w-14 h-14 rounded-full bg-mint/15 text-mint mb-4">
              <Send size={23} />
            </div>

            <p className="font-display text-2xl">
              OFFER SENT
            </p>

            <p className="font-mono text-[10px] text-ink-2 mt-2">
              {posterName} will see your proposal in
              their requests.
            </p>

            <button
              onClick={onClose}
              className="machine-control machine-control--ghost mt-6"
            >
              <span className="ctrl-led" />
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="flex items-center gap-3 border-b border-metal-1/40 pb-4 mb-5">
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-amber/10 text-amber">
                <HandCoins size={19} />
              </span>

              <div>
                <p className="font-technical text-[10px]">
                  BARGAIN / NEGOTIATE
                </p>

                <p className="font-mono text-[9px] text-ink-3 mt-1">
                  {item?.title || 'Jugaad'}
                </p>
              </div>
            </div>

            {/* CURRENT AMOUNT */}
            <div className="surface-panel rounded-xl p-4 mb-4">
              <p className="font-technical text-[8px] text-ink-3">
                CURRENT AMOUNT
              </p>

              <p className="font-display text-3xl text-amber mt-1">
                ₹{item?.amount ?? 0}
              </p>
            </div>

            {/* PROPOSED AMOUNT */}
            <label className="font-technical text-[8px] text-ink-2 block mb-2">
              YOUR PROPOSED AMOUNT
            </label>

            <div className="flex items-center rounded-lg bg-bg-1 border border-metal-1 mb-4">
              <IndianRupee
                size={14}
                className="ml-3 text-ink-3"
              />

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="650"
                className="w-full bg-transparent px-2 py-3 font-mono text-sm outline-none"
                disabled={sending}
              />
            </div>

            {/* MESSAGE */}
            <label className="font-technical text-[8px] text-ink-2 block mb-2">
              OPTIONAL MESSAGE
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              rows={3}
              placeholder="Add a short note to the poster"
              className="w-full rounded-lg bg-bg-1 border border-metal-1 p-3 font-mono text-xs outline-none resize-none mb-5"
              disabled={sending}
            />

            {/* ERROR */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}

            {/* SEND */}
            <button
              disabled={!amount || sending}
              onClick={handleSendOffer}
              className="machine-control machine-control--primary w-full justify-center disabled:opacity-40"
            >
              <span className="ctrl-led" />

              <Send size={13} />

              {sending
                ? 'SENDING...'
                : 'SEND OFFER'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BargainModal;