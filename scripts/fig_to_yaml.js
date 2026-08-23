import { promises as fs } from 'fs';
import { parseFig } from 'openfig-core'; // もしパッケージ名が openfig-core の場合は 'openfig-core' からインポート

// 依存関係としてpathモジュールをインポート
import * as path from 'path';
// YAML変換用のライブラリをインポート
import yaml from 'yaml';

async function convertFigToJson(inputFilePath, outputFilePath) {
  try {
    console.log(`[読み込み中] ${inputFilePath}...`);
    
    // 1. .figファイルをバイナリ（Buffer）として読み込む
    const fileBuffer = await fs.readFile(inputFilePath);

    console.log('[パース中] OpenFigでファイルを解析しています...');
    // 2. OpenFigを使ってFigmaバイナリをノードツリーにパース
    const nodeTree = await parseFig(fileBuffer);

    // 不要なデータ(absoluteRenderBoundsのみ)を削除
    // 元々のOpenFigが吐くJSONを、ページやレイヤーなどのFigmaのデザインファイルと全く同じように構造(ツリー)が対応するように調整する処理を追加
    // ※ 内部のIDは消さずに残す
    
    // guidオブジェクトから一意の文字列キーを生成するヘルパー関数
    function getGuidKey(guid) {
      if (!guid) return '';
      return `${guid.sessionID}-${guid.localID}`;
    }

    // 指定された不要なプロパティを再帰的に削除する関数を追加
    function removeUnnecessaryKeys(obj) {
      if (Array.isArray(obj)) {
        obj.forEach(item => removeUnnecessaryKeys(item));
      } else if (obj !== null && typeof obj === 'object') {
        const keysToDelete = [
          'editInfo', 'userId', 'lastEditedAt', 'createdAt', 
          'pluginData', 'exportSettings', 'imageThumbnail', 
          'hash', 'thumbHash', 'commandsBlob'
        ];
        keysToDelete.forEach(key => {
          if (key in obj) {
            delete obj[key];
          }
        });
        Object.values(obj).forEach(value => removeUnnecessaryKeys(value));
      }
    }

    // 1. 全ノードのディープコピーを作成し、absoluteRenderBoundsを削除する共通処理
    const cleanNodes = {};
    const nodesArray = nodeTree.nodes || [];

    for (const node of nodesArray) {
      if (!node || !node.guid) continue;
      
      const copy = JSON.parse(JSON.stringify(node));
      if (copy.absoluteRenderBounds !== undefined) {
        delete copy.absoluteRenderBounds;
      }
      
      // 追加: 階層の深い箇所にある対象キーもまとめて削除
      removeUnnecessaryKeys(copy);
      
      const key = getGuidKey(copy.guid);
      cleanNodes[key] = copy;
    }

    // 各親ノードの文字列キーに対して、子ノードのguidオブジェクトの配列を格納するマップを自前で構築
    const customChildrenMap = {};
    for (const node of nodesArray) {
      if (!node || !node.guid || !node.parentIndex || !node.parentIndex.guid) continue;
      
      const parentKey = getGuidKey(node.parentIndex.guid);
      if (!customChildrenMap[parentKey]) {
        customChildrenMap[parentKey] = [];
      }
      // 子ノードの元のオブジェクト内のguidをそのまま追加
      customChildrenMap[parentKey].push(node.guid);
    }

    // 2. ツリー構造を再構築する関数
    function buildTree(nodeGuidKey) {
      const node = cleanNodes[nodeGuidKey];
      if (!node) return null;

      // 自前で構築したマッピングから子ノードのID（guid）リストを取得
      const childGuids = customChildrenMap[nodeGuidKey] || [];

      if (childGuids.length > 0) {
        node.children = childGuids
          .map(childGuid => {
            const childKey = getGuidKey(childGuid);
            return buildTree(childKey);
          })
          .filter(child => child !== null);
      }
      return node;
    }

    // ルートとなるDOCUMENTノードを配列から特定
    const rootNode = nodesArray.find(n => n && n.type === 'DOCUMENT');
    if (!rootNode || !rootNode.guid) {
      throw new Error('DOCUMENTノードが見つかりません。');
    }
    const rootId = getGuidKey(rootNode.guid);

    // DOCUMENT直下の子ノード（通常はCANVAS型 = ページ）のIDリストを取得
    const pageGuids = customChildrenMap[rootId] || [];

    // 出力フォルダのパスを確定（引数のoutputFilePathを出力フォルダのベースパスとして使用）
    const outputDir = outputFilePath;
    await fs.mkdir(outputDir, { recursive: true });

    // 各ページごとに処理を行い、パターンBの構造で保存
    for (const pageGuid of pageGuids) {
      const pageKey = getGuidKey(pageGuid);
      const pageNode = cleanNodes[pageKey];
      if (!pageNode) continue;

      // ページ名を取得（デフォルト値：文字列化したキー）
      const pageName = pageNode.name || pageKey;

      // Linuxの禁止文字（スラッシュ '/' と NULL文字 '\0'）を削除
      const safePageName = pageName.replace(/[\/\0]/g, '');

      // デザインファイルの同じ構造でYAMLファイルにする(出力フォルダ → ページ名.yaml)
      const targetYamlPath = path.join(outputDir, `${safePageName}.yaml`);

      // パターンB: DOCUMENTをルートにして、childrenには該当する1つのページのみを格納
      // DOCUMENT自体のツリーを再構築
      const documentRoot = buildTree(rootId);
      
      // 該当するページだけのツリーを構築して格納
      const pageTree = buildTree(pageKey);
      if (documentRoot) {
        documentRoot.children = pageTree ? [pageTree] : [];

        // 3. パースされたオブジェクトをインデント付きのYAML文字列に変換
        // yamlパッケージのstringifyを使用。折返しを防ぐため lineWidth: 0 を設定
        const yamlString = yaml.stringify(documentRoot, { lineWidth: 0 });

        // 4. YAMLファイルとして保存
        await fs.writeFile(targetYamlPath, yamlString, 'utf-8');
        console.log(`[ページ出力完了] YAMLファイルが正常に出力されました: ${targetYamlPath}`);
      }
    }
    
    console.log(`[完了] 全ページのYAMLファイルが正常に出力されました: ${outputDir}`);
  } catch (error) {
    console.error('[エラーが発生しました]', error);
  }
}

// 実行（引数にパースしたい.figファイルと、出力先のパスを指定）
const inputFigFile = './pwa.fig';
// 出力フォルダを指定
const outputJsonFile = './output_pages';

convertFigToJson(inputFigFile, outputJsonFile);
