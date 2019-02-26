var CService = function(connection){
this.recordSetToJSON = function (rs,rsName){
    rsName = typeof rsName !== 'undefined' ? rsName : 'entries';

    var meta = rs.getMetaData();
    var colCount = meta.getColumnCount();
    var values=[];
    var table=[];
    var value="";
    while (rs.next()) {
        for (var i=1; i<=colCount; i++) {
            value = '"'+meta.getColumnLabel(i)+'" : ';
            switch(meta.getColumnType(i)) {
                case $.db.types.VARCHAR:
                case $.db.types.CHAR:
                    value += '"'+ escapeSpecialChars(rs.getString(i))+'"';
                    break;
                case $.db.types.NVARCHAR:
                case $.db.types.NCHAR:
                case $.db.types.SHORTTEXT:
                    value += '"'+escapeSpecialChars(rs.getNString(i))+'"';
                    break;
                case $.db.types.TINYINT:
                case $.db.types.SMALLINT:
                case $.db.types.INT:
                case $.db.types.BIGINT:
                    value += rs.getInteger(i);
                    break;
                case $.db.types.DOUBLE:
                    value += rs.getDouble(i);
                    break;
                case $.db.types.DECIMAL:
                    value += rs.getDecimal(i);
                    break;
                case $.db.types.REAL:
                    value += rs.getReal(i);
                    break;
                case $.db.types.NCLOB:
                case $.db.types.TEXT:
                    value += '"'+ escapeSpecialChars(rs.getNClob(i))+'"';
                    break;
                case $.db.types.CLOB:
                    value += '"'+ escapeSpecialChars(rs.getClob(i))+'"';
                    break;
                case $.db.types.BLOB:
                    value += '"'+ $.util.convert.encodeBase64(rs.getBlob(i))+'"';
                    break;
                case $.db.types.DATE:
                    var dateTemp = new Date();
                    dateTemp.setDate(rs.getDate(i));
                    var dateString = dateTemp.toJSON();
                    value += '"'+dateString+'"';
                    break;
                case $.db.types.TIME:
                    var dateTemp = new Date();
                    dateTemp.setDate(rs.getTime(i));
                    var dateString = dateTemp.toJSON();
                    value += '"'+dateString+'"';
                    break;
                case $.db.types.TIMESTAMP:
                    var dateTemp = new Date();
                    dateTemp.setDate(rs.getTimestamp(i));
                    var dateString = dateTemp.toJSON();
                    value += '"'+dateString+'"';
                    break;
                case $.db.types.SECONDDATE:
                    var dateTemp = new Date();
                    dateTemp.setDate(rs.getSeconddate(i));
                    var dateString = dateTemp.toJSON();
                    value += '"'+dateString+'"';
                    break;
                default:
                    value += '"'+escapeSpecialChars(rs.getString(i))+'"';
            }
            values.push(value);
        }
        table.push('{'+values+'}');
    }
    return 	JSON.parse('{"'+ rsName +'" : [' + table	+']}');

}

function escapeSpecialChars (input) {
    if(typeof(input) != 'undefined' && input != null)
    {
        return input
            .replace(/[\\]/g, '\\\\')
            .replace(/[\"]/g, '\\\"')
            .replace(/[\/]/g, '\\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t'); }
    else{

        return "";
    }
}

function escapeSpecialCharsText (input) {
    if(typeof(input) != 'undefined' && input != null)
    {
        input.replace(/[\"]/g, '\"\"');
        if(input.indexOf(",") >= 0 ||
            input.indexOf("\t") >= 0 ||
            input.indexOf(";") >= 0 ||
            input.indexOf("\n") >= 0 ||
            input.indexOf('"') >= 0 )
        {input = '"'+input+'"';}

        return input;
    }
    else{

        return "";
    }
}

};