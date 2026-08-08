import statsImage from "@/assets/by-the-numbers.png.asset.json";

export function Stats() {
  return (
    <section className="bg-black">
      <img
        src={statsImage.url}
        alt="By the numbers: 95% accuracy rate, 24h average delivery, 99.9% system uptime"
        loading="lazy"
        className="block w-full"
      />
    </section>
  );
}
