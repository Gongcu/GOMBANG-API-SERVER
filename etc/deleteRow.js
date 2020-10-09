function deleteColumn(item) {
    if(item===0 || item[0]===0){
        return {
            result:false,
            msg:"delete err:"
        };
    }else{
        return {
            result:true,
            msg:"delete success"
        };
    }
}

module.exports = deleteColumn;