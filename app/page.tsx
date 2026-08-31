import LabFrame from '@/components/LabFrame';
import UsernameForm from '@/components/UsernameForm';
import SpecimenBanner from '@/components/SpecimenBanner';
import { QUESTION_COUNT } from '@/lib/questions';

export default function LandingPage() {
  return (
    <LabFrame status="INTAKE OPEN">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-12 sm:px-8 lg:py-14">
        {/* Masthead banner */}
        <SpecimenBanner />

        {/* Hero */}
        <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* Left: the pitch */}
          <div className="flex flex-col">
            <div className="mb-5 flex items-center gap-3">
              <span className="lab-label text-faint">FIG. 01</span>
              <span className="h-px w-8 bg-line" />
              <span className="lab-label text-ash">BEHAVIORAL STUDY / SUBJECTS: CT</span>
            </div>

            <h1 className="font-display text-[2.7rem] font-bold leading-[0.98] tracking-tight text-balance sm:text-6xl">
              THE CT HUMAN
              <br />
              <span className="text-ash">EXPERIMENT</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-snug text-bone text-balance">
              We&apos;ve studied the timeline. Now let&apos;s study you.
            </p>

            <p className="mt-3 max-w-md font-mono text-[12px] leading-relaxed text-ash">
              {QUESTION_COUNT} questions. No correct answers. Your CT personality
              will be judged.
            </p>

            <div className="mt-8 lg:hidden">
              <UsernameForm />
            </div>

            {/* Experimental spec strip */}
            <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden border border-line bg-line text-center">
              {[
                ['METHOD', 'SELF-REPORT'],
                ['DIMENSIONS', '12 HIDDEN'],
                ['OUTPUT', '1 DIAGNOSIS'],
              ].map(([k, v]) => (
                <div key={k} className="bg-ink px-2 py-4">
                  <dt className="lab-label text-faint">{k}</dt>
                  <dd className="mt-1.5 font-mono text-[12px] text-bone">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: the intake form (desktop) */}
          <div className="hidden lg:flex lg:flex-col lg:justify-center lg:pt-2">
            <UsernameForm />
          </div>
        </div>
      </section>
    </LabFrame>
  );
}
