/**
 * Print rules for the monitor only (it doubles as the A4 sample pack). Scoped with :has(.mon-page) so no other page
 * changes when printed. Site chrome (header, footer, market strip) already carries .no-print.
 */
const css = `
@page { size: A4; margin: 11mm 11mm 12mm; }
@media print {
  html:has(.mon-page) {
    --paper: #ffffff; --paper-2: #f1f2f0; --paper-3: #e4e6e2; --surface: #ffffff;
    --ink: #121826; --ink-soft: #3b4354; --muted: #5a6273; --forest: #26335a;
    --gold: #5b3fd6; --rule: #cfd3cd; --brand-accent: #5b3fd6;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  html:has(.mon-page) body { background: #fff; }
  #main:has(.mon-page) > :not(.mon-page) { display: none !important; }
  .mon-page nav[aria-label="Breadcrumb"] { display: none; }
  .mon-page > div { max-width: none; padding: 0; }
  .mon-page header { margin-top: 0 !important; gap: 0 !important; display: block !important; }
  .mon-page h1 { font-size: 20pt !important; margin-top: 1mm !important; line-height: 1.1 !important; }
  .mon-page header p, .mon-page header div { font-size: 8.6pt; line-height: 1.4; }
  .mon-page header > div + div { margin-top: 2.5mm; }
  .mon-page header .max-w-2xl { max-width: none; margin-top: 2mm; }
  .mon-page .mt-10 { margin-top: 4mm; }
  .mon-page h2 { font-size: 12.5pt !important; }
  .mon-page h3 { font-size: 11pt !important; }
  .mon-page .border-b.pb-3 { padding-bottom: 1.2mm; }
  .mon-block { margin-top: 5mm !important; }
  .mon-scroll { overflow: visible !important; margin-top: 1.5mm !important; }
  .mon-table { font-size: 7.4pt; }
  .mon-table th, .mon-table td { padding: 0.7mm 1.2mm; line-height: 1.25; }
  .mon-table td, .mon-table td.mon-bond { font-size: 7.4pt !important; }
  .mon-table th { white-space: normal; font-size: 6.8pt; line-height: 1.2; }
  .mon-table td .text-\\[11px\\] { font-size: 6.4pt; line-height: 1.2; }
  .mon-table tr { break-inside: avoid; }
  .mon-mini td.mon-bond { max-width: 22mm; }
  .mon-arrow { display: none; }
  .mon-sections { display: block !important; columns: 2 !important; column-gap: 6mm !important; margin-top: 2mm !important; }
  .mon-sections > * + * { margin-top: 0 !important; }
  .mon-section { break-inside: avoid; margin-bottom: 0 !important; padding-bottom: 3.5mm; }
  .mon-section p { font-size: 7pt !important; line-height: 1.35 !important; margin-top: 0.8mm !important; }
  .mon-section .mt-3 { margin-top: 1.6mm; }
  .mon-section p.text-\\[13px\\] { font-size: 7.6pt !important; }
  .mon-page-break { break-before: page; }
  .mon-foot { gap: 6mm !important; padding-top: 3mm !important; }
  .mon-foot p, .mon-foot code, .mon-foot a, .mon-foot li { font-size: 7.4pt !important; line-height: 1.4 !important; }
  .mon-print-only { display: block !important; }
}
`;

export function PrintStyles() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
