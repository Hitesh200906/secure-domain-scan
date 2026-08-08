import statsImage from "@/assets/by-the-numbers-v2.png.asset.json";

export function Stats() {
  return (
    <section className="relative w-full bg-black">
      <img
        src={statsImage.url}
        alt="By the numbers"
        loading="lazy"
        className="block w-full h-auto"
      />
    </section>
  );
}
