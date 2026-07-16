let model: any;
let isFirstCall: boolean = true;

// 人数検出のループ処理
async function countPairs(inputImage: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<number> {
  if (isFirstCall) {
    model = await cocoSsd.load();
    isFirstCall = false;
  }

  if (!model) throw new Error('Model not found');
  
  // 映像から人物を検出
  const predictions = await model.detect(inputImage);
  
  const people = predictions.filter((prediction: any) => prediction.class === 'person');
  
  // 検出された配列の長さが「写っている人数」
  return people.length;
}

export default countPairs;
