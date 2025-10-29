import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ImageDiagnosticProps {
  imageUrl: string;
}

export const ImageDiagnostic: React.FC<ImageDiagnosticProps> = ({ imageUrl }) => {
  const [testResults, setTestResults] = useState<{
    directFetch: string;
    imgTag: string;
    supabaseMethod: string;
    session: string;
  }>({
    directFetch: 'Testing...',
    imgTag: 'Testing...',
    supabaseMethod: 'Testing...',
    session: 'Testing...',
  });

  useEffect(() => {
    const runTests = async () => {
      const results = { ...testResults };

      // Test 1: Session status
      const { data: { session } } = await supabase.auth.getSession();
      results.session = session ? `✅ Connected as ${session.user.email}` : '❌ Not connected';

      // Test 2: Direct fetch
      try {
        const response = await fetch(imageUrl);
        results.directFetch = `${response.status} ${response.statusText}`;
      } catch (err) {
        results.directFetch = `❌ Error: ${(err as Error).message}`;
      }

      // Test 3: Supabase getPublicUrl
      if (imageUrl.includes('storage/v1/object/public/product-images/')) {
        const path = imageUrl.split('storage/v1/object/public/product-images/')[1];
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        results.supabaseMethod = data.publicUrl === imageUrl ? '✅ Same URL' : `⚠️ Different: ${data.publicUrl}`;
      } else {
        results.supabaseMethod = '⚠️ Not a Supabase Storage URL';
      }

      setTestResults(results);
    };

    runTests();
  }, [imageUrl]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white border-2 border-red-500 rounded-lg p-4 max-w-md shadow-2xl">
      <h3 className="font-bold text-red-600 mb-2">🔍 IMAGE DIAGNOSTIC</h3>
      <div className="text-xs space-y-1 font-mono">
        <div><strong>Session:</strong> {testResults.session}</div>
        <div><strong>Direct Fetch:</strong> {testResults.directFetch}</div>
        <div><strong>Supabase Method:</strong> {testResults.supabaseMethod}</div>
        <div className="mt-2 pt-2 border-t">
          <strong>URL:</strong>
          <div className="break-all text-[10px] text-gray-600">{imageUrl}</div>
        </div>
        <div className="mt-2">
          <strong>Test Images:</strong>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <div className="text-[10px] text-gray-600 mb-1">Standard img</div>
              <img
                src={imageUrl}
                alt="test standard"
                className="w-20 h-20 object-cover border"
                onLoad={() => console.log('✅ Standard img loaded')}
                onError={(e) => {
                  console.error('❌ Standard img failed', e);
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 mb-1">With referrerPolicy</div>
              <img
                src={imageUrl}
                alt="test referrer"
                className="w-20 h-20 object-cover border"
                referrerPolicy="no-referrer"
                onLoad={() => console.log('✅ Referrer img loaded')}
                onError={(e) => {
                  console.error('❌ Referrer img failed', e);
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 mb-1">With crossOrigin</div>
              <img
                src={imageUrl}
                alt="test cors"
                className="w-20 h-20 object-cover border"
                crossOrigin="anonymous"
                onLoad={() => console.log('✅ CORS img loaded')}
                onError={(e) => {
                  console.error('❌ CORS img failed', e);
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
              />
            </div>
            <div>
              <div className="text-[10px] text-gray-600 mb-1">Both attributes</div>
              <img
                src={imageUrl}
                alt="test both"
                className="w-20 h-20 object-cover border"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onLoad={() => console.log('✅ Both attributes loaded')}
                onError={(e) => {
                  console.error('❌ Both attributes failed', e);
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
