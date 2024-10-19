const shell = require('shelljs');

module.exports = function(commd, txdata = '') {
    console.log("commd:")
    console.log(commd)
    let output;
    try {
        let result = shell.exec(commd, { silent: true, shell: '/bin/bash' });
        
        if (result.code !== 0) {  // Проверка на ошибки выполнения
            console.error('Command Error:', result.stderr ? result.stderr.trim() : 'Unknown error');
            output = 'Error get logs';
            return false            
        } else {
            output = result.stdout.trim();
        }
    } catch (e) {
        console.error('Exception:', e);
        output = 'Error get logs';
    }
    return output;
};
