import pageAsset from "@/assets/credits-amount-page.png.asset.json";

export default function CreditsAmount({
  onContinue: _onContinue,
  onClose: _onClose,
}: {
  onContinue?: (credits: number) => void;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#050505]">
      <img
        src={pageAsset.url}
        alt="Choose how many Power Credits you want"
        className="h-auto w-full select-none"
      />
    </div>
  );
}
