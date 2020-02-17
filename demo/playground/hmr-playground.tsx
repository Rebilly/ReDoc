import * as React from 'react';
import { render } from 'react-dom';
// tslint:disable-next-line
import { AppContainer } from 'react-hot-loader';
// import DevTools from 'mobx-react-devtools';

import { Redoc, RedocProps } from '../../src/components/Redoc/Redoc';
import { AppStore } from '../../src/services/AppStore';
import { RedocRawOptions } from '../../src/services/RedocNormalizedOptions';
import { loadAndBundleSpec } from '../../src/utils/loadAndBundleSpec';

const renderRoot = (props: RedocProps) =>
  render(
    <AppContainer>
      <Redoc {...props} />
    </AppContainer>,
    document.getElementById('example'),
  );

const big = window.location.search.indexOf('big') > -1;
const swagger = window.location.search.indexOf('swagger') > -1;

const userUrl = window.location.search.match(/url=(.*)$/);

const specUrl =
  (userUrl && userUrl[1]) || (swagger ? 'swagger.yaml' : big ? 'big-openapi.json' : 'openapi.yaml');

let store;
const headers = {};
const options: RedocRawOptions = { nativeScrollbars: false, enableConsole: true, providedByName: 'Intent ApiDocs by Nutanix', providedByUri: 'http://www.nutanix.com', additionalHeaders: headers };

async function init() {
  const spec = await loadAndBundleSpec(specUrl);
  store = new AppStore(spec, specUrl, options);
  renderRoot({ store });
}

init();

if (module.hot) {
  const reload = (reloadStore = false) => async () => {
    if (reloadStore) {
      // create a new Store
      store.dispose();

      const state = await store.toJS();
      store = AppStore.fromJS(state);
    }

    renderRoot({ store });
  };

  module.hot.accept(['../../src/components/Redoc/Redoc'], reload());
  module.hot.accept(['../../src/services/AppStore'], reload(true));
}
