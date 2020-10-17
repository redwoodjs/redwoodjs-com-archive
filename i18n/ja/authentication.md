# 認証

`@redwoodjs/auth`は、一般的な SPA 認証ライブラリの軽量ラッパーです。現在、次の認証プロバイダーをサポートしています。

- [NetlifyID ウィジェット](https://github.com/netlify/netlify-identity-widget)
- [Auth0](https://github.com/auth0/auth0-spa-js)
- [Netlify GoTrue-JS](https://github.com/netlify/gotrue-js)
- [マジックリンク-Magic.js](https://github.com/MagicHQ/magic-js)
- [Firebase の GoogleAuthProvider](https://firebase.google.com/docs/reference/js/firebase.auth.GoogleAuthProvider)
- [貢献してください](#contributing)、それは SuperEasy™ です！

[AuthPlayground を](https://github.com/redwoodjs/playground-auth)チェックしてください。

## インストール

### CLI 認証ジェネレーター

次の CLI コマンドは、Redwood Projects に必要なパッケージをインストールし、定型コードとファイルを生成します。

```terminal
yarn rw g auth [provider]
```

- `[provider]`は、「auth0」、「custom」、「firebase」、「goTrue」、「magicLink」、「netlify」のいずれかになります。

### 手動インストール

+++ NetlifyIdentity ウィジェット

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

## セットアップ

認証クライアントをインスタンス化し、それを`<AuthProvider>` 。

+++ NetlifyIdentity ウィジェット

Netlify サイトで Identity を有効にする必要があります。 [Netlify IdentitySetup を](https://redwoodjs.com/tutorial/authentication#netlify-identity-setup)参照してください。

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

Netlify サイトで Identity を有効にする必要があります。 [Netlify IdentitySetup を](https://redwoodjs.com/tutorial/authentication#netlify-identity-setup)参照してください。

GoTrue-JS パッケージを Web 側に追加します。

```terminal
yarn workspace web add gotrue-js
```

GoTrue をインスタンス化し、構成を渡します。必ず APIUrl を Netlify サイトの[ID]タブにある API エンドポイントに設定してください。

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

アプリケーションキーを取得するには、SPA クイックスタートガイドの[「認証の構成」](https://auth0.com/docs/quickstart/spa/react#get-your-application-keys)セクションのみを完了してください。

**NOTE** If you're using Auth0 with Redwood then you must also [create an API](https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api) and set the audience parameter, or you'll receive an opaque token instead of the required JWT token.

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

#### ログインおよびログアウトオプション

Auth0 クライアントを使用する場合、 `login`と`logout`は、クライアント構成を上書きするために使用できる`options`があります。

- `returnTo`: a permitted logout url set in Auth0
- `redirectTo` ：ログイン後のターゲット URL

The latter is helpful when an unauthenticated user visits a Private route, but then is redirected to the `unauthenticated` route. The Redwood router will place the previous requested path in the pathname as a `redirectTo` parameter which can be extracted and set in the Auth0 `appState`. That way, after successfully logging in, the user will be directed to this `targetUrl` rather than the config's callback.

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

アプリケーションキーを取得するには、 [dashboard.magic.link](https://dashboard.magic.link/)に移動し、API キーに移動して.env に追加します

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

[Firebase Google サインイン](https://firebase.google.com/docs/auth/web/google-signin)を使用しているため、このガイドの[「始める前に」の](https://firebase.google.com/docs/auth/web/google-signin#before_you_begin)手順に従う必要があります。 「始める前に」の部分**のみに**従ってください。

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

#### 使用法

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

次の値は、 `useAuth`フックから利用できます。

- async `logIn()` ：クライアントライブラリに基づいて異なり、Netlify Identity ではポップアップが表示され、Auth0 ではユーザーがリダイレクトされます
- async `logOut()` ：現在のユーザーをログアウトします
- `currentUser` ：現在のユーザーに関する情報を含むオブジェクト。ユーザーが認証されていない場合は`null`
- async `reauthenticate()`: 認証データを再フェッチし、状態を入力します。
- async `getToken()` ：jwt を返します
- `client` ： `AuthProvider`渡したクライアントのインスタンスにアクセスします
- `isAuthenticated` ：現在のユーザーが認証されているかどうかを判断するために使用されます
- `hasRole` ：現在のユーザーに役割が割り当てられているかどうかを判断するために使用されます
- `loading` ：ユーザーが初めてサイトにアクセスしたときに認証状態が非同期に復元されます。これを使用して、正しい状態かどうかを判断します。

## レッドウッドでの使用法

Redwood は、Auth パッケージを使用するときに zeroconf エクスペリエンスを提供します！

### GraphQL クエリとミューテーション

GraphQL リクエストは、ユーザーが認証されると自動的に`Authorization`ヘッダーを受け取ります。

### API

ユーザーがサインインしている場合、` Authorization {/ code0}トークンが検証、デコードされ、` context.currentUser {/ code1}で利用可能になります``

```js
import { context } from '@redwoodjs/api'

console.log(context.currentUser)
// {
//    sub: '<netlify-id>
//    email: 'user@example.com',
//    [...]
// }
```

`getCurrentUser`関数を`createCreateGraphQLHandler`渡すことで、「生のデコードされた JWT」を実際のユーザーオブジェクトにマッピングできます。

`getCurrentUser`をエクスポートする`src/lib/auth.js|ts`ファイルを作成することをお勧めします。 （注：すでにスタブ関数がある場合があります。）

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

` getCurrentUser {/ code0}によって返される値は、` context.currentUser {/ code1}で利用できます。``

サービスで`requireAuth`を使用して、ユーザーがログインしているかどうか、ロールが割り当てられているかどうかを確認し、そうでない場合はオプションでエラーを発生させます。

```js
export const requireAuth = ({ role }) => {
  if (!context.currentUser) {
    throw new AuthenticationError("You don't have permission to do that.")
  }

  if (typeof role !== 'undefined' && !context.currentUser.roles?.includes(role)) {
    throw new ForbiddenError("You don't have access to do that.")
  }
}
```

### API 固有の統合

+++ Auth0

Auth0 を使用している場合は、[ API {/ a0}を作成し、オーディエンスパラメータを設定する必要があります。そうしないと、JWT トークンの代わりに不透明なトークンを受け取り、Redwood は JWT トークンを受け取ることを期待します。](https://auth0.com/docs/quickstart/spa/react/02-calling-an-api#create-an-api)

#### 役割ベースのアクセス制御（RBAC）

[ロールベースのアクセス制御（RBAC）](https://auth0.com/docs/authorization/concepts/rbac)は、組織内でのロールに基づいてユーザーにアクセス許可を割り当てるという考え方を指します。これは、きめ細かい制御を提供し、ユーザーに個別にアクセス許可を割り当てるよりもエラーが発生しにくい、アクセス管理へのシンプルで管理しやすいアプローチを提供します。

基本的に、ロールは、ユーザーに適用できる権限のコレクションです。役割は、「管理者」、「編集者」、または「発行者」の場合があります。これは、「publish：blog」などのアクセス許可とは異なります。

#### アプリのメタデータ

Auth0 は、情報（サポートプランのサブスクリプション、セキュリティロール、アクセス制御グループなど）を「アプリメタデータ」に保存します。 `app_metadata`保存されているデータは、ユーザーが編集することはできません。

Auth0 の「ユーザーとロール」管理ビューでアプリケーションのロールを作成および管理します。次に、これらの役割をユーザーに割り当てることができます。

ただし、その情報は、認証時にユーザーのアプリメタデータまたは RedwoodJS ですぐに利用できるわけではありません。

ユーザーに Auth0 の「管理者」ロールを割り当てる場合、ユーザーの app_metadata を次のように表示する必要があります。

```
{
  "roles": [
    "admin"
  ]
}
```

この情報を設定して RedwoodJS で利用できるようにするには、 [Auth0 ルール](https://auth0.com/docs/rules)を使用できます。

#### アプリメタデータの Auth0 ルール

RedwoodJS は、 `app_metadata`が 1）役割情報を含み、2）デコードされる JWT に存在する必要があります。

これらのタスクを実行するには、 [Auth0 ルール](https://auth0.com/docs/rules)を使用して、JWT にカスタムクレームとして追加します。

##### AppMetadata ルールに承認ロールを追加する

最初のルールは`Add Authorization Roles to AppMetadata` 。

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

Auth0 は、ユーザーロールの割り当て`context.authorization`維持します。このルールは、その情報をユーザーの`app_metadata`にコピーするだけです。

```
{
  "roles": [
    "admin"
  ]
}
```

しかし、今あなたが含まれている必要があり`app_metdata` RedwoodJS が解読することをユーザーの JWT 上を。

##### AppMetadata を JWT ルールに追加する

したがって、2 番目のルールは`Add AppMetadata to JWT`ます。

`app_metadata`を`idToken`または`accessToken`追加できます。

`idToken`追加すると、アプリメタデータが RedwoodJS getuserMetadata にアクセスできるようになり、Auth0 の`getuserMetadata`は認証クライアントの`getUser`ます。

Adding to `accessToken` will make the make App metadta accessible to RedwoodJS when decoding the JWT via `getToken`.

While adding to `idToken` is optional. you _must_ add to `accessToken`.

To keep your custom claims from colliding with any reserved claims or claims from other resources, you must give them a [globally unique name using a namespaced format](https://auth0.com/docs/tokens/guides/create-namespaced-custom-claims). Otherwise, Auth0 will _not_ add the infomration to the token(s).

したがって、名前空間が「https://example.com」の場合、トークンのapp_metadataは次のようになります。

```js
"https://example.com/app_metadata": {
  "authorization": {
    "roles": [
      "admin"
    ]
  }
},
```

この名前空間情報を設定するには、ルールで次の関数を使用します。

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

これで、 `authorization`と`role`情報を`app_metadata`が、ログイン後にユーザーの JWT に表示されます。

#### アプリケーションの追加 hasRole サポート

If you intend to support, RBAC then in your `api/src/lib/auth.js` you need to extract `roles` using the `parseJWT` utility and set these roles on `currentUser`.

ロールが名前空間付きの app_metadata クレームにある場合、 `parseJWT`はこの値を提供するオプションを提供します。

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

##### 機能、サービス、および Web での役割保護

`requireAuth`オプションのロールを指定して、ユーザーが認証され、ロールが割り当てられているかどうかを確認できます。

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

<route notfound="" page="{NotFoundPage}"></route><route path="/forbidden" page="{ForbiddenPage}" name="forbidden"></route>`` `

また、 `userAuth()`フックを介してページまたはコンポーネントのコンテンツを保護します。

```
const { isAuthenticated, hasRole } = useAuth()

...

{hasRole('admin') && (
  <Link to={routes.admin()}>Admin</Link>
)}
```

+++

+++ Magic.Link

redwood API には、magiclinks 認証トークンをデコードする機能が含まれていないため、クライアントが開始され、 `getCurrentUser`内のトークンがデコードされます。

Magic.link は、発行者をユーザー ID として使用することをお勧めします。

```js
// redwood/api/src/lib/auth.ts
import { Magic } from '@magic-sdk/admin'

export const getCurrentUser = async (_decoded, { token }) => {
  const mAdmin = new Magic(process.env.MAGICLINK_SECRET)
  const { email, publicAddress, issuer } = await mAdmin.users.getMetadataByToken(token)

  return await db.user.findOne({ where: { issuer } })
}
```

+++

+++ Firebase

You must follow the ["Before you begin"](https://firebase.google.com/docs/auth/web/google-signin) part of the "Authenticate Using Google Sign-In with JavaScript" guide. +++

### ルート

ルートは、 `<Private>`コンポーネントでラップすることにより、認証を要求できます。認証されていないユーザーは、 `unauthenticated`指定されたページにリダイレクトされます。

```js
import { Router, Route, Private } from '@redwoodjs/router'

;<Router>
  <Route path="/" page={HomePage} name="home" />
  <Route path="/login" page={LoginPage} name="login" />

  <Private unauthenticated="login">
    <Route path="/admin" page={AdminPage} name="admin" />
    <Route path="/secret-page" page={SecretPage} name="secret" />
  </Private>
</Router>
```

`<Private>`コンポーネントで`hasRole(roleName)`指定することにより、ロールによってルートを再制限することもできます。ロールが割り当てられていないユーザーは、 `unauthenticated`指定されたページにリダイレクトされます。

```js
import { Router, Route, Private } from '@redwoodjs/router'

;<Router>
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

## 貢献

https://github.com/redwoodjs/redwood/blob/main/packages/auth/README.mdを参照してください
