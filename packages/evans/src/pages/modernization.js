// @flow
import * as React from 'react';
import { graphql } from 'gatsby';
import styled from '@emotion/styled';
import type { Html } from '../../../../type';
import { Layout, Block, PageTitle } from '../components';

const Div = styled.div`
  & dl {
    margin-left: 1.5em;
  }
  & dt:before {
    content: " ";
    white-space: pre-wrap;
    display: block;
    height: .5em;
  }
  & dt {
    font-weight: 700;
    display: inline;
    margin: 0;
    width: 50px;
  }
  & dt:after {
    content: " - ";
    font-weight: 400;
  }
  & dd {
    display: inline;
    margin: 0;
  }
`;

type Props = {|
  data: {|
    partial: {|
      html: Html,
    |},
  |},
|};

export default ({ data: { partial: { html } } }: Props) => (
  <Layout>
    <Block>
      <PageTitle>Modernization</PageTitle>
      <Div dangerouslySetInnerHTML={{ __html: html }} />
    </Block>
  </Layout>
);

export const query = graphql`
  query {
    partial(id: {eq: "partial:modernization"}) {
      html
    }
  }
`;
