import { TitleCollapse } from "@/components/accordion";
import { Cite } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import {
  IRC_1035_ALLOWED,
  IRC_1035_INTRO,
  IRC_1035_RULES,
  IRC_1035_TITLE,
} from "@/lib/ltc-tax";

export const IRC_1035_ANCHOR = "irc-1035";

export function LinkTo1035({ onOpen }: { onOpen?: () => void }) {
  return (
    <a
      href={`#${IRC_1035_ANCHOR}`}
      className="source-link font-semibold text-link underline underline-offset-2 hover:text-link"
      onClick={(e) => {
        e.preventDefault();
        onOpen?.();
        window.setTimeout(() => {
          document.getElementById(IRC_1035_ANCHOR)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 250);
      }}
    >
      1035 tax exchange
    </a>
  );
}

export function Irc1035Panel() {
  return (
    <div id={IRC_1035_ANCHOR} className="mt-4 scroll-mt-6 text-sm text-muted">
      <p className="font-display text-lg text-navy">{IRC_1035_TITLE}</p>
      <p className="mt-2">
        {IRC_1035_INTRO} Source:{" "}
        <Cite href={SRC.irc1035}>26 U.S.C. §1035</Cite>; qualified contract definition{" "}
        <Cite href={SRC.irc7702b}>IRC §7702B</Cite>.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">From</th>
              <th className="py-2 pr-2">To</th>
              <th className="py-2">1035?</th>
            </tr>
          </thead>
          <tbody>
            {IRC_1035_ALLOWED.map((r) => (
              <tr key={`${r.from}-${r.to}`} className="border-t border-line align-top">
                <td className="py-1.5 pr-2">{r.from}</td>
                <td className="py-1.5 pr-2">{r.to}</td>
                <td className={`py-1.5 font-semibold ${r.ok ? "text-navy" : "text-deplete"}`}>
                  {r.ok ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {IRC_1035_RULES.map((p) => (
        <TitleCollapse key={p.heading} title={p.heading} className="mt-2">
          <p>{p.body}</p>
        </TitleCollapse>
      ))}
      <p className="mt-3 text-xs">
        Direction of travel matters: you can move toward an annuity or qualified LTC; you
        cannot 1035 an annuity or stand-alone QLTC into life insurance. Confirm the
        receiving carrier will accept a 1035, that the new contract is tax-qualified, and
        the tax result with a CPA or enrolled agent. This model does not process an
        exchange or compute basis.
      </p>
    </div>
  );
}