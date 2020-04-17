# Babel webpack example

> Exemple pris de [ amazon-archives / amazon-cognito-identity-js](https://github.com/amazon-archives/amazon-cognito-identity-js/tree/master/examples/babel-webpack) avec ajout de vérification et login.

:warning: Ce repo utilise des vieilles dépendances, utilisé que pour du développement.

To run the example first setup your AWS configuration.

```js
// src/config.js
export default {
  region: '',
  IdentityPoolId: '',
  UserPoolId: '',
  ClientId: '',
}
```

Now, you are ready to build this example.

```
npm install
```

Open browser to try this example.

```
open index.html
```
