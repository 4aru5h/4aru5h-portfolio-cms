import { EDUCATION, EXPERIENCE, IDENTITY, PROJECTS, SKILL_GROUPS } from '../data/portfolio';

/**
 * Builds a one-page, ATS-friendly résumé PDF from the same data the site renders,
 * so the résumé can never drift out of date. jsPDF is loaded only on click.
 */

const PAGE_W = 595.28; // A4 in pt
const PAGE_H = 841.89;
const MARGIN_X = 46;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 34;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const INK: [number, number, number] = [17, 17, 17];
const MUTED: [number, number, number] = [88, 88, 84];
const ACCENT: [number, number, number] = [10, 122, 74];
const RULE: [number, number, number] = [210, 210, 204];

/** Standard PDF fonts only cover WinAnsi; map anything outside it to safe ASCII. */
function clean(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, '->')
    .replace(/–/g, '-')
    .replace(/—/g, ' - ')
    .replace(/·/g, '|');
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}

type JsPDFCtor = typeof import('jspdf').jsPDF;

/** Lays out the résumé and returns the document (exported so it can be tested outside the browser). */
export function buildResume(JsPDF: JsPDFCtor) {
  const doc = new JsPDF({ unit: 'pt', format: 'a4', compress: true });

  doc.setProperties({
    title: `${IDENTITY.name} - Résumé`,
    subject: IDENTITY.role,
    author: IDENTITY.name,
    keywords: 'security engineer, offensive security, compilers, systems, résumé',
    creator: IDENTITY.liveSite,
  });

  let y = MARGIN_TOP;

  const ensure = (needed: number) => {
    if (y + needed > PAGE_H - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
  };

  const setFont = (style: 'normal' | 'bold', size: number, color: [number, number, number] = INK) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const paragraph = (text: string, size = 9.2, color = INK, indent = 0, lead = 1.32) => {
    setFont('normal', size, color);
    const lines = doc.splitTextToSize(clean(text), CONTENT_W - indent) as string[];
    const lh = size * lead;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, MARGIN_X + indent, y + size);
      y += lh;
    }
  };

  const bullet = (text: string) => {
    const size = 9;
    setFont('normal', size, INK);
    const lines = doc.splitTextToSize(clean(text), CONTENT_W - 12) as string[];
    const lh = size * 1.3;
    ensure(lh);
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN_X + 2, y + size - 4.2, 2.6, 2.6, 'F');
    for (const line of lines) {
      ensure(lh);
      doc.text(line, MARGIN_X + 12, y + size);
      y += lh;
    }
  };

  const heading = (label: string) => {
    ensure(34);
    y += 7;
    setFont('bold', 8.6, ACCENT);
    doc.text(label.toUpperCase(), MARGIN_X, y + 8.6, { charSpace: 1.1 });
    y += 13;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.6);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 6;
  };

  /** Bold title (+ optional muted qualifier), muted right-aligned meta on the same baseline. */
  const titleRow = (left: string, right: string, sub?: string, qualifier?: string) => {
    ensure(26);
    setFont('bold', 10.2, INK);
    doc.text(clean(left), MARGIN_X, y + 10.2);
    if (qualifier) {
      const lw = doc.getTextWidth(clean(left));
      setFont('normal', 9.4, MUTED);
      doc.text(clean(`  -  ${qualifier}`), MARGIN_X + lw, y + 10.2);
    }
    setFont('normal', 8.8, MUTED);
    doc.text(clean(right), PAGE_W - MARGIN_X, y + 10.2, { align: 'right' });
    y += 14;
    if (sub) {
      setFont('normal', 9, MUTED);
      doc.text(clean(sub), MARGIN_X, y + 9);
      y += 12.5;
    }
  };

  // ---- Header -------------------------------------------------------------
  setFont('bold', 22, INK);
  doc.text(IDENTITY.name, MARGIN_X, y + 20);
  y += 28;
  setFont('normal', 10, MUTED);
  doc.text(clean(`${IDENTITY.role}  ·  ${IDENTITY.location}`), MARGIN_X, y + 10);
  y += 17;

  const contacts: { label: string; url: string }[] = [
    { label: IDENTITY.email, url: `mailto:${IDENTITY.email}` },
    { label: stripProtocol(IDENTITY.github), url: IDENTITY.github },
    { label: stripProtocol(IDENTITY.linkedin), url: IDENTITY.linkedin },
    { label: stripProtocol(IDENTITY.liveSite), url: IDENTITY.liveSite },
  ];
  setFont('normal', 9, ACCENT);
  let cx = MARGIN_X;
  contacts.forEach((c, i) => {
    doc.textWithLink(c.label, cx, y + 9, { url: c.url });
    cx += doc.getTextWidth(c.label);
    if (i < contacts.length - 1) {
      doc.setTextColor(...RULE);
      doc.text('   |   ', cx, y + 9);
      cx += doc.getTextWidth('   |   ');
      doc.setTextColor(...ACCENT);
    }
  });
  y += 14;

  // ---- Summary ------------------------------------------------------------
  heading('Profile');
  paragraph(IDENTITY.resumeSummary);

  // ---- Education ----------------------------------------------------------
  heading('Education');
  titleRow(EDUCATION.degree, EDUCATION.period, `${EDUCATION.school}, ${EDUCATION.location}`);

  // ---- Projects -----------------------------------------------------------
  heading('Projects');
  PROJECTS.forEach((p, i) => {
    if (i > 0) y += 4;
    titleRow(p.title, p.year, undefined, p.domain.replace(/ · /g, ', '));
    p.highlights.forEach(bullet);
    setFont('normal', 8.6, MUTED);
    const links = [stripProtocol(p.repoUrl), p.liveUrl ? stripProtocol(p.liveUrl) : null]
      .filter(Boolean)
      .join('   |   ');
    paragraph(`Stack: ${p.stack.join(', ')}   |   ${links}`, 8.4, MUTED, 12);
  });

  // ---- Experience ---------------------------------------------------------
  heading('Experience');
  EXPERIENCE.forEach((e, i) => {
    if (i > 0) y += 4;
    titleRow(`${e.role}  ·  ${e.org}`, `${e.period}  |  ${e.location}`);
    e.highlights.slice(0, 2).forEach(bullet);
  });

  // ---- Skills -------------------------------------------------------------
  heading('Skills');
  SKILL_GROUPS.forEach((g) => {
    const size = 9;
    setFont('bold', size, INK);
    const label = `${g.title}: `;
    const labelW = doc.getTextWidth(label);
    ensure(size * 1.35);
    doc.text(label, MARGIN_X, y + size);
    setFont('normal', size, INK);
    const lines = doc.splitTextToSize(clean(g.items.join(', ')), CONTENT_W - labelW) as string[];
    lines.forEach((line, li) => {
      if (li > 0) ensure(size * 1.35);
      doc.text(line, MARGIN_X + labelW, y + size);
      y += size * 1.35;
    });
  });

  return doc;
}

export async function downloadResume(): Promise<void> {
  const { jsPDF } = await import('jspdf');
  buildResume(jsPDF).save('Aarush-Sharma-Resume.pdf');
}
