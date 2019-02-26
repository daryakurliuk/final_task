 const servicelb = $.import('xsjs.gym', 'CService').CService;
    const service = new servicelb($.hdb.getConnection({
    treatDateAsUTC: true
}));

    const Gym_TABLE = "HiMTA::Gym";
    const Gym_ID =   "HiMTA::usid";

function GymsCreate(param){
    $.trace.error("Param :" + JSON.stringify(param));
    var after = param.afterTableName;

    //Get Input New Record Values
    var	pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");
    var oResult = pStmt.executeQuery();

	var currentDate = new Date();	

    var oGymItems = service.recordSetToJSON(oResult, "items");
    var oGym = oGymItems.items[0];

	oGym.creationDate = currentDate;
	oGym.updateDate = currentDate;

	//Get Next Personnel Number
	pStmt = param.connection.prepareStatement(`select \"${Gym_ID}\".NEXTVAL from dummy`); 
	var result = pStmt.executeQuery();
    
    while (result.next()) {
		oGym.id = result.getString(1);
	}

	$.trace.error("oGym: " + JSON.stringify(oGym));
    
	pStmt.close();
	//Insert Record into DB Table and Temp Output Table
	pStmt = param.connection.prepareStatement(`insert into \"${Gym_TABLE}\" values(?,?,?,?)`);
	fillAndExecute(pStmt, oGym);
	pStmt = param.connection.prepareStatement("TRUNCATE TABLE \"" + after + "\"" );
	pStmt.executeUpdate();
	pStmt.close();
	pStmt = param.connection.prepareStatement("insert into \"" + after + "\" values(?,?,?,?)" );
	fillAndExecute(pStmt, oGym);
}

function fillAndExecute(pStmt, oGym) {
	pStmt.setString(1, oGym.id.toString());
	pStmt.setString(2, oGym.name.toString());
	pStmt.setTimestamp(3, oGym.creationDate);	
	pStmt.setTimestamp(4, oGym.updateDate);	
	pStmt.executeUpdate();
	pStmt.close();	
}

function GymsUpdate(param){
    var after = param.afterTableName;

    var pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");
    var oResult = pStmt.executeQuery();

    var oGymItems = service.recordSetToJSON(oResult, "items");
    var oGym = oGymItems.items[0];
    $.trace.error("Update oGym :" + JSON.stringify(oGym));

    pStmt.close();
    pStmt = param.connection.prepareStatement(`UPDATE \"${Gym_TABLE}\" SET "name"='${oGym.name}', "updateDate" = current_timestamp WHERE "usid"=${oGym.usid}`);   
    pStmt.executeUpdate();
    pStmt.close();
    
}