// @flow
import * as React from 'react';
import { css } from 'glamor';
import StickyNav from './StickyNav';
import Slideover from './Slideover';

type Props = {|
  title: string,
  children: React.Node,
|};

const content = css`
  padding-top: 52px;
  position: relative;
  background: #fff;
  min-height: 100vh;
`;

export default ({ title, children }: Props) => (
  <html>
    <head>
      <title>{title}</title>
      <link href="https:////netdna.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.css" rel="stylesheet prefetch" />
    </head>
    <body>
      <Slideover />
      <StickyNav />
      <div id="App__Content" className={content}>
        {children}
      </div>
      <script async src="/js/bundle.js"></script>
    </body>
  </html>
);