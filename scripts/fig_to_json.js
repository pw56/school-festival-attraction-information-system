import { promises as fs } from 'fs';
import { parseFig } from 'openfig-core'; // もしパッケージ名が openfig-core の場合は 'openfig-core' からインポート

// 依存関係としてpathモジュールをインポート
import * as path from 'path';

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
    
    // 1. 全ノードのディープコピーを作成し、absoluteRenderBoundsを削除する共通処理
    const cleanNodes = {};
    for (const [id, node] of Object.entries(nodeTree.nodes || {})) {
      const copy = JSON.parse(JSON.stringify(node));
      if (copy.absoluteRenderBounds !== undefined) {
        delete copy.absoluteRenderBounds;
      }
      cleanNodes[id] = copy;
    }

    // 2. ツリー構造を再構築する関数
    function buildTree(nodeId) {
      const node = cleanNodes[nodeId];
      if (!node) return null;

      // childrenMapから子ノードのIDリストを取得
      const childIds = nodeTree.childrenMap?.[nodeId] || [];
      if (childIds.length > 0) {
        node.children = childIds
          .map(id => buildTree(id))
          .filter(child => child !== null);
      }
      return node;
    }

    // ルートとなるDOCUMENTノードを特定
    const rootId = nodeTree.rootId || '0:0';
    const originalDocument = cleanNodes[rootId];

    if (!originalDocument) {
      throw new Error('DOCUMENTノードが見つかりません。');
    }

    // DOCUMENT直下の子ノード（通常はCANVAS型 = ページ）のIDリスト
    const pageIds = nodeTree.childrenMap?.[rootId] || [];

    // 出力フォルダのパスを確定（引数のoutputFilePathを出力フォルダのベースパスとして使用）
    const outputDir = outputFilePath;
    await fs.mkdir(outputDir, { recursive: true });

    // 各ページごとに処理を行い、パターンBの構造で保存
    for (const pageId of pageIds) {
      const pageNode = cleanNodes[pageId];
      if (!pageNode) continue;

      // ページ名を取得（デフォルト値：pageId）
      const pageName = pageNode.name || pageId;

      // Linuxの禁止文字（スラッシュ '/' と NULL文字 '\0'）を削除
      const safePageName = pageName.replace(/[\/\0]/g, '');

      // デザインファイルの同じ構造でJSONファイルにする(出力フォルダ → ページ名.json)
      const targetJsonPath = path.join(outputDir, `${safePageName}.json`);

      // パターンB: DOCUMENTをルートにして、childrenには該当する1つのページのみを格納
      // DOCUMENT自体のツリーを再構築
      const documentRoot = buildTree(rootId);
      
      // 該当するページだけのツリーを構築して格納
      const pageTree = buildTree(pageId);
      documentRoot.children = pageTree ? [pageTree] : [];

      // 3. パースされたオブジェクトをインデント付きのJSON文字列に変換
      const jsonString = JSON.stringify(documentRoot, null, 2);

      // 4. JSONファイルとして保存
      await fs.writeFile(targetJsonPath, jsonString, 'utf-8');
      console.log(`[ページ出力完了] JSONファイルが正常に出力されました: ${targetJsonPath}`);
    }
    
    console.log(`[完了] 全ページのJSONファイルが正常に出力されました: ${outputDir}`);
  } catch (error) {
    console.error('[エラーが発生しました]', error);
  }
}

// 実行（引数にパースしたい.figファイルと、出力先のパスを指定）
const inputFigFile = './pwa.fig';
// 出力フォルダを指定
const outputJsonFile = './output_pages';

convertFigToJson(inputFigFile, outputJsonFile);
