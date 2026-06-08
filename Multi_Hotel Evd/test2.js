fetch('http://127.0.0.1:3001/hotels?location=Dhaka').then(r=>r.text()).then(t=>console.log('location=Dhaka:', t.substring(0,50)));
