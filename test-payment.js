fetch('http://localhost:3001/api/v1/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'test',
    language: 'teal'
  })
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  console.log('Body:', await res.json());
});