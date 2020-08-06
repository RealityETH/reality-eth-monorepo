RKETH_ENVIRONMENT = 'prod'
import os

import sys
import rcpy.secrets as SECRETS

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.10/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = SECRETS.SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
    'rcindex',
    'rctwitter'
]

MIDDLEWARE = []

# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'rcindex',
        'USER': 'rcindexer',
        'PASSWORD': SECRETS.DB_PASSWORD,
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True



# RC_ADDRESS = '0xac870cdc25a87f12a5533704d047138d098812b8'
RC_ADDRESS = '0x325a2e0F3CCA2ddbaeBB4DfC38Df8D19ca165b47'
GETH_RPC_HOST = '127.0.0.1'
GETH_RPC_PORT = '8545'
GETH_TESTNET = False

URL_QUESTION_BASE = 'https://reality.eth.link/app/#!/question/'
