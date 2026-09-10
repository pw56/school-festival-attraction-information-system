import { createRoot } from 'react-dom/client';
import App from './App';
import { SdkClient } from '../utils/sdk';

// SdkClient のインスタンスを作成（実装に応じて）
const sdkClient = new SdkClient({baseUrl: 'https://example.com'});

const root = createRoot(document.getElementById('root')!);
root.render(<App sdkClient={sdkClient} />);