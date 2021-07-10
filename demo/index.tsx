import * as React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import { resolve as urlResolve } from 'url';
import { RedocStandalone } from '../src';
import ComboBox from './ComboBox';
import ClipboardImporter from './ClipboardImporter';

const DEFAULT_SPEC = 'openapi.yaml';
const NEW_VERSION_SPEC = 'openapi-3-1.yaml';

const demos = [
  { value: NEW_VERSION_SPEC, label: 'Petstore OpenAPI 3.1' },
  { value: 'https://api.apis.guru/v2/specs/instagram.com/1.0.0/swagger.yaml', label: 'Instagram' },
  {
    value: 'https://api.apis.guru/v2/specs/googleapis.com/calendar/v3/openapi.yaml',
    label: 'Google Calendar',
  },
  { value: 'https://api.apis.guru/v2/specs/slack.com/1.7.0/openapi.yaml', label: 'Slack' },
  { value: 'https://api.apis.guru/v2/specs/zoom.us/2.0.0/openapi.yaml', label: 'Zoom.us' },
  { value: 'https://docs.graphhopper.com/openapi.json', label: 'GraphHopper' },
];

class DemoApp extends React.Component<
  {},
  { spec?: object; specUrl: string; dropdownOpen: boolean; cors: boolean }
> {
  constructor(props) {
    super(props);

    let parts = window.location.search.match(/url=([^&]+)/);
    let url = DEFAULT_SPEC;
    if (parts && parts.length > 1) {
      url = decodeURIComponent(parts[1]);
    }

    parts = window.location.search.match(/[?&]nocors(&|#|$)/);
    let cors = true;
    if (parts && parts.length > 1) {
      cors = false;
    }

    this.state = {
      spec: undefined,
      specUrl: url,
      dropdownOpen: false,
      cors,
    };
  }

  handlePaste = (spec: object) => {
    this.setState({
      spec,
      specUrl: '',
    });
  };

  handleChange = (url: string) => {
    if (url === NEW_VERSION_SPEC) {
      this.setState({ cors: false })
    }
    this.setState({
      spec: undefined,
      specUrl: url,
    });
    window.history.pushState(
      undefined,
      '',
      updateQueryStringParameter(location.search, 'url', url),
    );
  };

  toggleCors = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cors = e.currentTarget.checked;
    this.setState({
      cors,
    });
    window.history.pushState(
      undefined,
      '',
      updateQueryStringParameter(location.search, 'nocors', cors ? undefined : ''),
    );
  };

  render() {
    const { specUrl, cors } = this.state;
    let proxiedUrl = specUrl;
    if (specUrl !== DEFAULT_SPEC) {
      proxiedUrl = cors
        ? '\\\\cors.redoc.ly/' + urlResolve(window.location.href, specUrl)
        : specUrl;
    }
    return (
      <>
        <Heading>
          <a href=".">
            <Logo
              src="https://github.com/Redocly/redoc/raw/master/docs/images/redoc-logo.png"
              alt="Redoc logo"
            />
          </a>
          <ControlsContainer>
            <ClipboardImporter onPaste={this.handlePaste}/>
            <ComboBox
              placeholder={'URL to a spec to try'}
              options={demos}
              onChange={this.handleChange}
              value={specUrl === DEFAULT_SPEC ? '' : specUrl}
            />
            <CorsCheckbox title="Use CORS proxy">
              <input id="cors_checkbox" type="checkbox" onChange={this.toggleCors} checked={cors} />
              <label htmlFor="cors_checkbox">CORS</label>
            </CorsCheckbox>
          </ControlsContainer>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=Redocly&amp;repo=redoc&amp;type=star&amp;count=true&amp;size=large"
            frameBorder="0"
            scrolling="0"
            width="160px"
            height="30px"
          />
        </Heading>
        <RedocStandalone
          spec={this.state.spec}
          specUrl={proxiedUrl}
          options={{ scrollYOffset: 'nav', untrustedSpec: true }}
        />
      </>
    );
  }
}

/* ====== Styled components ====== */

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
  margin: 0 15px;
  align-items: center;
`;

const CorsCheckbox = styled.div`
  margin-left: 10px;
  white-space: nowrap;

  label {
    font-size: 13px;
  }

  @media screen and (max-width: 550px) {
    display: none;
  }
`;

const Heading = styled.nav`
  position: sticky;
  top: 0;
  width: 100%;
  height: 50px;
  box-sizing: border-box;
  background: white;
  border-bottom: 1px solid #cccccc;
  z-index: 10;
  padding: 5px;

  display: flex;
  align-items: center;
  font-family: Roboto, sans-serif;
`;

const Logo = styled.img`
  height: 40px;
  width: 124px;
  display: inline-block;
  margin-right: 15px;

  @media screen and (max-width: 950px) {
    display: none;
  }
`;

render(<DemoApp />, document.getElementById('container'));

/* ====== Helpers ====== */
function updateQueryStringParameter(uri, key, value) {
  const keyValue = value === '' ? key : key + '=' + value;
  const re = new RegExp('([?|&])' + key + '=?.*?(&|#|$)', 'i');
  if (uri.match(re)) {
    if (value !== undefined) {
      return uri.replace(re, '$1' + keyValue + '$2');
    } else {
      return uri.replace(re, (_, separator: string, rest: string) => {
        if (rest.startsWith('&')) {
          rest = rest.substring(1);
        }
        return separator === '&' ? rest : separator + rest;
      });
    }
  } else {
    if (value === undefined) {
      return uri;
    }
    let hash = '';
    if (uri.indexOf('#') !== -1) {
      hash = uri.replace(/.*#/, '#');
      uri = uri.replace(/#.*/, '');
    }
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    return uri + separator + keyValue + hash;
  }
}
