fetch('http://127.0.0.1:3001/hotels?ownerId=2').then(r=>r.text()).then(t=>console.log('2:', t.substring(0,50)));
fetch('http://127.0.0.1:3001/hotels?ownerId=\"2\"').then(r=>r.text()).then(t=>console.log('\"2\":', t.substring(0,50)));
