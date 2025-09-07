import { useState, useEffect } from 'react';
import './App.css';

declare global {
  interface Navigator {
    nfc?: {
      scan: (options?: { signal?: AbortSignal }) => Promise<{
        serialNumber: string;
        records: Array<{
          recordType: string;
          mediaType?: string;
          data?: ArrayBuffer;
        }>;
      }>;
    };
  }
}

interface NFCData {
  serialNumber: string;
  records: Array<{
    recordType: string;
    mediaType?: string;
    data?: string;
  }>;
}

function App() {
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [nfcData, setNfcData] = useState<NFCData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('nfc' in navigator) {
      setNfcSupported(true);
    } else {
      setNfcSupported(false);
    }
  }, []);

  const handleScan = async () => {
    if (!navigator.nfc) {
      setError('NFC is not supported on this device');
      return;
    }

    setScanning(true);
    setError(null);
    setNfcData(null);

    try {
      const result = await navigator.nfc.scan();
      
      const processedRecords = result.records.map(record => ({
        recordType: record.recordType,
        mediaType: record.mediaType,
        data: record.data ? new TextDecoder().decode(record.data) : undefined
      }));

      setNfcData({
        serialNumber: result.serialNumber,
        records: processedRecords
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(`NFC Error: ${err.message}`);
      } else {
        setError('Failed to read NFC tag');
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>NFC Reader</h1>
        
        {!nfcSupported && (
          <div className="error">
            NFC is not supported on this device or browser
          </div>
        )}

        {nfcSupported && (
          <div className="nfc-controls">
            <button 
              onClick={handleScan} 
              disabled={scanning}
              className="scan-button"
            >
              {scanning ? 'Scanning...' : 'Scan NFC Tag'}
            </button>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {nfcData && (
          <div className="nfc-data">
            <h2>NFC Tag Data</h2>
            <div className="data-field">
              <strong>Serial Number:</strong> {nfcData.serialNumber}
            </div>
            
            {nfcData.records.length > 0 && (
              <div className="records">
                <h3>Records:</h3>
                {nfcData.records.map((record, index) => (
                  <div key={index} className="record">
                    <div><strong>Type:</strong> {record.recordType}</div>
                    {record.mediaType && <div><strong>Media Type:</strong> {record.mediaType}</div>}
                    {record.data && <div><strong>Data:</strong> {record.data}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App
