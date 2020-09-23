function formatDeleteResult(str) {
    if(str.deletedCount===0){
        return false;
    }else{
        return true;
    }
}

module.exports = formatDeleteResult;