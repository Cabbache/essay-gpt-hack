// require dependencies
const PDFDocument = require('pdfkit');
const blobStream = require('blob-stream');

let blob;

const port = 40780;
//const backend = `https://${window.location.hostname}:${port}`;
const backend = `http://${window.location.hostname}:${port}/query`;

global.generate = function(event){
	event.preventDefault();

	const iframe = document.getElementById('iframe-id');
	iframe.src = "loadingpage.html";
	
	const title = document.getElementById('title').value;
	const wcount = parseInt(document.getElementById('word_count').value);
	const exotic = document.getElementById('exotic_check').checked;
	const ducks = document.getElementById('ducks_check').checked;
	document.getElementById('gen_btn').disabled = true;

	const query = JSON.stringify(
		{
			title: title,
			words: wcount,
			exotic: exotic,
			ducks: ducks,
		}
	);

	document.getElementById('gen_btn').disabled = true;
	document.getElementById('errDiv').innerHTML = '';
	fetch(backend, {
		method: 'POST',
		headers: {
			Accept: 'application.json',
			'Content-Type': 'application/json'
		},
		body: query
	})
	.then(async (response) => {
		if (response.status === 429)
			throw "You are being rate limited. Please wait.";

		response = await response.json();
		if (response.status !== 0)
			throw response.message;

		const doc = new PDFDocument();
		var stream = doc.pipe(blobStream());
		doc.fontSize(25).text(title, {align: 'center'});
		doc.fontSize(18).text(response.message, {align: 'justify'});
		doc.end();
		stream.on("finish", function() {
			blob = stream.toBlob("application/pdf");
			const url = stream.toBlobURL("application/pdf");
			iframe.src = url;
		});
		
		document.getElementById('gen_btn').disabled = false;
	}).catch((error) => {
		iframe.src = '';
		document.getElementById('gen_btn').disabled = false;
		document.getElementById('errDiv').innerHTML = error;
	});
}
