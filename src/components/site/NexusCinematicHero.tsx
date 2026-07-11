import { ModeToggle } from "./ModeToggle";

/* ================================================================
   HERO — cleared. Blank foundation ready for the new animation.
   Only the mode switching buttons remain.
   ================================================================ */

export function NexusCinematicHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-16 sm:pb-24 min-h-[100svh]">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 sm:px-6 min-h-[70svh]">
        {/* Switching buttons (preserved) */}
        <div className="flex justify-center">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
