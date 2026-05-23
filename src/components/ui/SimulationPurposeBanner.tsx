interface SimulationPurposeBannerProps {
  text?: string;
}

export function SimulationPurposeBanner({
  text = 'Educational simulation only. Outputs are conceptual and do not constitute regulated financial advice.',
}: SimulationPurposeBannerProps) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4">
      <p className="text-xs sm:text-sm text-indigo-800">
        <span className="font-semibold">Simulation Notice:</span> {text}
      </p>
    </div>
  );
}

export default SimulationPurposeBanner;

