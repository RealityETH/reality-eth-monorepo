import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common';
import { ConnectorController, ConnectorUtil, StorageUtil } from '@reown/appkit-controllers';
export const ConnectionUtil = {
    getAuthData(connection) {
        const isAuth = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH;
        if (!isAuth) {
            return { isAuth: false, icon: undefined, iconSize: undefined, name: undefined };
        }
        const socialProvider = (connection?.auth?.name ??
            StorageUtil.getConnectedSocialProvider());
        const socialUsername = (connection?.auth?.username ??
            StorageUtil.getConnectedSocialUsername());
        const authConnector = ConnectorController.getAuthConnector();
        const email = authConnector?.provider.getEmail() ?? '';
        return {
            isAuth: true,
            icon: socialProvider ?? 'mail',
            iconSize: socialProvider ? 'xl' : 'md',
            name: isAuth
                ? ConnectorUtil.getAuthName({ email, socialUsername, socialProvider })
                : undefined
        };
    }
};
//# sourceMappingURL=ConnectionUtil.js.map