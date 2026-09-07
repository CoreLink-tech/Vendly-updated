import { landing } from '@/lib/landing-theme';

// The logo's own green + orange, as a two-tone blob backdrop. Used behind
// every character illustration on the site so the treatment is consistent
// rather than one-off to the hero.
export function ImageBlob() {
  return (
    <>
      <div
        className="absolute rounded-[45%_55%_60%_40%/50%_45%_55%_50%]"
        style={{
          backgroundColor: landing.green,
          width: '78%',
          height: '78%',
          right: '2%',
          bottom: '4%',
        }}
      />
      <div
        className="absolute rounded-[55%_45%_40%_60%/45%_55%_45%_55%]"
        style={{
          backgroundColor: landing.orange,
          width: '38%',
          height: '38%',
          left: '4%',
          bottom: '0%',
          opacity: 0.9,
        }}
      />
    </>
  );
}
