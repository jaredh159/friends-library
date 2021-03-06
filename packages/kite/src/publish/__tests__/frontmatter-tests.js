import { frontmatter, halfTitle } from '../frontmatter';
import { testJob } from '../test-helpers';

describe('frontmatter()', () => {
  let job;

  beforeEach(() => {
    job = testJob();
  });

  it('does not include original title page if no orig title', () => {
    const files = frontmatter(job);

    expect(files['original-title']).toBeUndefined();
  });

  it('includes original title if document has original title', () => {
    job.spec.meta.originalTitle = 'Original Title &c.';

    const files = frontmatter(job);

    expect(files['original-title']).toContain('Original Title &c.');
  });

  test('copyright has published date if data exists on spec', () => {
    job.spec.meta.published = 1834;

    const files = frontmatter(job);

    expect(files.copyright).toContain('1834');
  });

  test('no originally published item in copyright if no data on spec', () => {
    const files = frontmatter(job);

    expect(files.copyright).not.toContain('Originally published');
  });

  it('includes epigraphs if necessary', () => {
    const adoc = `
[quote.epigraph, , citation]
____
Quote text.
____

== Chapter 1
    `.trim();

    const files = frontmatter(testJob(adoc));

    expect(files.epigraph).toContain('Quote text.');
  });
});

describe('halfTitle()', () => {
  it('omits byline if author name in author title', () => {
    const job = testJob();
    job.spec.meta.author.name = 'Ambrose Rigge';
    job.spec.meta.title = 'Journal of Ambrose Rigge';

    const ht = halfTitle(job);

    expect(ht).not.toContain('byline');
  });

  it('keeps byline if author name not in author title', () => {
    const job = testJob();
    job.spec.meta.author.name = 'Ambrose Rigge';
    job.spec.meta.title = 'Journal &c.';

    const ht = halfTitle(job);

    expect(ht).toContain('byline');
  });
});
