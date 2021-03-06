import { prepare } from '../prepare';
import { testPrecursor as precursor } from '../test-helpers';


function parse(adoc) {
  const { sections: [section] } = prepare(precursor(adoc));
  return section.heading;
}

describe('parsing headings', () => {
  const cases = [
    [
      '== Forward',
      {
        id: '_forward',
        text: 'Forward',
      },
    ],

    [
      '== Chapter 3: Foobar',
      {
        text: 'Foobar',
        sequence: {
          type: 'Chapter',
          number: 3,
        },
      },
    ],

    [
      '== Chapter x',
      {
        sequence: {
          number: 10,
        },
      },
    ],

    [
      '== Section 5: Lorem',
      {
        text: 'Lorem',
        sequence: {
          type: 'Section',
          number: 5,
        },
      },
    ],
  ];

  test.each(cases)('parses heading from %s', (adoc, heading) => {
    expect(parse(adoc)).toMatchObject(heading);
  });
});
