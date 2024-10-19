module.exports = function(text){
	try {
    console.log('prishlo')
    console.log(text)
    console.log('.prishlo')
		const jsonStatus = JSON.parse(text);
    return jsonStatus
	} catch (e) {
    console.error('Failed to parse JSON:', e);
    return false		
	}
}
