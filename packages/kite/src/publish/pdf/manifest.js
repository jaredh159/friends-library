// @flow
import { flow, mapValues } from 'lodash';
import { toRoman } from 'roman-numerals';
import type { Css, Html } from '../../../../../type';
import type { Job, FileManifest, Heading, PrintSize } from '../../type';
import { capitalizeTitle, trimTrailingPunctuation } from '../text';
import { file, toCss } from '../file';
import { replaceHeadings } from '../headings';
import { removeMobi7Tags } from '../html';
import { frontmatter } from './frontmatter';
import { getBookSize } from '../book-sizes';

export function getPdfManifest(job: Job): FileManifest {
  return {
    'doc.html': getHtml(job),
    'doc.css': getCss(job),
    'line.svg': file('pdf/line.svg'),
  };
}

export function getCss(job: Job): Css {
  const { target, spec: { notes, customCss }, cmd: { condense } } = job;
  const vars = getSassVars(job);
  return [
    'sass/common.scss',
    'sass/not-mobi7.scss',
    'sass/paging.scss',
    'pdf/sass/base.scss',
    'pdf/sass/typography.scss',
    'pdf/sass/half-title.scss',
    'pdf/sass/original-title.scss',
    'pdf/sass/copyright.scss',
    'pdf/sass/toc.scss',
    'pdf/sass/chapter-heading.scss',
    ...target === 'pdf-print' ? ['pdf/sass/print.scss'] : ['pdf/sass/web.scss'],
    ...notes.size < 5 ? ['pdf/sass/symbol-notes.scss'] : [],
    ...condense ? ['pdf/sass/condense.scss'] : [],
  ]
    .map(path => toCss(path, vars))
    .join('\n')
    .concat(customCss.all || '')
    .concat(customCss.pdf || '')
    .concat(customCss[target] || '');
}

function getSassVars(job: Job): { [string]: string } {
  const { target, spec: { meta, sections, config } } = job;
  const title = sections.length === 1 ? meta.author.name : config.shortTitle || meta.title;
  return {
    'running-head-title': `"${title}"`,
    ...target === 'pdf-print' ? printDims(job) : {},
  };
}

export function printDims(job: Job): { [string]: string } {
  const trim = getTrim(job);
  return mapValues({
    'page-width': trim.dims.width,
    'page-height': trim.dims.height,
    'page-top-margin': trim.margins.top,
    'page-bottom-margin': trim.margins.bottom,
    'page-outer-margin': trim.margins.outer,
    'page-inner-margin': trim.margins.inner,
    'running-head-margin-top': trim.margins.runningHeadTop,
  }, v => `${v}in`);
}

function getTrim({ cmd }: Job): PrintSize {
  return getBookSize(cmd.printSize || 'm');
}

export function getHtml(job: Job): Html {
  return flow([
    joinSections,
    addFirstChapterClass,
    inlineNotes,
    prependFrontmatter,
    ([html, j]) => [removeMobi7Tags(html), j],
    wrapHtml,
    addBodyClasses,
  ])(['', job])[0];
}

function joinSections([_, job]: [Html, Job]): [Html, Job] {
  const joined = job.spec.sections.map(({ html, heading }) => {
    return replaceHeadings(html, heading, job)
      .replace(
        '<div class="sectionbody">',
        `<div class="sectionbody" short="${runningHeader(heading)}">`,
      );
  }).join('\n');

  return [joined, job];
}

function runningHeader({ shortText, text, sequence }: Heading): string {
  if (shortText || text || !sequence) {
    return capitalizeTitle(trimTrailingPunctuation(shortText || text))
      .replace(/ \/ .+/, '');
  }

  return `${sequence.type} ${toRoman(sequence.number)}`;
}

function addFirstChapterClass([html, job]: [Html, Job]): [Html, Job] {
  return [html.replace(
    '<div class="sect1',
    '<div class="sect1 first-chapter',
  ), job];
}

function addBodyClasses([html, job]: [Html, Job]): [Html, Job] {
  const { abbrev } = getTrim(job);
  return [html.replace(
    '<body>',
    `<body class="body trim--${abbrev}">`,
  ), job];
}

function inlineNotes([html, job]: [Html, Job]): [Html, Job] {
  const { spec: { notes } } = job;
  return [html.replace(
    /{% note: ([a-z0-9-]+) %}/gim,
    (_, id) => `<span class="footnote">${notes.get(id) || ''}</span>`,
  ), job];
}

function wrapHtml([html, job]: [Html, Job]): [Html, Job] {
  const wrapped = `
<!DOCTYPE html>
<html>
<head>
  <link href="doc.css" rel="stylesheet" type="text/css">
</head>
<body>
  ${html}
</body>
</html>
`.trim();
  return [wrapped, job];
}

function prependFrontmatter([html, job]: [Html, Job]): [Html, Job] {
  return [frontmatter(job).concat(html), job];
}
