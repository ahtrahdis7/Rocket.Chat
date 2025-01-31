import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { SAMLUtils } from './lib/Utils';
import { SAML } from './lib/SAML';
import { SystemLogger } from '../../../server/lib/logger/system';

const makeError = (message: string): Record<string, any> => ({
	type: 'saml',
	// @ts-ignore - LoginCancelledError does in fact exist
	error: new Meteor.Error(Accounts.LoginCancelledError.numericError, message),
});

Accounts.registerLoginHandler('saml', function(loginRequest) {
	if (!loginRequest.saml || !loginRequest.credentialToken || typeof loginRequest.credentialToken !== 'string') {
		return undefined;
	}

	const loginResult = SAML.retrieveCredential(loginRequest.credentialToken);
	SAMLUtils.log({ msg: 'RESULT', loginResult });

	if (!loginResult) {
		return makeError('No matching login attempt found');
	}

	if (!loginResult.profile) {
		return makeError('No profile information found');
	}

	try {
		const userObject = SAMLUtils.mapProfileToUserObject(loginResult.profile);

		return SAML.insertOrUpdateSAMLUser(userObject);
	} catch (error) {
		SystemLogger.error(error);
		return makeError(error.toString());
	}
});
