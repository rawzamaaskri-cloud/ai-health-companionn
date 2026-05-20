import logo from "@/assets/logo.png";

export function Logo({ size = 40, withText = false }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <img src={logo} alt="AIsanté" width={size} height={size} className="rounded-md" />
      {withText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          AI<span className="text-primary">santé</span>
        </span>
      )}
    </div>
  );
}
