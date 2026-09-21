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
    <span className={`${className} block text-sm font-bold amt-red`}>
      {text}
    </span>
  );
}

export function AllDesignationNotice({ className }: { className?: string }) {
  return <DesignationNotice names={ALL_DESIGNATION_NAMES} className={className} />;
}
