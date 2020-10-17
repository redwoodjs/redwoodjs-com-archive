# Autenticación

`@redwoodjs/auth` es un contenedor ligero de bibliotecas de autenticación de SPA populares. Actualmente admitimos los siguientes proveedores de autenticación:

- [Widget de identidad de Netlify](https://github.com/netlify/netlify-identity-widget)
- [Auth0](https://github.com/auth0/auth0-spa-js)
- [Netlify GoTrue-JS](https://github.com/netlify/gotrue-js)
- [Enlaces mágicos - Magic.js](https://github.com/MagicHQ/magic-js)
- [GoogleAuthProvider de Firebase](https://firebase.google.com/docs/reference/js/firebase.auth.GoogleAuthProvider)
- [¡Contribuya con uno](#contributing) , es SuperEasy ™!

Echa un vistazo a [Auth Playground](https://github.com/redwoodjs/playground-auth) .

## Instalación

### Generador de autenticación CLI

El siguiente comando de la CLI instalará los paquetes necesarios, generará código estándar y archivos para Redwood Projects:

```terminal
yarn rw g auth [provider]
```

* `[provider]` puede ser uno de los siguientes: "auth0", "custom", "firebase", "goTrue", "magicLink" o "netlify".

### Instalación manual

+++ Widget de identidad de Netlify

```bash
cd web
yarn add @redwoodjs/auth netlify-identity-widget
```

+++

+++ Auth0

```bash
cd web
yarn add @redwoodjs/auth @auth0/auth0-spa-js
```

+++

+++ Magic.Link

```bash
cd web
yarn add @redwoodjs/auth magic-sdk
```

+++

+++ GoTrue-JS

```bash
cd web
yarn add @redwoodjs/auth gotrue-js
```

+++

## Preparar

Cree una instancia de su cliente de autenticación y páselo al `<AuthProvider>` :

+++ Widget de identidad de Netlify

Deberá habilitar la identidad en su sitio de Netlify. Consulte [Configuración de identidad de Netlify](https://redwoodjs.com/tutorial/authentication#netlify-identity-setup) .

```js
// web/src/index.js
import { AuthProvider } from '@redwoodjs/auth'
import netlifyIdentity from 'netlify-identity-widget'

netlifyIdentity.init()

// in your JSX component
ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={netlifyIdentity} type="netlify">
      <RedwoodProvider>
        <Routes />
      </RedwoodProvider>
    </AuthProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

+++

+++ GoTrue-JS

Deberá habilitar la identidad en su sitio de Netlify. Consulte [Configuración de identidad de Netlify](https://redwoodjs.com/tutorial/authentication#netlify-identity-setup) .

Agregue el paquete GoTrue-JS al lado web:

```terminal
yarn workspace web add gotrue-js
```

Cree una instancia de GoTrue y pase su configuración. Asegúrese de establecer APIUrl en el punto final de la API que se encuentra en la pestaña Identidad de su sitio Netlify:

```js
// web/src/index.js
import { AuthProvider } from '@redwoodjs/auth'
import GoTrue from 'gotrue-js'

const goTrue = new GoTrue({
  APIUrl: 'https://MYAPP.netlify.app/.netlify/identity',
  setCookie: true,
})

// in your JSX component
ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={goTrue} type="goTrue">
      <RedwoodProvider>
        <Routes />
      </RedwoodProvider>
    </AuthProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

+++

+++ Auth0

To get your application keys, only complete the ["Configure Auth0"](https://auth0.com/docs/quickstart/spa/react#get-your-application-keys) section of the SPA Quickstart guide.

**NOTA** Si está utilizando Auth0 con Redwood, también debe [crear una API](https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api) y establecer el parámetro de audiencia, o recibirá un token opaco en lugar del token JWT requerido.

```js
// web/src/index.js
import { AuthProvider } from '@redwoodjs/auth'
import { Auth0Client } from '@auth0/auth0-spa-js'

const auth0 = new Auth0Client({
    domain: process.env.AUTH0_DOMAIN,
    client_id: process.env.AUTH0_CLIENT_ID,
    redirect_uri: 'http://localhost:8910/',
    cacheLocation: 'localstorage',
    audience: process.env.AUTH0_AUDIENCE,
})

ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={auth0} type="auth0">
      <RedwoodProvider>
        <Routes />
      </RedwoodProvider>
    </AuthProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

#### Opciones de inicio de sesión y cierre de sesión

When using the Auth0 client, `login` and `logout` take `options` that can be used to override the client config:

- `returnTo` : una URL de cierre de sesión permitida establecida en Auth0
- `redirectTo` : una URL de destino después de iniciar sesión

Esto último es útil cuando un usuario no autenticado visita una ruta privada, pero luego se le redirige a la ruta `unauthenticated` . El enrutador Redwood colocará la ruta solicitada anteriormente en el nombre de ruta como un parámetro `redirectTo` que se puede extraer y configurar en Auth0 `appState` . De esa manera, después de iniciar sesión correctamente, el usuario será dirigido a esta `targetUrl` lugar de la devolución de llamada de la configuración.

```js
const UserAuthTools = () => {
  const { loading, isAuthenticated, logIn, logOut } = useAuth()

  if (loading) {
    // auth is rehydrating
    return null
  }

  return (
    <Button
      onClick={async () => {
        if (isAuthenticated) {
          await logOut({ returnTo: process.env.AUTH0_REDIRECT_URI })
        } else {
          const searchParams = new URLSearchParams(window.location.search)
          await logIn({
            appState: { targetUrl: searchParams.get('redirectTo') },
          })
        }
      }}
    >
      {isAuthenticated ? 'Log out' : 'Log in'}
    </Button>
  )
}
```

+++

+++ Magic.Link

Para obtener las claves de su aplicación, vaya a [dashboard.magic.link,](https://dashboard.magic.link/) luego navegue hasta las claves API y agréguelas a su .env

```js
// web/src/index.js
import { Magic } from 'magic-sdk'

const m = new Magic(process.env.MAGICLINK_PUBLIC)

ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={m} type="magicLink">
      <RedwoodProvider>
        <Routes />
      </RedwoodProvider>
    </AuthProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

+++

+++ Firebase

Estamos usando [Firebase Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin) , por lo que deberá seguir los pasos ["Antes de comenzar"](https://firebase.google.com/docs/auth/web/google-signin#before_you_begin) de esta guía. Siga **únicamente** las partes "Antes de comenzar".

```js
// web/src/index.js
import * as firebase from 'firebase/app'
import 'firebase/auth'

const firebaseClientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}

const firebaseClient = ((config) => {
  firebase.initializeApp(config)
  return firebase
})(firebaseClientConfig)

ReactDOM.render(
  <FatalErrorBoundary page={FatalErrorPage}>
    <AuthProvider client={firebaseClient} type="firebase">
      <RedwoodProvider>
        <Routes />
      </RedwoodProvider>
    </AuthProvider>
  </FatalErrorBoundary>,
  document.getElementById('redwood-app')
)
```

#### Uso

```js
const UserAuthTools = () => {
  const { loading, isAuthenticated, logIn, logOut } = useAuth()

  if (loading) {
    return null
  }

  return (
    <Button
      onClick={async () => {
        if (isAuthenticated) {
          await logOut()
          navigate('/')
        } else {
          await logIn()
        }
      }}
    >
      {isAuthenticated ? 'Log out' : 'Log in'}
    </Button>
  )
}
```

+++

## API

Los siguientes valores están disponibles en el `useAuth` :

- async `logIn()` : difiere según la biblioteca del cliente, con Netlify Identity se muestra una ventana emergente y con Auth0 se redirige al usuario
- async `logOut()`: Log out the current user
- `currentUser` : un objeto que contiene información sobre el usuario actual, o `null` si el usuario no está autenticado
- async `reauthenticate()` : vuelve a recuperar los datos de autenticación y completa el estado.
- async `getToken()` : devuelve un jwt
- `client` : acceda a la instancia del cliente que pasó a `AuthProvider`
- `isAuthenticated` : se utiliza para determinar si el usuario actual se ha autenticado
- `hasRole` : se utiliza para determinar si el usuario actual tiene asignado un rol
- `loading` : el estado de autenticación se restaura de forma asincrónica cuando el usuario visita el sitio por primera vez, utilice esto para determinar si tiene el estado correcto

## Uso en Redwood

¡Redwood ofrece una experiencia zeroconf al usar nuestro paquete Auth!

### Consulta y mutaciones de GraphQL

Las solicitudes GraphQL reciben automáticamente un encabezado JWT de `Authorization` cuando se autentica un usuario.

### API

If a user is signed in, the `Authorization` token is verified, decoded and available in `context.currentUser`

```js
import { context }  from '@redwoodjs/api'

console.log(context.currentUser)
// {
//    sub: '<netlify-id>
//    email: 'user@example.com',
//    [...]
// }
```

Puede asignar la "JWT decodificada en bruto" en un objeto de usuario real al pasar un `getCurrentUser` función para `createCreateGraphQLHandler`

Nuestra recomendación es crear un archivo `src/lib/auth.js|ts` que exporte un `getCurrentUser` . (Nota: es posible que ya tenga funciones de código auxiliar).

```js
import { getCurrentUser } from 'src/lib/auth'
// Example:
//  export const getCurrentUser = async (decoded) => {
//    return await db.user.findOne({ where: { decoded.email } })
//  }
//

export const handler = createGraphQLHandler({
  schema: makeMergedSchema({
    schemas,
    services: makeServices({ services }),
  }),
  getCurrentUser,
})
```

El valor devuelto por `getCurrentUser` está disponible en `context.currentUser`

Use `requireAuth` en sus servicios para verificar que un usuario haya iniciado sesión, tenga o no asignado un rol y, opcionalmente, genere un error si no lo está.

```js
export const requireAuth = ({ role }) => {
  if (!context.currentUser) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (
    typeof role !== 'undefined' &&
    !context.currentUser.roles?.includes(role)
  ) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}

```

### Integración específica de API

+++ Auth0

Si está utilizando Auth0, también debe [crear una API](https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api) y establecer el parámetro de audiencia, o recibirá un token opaco en lugar de un token JWT, y Redwood espera recibir un token JWT.

#### Control de acceso basado en roles (RBAC)

[El control de acceso basado en roles (RBAC) se](https://auth0.com/docs/authorization/concepts/rbac) refiere a la idea de asignar permisos a los usuarios según su rol dentro de una organización. Proporciona un control detallado y ofrece un enfoque simple y manejable para la administración de acceso que es menos propenso a errores que asignar permisos a los usuarios individualmente.

Básicamente, una función es una colección de permisos que puede aplicar a los usuarios. Un rol puede ser "administrador", "editor" o "editor". Esto difiere de los permisos, un ejemplo de los cuales podría ser "publicar: blog".

#### Metadatos de la aplicación

Auth0 stores information (such as, support plan subscriptions, security roles, or access control groups) in "App metadata". Data stored in `app_metadata` cannot be edited by users.

Cree y administre roles para su aplicación en las vistas de administración "Usuario y rol" de Auth0. Luego puede asignar estos roles a los usuarios.

Sin embargo, esa información no está disponible de inmediato en los metadatos de la aplicación del usuario o para RedwoodJS cuando se autentica.

Si asigna a su usuario el rol de "administrador" en Auth0, querrá que los metadatos de la aplicación de su usuario se vean así:

```
{
  "roles": [
    "admin"
  ]
}
```

Para configurar esta información y ponerla a disposición de RedwoodJS, puede utilizar [las Reglas Auth0](https://auth0.com/docs/rules) .

#### Reglas de autenticación para metadatos de aplicaciones

RedwoodJS necesita que `app_metadata` 1) contenga la información del rol y 2) esté presente en el JWT que se decodifica.

Para realizar estas tareas, puede usar [Reglas Auth0](https://auth0.com/docs/rules) para agregarlas como reclamos personalizados en su JWT.

##### Agregar roles de autorización a la regla de AppMetadata

Su primera regla agregará `Add Authorization Roles to AppMetadata` .

```js
/// Add Authorization Roles to AppMetadata
function (user, context, callback) {
    auth0.users.updateAppMetadata(user.user_id, context.authorization)
      .then(function(){
          callback(null, user, context);
      })
      .catch(function(err){
          callback(err);
      });
  }
```

Auth0 mantiene las asignaciones de roles de usuario `context.authorization` . Esta regla simplemente copia esa información en el `app_metadata` del usuario, como:

```
{
  "roles": [
    "admin"
  ]
}
```

Pero ahora debe incluir el `app_metdata` en el JWT del usuario que decodificará RedwoodJS.

##### Agregar AppMetadata a la regla JWT

Por lo tanto, su segunda regla agregará `Add AppMetadata to JWT` .

Puede agregar `app_metadata` a `idToken` o `accessToken` .

Agregar a `idToken` hará que los metadtos de la aplicación sean accesibles a `getuserMetadata` que para Auth0 llama al getUser del cliente de `getUser` .

Agregar a `accessToken` hará que los metadtos de la aplicación sean accesibles para RedwoodJS al decodificar el JWT a través de `getToken` .

Aunque agregar a `idToken` es opcional. *debe* agregar a `accessToken` .

Para evitar que sus reclamos personalizados choquen con reclamos reservados o reclamos de otros recursos, debe darles un [nombre único global usando un formato de espacio de nombres](https://auth0.com/docs/tokens/guides/create-namespaced-custom-claims) . De lo contrario, Auth0 *no* agregará la información a los token (s).

Por lo tanto, con un espacio de nombres de "https://example.com", los metadatos de la aplicación en su token deberían verse así:

```js
"https://example.com/app_metadata": {
  "authorization": {
    "roles": [
      "admin"
    ]
  }
},
```

Para configurar esta información de espacio de nombres, use la siguiente función en su regla:

```js
function (user, context, callback) {
  var namespace = 'https://example.com/';

  // adds to idToken, ie userMetadata in RedwoodJS
  context.idToken[namespace + 'app_metadata'] = {};
  context.idToken[namespace + 'app_metadata'].authorization = {
    groups: user.app_metadata.groups,
    roles: user.app_metadata.roles,
    permissions: user.app_metadata.permissions
  };

  context.idToken[namespace + 'user_metadata'] = {};

  // accessToken, ie the decoded JWT in RedwoodJS
  context.accessToken[namespace + 'app_metadata'] = {};
  context.accessToken[namespace + 'app_metadata'].authorization = {
    groups: user.app_metadata.groups,
    roles: user.app_metadata.roles,
    permissions: user.app_metadata.permissions
  };

   context.accessToken[namespace + 'user_metadata'] = {};

  return callback(null, user, context);
}
```

Ahora, su `app_metadata` con información de `authorization` y `role` estará en el JWT del usuario después de iniciar sesión.

#### Agregar soporte de hasRole de la aplicación

Si tiene la intención de admitir, RBAC, entonces en su `api/src/lib/auth.js` necesita extraer `roles` usando la utilidad `parseJWT` y establecer estos roles en `currentUser` .

Si sus roles están en una reclamación de app_metadata con espacio de nombres, `parseJWT` proporciona una opción para proporcionar este valor.

```js
// api/src/lib/auth.js`
const NAMESPACE = 'https://example.com'

const currentUserWithRoles = async (decoded) => {
  const currentUser = await userByUserId(decoded.sub)
  return {
    ...currentUser,
    roles: parseJWT({ decoded: decoded, namespace: NAMESPACE }).roles,
  }
}

export const getCurrentUser = async (decoded, { type, token }) => {
  try {
    requireAccessToken(decoded, { type, token })
    return currentUserWithRoles(decoded)
  } catch (error) {
    return decoded
  }
}
```

##### Protección de funciones en funciones, servicios y web

Puede especificar un rol opcional en `requireAuth` para verificar si el usuario está autenticado y tiene asignado el rol:

```js
export const myThings = () => {
  requireAuth({ role: 'admin'})

  return db.user.findOne({ where: { id: context.currentUser.id } }).things()
}

You can also protect routes:

```

<router>
</router>

  <private unauthenticated="forbidden" role="admin">
    <route path="/settings" page="{SettingsPage}" name="settings"></route>
    <route path="/admin" page="{AdminPage}" name="sites"></route>
  </private>



<route notfound="" page="{NotFoundPage}"></route><route path="/forbidden" page="{ForbiddenPage}" name="forbidden"></route>''

Y también protege el contenido en páginas o componentes a través del gancho `userAuth()` :

```
const { isAuthenticated, hasRole } = useAuth()

...

{hasRole('admin') && (
  <Link to={routes.admin()}>Admin</Link>
)}
```

+++

+++ Magic.Link

La API de Redwood no incluye la funcionalidad para decodificar los tokens de autenticación de magiclinks por lo que el cliente se inicia y decodifica los tokens dentro de `getCurrentUser` .

Magic.link recomienda utilizar el emisor como ID de usuario.

```js
// redwood/api/src/lib/auth.ts
import { Magic } from '@magic-sdk/admin'

export const getCurrentUser = async (_decoded, { token }) => {
  const mAdmin = new Magic(process.env.MAGICLINK_SECRET)
  const {
    email,
    publicAddress,
    issuer,
  } = await mAdmin.users.getMetadataByToken(token)

  return await db.user.findOne({ where: { issuer } })
}
```

+++

+++ Firebase

You must follow the ["Before you begin"](https://firebase.google.com/docs/auth/web/google-signin) part of the "Authenticate Using Google Sign-In with JavaScript" guide. +++

### Rutas

Las rutas pueden requerir autenticación envolviéndolas en un componente `<Private>` . Un usuario no autenticado será redirigido a la página especificada en `unauthenticated` .

```js
import { Router, Route, Private } from "@redwoodjs/router"

<Router>
  <Route path="/" page={HomePage} name="home" />
  <Route path="/login" page={LoginPage} name="login" />

  <Private unauthenticated="login">
    <Route path="/admin" page={AdminPage} name="admin" />
    <Route path="/secret-page" page={SecretPage} name="secret" />
  </Private>
</Router>
```

Las rutas también se pueden volver a dirigir por rol especificando `hasRole(roleName)` en el componente `<Private>` . Un usuario que no tenga asignado el rol será redirigido a la página especificada como `unauthenticated` .

```js
import { Router, Route, Private } from "@redwoodjs/router"

<Router>
  <Route path="/" page={HomePage} name="home" />
  <Route path="/login" page={LoginPage} name="login" />
  <Route path="/forbidden" page={ForbiddenPage} name="login" />

  <Private unauthenticated="login">
    <Route path="/secret-page" page={SecretPage} name="secret" />
  </Private>

  <Private unauthenticated="forbidd4n" hasRole="admin">
    <Route path="/admin" page={AdminPage} name="admin" />
  </Private>
</Router>
```

## Contribuyendo

Ver https://github.com/redwoodjs/redwood/blob/main/packages/auth/README.md
