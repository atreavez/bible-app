import ornament from "@/assets/ornament-divider.png";

export default function OrnamentDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <img
        src={ornament}
        alt=""
        className="w-48 md:w-64 opacity-60"
        loading="lazy"
        width={1024}
        height={512}
      />
    </div>
  );
}
