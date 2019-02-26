var gym = function (connection) {
const servicelb = $.import('xsjs.gym', 'CService').CService;
const service = new servicelb(connection);

    const GYM_TABLE = "HiMTA::Gym";
    const GYM_ID = '"HiMTA::usid"';
    const CREATION_DATE = "creationDate";
    const UPADATE_DATE = "updateDate";

   this.doGet = function () {
        const result = connection.executeQuery(`SELECT * FROM "${GYM_TABLE}"`);

        result.forEach(x => $.trace.error(JSON.stringify(x)));

        $.response.status = $.net.http.OK;
        $.response.setBody(JSON.stringify(result));
    };


    this.doPost = function (oGym) {
        //Get Next ID Number
        oGym.usid = getNextval(GYM_ID);
       
        //generate query
        const statement = createPreparedInsertStatement(GYM_TABLE, oGym);
        //execute update
        connection.executeUpdate(statement.sql, statement.aValues);

        connection.commit();
        $.response.status = $.net.http.CREATED;
        $.response.setBody(JSON.stringify(oGym));
    };


    this.doPut = function (oGym) {
        const statement = createPreparedUpdateStatement(GYM_TABLE, oGym);
        //execute update
        connection.executeUpdate(statement.sql, statement.aValues);

        connection.commit();
        $.response.status = $.net.http.OK;
        $.response.setBody(JSON.stringify(oGym));
    };

    this.doDelete = function (usid) {
        const statement = createPreparedDeleteStatement(GYM_TABLE, {usid: usid});
        connection.executeUpdate(statement.sql, statement.aValues);

        connection.commit();
        $.response.status = $.net.http.OK;
        $.response.setBody(JSON.stringify({}));
    };

    function getNextval(sSeqName) {
        const statement = `select "${sSeqName}".NEXTVAL as "ID" from "${GYM_TABLE}"`;
        const result = connection.executeQuery(statement);

        if (result.length > 0) {
            return result[0].ID;
        } else {
            throw new Error('ID was not generated');
        }
    }

    function createPreparedInsertStatement(sTableName, oValueObject) {
        let oResult = new Result();

        let sColumnList = '', sValueList = '';
        
        var currentDate = new Date();

        for(let key in oValueObject){
            sColumnList += `"${key}",`;
            oResult.aParams.push(key);
            sValueList += "?, "; 
            oResult.aValues.push(oValueObject[key]);  
        }

        sColumnList += `"${CREATION_DATE}",`;
        oResult.aParams.push(CREATION_DATE);
        sValueList += "?, "; 
        oResult.aValues.push(currentDate);

        sColumnList += `"${UPADATE_DATE}",`;
        oResult.aParams.push(UPADATE_DATE);
        sValueList += "?, "; 
        oResult.aValues.push(currentDate);        

        // Remove the last unnecessary comma and blank
        sColumnList = sColumnList.slice(0, -1);
        sValueList = sValueList.slice(0, -2);

        oResult.sql = `insert into "${sTableName}" (${sColumnList}) values (${sValueList})`;

        $.trace.error("sql to insert: " + oResult.sql);
        return oResult;
    };

    var setCurrentDate = function(currentDate, targetDate){
        sColumnList += `"${targetDate}",`;
        oResult.aParams.push(targetDate);
        sValueList += "?, "; 
        oResult.aValues.push(currentDate);
    }

    function createPreparedUpdateStatement(sTableName, oValueObject) {
        let oResult = new Result();

        let sColumnList = '', sValueList = '';

        var currentDate = new Date();

        for(let key in oValueObject){
            sColumnList += `"${key}",`;
            oResult.aParams.push(key);
            sValueList += "?, ";
            oResult.aValues.push(oValueObject[key]);            
        }
        
        sColumnList += `"${UPADATE_DATE}",`;
        oResult.aParams.push(UPADATE_DATE);
        sValueList += "?, "; 
        oResult.aValues.push(currentDate); 

        // Remove the last unnecessary comma and blank
        sColumnList = sColumnList.slice(0, -1);
        sValueList = sValueList.slice(0, -2);

        oResult.sql = `update "${sTableName}" set (${sColumnList}) = (${sValueList}) where "${oResult.aParams[0]}" = '${oResult.aValues[0]}'`;

        $.trace.error("sql to insert: " + oResult.sql);
        return oResult;
    };

    function createPreparedDeleteStatement(sTableName, oConditionObject) {
        let oResult = new Result();

        let sWhereClause = '';
        for (let key in oConditionObject) {
            sWhereClause += `"${key}"=? and `;
            oResult.aValues.push(oConditionObject[key]);
            oResult.aParams.push(key);
        }

        // Remove the last unnecessary AND
        sWhereClause = sWhereClause.slice(0, -5);
        if (sWhereClause.length > 0) {
            sWhereClause = " where " + sWhereClause;
        }

        oResult.sql = `delete from "${sTableName}" ${sWhereClause}`;

        $.trace.error("sql to delete: " + oResult.sql);
        return oResult;
    };

    function Result() {
        this.aParams = [];
        this.aValues = [];
        this.sql = "";
    };
};