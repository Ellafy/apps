// Copyright 2017-2020 @polkadot/react-signer authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SignerOptions } from '@polkadot/api/submittable/types';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { InputNumber, Modal, Output } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from './translate';

interface Props {
  address: string | null;
  className?: string;
  onChange: (signedOptions: Partial<SignerOptions>) => void;
  signedTx: string | null;
}

function SignFields ({ address, onChange, signedTx }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [blocks, setBlocks] = useState(new BN(64));
  const [nonce, setNonce] = useState(BN_ZERO);
  const { t } = useTranslation();

  useEffect((): void => {
    address && api.derive.balances
      .account(address)
      .then(({ accountNonce }) => setNonce(accountNonce))
      .catch(console.error);
  }, [address, api]);

  useEffect((): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    onChange({ era: blocks.toNumber(), nonce });
  }, [blocks, nonce, onChange]);

  const _setBlocks = useCallback(
    (blocks = BN_ZERO) => setBlocks(blocks),
    []
  );

  const _setNonce = useCallback(
    (nonce = BN_ZERO) => setNonce(nonce),
    []
  );

  return (
    <>
      <Modal.Columns>
        <Modal.Column>
          <InputNumber
            isDisabled={!!signedTx}
            isZeroable
            label={t('Nonce')}
            labelExtra={t('Current account nonce: {{accountNonce}}', { replace: { accountNonce: nonce } })}
            onChange={_setNonce}
            value={nonce}
          />
          <InputNumber
            isDisabled={!!signedTx}
            isZeroable
            label={t('Lifetime (# of blocks)')}
            labelExtra={t('Set to 0 to make transaction immortal')}
            onChange={_setBlocks}
            value={blocks}
          />
        </Modal.Column>
        <Modal.Column>
          <p>{t('Override any applicable values for the specific signed output. These will be used to construct and display the signed transaction.')}</p>
        </Modal.Column>
      </Modal.Columns>
      {!!signedTx && (
        <Output
          label={t<string>('Signed transaction')}
          value={signedTx}
          withCopy
        />
      )}
    </>
  );
}

export default React.memo(SignFields);
