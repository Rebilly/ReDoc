import * as React from 'react';
import styled from '../../styled-components';

export const LogoImgEl = styled.img`
  max-height: ${props => props.theme.logo.maxHeight};
  max-width: ${props => props.theme.logo.maxWidth};
  padding: ${props => props.theme.logo.gutter};
  width: 100%;
  display: block;
`;

export const LogoWrap = styled.div`
  text-align: center;
`;

const Link = styled.a`
  display: flex;
  justify-content: center;
`;

// eslint-disable-next-line react/display-name
export const LinkWrap = url => Component => <Link href={url}>{Component}</Link>;
