function testCors() {
  fetch('http://localhost:3000/', {
    method: 'GET'
  }).then((response) => {
    return response.text()
  }).then((text) => {
    console.log(text);
  })
}

const button = document.getElementById('testButton');
button.addEventListener('click', testCors);