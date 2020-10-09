function updateColumn(item) {
    if(item===0 || item[0]===0){
        return {
            result:false,
            msg:"update err:It's already same value or No item"
        };
    }else{
        return {
            result:true,
            msg:"update success"
        };
    }
}

module.exports = updateColumn;