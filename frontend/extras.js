function validate(){
	if (hasGoodChars(document.getElementById('title').value)){
		document.getElementById('title').style.borderColor = "#ccc";
	} else {
		document.getElementById('title').style.borderColor = "red";
	}
}

function hasGoodChars(title){
	return !title.match(/[^a-zA-Z0-9\-\'\!\$\ \(\)\[\]\,\.\;\?]/);
}

const winput = document.getElementById('word_count');
winput.value = 150;
setVal(winput.value);
document.getElementById('iframe-id').src = '';
