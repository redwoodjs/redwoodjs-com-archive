# アプリの構成：redwood.toml

Redwoodアプリの設定は`redwood.toml`構成できます。デフォルトでは、 `redwood.toml`には次の構成オプションがリストされています。

<!-- TODO -->

<!-- toml syntax coloring not working here -->

```toml
[web]
  port = 8910
  apiProxyPath = "/.netlify/functions"
[api]
  port = 8911
[browser]
  open = true
```

<br>これらは、構成する可能性が最も高いものであるため、デフォルトでリストされています。しかし、利用できるオプションがもっとたくさんあります。残りは、Redwoodの<a> webpack構成ファイル{/ a1}と<code data-md-type="codespan"> @ redwoodjs / internal {/ code1}の<a href="https://github.com/redwoodjs/redwood/blob/main/packages/internal/src/config.ts#L42-L60" data-md-type="link"> config.ts {/ a2}の間に分散されます。</a></code></a>

```javascript
// redwood/packages/internal/src/config.ts

const DEFAULT_CONFIG: Config = {
  web: {
    host: 'localhost',
    port: 8910,
    path: './web',
    target: TargetEnum.BROWSER,
    apiProxyPath: '/.netlify/functions',
  },
  api: {
    host: 'localhost',
    port: 8911,
    path: './api',
    target: TargetEnum.NODE,
  },
  browser: {
    open: true,
  },
}
```

オプションとその構造は、レッドウッドの側面とターゲットの概念に基づいています。 現在、Redwoodには、NodeJS LambdasとBrowserをそれぞれターゲットとする、apiとwebの2つの固定面があります。 将来的には、ElectronやReact Nativeなどのサイドとターゲットのサポートを追加する予定です（[ TargetEnum {/ a0}に列挙型としてリストされています）。そうすると、それらが表示されます。 ` redwood.toml {/ code1}に反映されます。 ただし、現時点では、` target {/ code2}のようなオプションには触れない可能性があります。``](https://github.com/redwoodjs/redwood/blob/d51ade08118c17459cebcdb496197ea52485364a/packages/internal/src/config.ts#L11-L12)

将来的には、ここでの変更により、カスケードの「アプリレベル」の効果が生じるという考え方です。例としてジェネレーターを使用すると、サイドとターゲットに基づいて、ジェネレーターの動作は異なりますが、適切に異なります。

> 「サイド」と「ターゲット」の違いについては、 [Redwood FileStructureを](https://redwoodjs.com/tutorial/redwood-file-structure)参照してください。

`redwood.toml`は、Redwoodのwebpack構成ファイル上の便利なレイヤーと考えることができます。 、特定の設定のため、代わりに直接のWebPACKに対処することで、私たちはあなたを経由してすばやくアクセス与えていること`redwood.toml` 。これらの設定の一部は開発用、一部は本番用、一部は両方用です。あなたは、実際に、これは各configuraitonオプションがイン・参照されるWebPACKのファイルに反映さ見ることができます[webpack.development.js](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/webpack.development.js) 、 [webpack.production.js](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/webpack.production.js) 、および[webpack.common.jsを](https://github.com/redwoodjs/redwood/blob/main/packages/core/config/webpack.common.js)。

<!-- https://github.com/redwoodjs/redwood/pull/152#issuecomment-593835518 -->

`redwood.toml`は、少し大きな目的も果たします。これは、Redwoodプロジェクトのベースディレクトリを決定するために使用されます。したがって、このファイルは、Redwoodアプリを実際にRedwoodアプリにするものです。それを削除して`yarn rw dev`を実行すると、エラーが発生します。

```terminal
Error: Could not find a "redwood.toml" file, are you sure you're in a Redwood project?
```

（だからそうしないでください！）

## [ウェブ]

Web側の構成。

キー | 説明 | デフォルト | 環境
:-- | :-- | :-- | :--
`host` | リッスンするホスト名 | `'localhost'` | `development`
`port` | 聞くポート | `8910` | `development`
`path` | ウェブ側へのパス | `'./web'` | `both`
`target` | Web側のターゲット | `TargetEnum.BROWSER` | `both`
`apiProxyPath` | API側へのプロキシパス | `'/.netlify/functions'` | `production`
`includeEnvironmentVariables` | ホワイトリストに登録する環境変数 |  | `both`

### apiProxyPath

```toml
[web]
  apiProxyPath = "/.netlify/functions"
```

サーバーレス機能へのパス。アプリをローカルで実行している場合、これはエイリアス化されます（ [webpack.common.jsで](https://github.com/redwoodjs/redwood/blob/49c3afecc210709641dd340b974c86251ed207dc/packages/core/config/webpack.development.js#L21-L28)その方法を正確に確認できます（これがWebpackの[devServer.proxyの](https://webpack.js.org/configuration/dev-server/#devserverproxy)ドキュメントです）。

RedwoodはNetlifyとうまく連携するため、デフォルトでは[同じプロキシパス](https://docs.netlify.com/functions/build-with-javascript)を使用します。他の場所に展開する場合は、これを変更する必要があります。

### includeEnvironmentVariables

<!-- https://github.com/redwoodjs/redwood/issues/427 -->

<!-- https://github.com/redwoodjs/redwood/blob/d51ade08118c17459cebcdb496197ea52485364a/packages/core/config/webpack.common.js#L17-L31 -->

```toml
[web]
  includeEnvironmentVariables = ['API_KEY']
```

`API_KEY`が.envまたは.env.defaultsで定義されている場合：

```plaintext
API_KEY=...
```

`includeEnvironmentVariables`は、Web側のホワイトリストに登録する環境変数のセットです。また、接頭辞の環境変数ができ`REDWOOD_ENV_` （参照[環境変数を](https://redwoodjs.com/docs/environment-variables#web)）。

## [api]

API側の構成。

キー | 説明 | デフォルト | 環境
:-- | :-- | :-- | :--
`host` | リッスンするホスト名 | `'localhost'` | `development`
`port` | 聞くポート | `8911` | `development`
`path` | API側へのパス | `'./api'` | `both`
`target` | API側のターゲット | `TargetEnum.NODE` | `both`

## [ブラウザ]

ブラウザターゲットの設定。

キー | 説明 | デフォルト | 環境
:-- | :-- | :-- | :--
`open` | 開発サーバーの起動後、ブラウザを開いてWebの`host:port`にアクセスします | `false` | `development`

### 開いた

```toml
[browser]
  open = true
```

このように`open`を<code data-md-type="codespan"> true に設定すると、開発サーバーの起動後にブラウザがWebの<code>host：port</code>（デフォルトではlocalhost：8910）に開きます。 <code>yarn rw dev</code>のときにブラウザが開かないようにする場合は、これをfalseに設定します。 または、完全に削除します。

システムのデフォルトの代わりに使用するブラウザの名前を指定することもできます。たとえば、 `open = 'Firefox'`は、システムのデフォルトのブラウザに関係なくFirefoxを開きます。

ここでできることは他にもたくさんあります。すべての詳細については、上のWebPACKのドキュメントを参照[devServer.openを](https://webpack.js.org/configuration/dev-server/#devserveropen)。

## コンテナまたはVM内で実行

コンテナまたはVM内でRedwoodアプリを実行するには、WebとAPIの`host`両方を`0.0.0.0`に設定して、ホストとの間のネットワーク接続を許可する必要があります。

```toml
[web]
  host = '0.0.0.0'
  ...
[api]
  host = '0.0.0.0'
  ...
```
