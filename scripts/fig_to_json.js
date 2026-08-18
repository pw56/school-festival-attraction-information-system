import { promises as fs } from 'fs';
import { parseFig } from 'openfig-core'; // もしパッケージ名が openfig-core の場合は 'openfig-core' からインポート

async function convertFigToJson(inputFilePath, outputFilePath) {
  try {
    console.log(`[読み込み中] ${inputFilePath}...`);
    
    // 1. .figファイルをバイナリ（Buffer）として読み込む
    const fileBuffer = await fs.readFile(inputFilePath);

    console.log('[パース中] OpenFigでファイルを解析しています...');
    // 2. OpenFigを使ってFigmaバイナリをノードツリーにパース
    const nodeTree = await parseFig(fileBuffer);

    // 3. パースされたオブジェクトをインデント付きのJSON文字列に変換
    const jsonString = JSON.stringify(nodeTree, null, 2);

    // 4. JSONファイルとして保存
    await fs.writeFile(outputFilePath, jsonString, 'utf-8');
    
    console.log(`[完了] JSONファイルが正常に出力されました: ${outputFilePath}`);
  } catch (error) {
    console.error('[エラーが発生しました]', error);
  }
}

// 実行（引数にパースしたい.figファイルと、出力先のパスを指定）
const inputFigFile = './pwa.fig';
const outputJsonFile = './figma_output.json';

convertFigToJson(inputFigFile, outputJsonFile);
