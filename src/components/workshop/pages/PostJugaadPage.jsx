import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { JUGAAD_CATEGORIES } from '@/data/jugaadMockData';
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
      setError('Please enter a Jugaad title.');
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

    const payload = {
      title: form.title.trim(),

      description: form.description.trim(),

      category: form.category.trim(),

      required_skills: form.skill
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),

      budget,

      // Convert Date to ISO STRING.
      // Example:
      // "2026-11-21T18:29:59.999Z"
      deadline: deadlineDate.toISOString(),

      priority: 'medium',
    };

    console.log(
      'Creating Jugaad with payload:',
      payload
    );

    setSubmitting(true);

    try {
      const response = await api.createJugaad(payload);

      console.log(
        'Jugaad created successfully:',
        response
      );

      setDone(true);
    } catch (err) {
      console.error(
        'Create Jugaad error:',
        err
      );

      const backendMessage =
        err?.message ||
        err?.data?.message ||
        err?.data?.error;

      setError(
        backendMessage ||
          'Failed to post Jugaad. Please try again.'
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

        <p className="font-display text-3xl">
          JUGAAD POSTED
        </p>

        <p className="font-mono text-xs text-ink-2 mt-3">
          Your opportunity is now available to students
          with matching skills.
        </p>

        <div className="flex justify-center gap-3 mt-7">
          <Link
            to="/dashboard/my-jugaads"
            className="machine-control machine-control--primary"
          >
            <span className="ctrl-led" />
            VIEW MY JUGAADS
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

          <span className="font-technical text-[9px] text-ink-2">
            03 — DROP BOX
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl">
          POST A
          <br />
          <span className="text-mint">
            JUGAAD.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Tell the campus what you need. Students with
          the right skills can discover it, show interest,
          or make you an offer.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="surface-metal-brushed rounded-2xl p-5 sm:p-8 max-w-3xl"
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
          label="JUGAAD TITLE"
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

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="font-technical text-[8px] text-ink-2 block mb-2">
              REQUIRED CATEGORY
            </label>

            <div className="flex flex-wrap gap-1.5">
              {JUGAAD_CATEGORIES.map(
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
                    className={`px-2.5 py-2 rounded-md font-technical text-[8px] ${
                      form.category === category
                        ? 'bg-amber text-bg-0'
                        : 'bg-bg-2 text-ink-3 border border-metal-1'
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

        <div className="grid sm:grid-cols-2 gap-5 mt-5">
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
            <label className="font-technical text-[8px] text-ink-2 block mb-2">
              DEADLINE
            </label>

            <div
              className={`flex items-center rounded-lg bg-bg-1 border ${
                error &&
                (!form.deadline ||
                  !getDeadlineDate(
                    form.deadline
                  ))
                  ? 'border-coral/60'
                  : 'border-metal-1'
              }`}
            >
              <CalendarDays
                size={14}
                className="ml-3 text-ink-3 shrink-0"
              />

              <input
                type="text"
                value={form.deadline}
                onChange={handleDeadlineChange}
                placeholder="DD-MM-YYYY"
                maxLength={10}
                inputMode="numeric"
                autoComplete="off"
                className="w-full bg-transparent px-2 py-3 font-mono text-xs outline-none text-ink-0 placeholder:text-ink-3/50"
              />
            </div>

            <p className="font-mono text-[8px] text-ink-3 mt-2">
              Enter a future date as DD-MM-YYYY
            </p>
          </div>
        </div>

        {/* ============================================================
            SUBMIT
        ============================================================ */}

        <div className="mt-6 pt-5 border-t border-metal-1/40 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="machine-control machine-control--primary disabled:opacity-50"
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
      <label className="font-technical text-[8px] text-ink-2 block mb-2">
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
          className="w-full rounded-lg bg-bg-1 border border-metal-1 p-3 font-mono text-xs outline-none resize-none text-ink-0 placeholder:text-ink-3/50"
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
          className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-3 font-mono text-xs outline-none text-ink-0 placeholder:text-ink-3/50"
        />
      )}
    </div>
  );
}