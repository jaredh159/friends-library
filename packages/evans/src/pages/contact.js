// @flow
import * as React from 'react';
import { graphql } from 'gatsby';
import type { Html } from '../../../../type';
import { Layout, Block, PageTitle } from '../components';

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
      <PageTitle>Contact Us</PageTitle>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Block>
  </Layout>
);

export const query = graphql`
  query {
    partial(id: {eq: "partial:contact-page"}) {
      html
    }
  }
`;
