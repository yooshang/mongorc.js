prompt = function() {
	// set version
	version = db.version();

	// set slaveok
	slavecanread = rs.slaveOk();

	// set databasename
	databasename = db.getName();

	// case mongos
	if (rs.status().info == 'mongos') {
		return rs.status().info + ':[' + version + '][' + databasename + ']> ';
	}

	// config or replica
	if (rs.status().set) {
		role = rs.status().set;
	} else if (db.serverCmdLineOpts().parsed.configsvr) {
		role = 'configsvr';
		return role + ':[' + version + '][' + databasename + ']> ';
	} else if (db.serverCmdLineOpts().parsed.sharding.clusterRole == 'configsvr') {
		role = 'configsvr';
		return role + ':[' + version + '][' + databasename + ']> ';
	} else {
		role = 'single';
		return role + ':[' + version + '][' + databasename + ']> ';
	}

	// for replicasets
	switch (rs.status().myState) {
	case 1:
		stateStr = 'PRIMARY'
		break;

	case 2:
		stateStr = 'SECONDARY'
		slavecanread
		break;

	case 7:
		stateStr = 'ARBITER'
		break;
	}
	return role + ':' + stateStr + ':[' + version + '][' + databasename + ']> ';
}

dbaslow = function(j, i, a, b) {
	db.currentOp(true).inprog.forEach(function(op) {
		if (j == "") {
			x = "query"
		} else if (j == "q") {
			x = "query"
		} else if (j == "g") {
			x = "getmore"
		};
		if (i == "") i = 0;
		if (a == "") {
			if (op.op == x && op.secs_running > i) printjson(op);
		} else if (a == "opid") {
			if (op.op == x && op.secs_running > i) printjson(op.opid);
			if (b == "kill") {
				if (op.op == x && op.secs_running > i) {
					db.$cmd.sys.killop.findOne({
						'op': op.opid
					});
					printjson("kill opid:" + op.opid);
				}
			}
		} else {
			if (op.op == x && op.secs_running > i) printjson(op);
		};

	})
}

dba = function(name, num) {
	if (name == "") {
		print('put : "conn","mem"')
	} else if (name == "conn") {
		printjson(db.serverStatus().connections)
	} else if (name == "mem") {
		printjson(db.serverStatus().mem)
	} else if (name == "slave") {
		print('++++++++ReplicationInfo++++++++') 
		printjson(db.printReplicationInfo())
		print(' ') 
		print('++++++++SlaveReplicationInfo++++++++')
		printjson(db.printSlaveReplicationInfo())
		print(' ')
		print('++++++++RS STATUS++++++++')
		printjson(rs.conf())
	} else if (name == "query") {
		for (var a = 0; a < num; a++) {
			INSERT = db.serverStatus().opcounters.insert 
			QUERY = db.serverStatus().opcounters.query 
			UPDAE = db.serverStatus().opcounters.update
			DELETE = db.serverStatus().opcounters.delete
			GETMORE = db.serverStatus().opcounters.getmore
			COMMAND = db.serverStatus().opcounters.command

			if (rs.status().info != 'mongos') {
				REP_INSERT = db.serverStatus().opcountersRepl.insert
				REP_UPDAE = db.serverStatus().opcountersRepl.update
				REP_DELETE = db.serverStatus().opcountersRepl.delete
			};
			sleep(1000)

			INSERT_2 = db.serverStatus().opcounters.insert
			QUERY_2 = db.serverStatus().opcounters.query
			UPDAE_2 = db.serverStatus().opcounters.update
			DELETE_2 = db.serverStatus().opcounters.delete
			GETMORE_2 = db.serverStatus().opcounters.getmore
			COMMAND_2 = db.serverStatus().opcounters.command
			CONN_CUR = db.serverStatus().connections.current
			MEM_R = db.serverStatus().mem.resident
			MEM_V = db.serverStatus().mem.virtual
			
			if (rs.status().info != 'mongos') {
				REP_INSERT_2 = db.serverStatus().opcountersRepl.insert
				REP_UPDAE_2 = db.serverStatus().opcountersRepl.update
				REP_DELETE_2 = db.serverStatus().opcountersRepl.delete
				MEM_M = db.serverStatus().mem.mapped
				
				print('Query:', QUERY_2 - QUERY, '', 'Insert:', INSERT_2 - INSERT, '', 'R-Insert:', REP_INSERT_2 - REP_INSERT, '', 'Update:', UPDAE_2 - UPDAE, '', 'R-Update:', REP_UPDAE_2 - REP_UPDAE, '', 'Delete', DELETE_2 - DELETE, '', 'R-Delete:', REP_DELETE_2 - REP_DELETE, '', 'Getmore', GETMORE_2 - GETMORE, '', 'Command', COMMAND_2 - COMMAND,'','CONN:',CONN_CUR,'','Resident:',MEM_R/1024,'','Virtual:',MEM_V/1024,'','Mapped:',MEM_M/1024)
			} else {
				print('Query:', QUERY_2 - QUERY, '', 'Insert:', INSERT_2 - INSERT, '', 'Update:', UPDAE_2 - UPDAE, '', 'Delete', DELETE_2 - DELETE, '', 'Getmore', GETMORE_2 - GETMORE, '', 'Command',COMMAND_2 - COMMAND,'','CONN:',CONN_CUR,'','Resident:',MEM_R/1024,'','Virtual:',MEM_V/1024)
			};

		}
	};

}
