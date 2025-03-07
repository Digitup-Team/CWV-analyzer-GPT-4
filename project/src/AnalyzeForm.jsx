import React, { useState } from 'react';

function AnalyzeForm() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter page URL"
        />
        <button type="submit">Analyze</button>
      </form>

      {loading && <p>Analyzing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {analysis && (
        <div>
          <h3>Analysis for: {analysis.url}</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{analysis.chatGptAnalysis}</pre>
        </div>
      )}
    </div>
  );
}

export default AnalyzeForm;
