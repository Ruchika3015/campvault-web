import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
const GIG_CATEGORIES = [
  'Development',
  'Design',
  'Academics',
  'Content & Media',
  'Hardware & Electronics',
  'Events & Organization',
  'Marketing & Outreach',
  'Other',
];

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  CalendarDays,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export function PostJugaadPage() {
  const { isDemoMode } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    skill: '',
    amount: '',
    deadline: '',
  });

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ================================================================
  // UPDATE FORM
  // ================================================================

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ================================================================
  // CONVERT DD-MM-YYYY TO DATE
  //
  // Example:
  // 21-11-2026
  // ->
  // Date object representing 21 November 2026, 23:59:59.999
  // ================================================================

  const getDeadlineDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const value = dateValue.trim();

    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (!match) {
      return null;
    }

    const [, dayString, monthString, yearString] = match;

    const day = Number(dayString);
    const month = Number(monthString);
    const year = Number(yearString);

    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year)
    ) {
      return null;
    }

    if (month < 1 || month > 12) {
      return null;
    }

    if (day < 1 || day > 31) {
      return null;
    }

    const date = new Date(
      year,
      month - 1,
      day,
      23,
      59,
      59,
      999
    );

    // Prevent invalid dates such as:
    // 31-02-2026
    // 32-08-2026
    // etc.

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  // ================================================================
  // FORMAT DEADLINE INPUT
  //
  // User types:
  // 21112026
  //
  // It becomes:
  // 21-11-2026
  // ================================================================

  const handleDeadlineChange = (event) => {
    let value = event.target.value;

    // Only numbers
    value = value.replace(/\D/g, '');

    // Maximum DDMMYYYY = 8 digits
    value = value.slice(0, 8);

    if (value.length >= 5) {
      value =
        value.slice(0, 2) +
        '-' +
        value.slice(2, 4) +
        '-' +
        value.slice(4);
    } else if (value.length >= 3) {
      value =
        value.slice(0, 2) +
        '-' +
        value.slice(2);
    }

    update('deadline', value);

    // Clear old error while typing
    if (error) {
      setError('');
    }
  };

  // ================================================================
  // SUBMIT
  // ================================================================

  const submit = async (event) => {
    event.preventDefault();

    setError('');

    // --------------------------------------------------------------
    // TITLE
    // --------------------------------------------------------------

    if (!form.title.trim()) {
      setError('Please enter a gig title.');
      return;
    }

    // --------------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------------

    if (!form.description.trim()) {
      setError('Please enter a description.');
      return;
    }

    // --------------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------------

    if (!form.category) {
      setError('Please select a category.');
      return;
    }

    // --------------------------------------------------------------
    // REQUIRED SKILL
    // --------------------------------------------------------------

    if (!form.skill.trim()) {
      setError('Please enter the required skill.');
      return;
    }

    // --------------------------------------------------------------
    // BUDGET
    // --------------------------------------------------------------

    const budget = Number(form.amount);

    if (!form.amount.trim()) {
      setError('Please enter a budget.');
      return;
    }

    if (!Number.isFinite(budget)) {
      setError('Please enter a valid budget.');
      return;
    }

    if (budget <= 0) {
      setError('Budget must be greater than 0.');
      return;
    }

    // --------------------------------------------------------------
    // DEADLINE
    // --------------------------------------------------------------

    if (!form.deadline.trim()) {
      setError('Please enter a deadline.');
      return;
    }

    const deadlineDate = getDeadlineDate(form.deadline);

    if (!deadlineDate) {
      setError(
        'Please enter a valid deadline in DD-MM-YYYY format.'
      );
      return;
    }

    if (deadlineDate.getTime() <= Date.now()) {
      setError('Deadline must be a future date.');
      return;
    }

    // --------------------------------------------------------------
    // DEMO MODE
    // --------------------------------------------------------------

    if (isDemoMode) {
      setDone(true);
      return;
    }

    // --------------------------------------------------------------
    // CREATE BACKEND PAYLOAD
    //
    // IMPORTANT:
    //
    // Backend expects:
    //
    // title
    // description
    // category
    // required_skills
    // budget
    // deadline -> STRING
    // priority
    //
    // NOT:
    //
    // skillRequired
    // amount
    // deadline -> number
    // --------------------------------------------------------------

    const year = deadlineDate.getFullYear();
    const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
    const day = String(deadlineDate.getDate()).padStart(2, '0');
    const formattedDeadline = `${year}-${month}-${day}`;

    const skillsArray = form.skill
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      skillsRequired: skillsArray,
      required_skills: skillsArray,
      budget,
      deadline: formattedDeadline,
    };

    console.log(
      'Creating Jugaad with payload:',
      payload
    );

    setSubmitting(true);

    try {
      const response = await api.createGig(payload);

      console.log(
        'Gig created successfully:',
        response
      );

      setDone(true);
    } catch (err) {
      console.error(
        'Create gig error:',
        err
      );

      const backendMessage =
        err?.message ||
        err?.data?.message ||
        err?.data?.error;

      setError(
        backendMessage ||
          'Failed to post gig. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================================================================
  // SUCCESS SCREEN
  // ================================================================

  if (done) {
    return (
      <div className="pt-20 max-w-xl mx-auto text-center">
        <div className="mx-auto grid place-items-center w-20 h-20 rounded-2xl bg-mint/15 text-mint mb-5">
          <CheckCircle2 size={35} />
        </div>

        <h1 className="font-display text-4xl mb-3">
          GIG POSTED
        </h1>

        <p className="font-mono text-sm text-ink-2 max-w-sm mb-7">
          Your requirement is live. Campus peers can now view and apply.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <Link
            to="/dashboard/my-gigs"
            className="px-5 py-2.5 rounded-xl font-display text-xs bg-amber text-bg-0 hover:brightness-110 transition-all"
          >
            VIEW MY GIGS
          </Link>

          <button
            type="button"
            onClick={() => {
              setDone(false);

              setForm({
                title: '',
                description: '',
                category: '',
                skill: '',
                amount: '',
                deadline: '',
              });

              setError('');
            }}
            className="machine-control machine-control--ghost"
          >
            <span className="ctrl-led" />
            POST ANOTHER
          </button>
        </div>
      </div>
    );
  }

  // ================================================================
  // MAIN PAGE
  // ================================================================

  return (
    <div>
      <section className="pt-12 pb-7">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5"
        >
          <ArrowLeft size={12} />
          BACK TO WORKSPACE
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <LED
            color="mint"
            pulse
            size={7}
          />

          <span className="font-technical text-[10px] font-bold text-ink-0 tracking-wider">
            03 — DROP BOX
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl mb-2">
          POST A
          <br />
          <span className="text-mint">
            GIG.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm sm:text-base text-ink-1 font-medium leading-relaxed">
          Tell the campus what you need. Students with
          the right skills can discover it, show interest,
          or make you an offer.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="surface-metal-brushed rounded-2xl p-6 sm:p-8 max-w-3xl border-2 border-metal-2 shadow-md"
      >
        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="flex items-center gap-2 surface-panel rounded-lg p-3 mb-5 border border-coral/40">
            <AlertTriangle
              size={15}
              className="text-coral shrink-0"
            />

            <span className="font-mono text-xs text-coral-soft">
              {error}
            </span>
          </div>
        )}

        {/* ============================================================
            TITLE
        ============================================================ */}

        <Field
          label="GIG TITLE"
          value={form.title}
          onChange={(value) =>
            update('title', value)
          }
          placeholder="e.g. Need a React Developer"
        />

        {/* ============================================================
            DESCRIPTION
        ============================================================ */}

        <Field
          label="DESCRIPTION"
          value={form.description}
          onChange={(value) =>
            update('description', value)
          }
          placeholder="Describe what you need, expected output, and useful context."
          area
        />

        {/* ============================================================
            CATEGORY + SKILL
        ============================================================ */}

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="font-technical text-[10px] sm:text-[11px] font-bold text-ink-0 tracking-wider block mb-2">
              REQUIRED CATEGORY
            </label>

            <div className="flex flex-wrap gap-2">
              {GIG_CATEGORIES.map(
                (category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => {
                      update(
                        'category',
                        category
                      );
                      setError('');
                    }}
                    className={`px-3 py-2 rounded-lg font-technical text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all shadow-sm ${
                      form.category === category
                        ? 'bg-amber text-bg-0 border-2 border-amber font-extrabold shadow'
                        : 'bg-bg-1 text-ink-0 border-2 border-metal-2 hover:border-ink-0 hover:bg-bg-2'
                    }`}
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>

          <Field
            label="REQUIRED SKILL"
            value={form.skill}
            onChange={(value) =>
              update('skill', value)
            }
            placeholder="e.g. React, Photoshop"
          />
        </div>

        {/* ============================================================
            BUDGET + DEADLINE
        ============================================================ */}

        <div className="grid sm:grid-cols-2 gap-6 mt-6">
          {/* BUDGET */}

          <Field
            label="AMOUNT / BUDGET (₹)"
            value={form.amount}
            onChange={(value) =>
              update('amount', value)
            }
            placeholder="500"
            type="number"
            min="1"
            step="0.01"
          />

          {/* DEADLINE */}

          <div>
            <label className="font-technical text-[10px] sm:text-[11px] font-bold text-ink-0 tracking-wider block mb-2">
              DEADLINE
            </label>

            <div
              className={`flex items-center rounded-lg bg-bg-1 border-2 shadow-sm transition-all ${
                error &&
                (!form.deadline ||
                  !getDeadlineDate(
                    form.deadline
                  ))
                  ? 'border-coral'
                  : 'border-metal-2 focus-within:border-amber focus-within:ring-1 focus-within:ring-amber/30'
              }`}
            >
              <CalendarDays
                size={16}
                className="ml-3.5 text-ink-1 shrink-0"
              />

              <input
                type="text"
                value={form.deadline}
                onChange={handleDeadlineChange}
                placeholder="DD-MM-YYYY"
                maxLength={10}
                inputMode="numeric"
                autoComplete="off"
                className="w-full bg-transparent px-3 py-3 font-mono text-xs outline-none text-ink-0 font-medium placeholder:text-ink-3/80"
              />
            </div>

            <p className="font-mono text-[9px] text-ink-1 font-medium mt-2">
              Enter a future date as DD-MM-YYYY
            </p>
          </div>
        </div>

        {/* ============================================================
            SUBMIT
        ============================================================ */}

        <div className="mt-8 pt-6 border-t-2 border-metal-2/60 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="machine-control machine-control--primary disabled:opacity-50 font-bold"
          >
            <span className="ctrl-led" />

            {submitting ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                POSTING...
              </>
            ) : (
              <>
                <Plus size={14} />
                DROP INTO EXCHANGE
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ================================================================
// REUSABLE FIELD
// ================================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  area = false,
  type = 'text',
  min,
  step,
}) {
  return (
    <div className="mb-5">
      <label className="font-technical text-[10px] sm:text-[11px] font-bold text-ink-0 tracking-wider block mb-2">
        {label}
      </label>

      {area ? (
        <textarea
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          rows={5}
          className="w-full rounded-lg bg-bg-1 border-2 border-metal-2 p-3.5 font-mono text-xs outline-none resize-none text-ink-0 font-medium placeholder:text-ink-3/80 focus:border-amber focus:ring-1 focus:ring-amber/30 transition-all shadow-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          min={min}
          step={step}
          className="w-full rounded-lg bg-bg-1 border-2 border-metal-2 px-3.5 py-3 font-mono text-xs outline-none text-ink-0 font-medium placeholder:text-ink-3/80 focus:border-amber focus:ring-1 focus:ring-amber/30 transition-all shadow-sm"
        />
      )}
    </div>
  );
}

export const PostGigPage = PostJugaadPage;
export default PostJugaadPage;