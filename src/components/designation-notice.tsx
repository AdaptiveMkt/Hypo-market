import {
  ALL_DESIGNATION_NAMES,
  designationNonEndorsement,
} from "@/lib/designations";

export function DesignationNotice({
  names,
  className = "mt-2",
}: {
  names: string[];
  className?: string;
}) {
  const text = designationNonEndorsement(names);
  if (!text) return null;
  return (
    <p className={`${className} block w-full max-w-none text-sm font-bold leading-snug amt-red`}>
      {text}
    </p>
  );
}

export function AllDesignationNotice({ className }: { className?: string }) {
  return <DesignationNotice names={ALL_DESIGNATION_NAMES} className={className} />;
}
