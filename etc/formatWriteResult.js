function formatWriteResult(str) {
    if(str.nModified===0){
        return false;
    }else{
        return true;
    }
}

module.exports = formatWriteResult;