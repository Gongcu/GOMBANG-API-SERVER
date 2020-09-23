function formatDateTime(dateTime) { 
    var d = new Date(dateTime), 
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    hour=d.getHours(),
    minute=d.getMinutes(); 
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day; 

    var dateStr=[year, month, day].join('.');
    var timeStr=[hour,minute].join(':');

    return [dateStr, timeStr].join(' '); 
}

module.exports = formatDateTime;