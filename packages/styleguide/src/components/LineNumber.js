// @flow
import * as React from 'react';
import styled from 'styled-components';
import leftPad from 'left-pad';

const Number = styled.span`
  position: absolute;
  padding-left: 10px;
  left: 0;
  top: 0;
  opacity: 0.225;
  line-height: 1.25em;
  margin: 0;
  user-select: none;
  .highlight & {
    opacity: 1;
    color: rgba(0, 255, 0, 0.5);
    &::before {
      color: #000;
      content: "👉";
      position: absolute;
      text-shadow: 0.75px 0.75px 0.75px #888;
      left: -30px;
      top: 1px;
      font-size: 23px;
    }
  }
`;

export default ({ num }: { num: number }) => (
  <Number>
    {leftPad(String(num), 2, '0')}.
  </Number>
);
