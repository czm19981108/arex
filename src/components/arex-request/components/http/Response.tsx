import { css } from '@emotion/react';
import { FC, useContext, useMemo } from 'react';
import React from 'react';

import { HttpContext } from '../..';
import { HoppRESTResponse } from '../../helpers/types/HoppRESTResponse';
import { HoppTestResult } from '../../helpers/types/HoppTestResult';
import LensesResponseBodyRenderer from '../lenses/ResponseBodyRenderer';
import HttpResponseMeta from './ResponseMeta';

const HttpResponse: FC<{ onPin: any; config: any }> = ({ onPin, config }) => {
  const { store } = useContext(HttpContext);
  const hasResponse = useMemo(
    () =>
      store.response?.type === 'success' ||
      store.response?.type === 'fail' ||
      store.response?.type === 'empty',
    [store.response],
  );
  const loading = useMemo(
    () => store.response === null || store.response.type === 'loading',
    [store.response],
  );

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
        padding-left: 16px;
        padding-right: 16px;
      `}
    >
      <HttpResponseMeta response={store.response} />
      {!loading && hasResponse ? (
        <LensesResponseBodyRenderer
          onPin={onPin}
          response={store.response as HoppRESTResponse}
          testResult={store.testResult as HoppTestResult}
          config={config}
        />
      ) : null}
    </div>
  );
};

export default HttpResponse;
