import { divide } from '../divide';
import { convert } from '../asciidoc';

describe('divide()', () => {

  let spec;

  beforeEach(() => {
    spec = {
      html: '',
      config: {},
    };
  });

  it('divides by chapters', () => {
    spec.html = convert('== Ch1\n\nPara1.\n\n== Ch2\n\nPara2.\n');
    const sections = divide(spec);

    expect(sections.length).toBe(2);
    expect(sections[0].html).toContain('>Ch1</h2>');
    expect(sections[1].html).toContain('>Ch2</h2>');
    expect(sections[0].title).toBe('Ch1');
    expect(sections[1].title).toBe('Ch2');
    expect(sections[0].ref).toBe('_ch1');
    expect(sections[1].ref).toBe('_ch2');
  });

  it('adds id property', () => {
    const adoc = '== Ch1\n\nPara1.\n\n== Ch2\n\nPara2.footnote:[lol]\n';
    spec.html = convert(adoc);
    const [ one, two, notes ] = divide(spec);

    expect(one.id).toBe('sect1');
    expect(two.id).toBe('sect2');
    expect(notes.id).toBe('notes');
  });

  it('puts footnotes into own section', () => {
    spec.html = convert('== Ch1\n\nA para.footnote:[lol]</>');
    const sections = divide(spec);

    expect(sections.length).toBe(2);
    expect(sections[1].html).toMatch(/^\s*<div id="footnotes">/);
  });

  it('prepends resource file to footnote hash hrefs', () => {
    spec.html = convert('== Ch1\n\nA para.footnote:[lol]</>');
    const [ chapter ] = divide(spec);

    expect(chapter.html).toContain('href="notes.xhtml#_footnotedef_1"');
  });

  it('prepends resource file to footnote return links', () => {
    spec.html = convert('== Ch1\n\nA para.footnote:[lol]</>');
    const [ chapter, notes ] = divide(spec);

    expect(notes.html).toContain('href="sect1.xhtml#_footnoteref_1"');
  });

  it('removes square brackets around footnote ref', () => {
    spec.html = convert('== Ch1\n\nA para.footnote:[lol]</>');
    const [ chapter ] = divide(spec);

    expect(chapter.html).toMatch(/<sup class="footnote"><a[^>]+?>1<\/a><\/sup>/);
  });

  it('removes period after link in footnote', () => {
    spec.html = convert('== Ch1\n\nA para.footnote:[lol]</>');
    const [ chapter, notes ] = divide(spec);

    expect(notes.html).toContain('<a href="sect1.xhtml#_footnoteref_1">1</a> lol');
  });

  it('separates chapter prefix from body', () => {
    spec.html = convert('== Chapter 1: Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.chapterNumber).toBe(1);
    expect(section.chapterTitlePrefix).toBe('Chapter 1');
    expect(section.chapterTitleBody).toBe('Foobar');
  });

  it('understands roman numerals', () => {
    spec.html = convert('== Chapter xl: Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.chapterNumber).toBe(40);
  });

  it('preserves h2', () => {
    spec.html = convert('== Chapter xl: Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.html).toContain('<h2');
    expect(section.html).toContain('</h2>');
  });

  it('switches dot for colon', () => {
    spec.html = convert('== Chapter 1. Foobar\n\nPara\n');
    const [ section ] = divide(spec);

    expect(section.html).toContain(':');
    expect(section.html).not.toContain('.');
  });

  it('wraps markup around parts', () => {
    spec.html = convert('== Chapter i: Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    const expected = `
      <h2 id="_chapter_i_foobar">
        <span class="chapter-title__prefix">
          Chapter <span class="chapter-title__number">1</span>
        </span>
        <span class="chapter-title__separator">:</span>
        <span class="chapter-title__body">
          Foobar
        </span>
      </h2>
    `;

    expect(section.html).toContain(stripWhitespace(expected).replace('Foobar', ' Foobar'));
  });

  it('adds no extra whitespace that causes rendering issues', () => {
    spec.html = convert('== Chapter i: Foobar\n\nPara.\n');
    const [ section ] = divide(spec);
    const match = section.html.match(/(<h2[^>]+?>).+?<\/h2>/i);

    expect(match[0]).not.toMatch(/(  |\t|\n)/);
  });

  it('adds space before title body', () => {
    spec.html = convert('== Chapter i: Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.html).toContain(' Foobar');
  });

  it('finds full chapter title bodies', () => {
    spec.html = convert('== Chapter I. On Conversion and Regeneration.\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.chapterTitleBody).toBe('On Conversion and Regeneration.');
  });

  it('can handle numbered chapters with no title body', () => {
    spec.html = convert('== Chapter ii.\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.chapterNumber).toBe(2);
    expect(section.chapterTitleBody).toBe('');
    expect(section.html).not.toContain('__separator');
    expect(section.html).not.toContain('__body');
  });

  it('finds shortened title body from config, if present', () => {
    spec.config = { shortTitles: { 'ch-3': 'Foo' } };
    spec.html = convert('[#ch-3]\n== Chapter 1. Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.chapterTitleShort).toBe('Foo');
  });

  it('honors config for chapter number style', () => {
    spec.config = { chapterNumberFormat: "roman" };
    spec.html = convert('== Chapter 1.\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.html).toContain('<span class="chapter-title__number">I</span>');
  });

  it('honors config for chapter separator style', () => {
    spec.config = { chapterTitleSeparator: "*" };
    spec.html = convert('== Chapter 1. Foobar\n\nPara.\n');
    const [ section ] = divide(spec);

    expect(section.html).toContain('<span class="chapter-title__separator">*</span>');
  });
});

function stripWhitespace(str) {
  return str.trim().replace(/(\n|\t|  +)/gm, '');
}